"use client";

import { useState, useEffect } from "react";
import {
  ordersApi,
  productsApi,
  Product,
  CreateOrderDto,
  OrderItemDto,
} from "@/lib/api";

interface OrderFormProps {
  onSuccess?: () => void;
}

export default function OrderForm({ onSuccess }: OrderFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    shippingAddress: "",
  });
  const [orderItems, setOrderItems] = useState<OrderItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  const addItem = () => {
    setOrderItems([...orderItems, { productId: 0, quantity: 1 }]);
  };

  const updateItem = (
    index: number,
    field: keyof OrderItemDto,
    value: number
  ) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        return total + Number(product.price) * item.quantity;
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (orderItems.length === 0) {
      setError("Please add at least one item to the order");
      return;
    }

    if (orderItems.some((item) => item.productId === 0)) {
      setError("Please select a product for all items");
      return;
    }

    try {
      setLoading(true);
      const orderData: CreateOrderDto = {
        ...formData,
        items: orderItems,
      };

      await ordersApi.create(orderData);

      // Reset form
      setFormData({
        customerName: "",
        customerEmail: "",
        shippingAddress: "",
      });
      setOrderItems([]);

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
    >
      <h2 className="text-2xl font-bold mb-4">Create New Order</h2>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-200">Customer Name</label>
        <input
          type="text"
          required
          value={formData.customerName}
          onChange={(e) =>
            setFormData({ ...formData, customerName: e.target.value })
          }
          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-200">Customer Email</label>
        <input
          type="email"
          required
          value={formData.customerEmail}
          onChange={(e) =>
            setFormData({ ...formData, customerEmail: e.target.value })
          }
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Shipping Address
        </label>
        <textarea
          required
          value={formData.shippingAddress}
          onChange={(e) =>
            setFormData({ ...formData, shippingAddress: e.target.value })
          }
          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded"
          rows={3}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium dark:text-gray-200">Order Items</label>
          <button
            type="button"
            onClick={addItem}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Add Item
          </button>
        </div>

        {orderItems.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <select
              value={item.productId}
              onChange={(e) =>
                updateItem(index, "productId", Number(e.target.value))
              }
              className="flex-1 px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded"
              required
            >
              <option value={0}>Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${Number(product.price).toFixed(2)}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                updateItem(index, "quantity", Number(e.target.value))
              }
              className="w-20 px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded"
              required
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {orderItems.length > 0 && (
        <div className="text-right">
          <p className="text-lg font-bold">
            Total: ${calculateTotal().toFixed(2)}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:dark:bg-gray-600"
      >
        {loading ? "Creating..." : "Create Order"}
      </button>
    </form>
  );
}
