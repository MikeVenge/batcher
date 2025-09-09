#!/usr/bin/env python3
"""
Simple web interface for Railway deployment
Provides HTTP endpoints to trigger batch processing
"""

import os
import json
import threading
import subprocess
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = int(os.environ.get('PORT', 8000))

class BatchHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Research Batch Processor</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .container { max-width: 600px; margin: 0 auto; }
                    button { padding: 10px 20px; margin: 10px; background: #007cba; color: white; border: none; border-radius: 5px; cursor: pointer; }
                    button:hover { background: #005a87; }
                    .status { padding: 20px; background: #f5f5f5; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🚀 Research Batch Processor</h1>
                    <p>Backend service for processing equity and startup batches</p>
                    
                    <div class="status">
                        <h3>📊 Status: Running on Railway</h3>
                        <p>Service is healthy and ready to process batches</p>
                    </div>
                    
                    <h3>🔧 Available Operations:</h3>
                    <button onclick="triggerBatch('equity')">Run Equity Batch</button>
                    <button onclick="triggerBatch('startup')">Run Startup Batch</button>
                    
                    <h3>📋 Configuration:</h3>
                    <ul>
                        <li>Batch Size: 3 tickers per batch</li>
                        <li>Wait Time: 5 minutes between batches</li>
                        <li>API: AlphaX Research API</li>
                    </ul>
                    
                    <h3>🔗 Integration:</h3>
                    <p>This backend integrates with your React frontend for batch management.</p>
                </div>
                
                <script>
                    function triggerBatch(type) {
                        fetch('/trigger/' + type, { method: 'POST' })
                            .then(response => response.json())
                            .then(data => alert('Batch triggered: ' + data.message))
                            .catch(error => alert('Error: ' + error));
                    }
                </script>
            </body>
            </html>
            """
            
            self.wfile.write(html.encode())
            
        elif parsed_path.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {
                'status': 'healthy',
                'service': 'research-batch-processor',
                'port': PORT
            }
            self.wfile.write(json.dumps(response).encode())
            
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path.startswith('/trigger/'):
            batch_type = parsed_path.path.split('/')[-1]
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            if batch_type == 'equity':
                # Run equity batch processor in background
                threading.Thread(target=self.run_equity_batch, daemon=True).start()
                response = {'message': 'Equity batch processing started'}
            elif batch_type == 'startup':
                # Run startup batch processor in background  
                threading.Thread(target=self.run_startup_batch, daemon=True).start()
                response = {'message': 'Startup batch processing started'}
            else:
                response = {'error': 'Unknown batch type'}
            
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def run_equity_batch(self):
        """Run equity batch processor"""
        try:
            subprocess.run(['python', 'equity_batch_processor.py'], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Equity batch failed: {e}")
    
    def run_startup_batch(self):
        """Run startup batch processor"""
        try:
            subprocess.run(['python', 'startup_batch_processor.py'], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Startup batch failed: {e}")

def run_server():
    server = HTTPServer(('0.0.0.0', PORT), BatchHandler)
    print(f"🚀 Research Batch Processor running on port {PORT}")
    print(f"🌐 Access at: http://localhost:{PORT}")
    server.serve_forever()

if __name__ == '__main__':
    run_server()
