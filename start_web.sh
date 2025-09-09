#!/bin/bash
cd ~/code/batcher
source venv/bin/activate
export PORT=8080
export WAIT_TIME=300
export BATCH_SIZE=3
export API_URL='https://research-api.alphax.inc/api/v2/public-company/'
python3 web_interface.py
