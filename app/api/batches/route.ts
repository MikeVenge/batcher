import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const BATCHES_DIR = path.join(process.cwd(), 'data', 'batches')
const PROCESSED_DIR = path.join(process.cwd(), 'data', 'processed')

// Ensure directories exist
if (!fs.existsSync(BATCHES_DIR)) {
  fs.mkdirSync(BATCHES_DIR, { recursive: true })
}
if (!fs.existsSync(PROCESSED_DIR)) {
  fs.mkdirSync(PROCESSED_DIR, { recursive: true })
}

export async function GET() {
  try {
    const files = fs.readdirSync(BATCHES_DIR)
    const batches = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const content = fs.readFileSync(path.join(BATCHES_DIR, file), 'utf8')
        const batch = JSON.parse(content)
        
        // Check if there's a processed file for this batch
        const processedFile = path.join(PROCESSED_DIR, `${batch.id}_processed.txt`)
        const processedTickers = fs.existsSync(processedFile) 
          ? fs.readFileSync(processedFile, 'utf8').split('\n').filter(t => t.trim())
          : []
        
        // Get cooldown information
        const lastRunFile = path.join(PROCESSED_DIR, `${batch.id}_last_run.txt`)
        let lastRunTime = null
        let cooldown = { canRun: true }
        
        if (fs.existsSync(lastRunFile)) {
          try {
            const timestamp = fs.readFileSync(lastRunFile, 'utf8').trim()
            lastRunTime = new Date(timestamp)
            
            const now = new Date()
            const timeSinceLastRun = now.getTime() - lastRunTime.getTime()
            const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000 // 24 hours
            
            if (timeSinceLastRun < COOLDOWN_PERIOD) {
              const nextRunTime = new Date(lastRunTime.getTime() + COOLDOWN_PERIOD)
              const remainingMs = COOLDOWN_PERIOD - timeSinceLastRun
              const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000))
              const remainingMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000))
              
              const remainingTime = remainingHours > 0 
                ? `${remainingHours}h ${remainingMinutes}m`
                : `${remainingMinutes}m`
              
              cooldown = {
                canRun: false,
                nextRunTime: nextRunTime.toISOString(),
                remainingTime
              }
            }
          } catch (error) {
            console.error('Error reading last run time:', error)
          }
        }
        
        return {
          ...batch,
          processedCount: processedTickers.length,
          totalCount: batch.tickers.length,
          lastProcessed: fs.existsSync(processedFile) 
            ? fs.statSync(processedFile).mtime.toISOString()
            : null,
          lastRunTime: lastRunTime?.toISOString(),
          cooldown
        }
      })
    
    return NextResponse.json(batches)
  } catch (error) {
    console.error('Error fetching batches:', error)
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, tickers } = await request.json()
    
    if (!name || !tickers || !Array.isArray(tickers)) {
      return NextResponse.json({ error: 'Name and tickers array are required' }, { status: 400 })
    }

    const batch = {
      id: Date.now().toString(),
      name,
      tickers: tickers.map((t: string) => t.trim().toUpperCase()).filter((t: string) => t),
      createdAt: new Date().toISOString(),
    }

    const filePath = path.join(BATCHES_DIR, `${batch.id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(batch, null, 2))

    return NextResponse.json(batch)
  } catch (error) {
    console.error('Error creating batch:', error)
    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('id')
    
    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 })
    }

    const batchFile = path.join(BATCHES_DIR, `${batchId}.json`)
    const processedFile = path.join(PROCESSED_DIR, `${batchId}_processed.txt`)
    
    // Delete batch file
    if (fs.existsSync(batchFile)) {
      fs.unlinkSync(batchFile)
    }
    
    // Delete processed file if it exists
    if (fs.existsSync(processedFile)) {
      fs.unlinkSync(processedFile)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting batch:', error)
    return NextResponse.json({ error: 'Failed to delete batch' }, { status: 500 })
  }
}
