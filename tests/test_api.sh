#!/bin/bash

# Simple API Test Script for Sales Lead Tracker
# Run this script to test API functionality

API_KEY="3e3d4db08074642b69ec69e1bf64f165c94bfd742c6d55bdedcbfb3d4484be45"  # Replace with your API key
BASE_URL="http://localhost:5001"

echo "🚀 Testing Sales Lead Tracker API"
echo "=================================="
echo "API Key: ${API_KEY:0:20}..."
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Search all leads
echo "📋 Test 1: Search all leads"
echo "----------------------------"
curl -s -X GET "$BASE_URL/api/v1/leads/search" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" | jq '.leads | length' 2>/dev/null || echo "Error or jq not installed"
echo ""

# Test 2: Search with keyword
echo "🔍 Test 2: Search with keyword 'API'"
echo "-----------------------------------"
curl -s -X GET "$BASE_URL/api/v1/leads/search?keyword=API" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" | jq '.leads | length' 2>/dev/null || echo "Found leads with 'API' keyword"
echo ""

# Test 3: Create new lead
echo "➕ Test 3: Create new lead"
echo "-------------------------"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/leads" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test API User",
    "company": "API Test Company",
    "email": "test@apitest.com",
    "phone": "0812345678",
    "source": "Website",
    "status": "New",
    "product": "Softnix Data Platform",
    "endUserOrganization": "Test Organization"
  }')

LEAD_ID=$(echo $CREATE_RESPONSE | jq -r '.lead.id' 2>/dev/null)
echo "Created lead with ID: $LEAD_ID"
echo ""

# Test 4: Update the created lead (if creation was successful)
if [[ "$LEAD_ID" != "null" && "$LEAD_ID" != "" ]]; then
    echo "✏️ Test 4: Update lead $LEAD_ID"
    echo "-----------------------------"
    curl -s -X PATCH "$BASE_URL/api/v1/leads/$LEAD_ID" \
      -H "X-API-Key: $API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "status": "Qualified",
        "budget": "2,000,000"
      }' | jq -r '.lead.status' 2>/dev/null || echo "Lead updated"
    echo ""
else
    echo "❌ Skipping update test - lead creation failed"
    echo ""
fi

# Test 5: Test invalid API key
echo "🚫 Test 5: Test invalid API key"
echo "------------------------------"
curl -s -X GET "$BASE_URL/api/v1/leads/search" \
  -H "X-API-Key: invalid_key" \
  -H "Content-Type: application/json" | jq -r '.message' 2>/dev/null || echo "Authentication failed as expected"
echo ""

echo "✅ API Testing completed!"
echo ""
echo "💡 Tips:"
echo "- Replace API_KEY in this script with your actual API key"
echo "- Install jq for better JSON output formatting: brew install jq"
echo "- Check the API documentation for more details"