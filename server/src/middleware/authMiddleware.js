import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hyperone-jwt-secret-2026';

export function requireCustomerAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.customer = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}
