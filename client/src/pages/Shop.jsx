import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shopAPI } from '../services/api';
import ProductCard from '../components/shop/ProductCard';
import FilterSidebar from '../components/shop/FilterSidebar';
import Navbar from '../components/Navbar'

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    condition: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await shopAPI.getProducts(filters);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setTotalProducts(response.data.total);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: 'all',
      minPrice: '',
      maxPrice: '',
      condition: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 12
    });
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">♻️ Eco Shop</h1>
            <p className="text-gray-300 text-lg">
              Discover unique upcycled products made from waste materials
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {totalProducts} {totalProducts === 1 ? 'product' : 'products'} available
            </p>
          </div>
          <Link
            to="/shop/sell"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2 group"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Sell Product
          </Link>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg flex items-center justify-between"
          >
            <span>Filters</span>
            <svg 
              className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Filters</h2>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-green-400 hover:text-green-300"
                >
                  Clear All
                </button>
              </div>
              <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
            </div>
          </div>

          {/* Filters - Mobile */}
          {showFilters && (
            <div className="lg:hidden col-span-1">
              <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Filters</h2>
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-green-400 hover:text-green-300"
                  >
                    Clear All
                  </button>
                </div>
                <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Search and Sort Header */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange({ search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange({ sortBy, sortOrder });
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg hover:bg-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl shadow-md p-4 animate-pulse">
                    <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                    <div className="h-6 bg-gray-700 rounded w-1/3 mt-3"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={filters.page === 1}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (filters.page <= 3) {
                          page = i + 1;
                        } else if (filters.page >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = filters.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={page}
                            onClick={() => setFilters(prev => ({ ...prev, page }))}
                            className={`px-4 py-2 rounded-lg ${
                              filters.page === page
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-white border border-gray-600 hover:bg-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      {totalPages > 5 && filters.page < totalPages - 2 && (
                        <span className="px-2 py-2 text-gray-400">...</span>
                      )}
                      
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                        disabled={filters.page === totalPages}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        Next
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-gray-800 rounded-xl shadow-lg">
                <div className="text-8xl mb-4 text-gray-400">🛍️</div>
                <h3 className="text-2xl font-semibold text-white mb-4">No products found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search filters or check back later for new items.</p>
                <button
                  onClick={clearAllFilters}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Shop;