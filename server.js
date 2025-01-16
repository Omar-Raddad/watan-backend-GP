const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./src/config/db'); 
const userRouter = require('./src/routes/userRoutes');
const checkpointRoutes = require('./src/routes/checkpointRoutes');
const postRouter = require('./src/routes/postRoutes');
const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const conversationRoutes = require('./src/routes/messagingRoute');

const notificationRoutes = require('./src/routes/notificationRoutes');

const morgan = require('morgan');

dotenv.config();

// Connect to MongoDB
connectDB();  // Call the function to connect to the database

// Middleware for parsing JSON
app.use(express.json());

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// User routes
app.use('/api/auth', userRouter);
app.use('/api/products',productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/messaging',conversationRoutes);
app.use('/api/checkpoints', checkpointRoutes);
app.use('/api/posts', postRouter); // Post routes
app.use('/api/notifications', notificationRoutes);

app.use(morgan('dev'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
