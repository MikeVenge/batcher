# Listed Equities Uploads

import requests
import time
import json
import os
from datetime import datetime

API_URL = "https://research-api.alphax.inc/api/v2/public-company/"
HEADERS = {
    "Content-Type": "application/json",
}
WAIT_TIME = 300  # seconds between batches (5 minutes)
BATCH_SIZE = 3  # number of tickers to process per batch
PROGRESS_FILE = "processed_tickers.txt"  # File to track successfully processed tickers
TICKERS_FILE = "tickers.txt"  # File containing all tickers to process

def load_tickers():
    """Load tickers from external file"""
    try:
        with open(TICKERS_FILE, 'r') as f:
            tickers = [line.strip().upper() for line in f if line.strip()]
        print(f"[{datetime.now()}] Loaded {len(tickers)} tickers from {TICKERS_FILE}")
        return tickers
    except FileNotFoundError:
        print(f"[{datetime.now()}] Error: {TICKERS_FILE} not found!")
        return []
    except Exception as e:
        print(f"[{datetime.now()}] Error loading tickers: {e}")
        return []

# Load tickers from external file
TICKERS = load_tickers()

def load_processed_tickers():
    """Load the list of already processed tickers from file"""
    processed = set()
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            for line in f:
                ticker = line.strip().upper()
                if ticker:
                    processed.add(ticker)
    return processed

def save_processed_tickers(tickers):
    """Save successfully processed tickers to file"""
    with open(PROGRESS_FILE, 'a') as f:
        for ticker in tickers:
            f.write(f"{ticker}\n")
    print(f"[{datetime.now()}] Saved {len(tickers)} tickers to progress file")

def get_remaining_tickers(all_tickers, processed_tickers):
    """Get list of tickers that haven't been processed yet"""
    remaining = [ticker for ticker in all_tickers if ticker not in processed_tickers]
    return remaining

def send_tickers(ticker_batch):
    """Send a batch of tickers to the API with YYZ command format"""
    # Format: {"inputs": ["YYZ", "TICKER1", "TICKER2", "TICKER3"], "portfolio": "public", "apikey": "..."}
    payload = {
        "inputs": ["YYZ"] + ticker_batch,
        "portfolio": "public",
        "apikey": "ukMVIKfgon_V36yCIliIBWSAgXYxIVmkfPrT0cKYwCI"
    }
    
    try:
        response = requests.post(
            API_URL,
            headers=HEADERS,
            data=json.dumps(payload),
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            print(f"[{datetime.now()}] Success: Tickers processed successfully")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"[{datetime.now()}] Error: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"[{datetime.now()}] Request failed: {e}")
        return False

def main():
    wait_minutes = WAIT_TIME / 60
    
    print("Starting ticker processing service...")
    
    # Load previously processed tickers
    processed_tickers = load_processed_tickers()
    print(f"[{datetime.now()}] Loaded {len(processed_tickers)} previously processed tickers")
    
    # Get remaining tickers to process
    remaining_tickers = get_remaining_tickers(TICKERS, processed_tickers)
    
    print(f"Total tickers in list: {len(TICKERS)}")
    print(f"Already processed: {len(processed_tickers)}")
    print(f"Remaining to process: {len(remaining_tickers)}")
    print(f"Wait time between batches: {WAIT_TIME} seconds ({wait_minutes:.1f} minutes)")
    print(f"Batch size: {BATCH_SIZE} tickers per batch")
    
    if not remaining_tickers:
        print("All tickers have already been processed!")
        return
    
    # Process remaining tickers in batches
    for i in range(0, len(remaining_tickers), BATCH_SIZE):
        batch = remaining_tickers[i:i+BATCH_SIZE]
        batch_number = (i // BATCH_SIZE) + 1
        total_batches = (len(remaining_tickers) + BATCH_SIZE - 1) // BATCH_SIZE  # Ceiling division
        
        print(f"\n[{datetime.now()}] Processing batch {batch_number}/{total_batches} ({len(batch)} tickers):")
        for ticker in batch:
            print(f"  - {ticker}")
        
        # Process each ticker in the batch individually
        successful_tickers = []
        for j, ticker in enumerate(batch):
            print(f"[{datetime.now()}] Processing ticker {j+1}/{len(batch)} in batch: {ticker}")
            success = send_tickers([ticker])  # Send as single-item list (plus YYZ command)
            
            if success:
                successful_tickers.append(ticker)
                print(f"[{datetime.now()}] Ticker processed successfully!")
            else:
                print(f"[{datetime.now()}] Ticker failed - will not be saved to progress file")
        
        # Save only the successfully processed tickers
        if successful_tickers:
            save_processed_tickers(successful_tickers)
            print(f"[{datetime.now()}] Batch complete: {len(successful_tickers)}/{len(batch)} tickers successful")
        else:
            print(f"[{datetime.now()}] Batch complete: 0/{len(batch)} tickers successful")
        
        # Wait specified time unless it's the last batch
        if i + BATCH_SIZE < len(remaining_tickers):
            print(f"[{datetime.now()}] Waiting {wait_minutes:.1f} minutes before next batch...")
            time.sleep(WAIT_TIME)
    
    print(f"\n[{datetime.now()}] All remaining batches processed!")

if __name__ == "__main__":
    main()

