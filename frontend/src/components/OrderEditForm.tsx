"use client";

import { useState, useEffect } from "react";
import { ordersApi, Order, OrderStatus } from "@/lib/api";

interface OrderEditFormProps {
  order: Order;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function OrderEditForm({ order, onSuccess, onCancel }: OrderEditFormProps) {
  const [status, setStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStatus(order.status);
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await ordersApi.updateStatus(order.id, status);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 border-yellow-400 text-yellow-800",
      processing: "bg-blue-100 border-blue-400 text-blue-800",
      shipped: "bg-purple-100 border-purple-400 text-purple-800",
      delivered: "bg-green-100 border-green-400 text-green-800",
      cancelled: "bg-red-100 border-red-400 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 border-gray-400 text-gray-800";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Order Details</h2>

      <div className="space-y-4 mb-6">
        <div>
          <p className="text-sm text-gray-600">Order ID</p>
          <p className="font-semibold">#{order.id}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Customer</p>
          <p className="font-semibold">{order.customerName}</p>
          <p className="text-sm text-gray-500">{order.customerEmail}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Shipping Address</p>
          <p className="text-sm">{order.shippingAddress}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Items</p>
          <ul className="space-y-2 mt-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.product.name} <span className="text-gray-500">x {item.quantity}</span>
                </span>
                <span className="font-medium">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold">Total Amount</p>
            <p className="text-2xl font-bold text-green-600">
              ${Number(order.totalAmount).toFixed(2)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            Created: {new Date(order.createdAt).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            Last Updated: {new Date(order.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-2">
            Order Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(status)}`}
          >
            <option value={OrderStatus.PENDING}>Pending</option>
            <option value={OrderStatus.PROCESSING}>Processing</option>
            <option value={OrderStatus.SHIPPED}>Shipped</option>
            <option value={OrderStatus.DELIVERED}>Delivered</option>
            <option value={OrderStatus.CANCELLED}>Cancelled</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Change the order status to update the customer
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || status === order.status}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Status"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Close
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
