import jwt from 'jsonwebtoken';

const SECRET_KEY = "f3b4230dbac3956955afbc6fdbc6b55d974f6e6f9437d3a343e5e18390cfe6ea";

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
