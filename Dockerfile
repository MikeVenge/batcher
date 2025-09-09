FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory
RUN mkdir -p data

# Expose port (if needed for web interface later)
EXPOSE 8000

# Default command - can be overridden
CMD ["python", "equity_batch_processor.py"]
