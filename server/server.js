const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Get allowed origins from environment variable or use defaults
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

// Add your production frontend URL
if (process.env.NODE_ENV === 'production' && process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

// Configure multer for temporary file uploads
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/temp/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname);
  }
});

const tempUpload = multer({ 
  storage: tempStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Serve static files with proper CORS headers
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
}));

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  next(error);
});

// ML Service proxy endpoint
app.post('/api/ml/predict', tempUpload.single('file'), async (req, res) => {
  console.log('📨 Received ML prediction request');
  
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    let mlResponse;
    let filePath = req.file?.path;
    
    try {
      if (req.file) {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path));
        
        console.log('🔄 Calling your ML service...');
        mlResponse = await axios.post(
          `${process.env.ML_SERVICE_URL || 'http://localhost:5001'}/predict`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
            timeout: 15000 // 15 second timeout for ML processing
          }
        );
        
        // Clean up temp file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        // Check if ML service returned valid response
        if (mlResponse.data && mlResponse.data.success) {
          console.log('✅ Your ML model response received');
          
          return res.json({
            success: true,
            type: mlResponse.data.waste_category,
            confidence: mlResponse.data.confidence,
            coins: calculateCoinsFromCategory(mlResponse.data.waste_category),
            raw_prediction: mlResponse.data.original_class,
            isFallback: false
          });
        }
      }
    } catch (mlError) {
      console.error('❌ ML Service error:', mlError.message);
    }
    
    // If ML service fails, return error instead of fallback
    console.log('❌ ML service unavailable');
    
    // Clean up any temp files
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(503).json({ 
      success: false,
      error: 'ML service unavailable',
      isFallback: false
    });
    
  } catch (error) {
    console.error('❌ Error in ML proxy:', error);
    
    // Clean up any temp files
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      isFallback: false
    });
  }
});

// Helper function to match your ML model's coin values
function calculateCoinsFromCategory(category) {
  const coinValues = {
    'bio-degradable': 15,
    'plastic': 25,
    'e-waste': 50,
    'hazardous': 40,
    'other': 10
  };
  return coinValues[category] || 10;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'waste-classification-api',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to check uploads directory
app.get('/api/debug/uploads', (req, res) => {
  const uploadsPath = path.join(__dirname, 'uploads');
  
  fs.readdir(uploadsPath, (err, files) => {
    if (err) {
      return res.json({ 
        error: err.message, 
        path: uploadsPath,
        exists: fs.existsSync(uploadsPath)
      });
    }
    
    res.json({ 
      uploadsDirectory: uploadsPath,
      fileCount: files.length,
      files: files.slice(0, 10),
      backendUrl: process.env.BACKEND_URL || 'http://localhost:8000'
    });
  });
});

// Routes
app.use('/api/shop', require('./routes/shop'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/waste', require('./routes/waste'));
app.use('/api/contest', require('./routes/contest'));
app.use('/api/user', require('./routes/user'));

// MongoDB Connection with better error handling
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/waste-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.log('❌ MongoDB connection error:', err);
  // Don't exit process in production, just log the error
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  // Close server & exit process
  if (process.env.NODE_ENV === 'production') {
    server.close(() => {
      process.exit(1);
    });
  }
});

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 ML Service URL: ${process.env.ML_SERVICE_URL || 'http://localhost:5001'}`);
  console.log(`📁 Uploads served at: http://localhost:${PORT}/uploads/`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;