import multer from 'multer';

const isProduction = process.env.NODE_ENV === 'production';

// Unknown route -> JSON 404.
// Without this, Express answers with an HTML error page, which breaks clients
// that always parse the response as JSON.
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Central error handler.
// Express 5 forwards rejected promises from async handlers here automatically,
// so an unexpected throw becomes a clean JSON 500 instead of a hanging request
// or an HTML stack trace.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err instanceof multer.MulterError) {
    // Upload rejected by multer's own limits
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large.'
        : `Upload error: ${err.message}`;
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON body.';
  }

  // Always log server-side; never ship internals to the client in production.
  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}:`, err);
  } else {
    console.warn(`[warn] ${req.method} ${req.originalUrl}: ${message}`);
  }

  res.status(status).json({
    success: false,
    message: status >= 500 && isProduction ? 'Internal server error' : message,
  });
};
