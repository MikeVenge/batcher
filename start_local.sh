#!/bin/bash
# Local development startup script

echo "🚀 Starting local development environment..."

# Activate virtual environment
source venv/bin/activate

# Set local development environment variables
export PORT=8080
export WAIT_TIME=300
export BATCH_SIZE=3
export API_URL='https://research-api.alphax.inc/api/v2/public-company/'

echo "📊 Configuration:"
echo "  - Port: $PORT"
echo "  - Batch Size: $BATCH_SIZE"
echo "  - Wait Time: $WAIT_TIME seconds"
echo "  - API URL: $API_URL"
echo ""

echo "🌐 Starting web interface on http://localhost:$PORT"
echo "Press Ctrl+C to stop the server"
echo ""

# Start the web interface
python3 web_interface.py
