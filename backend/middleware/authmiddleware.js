import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const SECRET_KEY = process.env.JWT_SECRET_KEY;

export default function authenticateToken(req, res, next) {
  // Ensure req.cookies exists
  if (!req.cookies) {
    return res.status(401).json({ message: 'Access denied. No cookies found.' });
  }

  const token = req.cookies.token; // Read token from HTTP-only cookie

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Attach decoded token info to the request
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}
