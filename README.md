# Research Batch Backend

Python backend for processing equity and startup batches. Designed for deployment on Railway.

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
- `railway.yml` - Railway deployment configuration
- `web_interface.py` - Simple web interface for Railway
- `Procfile` - Railway process configuration
- `nixpacks.toml` - Railway build configuration
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

## 🚀 Railway Deployment

### 1. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "Deploy from GitHub repo"
4. Select repository: `MikeVenge/batcher`
5. **Choose branch: `backend`**
6. Railway will auto-detect Python and deploy

### 2. Configuration
- Railway automatically installs from `requirements.txt`
- Set environment variables in Railway dashboard:
  - `WAIT_TIME=300`
  - `BATCH_SIZE=3`
  - `API_URL=https://research-api.alphax.inc/api/v2/public-company/`

### 3. Access Points
- **Web Interface:** Your Railway app URL (e.g., `https://your-app.railway.app`)
- **Health Check:** `https://your-app.railway.app/health`
- **Trigger Batches:** `POST https://your-app.railway.app/trigger/equity`

### 4. Process Types
Railway supports multiple process types:
- **Web:** Runs web interface (`python web_interface.py`)
- **Worker:** Runs batch processor (`python equity_batch_processor.py`)

### 5. Scheduling
- Use Railway's cron jobs for scheduled processing
- Or integrate with external cron services
- Manual triggers via web interface

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

- Check Railway logs for processing status
- Monitor `processed_tickers.txt` for progress
- Use Railway's built-in monitoring and alerts
- Access web interface for manual triggers and status

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

- API credentials should be set as environment variables in Railway
- No sensitive data stored in repository
- Progress files contain only ticker symbols
- HTTPS enabled by default on Railway

## 🌐 Web Interface

The backend includes a simple web interface accessible at your Railway app URL:

- **Dashboard:** View service status and configuration
- **Manual Triggers:** Start equity or startup batch processing
- **Health Check:** Monitor service health
- **Integration Ready:** API endpoints for frontend integration

Ready for Railway deployment! 🚂
