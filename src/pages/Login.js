import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-red-500 tracking-widest mb-2">IRON GYM</h1>
          <p className="text-gray-400">Welcome back! Log in to your account</p>
        </div>
        <form onSubmit={handleLogin} className="bg-gray-800 rounded-2xl p-8 flex flex-col gap-4">
          {error && <p className="text-red-400 text-sm bg-red-900 bg-opacity-30 px-4 py-2 rounded">{error}</p>}
          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">Email</label>
            <input required type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-700 text-white px-4 py-3 rounded outline-none border border-gray-600 focus:border-red-500 text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">Password</label>
            <input required type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="bg-gray-700 text-white px-4 py-3 rounded outline-none border border-gray-600 focus:border-red-500 text-sm" />
          </div>
          <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3 rounded transition mt-2">
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="text-center text-gray-400 text-sm">
            Don't have an account? <Link to="/register" className="text-red-400 hover:text-red-300">Join Now</Link>
          </p>
        </form>
        <div className="text-center mt-4">
          <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm transition">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;