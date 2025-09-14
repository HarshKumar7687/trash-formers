import React, { useState, useEffect } from "react";
import { shopAPI } from "../services/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "all",
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await shopAPI.getOrders(filters);
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await shopAPI.updateOrderStatus(orderId, { status });
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-900 text-yellow-200",
      confirmed: "bg-blue-900 text-blue-200",
      shipped: "bg-indigo-900 text-indigo-200",
      delivered: "bg-green-900 text-green-200",
      cancelled: "bg-red-900 text-red-200",
    };
    return colors[status] || "bg-gray-700 text-gray-200";
  };

  // Safe access to product data
  const getProductImage = (order) => {
    if (!order.product || !order.product.images || order.product.images.length === 0) {
      return "/placeholder-image.jpg"; // Fallback image
    }
    return order.product.images[0];
  };

  const getProductName = (order) => {
    return order.product?.name || "Product not available";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">My Orders</h1>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          {["all", "buying", "selling"].map((type) => (
            <button
              key={type}
              onClick={() => setFilters((prev) => ({ ...prev, type }))}
              className={`px-4 py-2 rounded-lg capitalize ${
                filters.type === type
                  ? "bg-green-600 text-white"
                  : "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-white mb-2">
              No orders found
            </h3>
            <p className="text-gray-400">You don't have any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-gray-800 rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={getProductImage(order)}
                      alt={getProductName(order)}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                    <div>
                      <h3 className="font-medium text-white">
                        {getProductName(order)}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {filters.type === "buying"
                          ? `Seller: ${order.seller?.name || "Unknown"}`
                          : `Buyer: ${order.buyer?.name || "Unknown"}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">${order.price}</p>
                    {order.ecoCoinsUsed > 0 && (
                      <p className="text-sm text-yellow-400">
                        {order.ecoCoinsUsed} Eco Coins
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>

                  <div className="flex space-x-2">
                    {order.status === "pending" &&
                      filters.type === "selling" && (
                        <>
                          <button
                            onClick={() =>
                              updateOrderStatus(order._id, "confirmed")
                            }
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() =>
                              updateOrderStatus(order._id, "cancelled")
                            }
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                    {order.status === "confirmed" &&
                      filters.type === "selling" && (
                        <button
                          onClick={() =>
                            updateOrderStatus(order._id, "shipped")
                          }
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Mark as Shipped
                        </button>
                      )}

                    {order.status === "shipped" &&
                      filters.type === "buying" && (
                        <button
                          onClick={() =>
                            updateOrderStatus(order._id, "delivered")
                          }
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Mark as Delivered
                        </button>
                      )}
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400">
                      Tracking: {order.trackingNumber}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;