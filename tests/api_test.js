/**
 * API Testing Script for Sales Lead Tracker
 * This script tests the API endpoints for lead management
 */

const API_BASE_URL = 'http://localhost:5001';
const API_KEY = 'your_api_key_here'; // Replace with your actual API key

// Helper function to make API calls
async function apiCall(method, endpoint, data = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    console.log(`\n${method} ${endpoint}`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    return { status: response.status, data: result };
  } catch (error) {
    console.error(`Error calling ${method} ${endpoint}:`, error);
    return { status: 0, data: { error: error.message } };
  }
}

// Test data for creating a new lead
const testLead = {
  name: "ทดสอบ API",
  company: "บริษัท ทดสอบ จำกัด",
  email: "test@example.com",
  phone: "0812345678",
  source: "Website",
  status: "New",
  product: "Softnix Data Platform",
  productRegister: "Softnix Data Platform",
  endUserContact: "คุณทดสอบ",
  endUserOrganization: "องค์กรทดสอบ",
  projectName: "โปรเจคทดสอบ API",
  budget: "500,000",
  partnerContact: "คุณพาร์ทเนอร์"
};

// Test update data
const updateData = {
  status: "Qualified",
  budget: "750,000",
  phone: "0987654321"
};

async function runTests() {
  console.log('🚀 Starting API Tests...');
  console.log('📡 API Base URL:', API_BASE_URL);
  console.log('🔑 API Key:', API_KEY ? 'Set' : 'Not Set');

  if (API_KEY === 'your_api_key_here') {
    console.log('❌ Please replace API_KEY with your actual API key');
    return;
  }

  // Test 1: Search all leads
  console.log('\n📋 Test 1: Search all leads');
  const searchResult = await apiCall('GET', '/api/v1/leads/search');

  // Test 2: Search leads with keyword
  console.log('\n🔍 Test 2: Search leads with keyword');
  await apiCall('GET', '/api/v1/leads/search?keyword=test');

  // Test 3: Search leads with specific fields
  console.log('\n🎯 Test 3: Search leads with specific fields');
  await apiCall('GET', '/api/v1/leads/search?company=Softnix&status=New');

  // Test 4: Create a new lead
  console.log('\n➕ Test 4: Create a new lead');
  const createResult = await apiCall('POST', '/api/v1/leads', testLead);
  
  let createdLeadId = null;
  if (createResult.status === 201 && createResult.data.lead) {
    createdLeadId = createResult.data.lead.id;
    console.log(`✅ Lead created with ID: ${createdLeadId}`);
  }

  // Test 5: Update the created lead (if creation was successful)
  if (createdLeadId) {
    console.log('\n✏️ Test 5: Update the created lead');
    await apiCall('PATCH', `/api/v1/leads/${createdLeadId}`, updateData);

    // Test 6: Search for the updated lead
    console.log('\n🔍 Test 6: Search for the updated lead');
    await apiCall('GET', `/api/v1/leads/search?keyword=${createdLeadId}`);
  } else {
    console.log('\n❌ Skipping update test - lead creation failed');
  }

  // Test 7: Test error handling - invalid API key
  console.log('\n🚫 Test 7: Test invalid API key');
  const invalidOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'invalid_key'
    }
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/leads/search`, invalidOptions);
    const result = await response.json();
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error testing invalid API key:', error);
  }

  // Test 8: Test validation error - missing required fields
  console.log('\n❌ Test 8: Test validation error');
  const invalidLead = {
    name: "", // Missing required field
    email: "invalid-email" // Invalid email format
  };
  await apiCall('POST', '/api/v1/leads', invalidLead);

  console.log('\n✅ API Tests completed!');
}

// Run the tests
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  runTests();
} else {
  // Browser environment
  window.runAPITests = runTests;
  console.log('To run tests in browser, call: runAPITests()');
}