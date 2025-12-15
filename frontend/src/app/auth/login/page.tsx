"use client";

import LoginForm from "@/components/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto">
        <LoginForm />
        <p className="text-center mt-4 dark:text-gray-300">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-blue-500 dark:text-blue-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
