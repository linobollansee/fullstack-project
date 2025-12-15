"use client";

import RegisterForm from "@/components/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto">
        <RegisterForm />
        <p className="text-center mt-4 dark:text-gray-300">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-500 dark:text-blue-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
