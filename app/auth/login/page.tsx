'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import supabase from '@/lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      router.push('/dashboard');
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleLogin} className="w-80 space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
        <button type="submit" className="w-full rounded bg-blue-600 p-2 text-white">
          Login
        </button>
        <div className="text-center mt-4">
          <span className="text-gray-600">Don't have an account?</span>
          <a
            href="/auth/register"
            className="ml-2 text-blue-600 hover:underline"
          >
            Register
          </a>
        </div>
      </form>
    </div>
  );
}
