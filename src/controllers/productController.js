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


  // Get all products with filters
exports.getProducts = async (req, res) => {
  try {
    const { category, user, search, minPrice, maxPrice, occasion } = req.query;

    const filter = {};

    // Filter by category ID
    if (category) filter.category = category;

    // Filter by user ID
    if (user) filter.user = user;

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Filter by search term (name/description)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by occasion true/false
    // e.g. GET /api/products?occasion=true
    // or GET /api/products?occasion=false
    if (occasion !== undefined) {
      // Convert the string "true"/"false" to a boolean
      filter.occasion = occasion === 'true';
    }

    const products = await Product.find(filter)
      .populate('category', 'name')   // Also populate category name
      .populate('user', 'username email')
      .sort({ createdAt: -1 });       // Sort newest first

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error });
  }
};


// Get all products with filters
exports.getProducts = async (req, res) => {
  try {
    const { category, user, search, minPrice, maxPrice } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (user) filter.user = user;
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

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
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

