"use client";

import { useState, useEffect } from "react";
import { customersApi, Customer } from "@/lib/api";

interface CustomerListProps {
  onEdit?: (customer: Customer) => void;
}

export default function CustomerList({ onEdit }: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      await customersApi.delete(id);
      fetchCustomers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete customer");
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading customers...</div>;
  if (error) return <div className="text-red-500 py-8">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Customers</h2>

      {customers.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No customers yet.</p>
      ) : (
        <div className="grid gap-4">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{customer.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{customer.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Orders: {customer.orders?.length || 0}
                  </p>
                </div>
                <div className="flex gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(customer)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Joined: {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
