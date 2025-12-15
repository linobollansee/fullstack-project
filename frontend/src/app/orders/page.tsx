"use client";

import { useState } from "react";
import OrderForm from "@/components/OrderForm";
import OrderList from "@/components/OrderList";
import OrderEditForm from "@/components/OrderEditForm";
import { Order } from "@/lib/api";
import Link from "next/link";

export default function OrdersPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const handleOrderCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOrderUpdated = () => {
    setRefreshKey((prev) => prev + 1);
    setViewingOrder(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold dark:text-gray-100">Order Management</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
          >
            Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            {viewingOrder ? (
              <OrderEditForm 
                order={viewingOrder} 
                onSuccess={handleOrderUpdated}
                onCancel={() => setViewingOrder(null)}
              />
            ) : (
              <OrderForm onSuccess={handleOrderCreated} />
            )}
          </div>

          <div className="lg:col-span-2">
            <OrderList refreshKey={refreshKey} onViewOrder={setViewingOrder} />
          </div>
        </div>
      </div>
    </div>
  );
}
