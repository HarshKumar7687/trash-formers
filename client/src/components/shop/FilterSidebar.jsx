import React from 'react';

const FilterSidebar = ({ filters, onFilterChange }) => {
  const categories = ['all', 'art', 'furniture', 'decor', 'fashion', 'other'];
  const conditions = ['', 'new', 'like_new', 'good', 'fair'];

  const clearAllFilters = () => {
    onFilterChange({
      category: 'all',
      minPrice: '',
      maxPrice: '',
      condition: '',
      search: '',
      page: 1
    });
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Category
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onFilterChange({ category: cat })}
              className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                filters.category === cat
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 my-2"></div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Price Range
        </h3>
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">$</span>
            </div>
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => onFilterChange({ minPrice: e.target.value })}
              className="w-full pl-7 pr-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">$</span>
            </div>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
              className="w-full pl-7 pr-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 my-2"></div>

      {/* Condition Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Condition
        </h3>
        <div className="space-y-2">
          {conditions.filter(c => c).map(cond => (
            <button
              key={cond}
              onClick={() => onFilterChange({ condition: cond })}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                filters.condition === cond
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {cond.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
          <button
            onClick={() => onFilterChange({ condition: '' })}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
              filters.condition === ''
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Conditions
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 my-2"></div>

      {/* Clear Filters Button */}
      <button
        onClick={clearAllFilters}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 rounded-lg transition-all duration-200 hover:from-red-700 hover:to-red-800 flex items-center justify-center shadow-md hover:shadow-lg"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Clear All Filters
      </button>
    </div>
  );
};

export default FilterSidebar;