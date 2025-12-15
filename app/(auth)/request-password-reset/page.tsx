'use client';

import { useActionState } from 'react';
import Link from 'next/link';

async function requestResetAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string;

  try {
    const res = await fetch('/api/auth/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || 'Request failed', success: false };
    }

    return { success: true, message: data.message };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // console.error(error)

    return { error: 'Network error. Please try again.', success: false };
  }
}

export default function RequestPasswordResetPage() {
  const [state, formAction, isPending] = useActionState(requestResetAction, null);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to login
        </Link>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Reset your password
      </h2>
      <p className="text-gray-600 mb-6">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending || state?.success}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="you@example.com"
          />
        </div>

        {state?.error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
            <p className="font-medium mb-1">Check your email</p>
            <p>{state.message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || state?.success}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isPending ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Remember your password?{' '}
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:text-indigo-500"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}