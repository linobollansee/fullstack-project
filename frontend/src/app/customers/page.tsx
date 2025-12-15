"use client";

import { useState } from "react";
import CustomerList from "@/components/CustomerList";
import CustomerForm from "@/components/CustomerForm";
import { Customer } from "@/lib/api";
import Link from "next/link";

export default function CustomersPage() {
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditSuccess = () => {
    setEditingCustomer(null);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Customers</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Products
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {editingCustomer && (
            <div className="lg:col-span-1">
              <CustomerForm 
                customer={editingCustomer}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingCustomer(null)}
              />
            </div>
          )}
          <div className={editingCustomer ? "lg:col-span-2" : "lg:col-span-3"}>
            <CustomerList key={refreshKey} onEdit={setEditingCustomer} />
          </div>
        </div>
      </div>
    </div>
  );
}
