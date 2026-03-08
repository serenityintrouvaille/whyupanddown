#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🧪 API Endpoint Tests"
echo "===================="

BASE_URL="http://localhost:3000"

# Test 1: Market Indicators
echo -e "\n${GREEN}[1/3] Testing /api/market-indicators${NC}"
curl -s "$BASE_URL/api/market-indicators" | jq . 2>/dev/null && echo -e "${GREEN}✅ Success${NC}" || echo -e "${RED}❌ Failed${NC}"

# Test 2: Results
echo -e "\n${GREEN}[2/3] Testing /api/results${NC}"
curl -s "$BASE_URL/api/results" | jq . 2>/dev/null && echo -e "${GREEN}✅ Success${NC}" || echo -e "${RED}❌ Failed${NC}"

# Test 3: Detailed Analysis
echo -e "\n${GREEN}[3/3] Testing /api/detailed-analysis${NC}"
curl -s -X POST "$BASE_URL/api/detailed-analysis" \
  -H "Content-Type: application/json" \
  -d '{"sector": "반도체"}' | jq . 2>/dev/null && echo -e "${GREEN}✅ Success${NC}" || echo -e "${RED}❌ Failed${NC}"

echo -e "\n${GREEN}All tests completed!${NC}"
