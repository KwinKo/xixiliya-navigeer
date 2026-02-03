// api/index.js
const app = require('./src/app');

// Vercel Serverless Functions 入口
module.exports = (req, res) => {
  app(req, res);
};