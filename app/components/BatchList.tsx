'use client'

import { Play, Trash2, Eye, Clock, CheckCircle, BarChart3 } from 'lucide-react'
import { Batch } from '../page'

interface BatchListProps {
  batches: Batch[]
  onRunBatch: (batchId: string) => void
  onDeleteBatch: (batchId: string) => void
  onViewStatus: (batchId: string) => void
  runningBatch: string | null
}

export default function BatchList({
  batches,
  onRunBatch,
  onDeleteBatch,
  onViewStatus,
  runningBatch
}: BatchListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProgressPercentage = (processed: number, total: number) => {
    return total > 0 ? Math.round((processed / total) * 100) : 0
  }

  const getStatusColor = (processed: number, total: number) => {
    const percentage = getProgressPercentage(processed, total)
    if (percentage === 0) return 'bg-gray-200'
    if (percentage === 100) return 'bg-green-500'
    return 'bg-blue-500'
  }

  if (batches.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No batches yet</h3>
        <p className="text-gray-500">Create your first batch to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Batch List</h2>
      
      <div className="grid gap-4">
        {batches.map((batch) => {
          const isRunning = runningBatch === batch.id
          const progress = getProgressPercentage(batch.processedCount, batch.totalCount)
          const isComplete = progress === 100
          const remaining = batch.totalCount - batch.processedCount
          const inCooldown = batch.cooldown && !batch.cooldown.canRun

          return (
            <div
              key={batch.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {batch.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Created: {formatDate(batch.createdAt)}</span>
                    {batch.lastProcessed && (
                      <span>Last run: {formatDate(batch.lastProcessed)}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onViewStatus(batch.id)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="View Status"
                  >
                    <Eye size={18} />
                  </button>
                  
                  <button
                    onClick={() => onRunBatch(batch.id)}
                    disabled={isRunning || (remaining === 0) || inCooldown}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      remaining === 0 
                        ? "All tickers processed" 
                        : inCooldown 
                          ? `Cooldown active - ${batch.cooldown?.remainingTime} remaining`
                          : "Run Batch"
                    }
                  >
                    {isRunning ? (
                      <Clock size={18} className="animate-spin" />
                    ) : (
                      <Play size={18} />
                    )}
                  </button>
                  
                  <button
                    onClick={() => onDeleteBatch(batch.id)}
                    disabled={isRunning}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Batch"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{batch.processedCount.toLocaleString()} / {batch.totalCount.toLocaleString()} ({progress}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(batch.processedCount, batch.totalCount)}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {batch.totalCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {batch.processedCount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {remaining.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Remaining</div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    {isComplete ? (
                      <>
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Complete</span>
                      </>
                    ) : isRunning ? (
                      <>
                        <Clock size={16} className="text-blue-500 animate-spin" />
                        <span className="text-sm text-blue-600 font-medium">Running...</span>
                      </>
                    ) : inCooldown ? (
                      <>
                        <Clock size={16} className="text-orange-500" />
                        <span className="text-sm text-orange-600 font-medium">
                          Cooldown ({batch.cooldown?.remainingTime})
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-500">Ready to run</span>
                      </>
                    )}
                  </div>
                  
                  <div className="text-right">
                    {inCooldown ? (
                      <div className="text-xs">
                        <div className="text-orange-600 font-medium">
                          Cooldown: {batch.cooldown?.remainingTime}
                        </div>
                        {batch.cooldown?.nextRunTime && (
                          <div className="text-orange-500">
                            Next run: {new Date(batch.cooldown.nextRunTime).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                    ) : remaining > 0 ? (
                      <span className="text-xs text-gray-500">
                        ~{Math.ceil(remaining / 3) * 5} min to process
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
