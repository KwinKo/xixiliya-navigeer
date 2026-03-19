'use client';

import { useEffect, useState } from 'react';

export default function DBTestPage() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('/api/db-test');
        const data = await response.json();
        if (response.ok) {
          setResult(JSON.stringify(data, null, 2));
        } else {
          setError(data.error || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Connection failed');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
        {result && (
          <div className="bg-green-100 p-4 rounded">
            <h2 className="font-semibold mb-2">Success:</h2>
            <pre className="text-sm">{result}</pre>
          </div>
        )}
        {error && (
          <div className="bg-red-100 p-4 rounded">
            <h2 className="font-semibold mb-2">Error:</h2>
            <p className="text-sm">{error}</p>
          </div>
        )}
        {!result && !error && (
          <p>Testing database connection...</p>
        )}
      </div>
    </div>
  );
}