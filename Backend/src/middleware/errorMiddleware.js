export const errorMiddleware = (err, req, res, next) => {
  console.error('💥 ERROR:', err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    // Provide stack trace only in development mode for security
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};