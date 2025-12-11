"use client";

import CustomerList from "@/components/CustomerList";
import Link from "next/link";

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Customers</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Products
          </Link>
        </div>

        <CustomerList />
      </div>
    </div>
  );
}
