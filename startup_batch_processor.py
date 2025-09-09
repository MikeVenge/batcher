# Startups Uploads

import requests
import time
import json
import os
from datetime import datetime

API_URL = "https://research-api.alphax.inc/api/v1/research/"
HEADERS = {
    "Content-Type": "application/json",
}
WAIT_TIME = 300  # seconds between batches (5 minutes)
BATCH_SIZE = 3  # number of companies to process per batch
PROGRESS_FILE = "processed_urls.txt"  # File to track successfully processed URLs
URLS_FILE = "urls.txt"  # File containing all URLs to process

def load_urls():
    """Load URLs from external file"""
    try:
        with open(URLS_FILE, 'r') as f:
            urls = [line.strip() for line in f if line.strip()]
        print(f"[{datetime.now()}] Loaded {len(urls)} URLs from {URLS_FILE}")
        return urls
    except FileNotFoundError:
        print(f"[{datetime.now()}] Error: {URLS_FILE} not found!")
        return []
    except Exception as e:
        print(f"[{datetime.now()}] Error loading URLs: {e}")
        return []

# Load URLs from external file
URLS = load_urls()
def load_processed_urls():
    """Load the list of already processed URLs from file"""
    processed = set()
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            for line in f:
                url = line.strip()
                if url:
                    # Add the URL as-is
                    processed.add(url)
                    # Also add normalized versions
                    if url.startswith('https://'):
                        # Add without protocol
                        processed.add(url.replace('https://', ''))
                    elif url.startswith('http://'):
                        # Add without protocol  
                        processed.add(url.replace('http://', ''))
                    else:
                        # Add with https:// protocol
                        processed.add(f'https://{url}')
                        # Also add with http:// protocol for completeness
                        processed.add(f'http://{url}')
    return processed

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
        
        if response.status_code in [200, 201]:
            print(f"[{datetime.now()}] Success: Company processed successfully")
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
    
    # Load previously processed URLs
    processed_urls = load_processed_urls()
    print(f"[{datetime.now()}] Loaded {len(processed_urls)} previously processed URLs")
    
    # Get remaining URLs to process
    remaining_urls = get_remaining_urls(URLS, processed_urls)
    
    print(f"Total URLs in list: {len(URLS)}")
    print(f"Already processed: {len(processed_urls)}")
    print(f"Remaining to process: {len(remaining_urls)}")
    print(f"Wait time between batches: {WAIT_TIME} seconds ({wait_minutes:.1f} minutes)")
    print(f"Batch size: {BATCH_SIZE} companies per batch")
    
    if not remaining_urls:
        print("All URLs have already been processed!")
        return
    
    # Process remaining URLs in batches
    for i in range(0, len(remaining_urls), BATCH_SIZE):
        batch = remaining_urls[i:i+BATCH_SIZE]
        batch_number = (i // BATCH_SIZE) + 1
        total_batches = (len(remaining_urls) + BATCH_SIZE - 1) // BATCH_SIZE  # Ceiling division
        
        print(f"\n[{datetime.now()}] Processing batch {batch_number}/{total_batches} ({len(batch)} companies):")
        for url in batch:
            print(f"  - {url}")
        
        # Process each URL in the batch individually
        successful_urls = []
        for j, url in enumerate(batch):
            print(f"[{datetime.now()}] Processing company {j+1}/{len(batch)} in batch: {url}")
            success = send_urls([url])  # Send as single-item list
            
            if success:
                successful_urls.append(url)
                print(f"[{datetime.now()}] Company processed successfully!")
            else:
                print(f"[{datetime.now()}] Company failed - will not be saved to progress file")
        
        # Save only the successfully processed URLs
        if successful_urls:
            save_processed_urls(successful_urls)
            print(f"[{datetime.now()}] Batch complete: {len(successful_urls)}/{len(batch)} companies successful")
        else:
            print(f"[{datetime.now()}] Batch complete: 0/{len(batch)} companies successful")
        
        # Wait specified time unless it's the last batch
        if i + BATCH_SIZE < len(remaining_urls):
            print(f"[{datetime.now()}] Waiting {wait_minutes:.1f} minutes before next batch...")
            time.sleep(WAIT_TIME)
    
    print(f"\n[{datetime.now()}] All remaining batches processed!")

if __name__ == "__main__":
    main()
