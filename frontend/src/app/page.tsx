"use client";

import { useState } from "react";
import ProductList from "@/components/ProductList";
import ProductForm from "@/components/ProductForm";
import { Product } from "@/lib/api";
import Link from "next/link";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleProductSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-center dark:text-gray-100">Products Management</h1>
        <Link
          href="/orders"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View Orders
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProductForm 
            onSuccess={handleProductSuccess} 
            editProduct={editingProduct}
            onCancelEdit={() => setEditingProduct(null)}
          />
        </div>

        <div className="lg:col-span-2">
          <ProductList key={refreshKey} onEdit={handleEditProduct} />
        </div>
      </div>
    </main>
  );
}
