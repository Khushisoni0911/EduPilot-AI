
import React, { useState } from 'react';
import { login, register } from '../../shared/utils/auth';

interface AuthPageProps {
  onAuthenticated: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }

      onAuthenticated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-gray-50 px-6 py-8">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-sm">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-gray-900">EduPilot AI</h1>
          <p className="mt-2 text-sm text-gray-500">
            Your personal AI-powered learning assistant
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`rounded-md py-2 text-sm font-medium ${
              isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            className={`rounded-md py-2 text-sm font-medium ${
              !isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              minLength={8}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? 'Please wait...'
              : isLogin
                ? 'Login to EduPilot'
                : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Your learning journey starts here.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
