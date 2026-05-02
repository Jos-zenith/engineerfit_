'use client'

import { useEffect } from 'react'

/**
 * Suppresses Supabase-related errors that occur in offline/disconnected environments.
 * This prevents console spam from lock timeouts and network failures when Supabase is unreachable.
 */
export function SupabaseErrorHandler() {
  useEffect(() => {
    // Suppress specific Supabase console errors
    const originalError = console.error
    const originalWarn = console.warn

    const shouldSuppressError = (args: any[]) => {
      const message = String(args?.[0] || '')
      return (
        message.includes('@supabase/gotrue-js') ||
        message.includes('Lock') ||
        message.includes('ERR_NAME_NOT_RESOLVED') ||
        message.includes('Failed to fetch') ||
        message.includes('AuthRetryableFetchError') ||
        message.includes('wugocmaoscwxmklyfsfl.supabase.co')
      )
    }

    // Override console.error to filter Supabase errors
    console.error = function (...args: any[]) {
      if (!shouldSuppressError(args)) {
        originalError.apply(console, args)
      }
    }

    // Override console.warn to filter Supabase warnings
    console.warn = function (...args: any[]) {
      if (!shouldSuppressError(args)) {
        originalWarn.apply(console, args)
      }
    }

    // Also suppress uncaught promise rejections from Supabase
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason || '')
      if (
        reason.includes('Lock') ||
        reason.includes('Failed to fetch') ||
        reason.includes('ERR_NAME_NOT_RESOLVED')
      ) {
        event.preventDefault()
      }
    }

    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      // Restore console methods on cleanup
      console.error = originalError
      console.warn = originalWarn
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}
