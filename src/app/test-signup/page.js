"use client";
import { useState } from 'react';

export default function TestSignup() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testSignup = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const testEmail = `test${Date.now()}@example.com`;
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: 'test123'
        })
      });

      const data = await response.json();
      
      setResult(JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data: data
      }, null, 2));
    } catch (error) {
      setResult(`Error: ${error.message}\n${error.stack}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Signup API Test</h1>
      <button 
        onClick={testSignup}
        disabled={loading}
        style={{
          padding: '1rem 2rem',
          fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          backgroundColor: loading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}
      >
        {loading ? 'Testing...' : 'Test Signup API'}
      </button>
      
      {result && (
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '1rem',
          borderRadius: '8px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}>
          {result}
        </pre>
      )}
    </div>
  );
}
