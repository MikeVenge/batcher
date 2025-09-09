import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const BATCHES_DIR = path.join(process.cwd(), 'data', 'batches')
const PROCESSED_DIR = path.join(process.cwd(), 'data', 'processed')
const API_URL = "https://research-api.alphax.inc/api/v2/public-company/"
const WAIT_TIME = 300000 // 5 minutes in milliseconds
const BATCH_SIZE = 3 // Number of tickers to process per batch
const API_BATCH_SIZE = 2 // Maximum tickers per API call
const API_CALL_GAP = 2000 // 2 seconds between API calls
const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

interface ProcessingResult {
  success: boolean
  processedTickers: string[]
  failedTickers: string[]
  logs: string[]
  apiCalls: Array<{
    tickers: string[]
    status: 'success' | 'failed'
    httpStatus?: number
    response?: any
    error?: string
    timestamp: string
  }>
}

async function sendTickers(tickers: string[]): Promise<{ success: boolean; processedTickers: string[]; failedTickers: string[]; apiCalls: any[] }> {
  const processedTickers: string[] = []
  const failedTickers: string[] = []
  const apiCalls: any[] = []
  
  // Split tickers into chunks of maximum API_BATCH_SIZE (2)
  for (let i = 0; i < tickers.length; i += API_BATCH_SIZE) {
    const tickerChunk = tickers.slice(i, i + API_BATCH_SIZE)
    
    try {
      const payload = { inputs: ["YYZ", ...tickerChunk] }
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })
      
      let responseData = null
      
      if (response.status === 200 || response.status === 201) {
        processedTickers.push(...tickerChunk)
        console.log(`✅ API call SUCCESS: ${tickerChunk.join(', ')} - Status: ${response.status}`)
        
        // Try to get response body for logging
        try {
          responseData = await response.json()
          console.log(`Response data:`, responseData)
        } catch (e) {
          responseData = await response.text()
          console.log(`Response text: ${responseData}`)
        }
        
        apiCalls.push({
          tickers: tickerChunk,
          status: 'success',
          httpStatus: response.status,
          response: responseData,
          timestamp: new Date().toISOString()
        })
      } else {
        failedTickers.push(...tickerChunk)
        console.error(`❌ API call FAILED: ${tickerChunk.join(', ')} - Status: ${response.status}`)
        
        let errorText = ''
        try {
          errorText = await response.text()
          console.error(`Error response: ${errorText}`)
        } catch (e) {
          errorText = 'Could not read error response'
          console.error(errorText)
        }
        
        apiCalls.push({
          tickers: tickerChunk,
          status: 'failed',
          httpStatus: response.status,
          error: errorText,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      failedTickers.push(...tickerChunk)
      console.error(`API request failed for tickers: ${tickerChunk.join(', ')}, error:`, error)
      
      apiCalls.push({
        tickers: tickerChunk,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })
    }
    
    // Log current progress
    console.log(`📊 Progress: ${processedTickers.length + failedTickers.length}/${tickers.length} API calls completed`)
    console.log(`✅ Successful: ${processedTickers.length} tickers`)
    console.log(`❌ Failed: ${failedTickers.length} tickers`)
    
    // Wait 2 seconds between API calls (except for the last one)
    if (i + API_BATCH_SIZE < tickers.length) {
      console.log(`⏳ Waiting ${API_CALL_GAP / 1000} seconds before next API call...`)
      await new Promise(resolve => setTimeout(resolve, API_CALL_GAP))
    }
  }
  
  return {
    success: processedTickers.length > 0,
    processedTickers,
    failedTickers,
    apiCalls
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

function saveLastRunTime(batchId: string) {
  const lastRunFile = path.join(PROCESSED_DIR, `${batchId}_last_run.txt`)
  fs.writeFileSync(lastRunFile, new Date().toISOString())
}

function canRunBatch(batchId: string): { canRun: boolean; nextRunTime?: Date; remainingTime?: string } {
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

    // Check cooldown period
    const cooldownCheck = canRunBatch(batchId)
    if (!cooldownCheck.canRun) {
      return NextResponse.json({ 
        error: 'Batch is in cooldown period',
        message: `This batch was run recently. Please wait ${cooldownCheck.remainingTime} before running again.`,
        nextRunTime: cooldownCheck.nextRunTime,
        remainingTime: cooldownCheck.remainingTime,
        cooldown: true
      }, { status: 429 }) // Too Many Requests
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

    // Save the run timestamp at the start
    saveLastRunTime(batchId)

    const result: ProcessingResult = {
      success: true,
      processedTickers: [],
      failedTickers: [],
      logs: [],
      apiCalls: []
    }

    result.logs.push(`Starting batch processing for ${remainingTickers.length} remaining tickers`)
    result.logs.push(`Next run will be available in 24 hours`)
    
    // Process tickers in batches
    for (let i = 0; i < remainingTickers.length; i += BATCH_SIZE) {
      const tickerBatch = remainingTickers.slice(i, i + BATCH_SIZE)
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1
      const totalBatches = Math.ceil(remainingTickers.length / BATCH_SIZE)
      
      result.logs.push(`🔄 Processing batch ${batchNumber}/${totalBatches}: ${tickerBatch.join(', ')}`)
      result.logs.push(`📡 Will make ${Math.ceil(tickerBatch.length / API_BATCH_SIZE)} API calls (max ${API_BATCH_SIZE} tickers each)`)
      
      console.log(`\n🚀 Starting batch ${batchNumber}/${totalBatches} with ${tickerBatch.length} tickers`)
      console.log(`Tickers: ${tickerBatch.join(', ')}`)
      console.log(`Will split into ${Math.ceil(tickerBatch.length / API_BATCH_SIZE)} API calls`)
      
      const batchResult = await sendTickers(tickerBatch)
      
      console.log(`\n✅ Batch ${batchNumber} complete:`)
      console.log(`  Processed: ${batchResult.processedTickers.length} tickers`)
      console.log(`  Failed: ${batchResult.failedTickers.length} tickers`)
      
      // Add results to overall tracking
      result.processedTickers.push(...batchResult.processedTickers)
      result.failedTickers.push(...batchResult.failedTickers)
      result.apiCalls.push(...batchResult.apiCalls)
      
      // Log individual ticker results
      batchResult.processedTickers.forEach(ticker => {
        result.logs.push(`✓ ${ticker} processed successfully`)
      })
      
      batchResult.failedTickers.forEach(ticker => {
        result.logs.push(`✗ ${ticker} failed to process`)
      })
      
      const successfulTickers = batchResult.processedTickers
      
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
