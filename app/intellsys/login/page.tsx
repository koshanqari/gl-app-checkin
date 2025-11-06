'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@atlaskit/button';
import TextField from '@atlaskit/textfield';
import { Field } from '@atlaskit/form';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple authentication check
    if (username === 'goldenlotus' && password === 'intellsys') {
      // Store auth token in localStorage
      localStorage.setItem('intellsys_auth', 'authenticated');
      router.push('/intellsys');
    } else {
      setError('Invalid username or password');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Golden Lotus
            </h1>
            <div className="border-l-4 border-amber-500 pl-4 inline-block">
              <h2 className="text-xl font-semibold text-amber-600">
                Intellsys Panel Login
              </h2>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Field name="username" label="Username" isRequired>
              {({ fieldProps }) => (
                <TextField
                  {...fieldProps}
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="username"
                />
              )}
            </Field>

            <Field name="password" label="Password" isRequired>
              {({ fieldProps }) => (
                <TextField
                  {...fieldProps}
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              )}
            </Field>

            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="pt-4">
              <Button
                appearance="primary"
                type="submit"
                isDisabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-amber-600 hover:text-amber-800 font-medium"
            >
              ← Back to Check-In Form
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

