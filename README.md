# Equity Batch Manager

A React-based web application for managing and running batch stock ticker processing. Built with Next.js and deployed on Vercel.

## Features

- **Create Batch Sets**: Create named batches of stock tickers
- **Save & Manage**: Save batches for reuse and manage multiple batch sets
- **On-Demand Execution**: Run batches on demand with real-time progress tracking
- **Progress Tracking**: Track processed vs remaining tickers with visual progress bars
- **Status Monitoring**: View detailed status for each batch including processed/remaining tickers
- **Resume Capability**: Automatically resumes from where it left off if interrupted

## How It Works

The application integrates with your existing equity batch processor logic:
- Processes 3 tickers per batch with 5-minute intervals between batches
- Sends tickers to the AlphaX research API using the "YYZ" command format
- Tracks progress and saves successfully processed tickers
- Provides estimated completion times

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deployment on Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically with zero configuration

The app is optimized for Vercel deployment with proper API route configurations and timeout settings.

## Usage

### Creating a Batch

1. Click "Create New Batch"
2. Enter a descriptive name for your batch
3. Add stock tickers (one per line, or separated by commas/spaces)
4. Click "Create Batch"

### Running a Batch

1. Click the play button on any batch
2. Monitor progress in real-time
3. View detailed status by clicking the eye icon
4. Batches automatically resume from where they left off

### Monitoring Progress

- **Dashboard View**: See all batches with progress bars and statistics
- **Detailed Status**: Click the eye icon to see processed vs remaining tickers
- **Real-time Updates**: Progress updates automatically as batches run

## API Endpoints

- `GET /api/batches` - List all batches
- `POST /api/batches` - Create a new batch
- `DELETE /api/batches?id={id}` - Delete a batch
- `POST /api/batches/[id]/run` - Run a batch
- `GET /api/batches/[id]/status` - Get batch status

## Configuration

The application uses the same configuration as your Python batch processor:
- API URL: `https://research-api.alphax.inc/api/v2/public-company/`
- Batch size: 3 tickers
- Wait time: 5 minutes between batches
- Command format: `["YYZ", "TICKER1", "TICKER2", "TICKER3"]`

## Data Storage

- Batch configurations are stored in `/data/batches/`
- Progress tracking files are stored in `/data/processed/`
- All data persists between deployments on Vercel
