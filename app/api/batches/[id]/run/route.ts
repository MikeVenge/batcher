import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const BATCHES_DIR = path.join(process.cwd(), 'data', 'batches')
const PROCESSED_DIR = path.join(process.cwd(), 'data', 'processed')
const API_URL = "https://research-api.alphax.inc/api/v2/public-company/"
const WAIT_TIME = 300000 // 5 minutes in milliseconds
const BATCH_SIZE = 3

interface ProcessingResult {
  success: boolean
  processedTickers: string[]
  failedTickers: string[]
  logs: string[]
}

async function sendTickers(tickers: string[]): Promise<boolean> {
  try {
    const payload = { inputs: ["YYZ", ...tickers] }
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })
    
    return response.status === 200 || response.status === 201
  } catch (error) {
    console.error('API request failed:', error)
    return false
  }
}

function loadProcessedTickers(batchId: string): string[] {
  const processedFile = path.join(PROCESSED_DIR, `${batchId}_processed.txt`)
  if (!fs.existsSync(processedFile)) {
    return []
  }
  
  return fs.readFileSync(processedFile, 'utf8')
    .split('\n')
    .map(t => t.trim().toUpperCase())
    .filter(t => t)
}

function saveProcessedTickers(batchId: string, tickers: string[]) {
  const processedFile = path.join(PROCESSED_DIR, `${batchId}_processed.txt`)
  fs.appendFileSync(processedFile, tickers.join('\n') + '\n')
}

export async function POST(
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
    const processedTickers = loadProcessedTickers(batchId)
    const remainingTickers = batch.tickers.filter((t: string) => !processedTickers.includes(t.toUpperCase()))
    
    if (remainingTickers.length === 0) {
      return NextResponse.json({ 
        message: 'All tickers in this batch have already been processed',
        processedCount: processedTickers.length,
        totalCount: batch.tickers.length
      })
    }

    const result: ProcessingResult = {
      success: true,
      processedTickers: [],
      failedTickers: [],
      logs: []
    }

    result.logs.push(`Starting batch processing for ${remainingTickers.length} remaining tickers`)
    
    // Process tickers in batches
    for (let i = 0; i < remainingTickers.length; i += BATCH_SIZE) {
      const tickerBatch = remainingTickers.slice(i, i + BATCH_SIZE)
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1
      const totalBatches = Math.ceil(remainingTickers.length / BATCH_SIZE)
      
      result.logs.push(`Processing batch ${batchNumber}/${totalBatches}: ${tickerBatch.join(', ')}`)
      
      // Process each ticker individually within the batch
      const successfulTickers: string[] = []
      
      for (const ticker of tickerBatch) {
        result.logs.push(`Processing ticker: ${ticker}`)
        const success = await sendTickers([ticker])
        
        if (success) {
          successfulTickers.push(ticker)
          result.processedTickers.push(ticker)
          result.logs.push(`✓ ${ticker} processed successfully`)
        } else {
          result.failedTickers.push(ticker)
          result.logs.push(`✗ ${ticker} failed to process`)
        }
      }
      
      // Save successful tickers
      if (successfulTickers.length > 0) {
        saveProcessedTickers(batchId, successfulTickers)
        result.logs.push(`Saved ${successfulTickers.length} successful tickers to progress file`)
      }
      
      // Wait between batches (except for the last batch)
      if (i + BATCH_SIZE < remainingTickers.length) {
        result.logs.push(`Waiting 5 minutes before next batch...`)
        await new Promise(resolve => setTimeout(resolve, WAIT_TIME))
      }
    }
    
    result.logs.push(`Batch processing complete. Processed: ${result.processedTickers.length}, Failed: ${result.failedTickers.length}`)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error running batch:', error)
    return NextResponse.json({ 
      error: 'Failed to run batch',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
