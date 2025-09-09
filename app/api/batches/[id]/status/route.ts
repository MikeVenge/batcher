import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const BATCHES_DIR = path.join(process.cwd(), 'data', 'batches')
const PROCESSED_DIR = path.join(process.cwd(), 'data', 'processed')

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
    
    return NextResponse.json({
      batch,
      processedTickers,
      remainingTickers,
      processedCount: processedTickers.length,
      totalCount: batch.tickers.length,
      remainingCount: remainingTickers.length,
      lastProcessed,
      isComplete: remainingTickers.length === 0
    })
    
  } catch (error) {
    console.error('Error getting batch status:', error)
    return NextResponse.json({ error: 'Failed to get batch status' }, { status: 500 })
  }
}
