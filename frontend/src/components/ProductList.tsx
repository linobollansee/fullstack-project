"use client";

import { useEffect, useState } from "react";
import { Product, productsApi } from "@/lib/api";

interface ProductListProps {
  onEdit?: (product: Product) => void;
}

export default function ProductList({ onEdit }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await productsApi.delete(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete product");
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 py-8">{error}</div>;

  return (
    <div className="space-y-4">
      {products.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No products found</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-600">
                  ${Number(product.price).toFixed(2)}
                </span>
                <div className="flex gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(product)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
