import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_ALGORITHM } from '../config/jwt.js';
import { isRevoked } from './security.js';

function extractBearer(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7);
}

export function requireCustomerAuth(req, res, next) {
  const token = extractBearer(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] });
    if (!decoded.customerId) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    // Reject tokens that have been explicitly invalidated via logout
    if (isRevoked(decoded.jti)) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }
    req.customer = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}

export function requireAdminAuth(req, res, next) {
  const token = extractBearer(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] });
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }
    if (isRevoked(decoded.jti)) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}
