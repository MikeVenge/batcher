import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const BATCHES_DIR = path.join(process.cwd(), 'data', 'batches')
const PROCESSED_DIR = path.join(process.cwd(), 'data', 'processed')
const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

function getLastRunTime(batchId: string): Date | null {
  const lastRunFile = path.join(PROCESSED_DIR, `${batchId}_last_run.txt`)
  if (!fs.existsSync(lastRunFile)) {
    return null
  }
  
  try {
    const timestamp = fs.readFileSync(lastRunFile, 'utf8').trim()
    return new Date(timestamp)
  } catch (error) {
    return null
  }
}

function getCooldownInfo(batchId: string): { canRun: boolean; nextRunTime?: Date; remainingTime?: string } {
  const lastRun = getLastRunTime(batchId)
  
  if (!lastRun) {
    return { canRun: true }
  }
  
  const now = new Date()
  const timeSinceLastRun = now.getTime() - lastRun.getTime()
  
  if (timeSinceLastRun >= COOLDOWN_PERIOD) {
    return { canRun: true }
  }
  
  const nextRunTime = new Date(lastRun.getTime() + COOLDOWN_PERIOD)
  const remainingMs = COOLDOWN_PERIOD - timeSinceLastRun
  const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000))
  const remainingMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000))
  
  const remainingTime = remainingHours > 0 
    ? `${remainingHours}h ${remainingMinutes}m`
    : `${remainingMinutes}m`
  
  return { 
    canRun: false, 
    nextRunTime,
    remainingTime 
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const batchId = params.id
    const batchFile = path.join(BATCHES_DIR, `${batchId}.json`)
    
    if (!fs.existsSync(batchFile)) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }

    const batch = JSON.parse(fs.readFileSync(batchFile, 'utf8'))
    const processedFile = path.join(PROCESSED_DIR, `${batchId}_processed.txt`)
    
    let processedTickers: string[] = []
    let lastProcessed: string | null = null
    
    if (fs.existsSync(processedFile)) {
      processedTickers = fs.readFileSync(processedFile, 'utf8')
        .split('\n')
        .map(t => t.trim())
        .filter(t => t)
      lastProcessed = fs.statSync(processedFile).mtime.toISOString()
    }
    
    const remainingTickers = batch.tickers.filter((t: string) => 
      !processedTickers.includes(t.toUpperCase())
    )
    
    // Get cooldown information
    const cooldownInfo = getCooldownInfo(batchId)
    const lastRunTime = getLastRunTime(batchId)
    
    return NextResponse.json({
      batch,
      processedTickers,
      remainingTickers,
      processedCount: processedTickers.length,
      totalCount: batch.tickers.length,
      remainingCount: remainingTickers.length,
      lastProcessed,
      lastRunTime: lastRunTime?.toISOString(),
      isComplete: remainingTickers.length === 0,
      cooldown: {
        canRun: cooldownInfo.canRun,
        nextRunTime: cooldownInfo.nextRunTime?.toISOString(),
        remainingTime: cooldownInfo.remainingTime
      }
    })
    
  } catch (error) {
    console.error('Error getting batch status:', error)
    return NextResponse.json({ error: 'Failed to get batch status' }, { status: 500 })
  }
}
