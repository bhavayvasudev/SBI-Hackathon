export function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  if (status >= 500) {
    // Only log server errors — never log 4xx (client errors)
    console.error(`[Error] ${status} ${req.method} ${req.path}:`, err.message);
  }
  const isProd = process.env.NODE_ENV === 'production';
  res.status(status).json({
    success: false,
    error: isProd && status >= 500 ? 'An unexpected error occurred.' : (err.message || 'Internal server error'),
    ...(process.env.NODE_ENV === 'development' && status >= 500 && { stack: err.stack }),
  });
}
