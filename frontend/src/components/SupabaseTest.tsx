import { useState, useEffect } from 'react'
import { testSupabaseConnection } from '../utils/testSupabase'
import { supabase } from '../lib/supabase'

export function SupabaseTest() {
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [envCheck, setEnvCheck] = useState<{ hasUrl: boolean; hasKey: boolean } | null>(null)

  useEffect(() => {
    // Check environment variables on mount
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    setEnvCheck({
      hasUrl: !!url,
      hasKey: !!key
    })
  }, [])

  const handleTest = async () => {
    if (!supabase) {
      setResult({
        success: false,
        error: 'Supabase client not initialized. Please check your .env file.'
      })
      return
    }

    setLoading(true)
    setResult(null)
    
    try {
      const testResult = await testSupabaseConnection()
      setResult(testResult)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-white p-6">
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-text-primary mb-4">Supabase Connection Test</h2>
      
      {/* Environment Variables Check */}
      {envCheck && (
        <div className={`mb-6 p-4 rounded-lg ${
          envCheck.hasUrl && envCheck.hasKey
            ? 'bg-success/10 border border-success/20'
            : 'bg-error/10 border border-error/20'
        }`}>
          <h3 className="font-semibold mb-2">Environment Variables:</h3>
          <ul className="text-sm space-y-1">
            <li>
              {envCheck.hasUrl ? '✅' : '❌'} VITE_SUPABASE_URL: {
                envCheck.hasUrl ? 'Set' : 'Missing'
              }
            </li>
            <li>
              {envCheck.hasKey ? '✅' : '❌'} VITE_SUPABASE_ANON_KEY: {
                envCheck.hasKey ? 'Set' : 'Missing'
              }
            </li>
          </ul>
          {(!envCheck.hasUrl || !envCheck.hasKey) && (
            <p className="text-sm text-text-secondary mt-2">
              Please create a <code className="bg-gray-100 px-1 rounded">.env</code> file in the <code className="bg-gray-100 px-1 rounded">frontend/</code> directory with your Supabase credentials.
            </p>
          )}
        </div>
      )}

      {!supabase && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-error font-semibold">⚠️ Supabase client not initialized</p>
          <p className="text-sm text-text-secondary mt-2">
            Make sure your .env file is in the frontend/ directory and contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
          </p>
        </div>
      )}
      
      <p className="text-text-secondary mb-6">
        Click the button below to test your Supabase configuration. Check the browser console for detailed logs.
      </p>

      <button
        onClick={handleTest}
        disabled={loading || !supabase}
        className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Testing...' : 'Test Supabase Connection'}
      </button>

      {result && (
        <div className={`mt-6 p-4 rounded-lg ${
          result.success 
            ? 'bg-success/10 border border-success/20' 
            : 'bg-error/10 border border-error/20'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {result.success ? (
              <>
                <span className="text-2xl">✅</span>
                <span className="font-semibold text-success">Connection Successful!</span>
              </>
            ) : (
              <>
                <span className="text-2xl">❌</span>
                <span className="font-semibold text-error">Connection Failed</span>
              </>
            )}
          </div>
          
          {result.message && (
            <p className="text-sm text-text-secondary mt-2">{result.message}</p>
          )}
          
          {result.error && (
            <div className="mt-2">
              <p className="text-sm font-semibold text-error mb-1">Error:</p>
              <p className="text-sm text-text-secondary font-mono bg-gray-100 p-2 rounded">
                {result.error}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-text-secondary">
          <strong>Tip:</strong> Open your browser's Developer Console (F12) to see detailed test logs.
        </p>
      </div>
      </div>
    </div>
  )
}
