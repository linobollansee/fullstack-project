"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Don't show nav on auth pages
  if (pathname?.startsWith("/auth")) return null;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Link href="/" className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              Products
            </Link>
            <Link
              href="/orders"
              className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Orders
            </Link>
            <Link
              href="/customers"
              className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Customers
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Hello, {user.name}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
