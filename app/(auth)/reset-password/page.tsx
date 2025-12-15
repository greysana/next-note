'use client';

import { useActionState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

async function resetPasswordAction(prevState: unknown, formData: FormData) {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!token) {
    return { error: 'Invalid reset link', success: false };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match', success: false };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters', success: false };
  }

  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || 'Password reset failed', success: false };
    }

    return { success: true, message: data.message };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // console.error(error)

    return { error: 'Network error. Please try again.', success: false };
  }
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);

  // Redirect to login on success
  if (state?.success) {
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  }

  if (!token) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Invalid Reset Link
        </h2>
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          This password reset link is invalid or has expired.
        </div>
        <Link
          href="/request-password-reset"
          className="text-indigo-600 hover:text-indigo-500 font-medium"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Set new password
      </h2>
      <p className="text-gray-600 mb-6">
        Enter your new password below.
      </p>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            disabled={isPending || state?.success}
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 8 characters
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            disabled={isPending || state?.success}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="••••••••"
          />
        </div>

        {state?.error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">
            <p className="font-medium mb-1">Password reset successful!</p>
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
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Resetting password...
            </span>
          ) : (
            'Reset password'
          )}
        </button>
      </form>

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}