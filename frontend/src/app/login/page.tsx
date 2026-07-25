'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const res = await fetch('http://localhost:8000/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      setError('Invalid credentials');
      return;
    }

    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    router.push('/');
  };

  return (
    <form onSubmit={handleLogin} className="p-8 max-w-sm mx-auto flex flex-col gap-4">
      <input
        name="username"
        placeholder="Username"
        autoComplete="username"
        className="border p-2 rounded"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        className="border p-2 rounded"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="bg-black text-white p-2 rounded">
        Log in
      </button>
    </form>
  );
}