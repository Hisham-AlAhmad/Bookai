'use client'

import { useCallback, useEffect, useReducer } from 'react'

/**
 * useAnalytics
 *
 * Reusable hook for fetching analytics data from /api/analytics.
 * Accepts an optional `scope` parameter for super admin platform-wide data.
 *
 * @param {{ scope?: 'platform' }} [options]
 */
export function useAnalytics(options = {}) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const fetchData = useCallback(async () => {
    dispatch({ type: 'LOADING' })
    try {
      const params = options.scope ? `?scope=${options.scope}` : ''
      const res = await fetch(`/api/analytics${params}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load analytics')
      }
      const data = await res.json()
      dispatch({ type: 'SUCCESS', payload: data })
    } catch (err) {
      dispatch({ type: 'ERROR', error: err.message })
    }
  }, [options.scope])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}

const INITIAL_STATE = {
  loading: true,
  error: null,
  kpis: null,
  charts: null,
  flaggedCustomers: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null }
    case 'SUCCESS':
      return {
        loading: false,
        error: null,
        kpis: action.payload.kpis,
        charts: action.payload.charts,
        flaggedCustomers: action.payload.flaggedCustomers,
      }
    case 'ERROR':
      return { ...state, loading: false, error: action.error }
    default:
      return state
  }
}