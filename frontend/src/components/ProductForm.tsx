"use client";

import { useState, useEffect } from "react";
import { productsApi, CreateProductDto, Product } from "@/lib/api";

interface ProductFormProps {
  onSuccess?: () => void;
  editProduct?: Product | null;
  onCancelEdit?: () => void;
}

export default function ProductForm({ onSuccess, editProduct, onCancelEdit }: ProductFormProps) {
  const [formData, setFormData] = useState<CreateProductDto>({
    name: "",
    description: "",
    price: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name,
        description: editProduct.description,
        price: editProduct.price,
      });
    } else {
      setFormData({ name: "", description: "", price: 0 });
    }
  }, [editProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate price
      if (isNaN(formData.price) || formData.price < 0) {
        setError("Please enter a valid price (must be 0 or greater)");
        setLoading(false);
        return;
      }

      if (editProduct) {
        // Only send fields that have changed
        const updates: Partial<typeof formData> = {};
        if (formData.name !== editProduct.name) updates.name = formData.name;
        if (formData.description !== editProduct.description) updates.description = formData.description;
        if (formData.price !== editProduct.price) updates.price = formData.price;
        
        // If nothing changed, just close the form
        if (Object.keys(updates).length === 0) {
          if (onSuccess) onSuccess();
          if (onCancelEdit) onCancelEdit();
          setLoading(false);
          return;
        }
        
        await productsApi.update(editProduct.id, updates);
      } else {
        await productsApi.create(formData);
      }
      setFormData({ name: "", description: "", price: 0 });
      if (onSuccess) onSuccess();
      if (onCancelEdit) onCancelEdit();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : (editProduct ? "Failed to update product" : "Failed to create product");
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "", price: 0 });
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-lg shadow"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {editProduct ? "Edit Product" : "Add New Product"}
        </h2>
        {editProduct && (
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          required
          rows={3}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium mb-1">
          Price
        </label>
        <input
          type="number"
          id="price"
          required
          min="0"
          step="0.01"
          value={formData.price || ""}
          onChange={(e) => {
            const value = e.target.value;
            setFormData({ ...formData, price: value === "" ? 0 : parseFloat(value) });
          }}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Saving..." : editProduct ? "Update Product" : "Add Product"}
      </button>
    </form>
  );
}
