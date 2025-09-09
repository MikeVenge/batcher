'use client'

import { useState, useEffect } from 'react'
import { Plus, Play, Trash2, Eye, Clock, CheckCircle } from 'lucide-react'
import BatchForm from './components/BatchForm'
import BatchList from './components/BatchList'
import BatchStatus from './components/BatchStatus'
import BackendStatus from './components/BackendStatus'

export interface Batch {
  id: string
  name: string
  tickers: string[]
  createdAt: string
  processedCount: number
  totalCount: number
  lastProcessed: string | null
}

export default function Home() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [runningBatch, setRunningBatch] = useState<string | null>(null)

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/batches')
      if (response.ok) {
        const data = await response.json()
        setBatches(data)
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBatches()
  }, [])

  const handleCreateBatch = async (name: string, tickers: string[]) => {
    try {
      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, tickers }),
      })
      
      if (response.ok) {
        setShowForm(false)
        fetchBatches()
      }
    } catch (error) {
      console.error('Failed to create batch:', error)
    }
  }

  const handleRunBatch = async (batchId: string) => {
    setRunningBatch(batchId)
    try {
      const response = await fetch(`/api/batches/${batchId}/run`, {
        method: 'POST',
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Batch run result:', result)
        fetchBatches() // Refresh to show updated counts
      }
    } catch (error) {
      console.error('Failed to run batch:', error)
    } finally {
      setRunningBatch(null)
    }
  }

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return
    
    try {
      const response = await fetch(`/api/batches?id=${batchId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        fetchBatches()
      }
    } catch (error) {
      console.error('Failed to delete batch:', error)
    }
  }

  const handleBackendTrigger = (type: 'equity' | 'startup') => {
    console.log(`Backend ${type} batch triggered`)
    // Optionally refresh batches or show notification
    setTimeout(() => {
      fetchBatches()
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Equity Batch Manager
          </h1>
          <p className="text-gray-600">
            Create and manage stock ticker batch processing
          </p>
        </div>

        <BackendStatus onTriggerBatch={handleBackendTrigger} />

        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Create New Batch
          </button>
        </div>

        {showForm && (
          <BatchForm
            onSubmit={handleCreateBatch}
            onCancel={() => setShowForm(false)}
          />
        )}

        {selectedBatch && (
          <BatchStatus
            batchId={selectedBatch}
            onClose={() => setSelectedBatch(null)}
          />
        )}

        <BatchList
          batches={batches}
          onRunBatch={handleRunBatch}
          onDeleteBatch={handleDeleteBatch}
          onViewStatus={setSelectedBatch}
          runningBatch={runningBatch}
        />
      </div>
    </div>
  )
}
