if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable must be set');
}

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_ALGORITHM = 'HS256';
export const JWT_EXPIRES_IN = '24h';
export const ADMIN_JWT_EXPIRES_IN = '8h';
