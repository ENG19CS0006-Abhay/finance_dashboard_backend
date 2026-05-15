const healthCheck = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is healthy",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  healthCheck,
};