# Local Development Setup

## 🚀 Your Local Batch Manager is Ready!

The React batch manager is now running locally for testing.

### 📍 **Access Points:**
- **Web Application:** http://localhost:3000
- **API Base:** http://localhost:3000/api

### 🛠 **Development Commands:**

```bash
# Start development server (already running)
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

### 🧪 **Testing the Application:**

1. **Open in Browser:**
   ```
   http://localhost:3000
   ```

2. **Test API Endpoints:**
   ```bash
   # Run the test script
   node test-local.js
   ```

3. **Manual Testing:**
   - Create a new batch with stock tickers
   - Save and view the batch list
   - Run a batch (it will use the real API)
   - Monitor progress in real-time

### 📁 **Data Storage (Local):**
- Batches: `data/batches/`
- Progress: `data/processed/`

### 🔧 **Key Features to Test:**

1. **Create Batch:**
   - Click "Create New Batch"
   - Enter name and tickers (e.g., AAPL, MSFT, GOOGL)
   - Validate ticker parsing

2. **Batch Management:**
   - View all batches with progress bars
   - Check processed vs remaining counts
   - View detailed status

3. **Run Batch:**
   - Click play button to start processing
   - Watch real-time progress updates
   - See estimated completion time

4. **API Integration:**
   - Batches send to: `https://research-api.alphax.inc/api/v2/public-company/`
   - Uses "YYZ" command format
   - 3 tickers per batch, 5-minute intervals

### 🚨 **Important Notes:**

- **Real API Calls:** Running batches will make actual API calls to your production endpoint
- **Data Persistence:** All batch data is stored locally in the `data/` directory
- **Hot Reload:** Changes to code will automatically refresh the browser
- **Port 3000:** Make sure no other services are using port 3000

### 🐛 **Debugging:**

1. **Check Console:** Open browser dev tools to see any errors
2. **Server Logs:** Check the terminal where `npm run dev` is running
3. **API Testing:** Use the test script to verify API endpoints
4. **File Permissions:** Ensure the app can write to `data/` directories

### 🔄 **Stopping the Server:**
```bash
# Press Ctrl+C in the terminal where npm run dev is running
# Or kill the process:
pkill -f "next-server"
```

### 📊 **Expected Behavior:**
- ✅ Create batches with multiple tickers
- ✅ Progress tracking with visual indicators  
- ✅ Resume interrupted batches
- ✅ Real-time status updates
- ✅ Responsive UI with modern design

Ready to test! 🎯
