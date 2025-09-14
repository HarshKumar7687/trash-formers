import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/shop/product/${product._id}`}>
        <img
          src={product.images[0]} // Now this is the full URL
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            {product.name}
          </h3>
          <p className="text-gray-400 text-sm mb-2">by {product.seller.name}</p>
          <div className="flex justify-between items-center">
            <span className="text-green-400 font-bold">${product.price}</span>
            {product.ecoCoinsPrice > 0 && (
              <span className="text-yellow-400 text-sm">
                {product.ecoCoinsPrice} Eco Coins
              </span>
            )}
          </div>
          <span className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full mt-2 capitalize">
            {product.condition.replace("_", " ")}
          </span>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
