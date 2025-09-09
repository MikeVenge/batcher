# Startups Uploads - TEST VERSION

import requests
import time
import json
import os
from datetime import datetime

API_URL = "https://research-api.alphax.inc/api/v1/research/"
HEADERS = {
    "Content-Type": "application/json",
}
WAIT_TIME = 600  # milliseconds between batches
PROGRESS_FILE = "processed_urls.txt"  # File to track successfully processed URLs

# Test with first 3 URLs only
URLS = [
    "https://sakana.ai",
    "https://elyza.ai",
    "https://rinna.co.jp",
]

def load_processed_urls():
    """Load the list of already processed URLs from file"""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            return set(line.strip() for line in f if line.strip())
    return set()

def save_processed_urls(urls):
    """Save successfully processed URLs to file"""
    with open(PROGRESS_FILE, 'a') as f:
        for url in urls:
            f.write(f"{url}\n")
    print(f"[{datetime.now()}] Saved {len(urls)} URLs to progress file")

def get_remaining_urls(all_urls, processed_urls):
    """Get list of URLs that haven't been processed yet"""
    remaining = [url for url in all_urls if url not in processed_urls]
    return remaining

def send_urls(url_batch):
    """Send a batch of URLs to the API"""
    payload = {"urls": url_batch}
    
    try:
        response = requests.post(
            API_URL,
            headers=HEADERS,
            data=json.dumps(payload),
            timeout=30
        )
        
        if response.status_code == 200:
            print(f"[{datetime.now()}] Success: Batch sent successfully")
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
    
    print("Starting URL processing service...")
    print("*** TESTING MODE: Processing only first 3 URLs ***")
    
    # Load previously processed URLs
    processed_urls = load_processed_urls()
    print(f"[{datetime.now()}] Loaded {len(processed_urls)} previously processed URLs")
    
    # Get remaining URLs to process
    remaining_urls = get_remaining_urls(URLS, processed_urls)
    
    print(f"Total URLs in list: {len(URLS)}")
    print(f"Already processed: {len(processed_urls)}")
    print(f"Remaining to process: {len(remaining_urls)}")
    print(f"Wait time between batches: {WAIT_TIME} seconds ({wait_minutes:.1f} minutes)")
    
    if not remaining_urls:
        print("All URLs have already been processed!")
        return
    
    # Process remaining URLs in batches of 3
    for i in range(0, len(remaining_urls), 3):
        batch = remaining_urls[i:i+3]
        batch_number = (i // 3) + 1
        total_batches = (len(remaining_urls) + 2) // 3  # Round up division
        
        print(f"\n[{datetime.now()}] Processing batch {batch_number}/{total_batches}: {batch}")
        success = send_urls(batch)
        
        if success:
            # Save successfully processed URLs
            save_processed_urls(batch)
        else:
            print(f"[{datetime.now()}] Batch failed - not saving to progress file")
            print("You can restart the script to retry failed batches")
        
        # Wait specified time unless it's the last batch
        if i + 3 < len(remaining_urls):
            print(f"[{datetime.now()}] Waiting {wait_minutes:.1f} minutes before next batch...")
            time.sleep(WAIT_TIME)
    
    print(f"\n[{datetime.now()}] All remaining batches processed!")

if __name__ == "__main__":
    main()
