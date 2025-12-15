"use client";

import { useState, useEffect } from "react";
import { customersApi, UpdateCustomerDto, Customer } from "@/lib/api";

interface CustomerFormProps {
  customer: Customer;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState<UpdateCustomerDto>({
    name: customer.name,
    email: customer.email,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      name: customer.name,
      email: customer.email,
    });
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await customersApi.update(customer.id, formData);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update customer");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
    >
      <h2 className="text-2xl font-bold mb-4">Edit Customer Profile</h2>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-gray-200">
          Name
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1 dark:text-gray-200">
          Email
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1 dark:text-gray-200">
          New Password (optional)
        </label>
        <input
          type="password"
          id="password"
          minLength={6}
          placeholder="Leave blank to keep current password"
          value={formData.password || ""}
          onChange={(e) => setFormData({ ...formData, password: e.target.value || undefined })}
          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:dark:bg-gray-600"
        >
          {loading ? "Saving..." : "Update Profile"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
