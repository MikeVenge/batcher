'use client'

import { useState, useEffect } from 'react'
import { Server, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { BACKEND_CONFIG } from '../config/api'

export default function BackendStatus() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkBackendHealth = async () => {
    setBackendStatus('checking')
    try {
      const response = await fetch(`${BACKEND_CONFIG.URL}${BACKEND_CONFIG.HEALTH_ENDPOINT}`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      if (response.ok) {
        setBackendStatus('online')
      } else {
        setBackendStatus('offline')
      }
    } catch (error) {
      console.error('Backend health check failed:', error)
      setBackendStatus('offline')
    } finally {
      setLastCheck(new Date())
    }
  }

  useEffect(() => {
    checkBackendHealth()
    // Check every 30 seconds
    const interval = setInterval(checkBackendHealth, 30000)
    return () => clearInterval(interval)
  }, [])


  const getStatusIcon = () => {
    switch (backendStatus) {
      case 'checking':
        return <RefreshCw size={16} className="animate-spin text-blue-500" />
      case 'online':
        return <CheckCircle size={16} className="text-green-500" />
      case 'offline':
        return <AlertCircle size={16} className="text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (backendStatus) {
      case 'checking':
        return 'Checking...'
      case 'online':
        return 'Online'
      case 'offline':
        return 'Offline'
    }
  }

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'checking':
        return 'border-blue-200 bg-blue-50'
      case 'online':
        return 'border-green-200 bg-green-50'
      case 'offline':
        return 'border-red-200 bg-red-50'
    }
  }

  return (
    <div className={`border rounded-lg p-4 mb-6 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Server size={20} className="text-gray-600" />
          <div>
            <h3 className="font-medium text-gray-900">Backend Server</h3>
            <p className="text-sm text-gray-500">{BACKEND_CONFIG.URL}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
          <button
            onClick={checkBackendHealth}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="Refresh status"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {lastCheck && (
        <div className="text-xs text-gray-500 mb-3">
          Last checked: {lastCheck.toLocaleTimeString()}
        </div>
      )}


      {backendStatus === 'offline' && (
        <div className="text-sm text-red-600">
          ⚠️ Backend server is not accessible. Check server status and firewall settings.
        </div>
      )}
    </div>
  )
}
