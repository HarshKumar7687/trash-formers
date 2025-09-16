const path = require('path');
const fs = require('fs');

// Middleware to serve static files with proper headers
const staticFileMiddleware = (req, res, next) => {
  // Only handle requests to uploads
  if (req.url.startsWith('/uploads/')) {
    const filename = req.url.split('/uploads/')[1];
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      // Set proper headers
      res.setHeader('Access-Control-Allow-Origin', 
        process.env.NODE_ENV === 'production' 
          ? 'https://trash-former.netlify.app' 
          : 'http://localhost:5173'
      );
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      // Send the file
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } else {
    next();
  }
};

module.exports = staticFileMiddleware;