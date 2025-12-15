"use client";

import { useState, useEffect } from "react";
import { ordersApi, Order } from "@/lib/api";

interface OrderListProps {
  refreshKey?: number;
  onViewOrder?: (order: Order) => void;
}

export default function OrderList({ refreshKey = 0, onViewOrder }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [refreshKey]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: Order["status"]) => {
    try {
      await ordersApi.updateStatus(id, status);
      fetchOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update order");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      await ordersApi.delete(id);
      fetchOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete order");
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  if (loading) return <div className="text-center py-8">Loading orders...</div>;
  if (error) return <div className="text-red-500 py-8">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{order.customerName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{order.customerEmail}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <p className="text-lg font-bold mt-2">
                    ${Number(order.totalAmount).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Shipping Address:</span>{" "}
                  {order.shippingAddress}
                </p>
              </div>

              <div className="mb-3">
                <h4 className="font-medium text-sm mb-2">Items:</h4>
                <ul className="space-y-1">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="text-sm text-gray-700 dark:text-gray-300 flex justify-between"
                    >
                      <span>
                        {item.product.name} x {item.quantity}
                      </span>
                      <span>
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t dark:border-gray-700">
                {onViewOrder && (
                  <button
                    onClick={() => onViewOrder(order)}
                    className="px-4 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    View Details
                  </button>
                )}
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(
                      order.id,
                      e.target.value as Order["status"]
                    )
                  }
                  className="px-3 py-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => handleDelete(order.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Delete
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Created: {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
