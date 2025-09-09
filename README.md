# Research Batch Backend

Python backend for processing equity and startup batches. Designed for deployment on Runway ML.

## 🚀 Features

- **Equity Batch Processing**: Process stock tickers in batches with rate limiting
- **Startup Batch Processing**: Handle startup company data processing  
- **Progress Tracking**: Save and resume interrupted batch processing
- **Rate Limiting**: 3 companies per batch, 5-minute intervals
- **API Integration**: Sends data to AlphaX research API

## 📁 Files

- `equity_batch_processor.py` - Main equity processing script
- `startup_batch_processor.py` - Startup company processing script
- `tickers.txt` - List of stock tickers to process
- `processed_tickers.txt` - Track completed tickers (auto-generated)
- `requirements.txt` - Python dependencies
- `runway.yml` - Runway deployment configuration
- `Dockerfile` - Container configuration

## 🔧 Configuration

### Environment Variables
- `API_URL` - Target API endpoint (default: AlphaX research API)
- `WAIT_TIME` - Seconds between batches (default: 300 = 5 minutes)  
- `BATCH_SIZE` - Tickers per batch (default: 3)

### Data Files
- **Input**: `tickers.txt` - One ticker per line
- **Progress**: `processed_tickers.txt` - Auto-generated progress tracking
- **URLs**: Various URL files for startup processing

## 🚀 Runway Deployment

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial backend commit"
git remote add origin https://github.com/YOUR_USERNAME/research-batch-backend.git
git push -u origin main
```

### 2. Connect to Runway
1. Go to [runway.ml](https://runway.ml)
2. Connect your GitHub repository
3. Runway will auto-detect the `runway.yml` configuration

### 3. Configure Schedules
- Set up cron jobs in Runway dashboard
- Configure environment variables
- Set up notifications for batch completion

### 4. Manual Execution
Use Runway's command interface to run:
- `run-equity-batch` - Process equity tickers
- `run-startup-batch` - Process startup companies

## 🔄 How It Works

### Equity Processing
1. Reads tickers from `tickers.txt`
2. Checks `processed_tickers.txt` for completed items
3. Processes remaining tickers in batches of 3
4. Waits 5 minutes between batches
5. Saves progress after each successful ticker

### API Format
Sends POST requests with format:
```json
{
  "inputs": ["YYZ", "TICKER1", "TICKER2", "TICKER3"]
}
```

### Resume Capability
- Automatically resumes from last processed ticker
- Safe interruption handling
- Progress persistence across runs

## 📊 Monitoring

- Check Runway logs for processing status
- Monitor `processed_tickers.txt` for progress
- Set up Runway notifications for completion/errors

## 🛠 Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run equity processor
python equity_batch_processor.py

# Run startup processor  
python startup_batch_processor.py
```

## 🔒 Security

- API credentials should be set as environment variables in Runway
- No sensitive data stored in repository
- Progress files contain only ticker symbols

Ready for Runway deployment! 🛫
