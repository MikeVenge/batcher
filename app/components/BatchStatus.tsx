'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react'

interface BatchStatusProps {
  batchId: string
  onClose: () => void
}

interface BatchStatusData {
  batch: {
    id: string
    name: string
    tickers: string[]
    createdAt: string
  }
  processedTickers: string[]
  remainingTickers: string[]
  processedCount: number
  totalCount: number
  remainingCount: number
  lastProcessed: string | null
  isComplete: boolean
}

export default function BatchStatus({ batchId, onClose }: BatchStatusProps) {
  const [status, setStatus] = useState<BatchStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/batches/${batchId}/status`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch batch status')
      }
      
      const data = await response.json()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [batchId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getProgressPercentage = () => {
    if (!status) return 0
    return status.totalCount > 0 ? Math.round((status.processedCount / status.totalCount) * 100) : 0
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center">
            <RefreshCw size={24} className="animate-spin text-blue-500" />
            <span className="ml-2">Loading batch status...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          <div className="flex items-center text-red-600">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={fetchStatus}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!status) return null

  const progress = getProgressPercentage()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{status.batch.name}</h2>
            <p className="text-gray-500">Batch Status</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchStatus}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{status.totalCount.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Tickers</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{status.processedCount.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Processed</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{status.remainingCount.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Remaining</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{progress}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{status.processedCount.toLocaleString()} / {status.totalCount.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status and Dates */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {status.isComplete ? (
                <>
                  <CheckCircle size={20} className="text-green-500" />
                  <span className="text-green-600 font-medium">Complete</span>
                </>
              ) : (
                <>
                  <Clock size={20} className="text-blue-500" />
                  <span className="text-blue-600 font-medium">In Progress</span>
                </>
              )}
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>Created: {formatDate(status.batch.createdAt)}</div>
              {status.lastProcessed && (
                <div>Last processed: {formatDate(status.lastProcessed)}</div>
              )}
            </div>
          </div>
        </div>

        {/* Ticker Lists */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Processed Tickers */}
          <div>
            <h3 className="text-lg font-medium text-green-600 mb-3 flex items-center">
              <CheckCircle size={18} className="mr-2" />
              Processed ({status.processedCount.toLocaleString()})
            </h3>
            <div className="bg-green-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              {status.processedTickers.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {status.processedTickers.map((ticker) => (
                    <span
                      key={ticker}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-mono"
                    >
                      {ticker}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">No tickers processed yet</div>
              )}
            </div>
          </div>

          {/* Remaining Tickers */}
          <div>
            <h3 className="text-lg font-medium text-blue-600 mb-3 flex items-center">
              <Clock size={18} className="mr-2" />
              Remaining ({status.remainingCount.toLocaleString()})
            </h3>
            <div className="bg-blue-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              {status.remainingTickers.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {status.remainingTickers.map((ticker) => (
                    <span
                      key={ticker}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-mono"
                    >
                      {ticker}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">All tickers processed!</div>
              )}
            </div>
          </div>
        </div>

        {/* API Call Details */}
        {status.batch.apiCalls && status.batch.apiCalls.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Recent API Calls</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {status.batch.apiCalls.slice(-10).map((call: any, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md border-l-4 ${
                      call.status === 'success' 
                        ? 'bg-green-50 border-green-400' 
                        : 'bg-red-50 border-red-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">
                          {call.status === 'success' ? '✅' : '❌'} {call.tickers.join(', ')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(call.timestamp).toLocaleTimeString()}
                          {call.httpStatus && ` • HTTP ${call.httpStatus}`}
                        </div>
                      </div>
                      <div className="text-right">
                        {call.status === 'success' ? (
                          <span className="text-xs text-green-600">Success</span>
                        ) : (
                          <span className="text-xs text-red-600">Failed</span>
                        )}
                      </div>
                    </div>
                    {call.error && (
                      <div className="mt-1 text-xs text-red-600">{call.error}</div>
                    )}
                    {call.response && call.response.message && (
                      <div className="mt-1 text-xs text-green-600">{call.response.message}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Estimated Time */}
        {status.remainingCount > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Estimated time remaining:</strong> ~{Math.ceil(status.remainingCount / 2) * 2} seconds for API calls + batch intervals
              <div className="text-xs text-blue-600 mt-1">
                Based on max 2 tickers per API call with 2-second intervals, plus 5-minute batch intervals
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
