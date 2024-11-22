import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization']; // Check the 'Authorization' header
  const token = authHeader?.split(' ')[1]; // Extract the token after 'Bearer'
  
  console.log('Authorization Header:', authHeader); // Log the header for debugging
  console.log('Token received:', token); // Log the extracted token
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token using your secret
    console.log('Decoded Token:', decoded); // Log the decoded payload for debugging
    req.user = decoded; // Attach decoded user info to the request object
    next(); // Call the next middleware or route handler
  } catch (err) {
    console.error('Token verification failed:', err.message); // Log the error
    return res.status(403).json({ message: 'Token verification failed' });
  }
};
