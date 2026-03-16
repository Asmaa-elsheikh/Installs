try {
  const app = require('../backend/index.js');
  module.exports = app;
} catch (error) {
  console.error('Vercel Boot Error:', error);
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Backend failed to start',
      message: error.message,
      stack: error.stack,
      path: __dirname
    });
  };
}
