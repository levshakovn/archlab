/**
 * Quick validation script
 * Import this in your app to check Supabase setup on load
 */
import { supabase } from '../lib/supabase'

export async function validateSupabaseSetup() {
  const results = {
    envVars: false,
    clientInit: false,
    database: false,
    storage: false,
    errors: [] as string[]
  }

  try {
    // Check environment variables
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (url && key) {
      results.envVars = true
      console.log('✅ Environment variables: OK')
    } else {
      results.errors.push('Missing environment variables')
      console.error('❌ Environment variables: FAILED')
      return results
    }

    // Check client initialization
    if (supabase) {
      results.clientInit = true
      console.log('✅ Supabase client: OK')
    } else {
      results.errors.push('Supabase client not initialized')
      console.error('❌ Supabase client: FAILED')
      return results
    }

    // Test database connection
    try {
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (error) {
        results.errors.push(`Database error: ${error.message}`)
        console.error('❌ Database connection: FAILED', error.message)
      } else {
        results.database = true
        console.log('✅ Database connection: OK')
      }
    } catch (error) {
      results.errors.push(`Database test failed: ${error}`)
      console.error('❌ Database connection: FAILED', error)
    }

    // Test storage (optional - not critical)
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets()
      if (error) {
        console.warn('⚠️ Storage check: Warning', error.message)
      } else {
        const hasBucket = buckets?.some(b => b.name === 'profile-photos')
        if (hasBucket) {
          results.storage = true
          console.log('✅ Storage bucket: OK')
        } else {
          console.warn('⚠️ Storage bucket: profile-photos not found (optional)')
        }
      }
    } catch (error) {
      console.warn('⚠️ Storage check: Warning', error)
    }

    // Summary
    const allCritical = results.envVars && results.clientInit && results.database
    if (allCritical) {
      console.log('')
      console.log('🎉 Supabase setup is valid!')
      console.log('')
    } else {
      console.log('')
      console.log('❌ Some checks failed. See errors above.')
      console.log('')
    }

    return results
  } catch (error) {
    results.errors.push(`Validation failed: ${error}`)
    console.error('❌ Validation error:', error)
    return results
  }
}
