'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatus({ kind: 'error', message: 'Please enter your email address.' });
      return;
    }

    setStatus({ kind: 'submitting' });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setStatus({
        kind: 'error',
        message:
          'Supabase environment variables are not configured. Please contact support.',
      });
      return;
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: 'https://apertos.vercel.app/auth/reset-password',
    });

    if (error) {
      setStatus({ kind: 'error', message: error.message });
      return;
    }

    setStatus({
      kind: 'success',
      message:
        'If an account exists for that email, a password reset link has been sent. Please check your inbox.',
    });
    setEmail('');
  }

  const isSubmitting = status.kind === 'submitting';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
          placeholder="you@example.com"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
        />
      </div>

      {status.kind === 'error' && (
        <p role="alert" className="text-sm text-red-600">
          {status.message}
        </p>
      )}

      {status.kind === 'success' && (
        <p role="status" className="text-sm text-green-600">
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Sending reset link…' : 'Send reset link'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Remembered your password?{' '}
        <Link
          href="/auth/login"
          className="font-medium text-black hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export default ForgotPasswordForm;
