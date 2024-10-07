// userController.js

// Dummy data to simulate a user database (replace this with real DB logic)
const users = [
    { username: 'testuser', password: 'password123' },
    // Add more test users as needed
  ];
  
  // User login controller
  const loginUser = (req, res) => {
    const { username, password } = req.body;
  
    // Find user in dummy database (replace with MongoDB logic)
    const user = users.find((u) => u.username === username && u.password === password);
  
    if (user) {
      res.status(200).json({ message: 'Login successful', user });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  };
  
  // User registration controller
  const registerUser = (req, res) => {
    const { username, password } = req.body;
  
    // Check if user already exists in dummy database (replace with MongoDB logic)
    const userExists = users.find((u) => u.username === username);
  
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
  
    // Add user to dummy database (replace with real DB insertion)
    users.push({ username, password });
    res.status(201).json({ message: 'User registered successfully', user: { username } });
  };
  
  module.exports = { loginUser, registerUser };
  