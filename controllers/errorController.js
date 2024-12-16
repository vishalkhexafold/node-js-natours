const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  const message = `Invalid token. Please log in again.`;
  return new AppError(message, 401);
};
const handleJWTExpireError = () => {
  const message = `Your token has expired. Please log in again.`;
  return new AppError(message, 401);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    status: err.status,
    error: err,
    stack: err.stack
  });
};
const sendErrorProd = (err, res) => {
  // Operational error, trusted error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message,
      status: err.status
    });
  } else {
    console.log(err);
    res.status(500).json({
      message: 'Something went wrong',
      status: 'error'
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    sendErrorProd(error, res);
    if (error.name === 'TokenExpiredError') error = handleJWTExpireError(error);
  }
};
