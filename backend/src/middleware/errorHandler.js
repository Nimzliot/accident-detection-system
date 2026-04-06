export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode ?? error.status ?? 500;
  const message =
    error.issues?.[0]?.message ??
    error.message ??
    "Internal server error";

  console.error("[smart-accident-system]", error);

  res.status(statusCode).json({
    success: false,
    message
  });
};
