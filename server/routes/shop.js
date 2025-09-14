const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../config/upload');
const router = express.Router();

// Get all products with filters
router.get('/products', async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      condition,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    const filter = { status: 'available' };
    
    if (category && category !== 'all') filter.category = category;
    if (condition) filter.condition = condition;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const products = await Product.find(filter)
      .populate('seller', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    // Add full URLs to images
    const productsWithFullUrls = products.map(product => ({
      ...product.toObject(),
      images: product.images.map(image => `${process.env.BACKEND_URL || 'http://localhost:8000'}/uploads/${image}`)
    }));

    res.json({
      products: productsWithFullUrls,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name avatar rating totalSales');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Add full URLs to images
    const productWithFullUrls = {
      ...product.toObject(),
      images: product.images.map(image => `${process.env.BACKEND_URL || 'http://localhost:8000'}/uploads/${image}`)
    };

    res.json(productWithFullUrls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create product (seller)
router.post('/products', protect, upload.array('images', 5), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      condition,
      ecoCoinsPrice,
      tags,
      dimensions,
      weight,
      materials
    } = req.body;

    // Check if user has enough eco coins if setting eco coins price
    // if (ecoCoinsPrice > 0) {
    //   const user = await User.findById(req.user._id);
    //   if (user.ecoCoins < ecoCoinsPrice) {
    //     return res.status(400).json({ message: 'Not enough eco coins' });
    //   }
    // }

    const images = req.files.map(file => file.filename);

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      condition,
      ecoCoinsPrice: Number(ecoCoinsPrice) || 0,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      dimensions: dimensions ? JSON.parse(dimensions) : undefined,
      weight: weight ? Number(weight) : undefined,
      materials: materials ? materials.split(',').map(m => m.trim()) : [],
      images,
      seller: req.user._id
    });

    await product.save();
    await product.populate('seller', 'name avatar');

    // Return product with full image URLs
    const productWithFullUrls = {
      ...product.toObject(),
      images: product.images.map(image => `${process.env.BACKEND_URL || 'http://localhost:8000'}/uploads/${image}`)
    };

    res.status(201).json(productWithFullUrls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product (seller only)
router.put('/products/:id', protect, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map(file => file.filename);
    }

    if (updates.tags) {
      updates.tags = updates.tags.split(',').map(tag => tag.trim());
    }

    if (updates.materials) {
      updates.materials = updates.materials.split(',').map(m => m.trim());
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('seller', 'name avatar');

    // Return product with full image URLs
    const productWithFullUrls = {
      ...updatedProduct.toObject(),
      images: updatedProduct.images.map(image => `${process.env.BACKEND_URL || 'http://localhost:8000'}/uploads/${image}`)
    };

    res.json(productWithFullUrls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product (seller only)
router.delete('/products/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create order
router.post('/orders', protect, async (req, res) => {
  try {
    const { productId, paymentMethod, shippingAddress, notes } = req.body;

    const product = await Product.findById(productId);
    if (!product || product.status !== 'available') {
      return res.status(404).json({ message: 'Product not available' });
    }

    const buyer = await User.findById(req.user._id);
    const seller = await User.findById(product.seller);

    if (buyer._id.toString() === seller._id.toString()) {
      return res.status(400).json({ message: 'Cannot buy your own product' });
    }

    let ecoCoinsUsed = 0;
    let cashAmount = 0;

    if (paymentMethod === 'eco_coins') {
      if (buyer.ecoCoins < product.ecoCoinsPrice) {
        return res.status(400).json({ message: 'Not enough eco coins' });
      }
      ecoCoinsUsed = product.ecoCoinsPrice;
    } else if (paymentMethod === 'cash') {
      cashAmount = product.price;
    } else if (paymentMethod === 'mixed') {
      return res.status(400).json({ message: 'Mixed payment not implemented yet' });
    }

    // Create order
    const order = new Order({
      product: productId,
      buyer: req.user._id,
      seller: product.seller,
      price: product.price,
      ecoCoinsUsed,
      cashAmount,
      paymentMethod,
      shippingAddress,
      notes,
      status: 'pending'
    });

    // Update product status
    product.status = 'pending';
    await product.save();

    // Deduct eco coins if used
    if (ecoCoinsUsed > 0) {
      buyer.ecoCoins -= ecoCoinsUsed;
      seller.ecoCoins += ecoCoinsUsed;
      await buyer.save();
      await seller.save();
    }

    await order.save();
    await order.populate('product buyer seller');

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user orders
router.get('/orders', protect, async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (type === 'buying') {
      filter.buyer = req.user._id;
    } else if (type === 'selling') {
      filter.seller = req.user._id;
    } else {
      filter.$or = [
        { buyer: req.user._id },
        { seller: req.user._id }
      ];
    }

    let orders = await Order.find(filter)
      .populate('product', 'name images')
      .populate('buyer', 'name')
      .populate('seller', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(); // Use lean() to get plain objects

    // Convert product images to full URLs
    orders = orders.map(order => {
      if (order.product && order.product.images) {
        order.product.images = order.product.images.map(image => 
          `${process.env.BACKEND_URL || 'http://localhost:8000'}/uploads/${image}`
        );
      }
      return order;
    });

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status
router.put('/orders/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (order.buyer.toString() !== req.user._id.toString() && 
        order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.status = status;
    await order.save();

    // If order is cancelled, return eco coins
    if (status === 'cancelled' && order.ecoCoinsUsed > 0) {
      const buyer = await User.findById(order.buyer);
      const seller = await User.findById(order.seller);
      
      buyer.ecoCoins += order.ecoCoinsUsed;
      seller.ecoCoins -= order.ecoCoinsUsed;
      
      await buyer.save();
      await seller.save();
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;