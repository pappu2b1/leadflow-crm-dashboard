export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Server error";
  if (err.name === "CastError") { statusCode = 400; message = "Invalid resource identifier"; }
  if (err.name === "ValidationError") { statusCode = 400; message = Object.values(err.errors).map((item) => item.message).join(", "); }
  res.status(statusCode).json({ success: false, message, stack: process.env.NODE_ENV === "production" ? undefined : err.stack });
};
