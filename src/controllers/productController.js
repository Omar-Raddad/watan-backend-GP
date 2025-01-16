const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, occasion, category } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({
        message: 'Name, description, and category are required.'
      });
    }

    // Check if the category exists; if not, create it
    let categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      categoryDoc = new Category({
        name: category,
        slug: category.toLowerCase().replace(/\s+/g, '-'),
      });
      await categoryDoc.save();
    }

    // Collect image paths from uploaded files (provided by multer)
    const images = req.files.map((file) => `/uploads/${file.filename}`);

    // Ensure req.user exists (from authMiddleware)
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const product = new Product({
      name,
      description,
      price: price || null,
      occasion: occasion || false,
      images,
      category: categoryDoc._id,
      user: req.user._id, // The currently logged-in user
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};


exports.getProducts = async (req, res) => {
  try {
    const { category, user, search, minPrice, maxPrice, occasion, userLocation } = req.query;

    const filter = {};

    // Apply filters to all products
    if (category) filter.category = mongoose.Types.ObjectId(category); // Convert to ObjectId
    if (user) filter.user = mongoose.Types.ObjectId(user); // Convert to ObjectId
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (occasion !== undefined) {
      filter.occasion = occasion === 'true';
    }

    // Parse userLocation if provided (e.g., { "city": "Ramallah" })
    let parsedLocation = null;
    if (userLocation) {
      parsedLocation = JSON.parse(userLocation); // Expecting a JSON string input
    }

    // Build the aggregation pipeline
    const pipeline = [
      // Match filters
      { $match: filter },

      // Add a calculated sponsorship score
      {
        $addFields: {
          sponsorshipScore: {
            $cond: [
              { $and: [
                { $eq: ['$sponsorship.isSponsored', true] },
                { $or: [
                  { $eq: ['$sponsorship.nationwide', true] },
                  { $in: [parsedLocation?.city, '$sponsorship.targetLocations.city'] }
                ]}
              ]},
              { $add: ['$sponsorship.priority', '$sponsorship.amountPaid'] }, // Sponsorship score
              0 // Default score for non-sponsored
            ],
          },
        },
      },

      // Sort by sponsorship score and createdAt
      { $sort: { sponsorshipScore: -1, createdAt: -1 } },

      // Lookup to "populate" category
      {
        $lookup: {
          from: 'categories', // The name of the "Category" collection
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } }, // Unwind populated category

      // Lookup to "populate" user
      {
        $lookup: {
          from: 'users', // The name of the "User" collection
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }, // Unwind populated user
    ];

    // Execute the aggregation pipeline
    const products = await Product.aggregate(pipeline);

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error });
  }
};




// Get a specific product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('user', 'username email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, occasion, images, category } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the logged-in user is the product owner
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (occasion !== undefined) product.occasion = occasion;
    if (images) product.images = images;
    if (category) product.category = category;

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};


// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the logged-in user is the product owner
    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.remove();
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};
exports.getUserProducts = async (req, res) => {
  try {
    console.log("re",req);
    const userId = req.user._id;

    const products = await Product.find({ user: userId })
      .populate('category', 'name')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ message: 'Error fetching user products', error });
  }
};
exports.getSponsoredProducts = async (req, res) => {
  try {
    const { city } = req.query;

    const filter = { 'sponsorship.isSponsored': true };

    if (city) {
      filter.$or = [
        { 'sponsorship.targetLocations.city': city },
        { 'sponsorship.nationwide': true },
      ];
    }

    const sponsoredProducts = await Product.find(filter)
      .sort({ 'sponsorship.priority': -1 }) // Higher sponsorship amount = higher priority
      .populate('category', 'name')
      .populate('user', 'username email');

    res.status(200).json(sponsoredProducts);
  } catch (error) {
    console.error('Error fetching sponsored products:', error);
    res.status(500).json({ message: 'Error fetching sponsored products', error });
  }
};
exports.addSponsorship = async (req, res) => {
  try {
    const { productId, amountPaid, targetLocations, nationwide, priority } = req.body;

    // Validate priority level
    if (priority && ![1, 2, 3, 4, 5].includes(priority)) {
      return res.status(400).json({
        message: 'Invalid priority level. Allowed values are 1, 2, 3, 4, or 5.',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.sponsorship = {
      isSponsored: true,
      amountPaid: amountPaid || 0,
      priority: priority || 1, // Default to priority level 1
      targetLocations: targetLocations?.map((city) => ({ city })) || [],
      nationwide: nationwide || false,
    };

    const updatedProduct = await product.save();
    res.status(200).json({
      message: 'Sponsorship added successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error adding sponsorship:', error);
    res.status(500).json({ message: 'Error adding sponsorship', error });
  }
};

