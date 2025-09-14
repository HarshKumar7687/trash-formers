import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { shopAPI, userAPI } from "../services/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEcoCoins, setUserEcoCoins] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderData, setOrderData] = useState({
    paymentMethod: "eco_coins",
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    notes: "",
  });

  useEffect(() => {
    fetchProduct();
    fetchUserData();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await shopAPI.getProduct(id);
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await userAPI.getDashboard();
      setUserEcoCoins(response.data.user.ecoCoins);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleOrder = async () => {
    try {
      await shopAPI.createOrder({
        productId: id,
        ...orderData,
      });
      setShowOrderModal(false);
      navigate("/shop/orders");
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-300">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 text-gray-400">😢</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-400 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/shop")}
          className="flex items-center text-green-400 hover:text-green-300 transition-colors mb-6 group"
        >
          <svg
            className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Shop
        </button>

        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-w-4 aspect-h-3 bg-gray-700 rounded-xl overflow-hidden">
                <img
                  src={product.images[selectedImage]} // Full URL
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-xl transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index
                        ? "border-green-500 ring-2 ring-green-500 ring-opacity-50"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {product.name}
                    </h1>
                    <p className="text-gray-400 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      by {product.seller.name}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.status === "available"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    {product.status === "available" ? "Available" : "Sold"}
                  </span>
                </div>
              </div>

              <div className="bg-gray-900/50 p-4 rounded-xl">
                <div className="flex items-end gap-4">
                  <p className="text-2xl font-bold text-green-400">
                    ${product.price}
                  </p>
                  {product.ecoCoinsPrice > 0 && (
                    <div className="flex items-center">
                      <span className="text-lg text-yellow-400">
                        {product.ecoCoinsPrice}
                      </span>
                      <span className="ml-1 text-yellow-300 flex items-center">
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm3-8.5a1 1 0 10-2 0 1 1 0 002 0zM9 8a1 1 0 10-2 0v3a1 1 0 102 0V8zm2 5a1 1 0 10-2 0 1 1 0 002 0z" />
                        </svg>
                        Eco Coins
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Description
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/30 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-400 text-sm mb-1">
                    Category
                  </h4>
                  <p className="text-white capitalize">{product.category}</p>
                </div>
                <div className="bg-gray-900/30 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-400 text-sm mb-1">
                    Condition
                  </h4>
                  <p className="text-white capitalize">
                    {product.condition.replace("_", " ")}
                  </p>
                </div>
                <div className="bg-gray-900/30 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-400 text-sm mb-1">
                    Materials
                  </h4>
                  <p className="text-white">{product.materials.join(", ")}</p>
                </div>
                <div className="bg-gray-900/30 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-400 text-sm mb-1">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowOrderModal(true)}
                disabled={product.status !== "available"}
                className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  product.status === "available"
                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                {product.status === "available" ? (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    Buy Now
                  </>
                ) : (
                  "Not Available"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                Complete Your Order
              </h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      setOrderData((prev) => ({
                        ...prev,
                        paymentMethod: "eco_coins",
                      }))
                    }
                    className={`p-3 rounded-lg border-2 transition-all ${
                      orderData.paymentMethod === "eco_coins"
                        ? "border-yellow-500 bg-yellow-900/20 text-yellow-400"
                        : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm3-8.5a1 1 0 10-2 0 1 1 0 002 0zM9 8a1 1 0 10-2 0v3a1 1 0 102 0V8zm2 5a1 1 0 10-2 0 1 1 0 002 0z" />
                      </svg>
                      Eco Coins
                    </div>
                    <div className="text-xs mt-1">
                      ({userEcoCoins} available)
                    </div>
                  </button>
                  <button
                    onClick={() =>
                      setOrderData((prev) => ({
                        ...prev,
                        paymentMethod: "cash",
                      }))
                    }
                    className={`p-3 rounded-lg border-2 transition-all ${
                      orderData.paymentMethod === "cash"
                        ? "border-green-500 bg-green-900/20 text-green-400"
                        : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Cash
                    </div>
                  </button>
                </div>
              </div>

              {orderData.paymentMethod === "eco_coins" &&
                product.ecoCoinsPrice > 0 && (
                  <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                    <div className="flex items-center text-yellow-200">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm">
                        This will cost{" "}
                        <span className="font-bold">
                          {product.ecoCoinsPrice}
                        </span>{" "}
                        Eco Coins. You have{" "}
                        <span className="font-bold">{userEcoCoins}</span>.
                      </p>
                    </div>
                  </div>
                )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Shipping Address
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={orderData.shippingAddress.street}
                    onChange={(e) =>
                      setOrderData((prev) => ({
                        ...prev,
                        shippingAddress: {
                          ...prev.shippingAddress,
                          street: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={orderData.shippingAddress.city}
                      onChange={(e) =>
                        setOrderData((prev) => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            city: e.target.value,
                          },
                        }))
                      }
                      className="px-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={orderData.shippingAddress.state}
                      onChange={(e) =>
                        setOrderData((prev) => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            state: e.target.value,
                          },
                        }))
                      }
                      className="px-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={orderData.shippingAddress.zipCode}
                      onChange={(e) =>
                        setOrderData((prev) => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            zipCode: e.target.value,
                          },
                        }))
                      }
                      className="px-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={orderData.shippingAddress.country}
                      onChange={(e) =>
                        setOrderData((prev) => ({
                          ...prev,
                          shippingAddress: {
                            ...prev.shippingAddress,
                            country: e.target.value,
                          },
                        }))
                      }
                      className="px-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={orderData.notes}
                  onChange={(e) =>
                    setOrderData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                  placeholder="Any special instructions for the seller..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-5 py-2.5 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOrder}
                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
