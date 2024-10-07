const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./src/config/db'); // Import the DB connection file

dotenv.config();

// Connect to MongoDB
connectDB();  // Call the function to connect to the database

// Middleware for parsing JSON
app.use(express.json());

// User routes
const userRouter = require('./src/routes/userRoutes');
app.use('/api/auth', userRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
