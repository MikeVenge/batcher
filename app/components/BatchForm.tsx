'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface BatchFormProps {
  onSubmit: (name: string, tickers: string[]) => void
  onCancel: () => void
}

export default function BatchForm({ onSubmit, onCancel }: BatchFormProps) {
  const [name, setName] = useState('')
  const [tickersText, setTickersText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !tickersText.trim()) return

    setLoading(true)
    
    // Parse tickers from text (split by newlines, commas, or spaces)
    const tickers = tickersText
      .split(/[\n,\s]+/)
      .map(t => t.trim().toUpperCase())
      .filter(t => t && /^[A-Z]{1,5}$/.test(t)) // Basic ticker validation
    
    if (tickers.length === 0) {
      alert('Please enter valid stock tickers')
      setLoading(false)
      return
    }

    try {
      await onSubmit(name, tickers)
    } finally {
      setLoading(false)
    }
  }

  const handleTickersChange = (value: string) => {
    setTickersText(value)
  }

  const getTickerCount = () => {
    const tickers = tickersText
      .split(/[\n,\s]+/)
      .map(t => t.trim().toUpperCase())
      .filter(t => t && /^[A-Z]{1,5}$/.test(t))
    return tickers.length
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Batch</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Batch Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Tech Stocks Q4"
              required
            />
          </div>

          <div>
            <label htmlFor="tickers" className="block text-sm font-medium text-gray-700 mb-1">
              Stock Tickers
            </label>
            <textarea
              id="tickers"
              value={tickersText}
              onChange={(e) => handleTickersChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={8}
              placeholder="Enter stock tickers separated by commas, spaces, or new lines&#10;&#10;Examples:&#10;AAPL, MSFT, GOOGL&#10;AAPL MSFT GOOGL&#10;AAPL&#10;MSFT&#10;GOOGL"
              required
            />
            <div className="text-sm text-gray-500 mt-1">
              Valid tickers found: {getTickerCount().toLocaleString()}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !tickersText.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
