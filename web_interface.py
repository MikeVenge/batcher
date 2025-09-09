#!/usr/bin/env python3
"""
Simple web interface for Railway deployment
Provides HTTP endpoints to trigger batch processing
"""

import os
import json
import threading
import subprocess
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PORT = int(os.environ.get('PORT', 8000))

class BatchHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        """Set CORS headers to allow frontend access"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self._set_cors_headers()
            self.end_headers()
            
            html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Research Batch Processor</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: #f8fafc;
            color: #1a202c;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        h1 { 
            color: #2d3748; 
            margin-bottom: 8px;
            font-size: 2.5rem;
        }
        .subtitle {
            color: #718096;
            font-size: 1.1rem;
            margin-bottom: 32px;
        }
        button { 
            padding: 12px 24px; 
            margin: 8px 12px 8px 0; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            border: none; 
            border-radius: 8px; 
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s;
        }
        button:hover { 
            transform: translateY(-2px);
            box-shadow: 0 8px 25px -8px rgba(102, 126, 234, 0.6);
        }
        .status { 
            padding: 24px; 
            background: linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%);
            border-radius: 12px; 
            margin: 32px 0;
            border-left: 4px solid #10b981;
        }
        .status h3 {
            margin-top: 0;
            color: #047857;
        }
        .section {
            margin: 32px 0;
        }
        .section h3 {
            color: #2d3748;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
        }
        ul {
            list-style: none;
            padding: 0;
        }
        li {
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        li:before {
            content: "•";
            color: #667eea;
            font-weight: bold;
            margin-right: 12px;
        }
        .integration-note {
            background: #fef7e7;
            border: 1px solid #f6cc4d;
            border-radius: 8px;
            padding: 16px;
            margin-top: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Research Batch Processor</h1>
        <p class="subtitle">Backend service for processing equity and startup batches</p>
        
        <div class="status">
            <h3>📊 Status: Running on Your Server</h3>
            <p>Service is healthy and ready to process batches via <strong>batching.adgo.dev</strong></p>
        </div>
        
        <div class="section">
            <h3>🔧 Available Operations</h3>
            <button onclick="triggerBatch('equity')">🏢 Run Equity Batch</button>
            <button onclick="triggerBatch('startup')">🚀 Run Startup Batch</button>
        </div>
        
        <div class="section">
            <h3>📋 Configuration</h3>
            <ul>
                <li><strong>Batch Size:</strong> 3 tickers per batch</li>
                <li><strong>Wait Time:</strong> 5 minutes between batches</li>
                <li><strong>API Endpoint:</strong> AlphaX Research API</li>
                <li><strong>SSL:</strong> Enabled with Let's Encrypt</li>
                <li><strong>Proxy:</strong> Nginx reverse proxy</li>
            </ul>
        </div>
        
        <div class="section">
            <h3>🔗 Integration</h3>
            <p>This backend provides health monitoring and manual triggers. Individual batch management is handled through the React frontend.</p>
            <div class="integration-note">
                <strong>Note:</strong> The trigger buttons above are for testing only. Use the React frontend for proper batch management with dynamic ticker lists.
            </div>
        </div>
    </div>
    
    <script>
        function triggerBatch(type) {
            const button = event.target;
            const originalText = button.textContent;
            button.disabled = true;
            button.textContent = 'Processing...';
            
            fetch('/trigger/' + type, { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    alert('✅ Batch triggered successfully: ' + data.message);
                })
                .catch(error => {
                    alert('❌ Error triggering batch: ' + error);
                })
                .finally(() => {
                    button.disabled = false;
                    button.textContent = originalText;
                });
        }
    </script>
</body>
</html>"""
            
            self.wfile.write(html.encode('utf-8'))
            
        elif parsed_path.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self._set_cors_headers()
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
            self._set_cors_headers()
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
            self._set_cors_headers()
            self.end_headers()
    
    def run_equity_batch(self):
        """Run equity batch processor using dynamic batches from frontend"""
        try:
            # This would need to integrate with the frontend's batch system
            # For now, just log that it was triggered
            print(f"[{datetime.now()}] Equity batch triggered via web interface")
            print(f"[{datetime.now()}] Note: This should integrate with frontend batch system")
            # TODO: Integrate with frontend batch API instead of hardcoded tickers
        except Exception as e:
            print(f"Equity batch failed: {e}")
    
    def run_startup_batch(self):
        """Run startup batch processor using dynamic batches from frontend"""
        try:
            # This would need to integrate with the frontend's batch system  
            print(f"[{datetime.now()}] Startup batch triggered via web interface")
            print(f"[{datetime.now()}] Note: This should integrate with frontend batch system")
            # TODO: Integrate with frontend batch API instead of hardcoded files
        except Exception as e:
            print(f"Startup batch failed: {e}")

def run_server():
    server = HTTPServer(('0.0.0.0', PORT), BatchHandler)
    print(f"🚀 Research Batch Processor running on port {PORT}")
    print(f"🌐 Access at: http://localhost:{PORT}")
    server.serve_forever()

if __name__ == '__main__':
    run_server()
