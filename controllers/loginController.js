// controllers/LoginController.js:
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./src/models/User.js');  // Adjust path as necessary

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Normalize email for case insensitivity
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists by normalized email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.error(`User not found for email: ${normalizedEmail}`);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error(`Password mismatch for email: ${normalizedEmail}`);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token valid for 1 hour
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with the token and user data (excluding the password)
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


/*
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./src/models/User');  // Adjust path as necessary

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token valid for 1 hour
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with the token and user data (excluding the password)
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
*/

/*
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = (req, res) => {
    const { username, password } = req.body;
    // Hardcoded example - in real setup, you would check against a database
    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = {
        username,
        password: hashedPassword,
    };

    // Hardcoded response
    res.status(200).json({ message: 'User registered successfully', user });
};

exports.login = (req, res) => {
    const { username, password } = req.body;

    // Hardcoded user check (replace with database logic later)
    const hardcodedUser = {
        username: 'testuser',
        password: bcrypt.hashSync('testpassword', 10), // pre-hashed
    };

    // Validate user credentials
    if (username === hardcodedUser.username && bcrypt.compareSync(password, hardcodedUser.password)) {
        const token = jwt.sign({ username }, 'secretKey', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
};


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Hardcoded user for now (simulating a database)
const users = [
    { username: 'testuser', password: bcrypt.hashSync('testpassword', 10) }
];

// Controller for registering a user
exports.register = (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = { username, password: hashedPassword };
    users.push(newUser);

    res.status(200).json({ message: 'User registered successfully', user: newUser });
};

// Controller for logging in a user
exports.login = (req, res) => {
    const { username, password } = req.body;

    const user = users.find(user => user.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ username }, 'secretKey', { expiresIn: '1h' });
        return res.status(200).json({ message: 'Login successful', token });
    } else {
        return res.status(401).json({ message: 'Invalid username or password' });
    }
};
*/