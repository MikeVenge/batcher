# 🚀 Local Development Guide

This guide will help you set up and run both the frontend and backend locally for development.

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Git

## 🏗️ Project Structure

```
research-batch-feeder/          # Frontend (React/Next.js)
├── app/                        # Next.js app directory
├── package.json               # Frontend dependencies
├── start_local_dev.sh         # Frontend startup script
└── LOCAL_DEVELOPMENT.md       # This file

research-batch-backend/         # Backend (Python)
├── web_interface.py           # Web server
├── equity_batch_processor.py  # Batch processing logic
├── requirements.txt           # Python dependencies
└── start_local.sh            # Backend startup script
```

## 🚀 Quick Start

### 1. Start Backend (Terminal 1)

```bash
cd /Users/michaelkim/code/research-batch-backend
./start_local.sh
```

This will:
- Activate Python virtual environment
- Start web server on http://localhost:8080
- Display configuration and logs

### 2. Start Frontend (Terminal 2)

```bash
cd /Users/michaelkim/code/research-batch-feeder
./start_local_dev.sh
```

This will:
- Set development environment variables
- Start Next.js dev server on http://localhost:3000
- Enable hot reload for development

### 3. Access Applications

- **Frontend UI:** http://localhost:3000
- **Backend API:** http://localhost:8080
- **Backend Health:** http://localhost:8080/health

## 🔧 Development Workflow

### Backend Development

1. **Edit Python files** in `/Users/michaelkim/code/research-batch-backend/`
2. **Restart backend** (Ctrl+C and run `./start_local.sh` again)
3. **Test API endpoints:**
   ```bash
   curl http://localhost:8080/health
   curl -X POST http://localhost:8080/trigger/equity
   ```

### Frontend Development

1. **Edit React components** in `/Users/michaelkim/code/research-batch-feeder/app/`
2. **Changes auto-reload** (hot reload enabled)
3. **Test in browser** at http://localhost:3000

## 📊 Configuration

### Backend Configuration
- **Port:** 8080
- **Batch Size:** 3 tickers per batch
- **Wait Time:** 5 minutes between batches
- **API URL:** https://research-api.alphax.inc/api/v2/public-company/

### Frontend Configuration
- **Port:** 3000
- **Backend URL:** http://localhost:8080 (development)
- **Hot Reload:** Enabled
- **Environment:** development

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:8080/health

# Trigger equity batch
curl -X POST http://localhost:8080/trigger/equity

# Trigger startup batch
curl -X POST http://localhost:8080/trigger/startup

# Web interface
open http://localhost:8080
```

### Test Frontend Integration

1. Open http://localhost:3000
2. Check **Backend Status** section - should show "Online"
3. Try creating a new batch
4. Test batch triggers via UI

## 🔄 Environment Switching

### Local Development
- Frontend automatically detects `NODE_ENV=development`
- Backend URL: `http://localhost:8080`

### Production Testing
- Set `BACKEND_URL=https://batching.adgo.dev`
- Frontend will connect to production backend

## 🛠️ Troubleshooting

### Backend Issues

**Port 8080 already in use:**
```bash
lsof -ti:8080 | xargs kill -9
./start_local.sh
```

**Python dependencies missing:**
```bash
cd /Users/michaelkim/code/research-batch-backend
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Issues

**Node modules missing:**
```bash
cd /Users/michaelkim/code/research-batch-feeder
npm install
```

**Port 3000 already in use:**
```bash
lsof -ti:3000 | xargs kill -9
./start_local_dev.sh
```

### Integration Issues

**Backend Status shows "Offline":**
1. Ensure backend is running on port 8080
2. Check `curl http://localhost:8080/health`
3. Verify no CORS issues in browser console

## 📝 Development Tips

1. **Keep both terminals open** - one for backend, one for frontend
2. **Check browser console** for any JavaScript errors
3. **Monitor backend logs** for API request/response info
4. **Use React DevTools** for component debugging
5. **Test API endpoints** with curl before UI integration

## 🚀 Deployment

When ready to deploy changes:

```bash
# Commit frontend changes
cd /Users/michaelkim/code/research-batch-feeder
git add .
git commit -m "Your changes"
git push origin main

# Commit backend changes
cd /Users/michaelkim/code/research-batch-backend
git add .
git commit -m "Your changes"
git push origin backend
```

- **Frontend:** Auto-deploys to Vercel from main branch
- **Backend:** Running on your server at batching.adgo.dev

Happy coding! 🎉
