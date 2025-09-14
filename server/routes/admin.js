const express = require('express');
const bcrypt = require('bcrypt'); 
const User = require('../models/User'); 
const { protect } = require('../middleware/auth');
const requireAdmin = require('../middleware/admin'); // CHANGED: Direct import
const { createAdminUser } = require('../controllers/authController');
const { 
  getAllUsers, 
  deleteUser, 
  updateUserRole,
  getAllWasteSubmissions,
  reviewWasteSubmission,
  getAdminDashboard,
  getSystemStats,
  getAllContestEntries,
  updateContestEntry
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(protect);
router.use(requireAdmin);

// Admin user management
router.post('/create-admin', createAdminUser);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

// Waste submission management
router.get('/waste', getAllWasteSubmissions);
router.put('/waste/:id/review', reviewWasteSubmission);

// Contest management
router.get('/contest', getAllContestEntries);
router.put('/contest/:id', updateContestEntry);

// Admin dashboard and analytics
router.get('/dashboard', getAdminDashboard);
router.get('/stats', getSystemStats);

module.exports = router;