#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🐳 Testing IntelliChat UI Docker Build...${NC}"
echo ""

# Navigate to the UI directory
cd "$(dirname "$0")"

# Clean up any existing test containers
echo -e "${YELLOW}🧹 Cleaning up existing test containers...${NC}"
docker stop intellichat-ui-test 2>/dev/null
docker rm intellichat-ui-test 2>/dev/null
docker rmi intellichat-ui-test 2>/dev/null

echo ""
echo -e "${YELLOW}📦 Building Docker image...${NC}"
echo "This may take a few minutes..."

# Build the image
if docker build -t intellichat-ui-test .; then
    echo ""
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo ""
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

# Check image size
echo ""
echo -e "${YELLOW}📊 Image information:${NC}"
docker images intellichat-ui-test

echo ""
echo -e "${YELLOW}🚀 Starting test container...${NC}"

# Run the container
docker run -d \
  --name intellichat-ui-test \
  -p 3001:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3002/api \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3001 \
  -e NEXT_PUBLIC_AUTH_ENABLED=true \
  -e NEXT_PUBLIC_ENABLE_VOICE_INPUT=true \
  -e NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true \
  -e NEXT_PUBLIC_ENABLE_TOOLS=true \
  -e NEXT_PUBLIC_ENABLE_SHARING=true \
  -e NEXT_PUBLIC_MOCK_API=false \
  intellichat-ui-test

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Container started successfully!${NC}"
else
    echo -e "${RED}❌ Failed to start container!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}⏳ Waiting for server to start (30 seconds)...${NC}"
sleep 5

# Show initial logs
echo ""
echo -e "${YELLOW}📝 Initial logs:${NC}"
docker logs intellichat-ui-test

# Wait more for server to fully start
sleep 25

echo ""
echo -e "${YELLOW}🔍 Checking if server is responding...${NC}"

# Test the endpoint
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Server is responding! HTTP Status: $HTTP_CODE${NC}"
else
    echo -e "${RED}⚠️  Server response: HTTP Status: $HTTP_CODE${NC}"
    echo ""
    echo -e "${YELLOW}📝 Recent logs:${NC}"
    docker logs --tail 50 intellichat-ui-test
fi

echo ""
echo -e "${GREEN}🎉 Docker test complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}📌 Container Information:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Access UI:     http://localhost:3001"
echo "📊 View logs:     docker logs -f intellichat-ui-test"
echo "🛑 Stop:          docker stop intellichat-ui-test"
echo "🗑️  Remove:        docker rm intellichat-ui-test"
echo "🧹 Clean image:   docker rmi intellichat-ui-test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}💡 Useful commands:${NC}"
echo "  # Follow logs in real-time"
echo "  docker logs -f intellichat-ui-test"
echo ""
echo "  # Execute shell in container"
echo "  docker exec -it intellichat-ui-test sh"
echo ""
echo "  # Restart container"
echo "  docker restart intellichat-ui-test"
echo ""
echo "  # Stop and remove everything"
echo "  docker stop intellichat-ui-test && docker rm intellichat-ui-test && docker rmi intellichat-ui-test"
echo ""
