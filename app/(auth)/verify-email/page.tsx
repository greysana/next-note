// app/(auth)/verify-email/page.tsx
"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

async function verifyEmailAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;

  if (!email || !otp) {
    return { error: "Email and OTP are required", success: false };
  }

  try {
    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Verification failed", success: false };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error(error);
    return { error: "Network error. Please try again.", success: false };
  }
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    verifyEmailAction,
    null
  );
  const [email, setEmail] = useState("");

  // Redirect to login on success
  if (state?.success) {
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Verify your email
      </h2>
      <p className="text-gray-600 mb-6">
        We&apos;ve sent a verification code to your email address. Please enter
        it below.
      </p>

      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending || state?.success}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="otp"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Verification code
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            required
            disabled={isPending || state?.success}
            maxLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-lg tracking-widest text-center"
            placeholder="123456"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter the 6-digit code from your email
          </p>
        </div>

        {state?.error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
            <p className="font-medium mb-1">Email verified successfully!</p>
            <p>Redirecting to login...</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || state?.success}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isPending ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Verifying...
            </span>
          ) : (
            "Verify email"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Didn&apos;t receive the code?
        </p>
        <button
          type="button"
          disabled={!email || isPending}
          onClick={async () => {
            // Resend OTP logic - call register API again or a dedicated resend endpoint
            if (email) {
              alert("Resending verification code to " + email);
            }
          }}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Resend code
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}
