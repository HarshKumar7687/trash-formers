import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopAPI } from '../services/api';

const SellProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'art',
    condition: 'good',
    ecoCoinsPrice: '',
    tags: '',
    materials: '',
    weight: '',
    dimensions: { length: '', width: '', height: '', unit: 'cm' }
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (images.length === 0) newErrors.images = 'At least one image is required';
    if (images.length > 5) newErrors.images = 'Maximum 5 images allowed';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      setErrors({ images: 'Maximum 5 images allowed' });
      return;
    }
    
    setImages(files);
    setErrors(prev => ({ ...prev, images: '' }));
    
    // Create image previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const data = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        if (key === 'dimensions') {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });

      // Append images
      images.forEach(image => {
        data.append('images', image);
      });

      await shopAPI.createProduct(data);
      navigate('/shop');
    } catch (error) {
      console.error('Error creating product:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to create product' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 md:p-8">
          <div className="mb-6">
            <button
              onClick={() => navigate('/shop')}
              className="flex items-center text-green-400 hover:text-green-300 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Shop
            </button>
            
            <h1 className="text-3xl font-bold text-white mb-2">Sell Your Product</h1>
            <p className="text-gray-400">List your upcycled creation for sale in our eco-friendly marketplace</p>
          </div>
          
          {errors.submit && (
            <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
              {errors.submit}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-750 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 pb-2 border-b border-gray-700">Product Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-700 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    placeholder="E.g., Upcycled Glass Bottle Lamp"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-700 border ${errors.description ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    placeholder="Describe your product in detail..."
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price ($) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">$</span>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`w-full pl-8 pr-4 py-3 bg-gray-700 border ${errors.price ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && <p className="mt-1 text-sm text-red-400">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Eco Coins Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-yellow-400">♻️</span>
                    <input
                      type="number"
                      name="ecoCoinsPrice"
                      min="0"
                      value={formData.ecoCoinsPrice}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="art">Art & Decor</option>
                    <option value="furniture">Furniture</option>
                    <option value="fashion">Fashion & Accessories</option>
                    <option value="home">Home Goods</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="new">New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="upcycled, eco-friendly, handmade"
                  />
                  <p className="mt-1 text-xs text-gray-400">Comma-separated tags</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Materials</label>
                  <input
                    type="text"
                    name="materials"
                    value={formData.materials}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="glass, wood, metal"
                  />
                  <p className="mt-1 text-xs text-gray-400">Comma-separated materials</p>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-gray-750 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6 pb-2 border-b border-gray-700">Product Images</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Images <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-650 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-400">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {errors.images && <p className="mt-2 text-sm text-red-400">{errors.images}</p>}
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-300 mb-3">Image Previews</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="px-6 py-3 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Listing...
                  </>
                ) : (
                  'Create Listing'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellProduct;