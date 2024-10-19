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

/*
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