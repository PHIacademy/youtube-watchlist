import { useState } from 'react';

export default function TestPage() {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Database Connection Test</h1>
      
      <div className="test-section">
        <button 
          onClick={testConnection}
          disabled={isLoading}
          className="test-button"
        >
          {isLoading ? 'Testing...' : 'Test Database Connection'}
        </button>

        {testResult && (
          <div className="result-section">
            <h2>Test Result:</h2>
            <pre className="result-data">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="error-section">
            <h2>Error:</h2>
            <pre className="error-data">
              {error}
            </pre>
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 1rem;
        }

        h1 {
          color: #333;
          text-align: center;
          margin-bottom: 2rem;
        }

        .test-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .test-button {
          padding: 1rem;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }

        .test-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .result-section, .error-section {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 4px;
        }

        .result-section {
          background-color: #f0f8ff;
        }

        .error-section {
          background-color: #fff0f0;
        }

        .result-data, .error-data {
          background-color: #fff;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}