#!/usr/bin/env node

// Simple test script for local development
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Local Batch Manager API...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthCheck = await axios.get(BASE_URL);
    console.log('✅ Server is running!\n');
    
    // Test 2: Create a test batch
    console.log('2. Creating test batch...');
    const testBatch = {
      name: 'Test Batch',
      tickers: ['AAPL', 'MSFT', 'GOOGL']
    };
    
    const createResponse = await axios.post(`${BASE_URL}/api/batches`, testBatch);
    const batchId = createResponse.data.id;
    console.log(`✅ Created batch with ID: ${batchId}\n`);
    
    // Test 3: Get all batches
    console.log('3. Fetching all batches...');
    const batchesResponse = await axios.get(`${BASE_URL}/api/batches`);
    console.log(`✅ Found ${batchesResponse.data.length} batch(es)\n`);
    
    // Test 4: Get batch status
    console.log('4. Getting batch status...');
    const statusResponse = await axios.get(`${BASE_URL}/api/batches/${batchId}/status`);
    console.log(`✅ Batch status: ${statusResponse.data.processedCount}/${statusResponse.data.totalCount} processed\n`);
    
    // Test 5: Clean up - delete test batch
    console.log('5. Cleaning up test batch...');
    await axios.delete(`${BASE_URL}/api/batches?id=${batchId}`);
    console.log('✅ Test batch deleted\n');
    
    console.log('🎉 All tests passed! Your local server is working correctly.');
    console.log(`\n🌐 Open your browser to: ${BASE_URL}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testAPI();
