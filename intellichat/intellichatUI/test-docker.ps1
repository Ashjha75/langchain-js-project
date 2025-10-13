# PowerShell script to test IntelliChat UI Docker build

Write-Host "🐳 Testing IntelliChat UI Docker Build..." -ForegroundColor Yellow
Write-Host ""

# Navigate to script directory
Set-Location $PSScriptRoot

# Clean up existing test containers
Write-Host "🧹 Cleaning up existing test containers..." -ForegroundColor Yellow
docker stop intellichat-ui-test 2>$null
docker rm intellichat-ui-test 2>$null
docker rmi intellichat-ui-test 2>$null

Write-Host ""
Write-Host "📦 Building Docker image..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..."

# Build the image
$buildResult = docker build -t intellichat-ui-test .

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Check image size
Write-Host ""
Write-Host "📊 Image information:" -ForegroundColor Yellow
docker images intellichat-ui-test

Write-Host ""
Write-Host "🚀 Starting test container..." -ForegroundColor Yellow

# Run the container
docker run -d `
  --name intellichat-ui-test `
  -p 3001:3000 `
  -e NEXT_PUBLIC_API_URL=http://localhost:3002/api `
  -e NEXT_PUBLIC_APP_URL=http://localhost:3001 `
  -e NEXT_PUBLIC_AUTH_ENABLED=true `
  -e NEXT_PUBLIC_ENABLE_VOICE_INPUT=true `
  -e NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true `
  -e NEXT_PUBLIC_ENABLE_TOOLS=true `
  -e NEXT_PUBLIC_ENABLE_SHARING=true `
  -e NEXT_PUBLIC_MOCK_API=false `
  intellichat-ui-test

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Container started successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start container!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⏳ Waiting for server to start (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Show initial logs
Write-Host ""
Write-Host "📝 Initial logs:" -ForegroundColor Yellow
docker logs intellichat-ui-test

# Wait more for server to fully start
Start-Sleep -Seconds 25

Write-Host ""
Write-Host "🔍 Checking if server is responding..." -ForegroundColor Yellow

# Test the endpoint
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 10
    $statusCode = $response.StatusCode
    
    if ($statusCode -eq 200) {
        Write-Host "✅ Server is responding! HTTP Status: $statusCode" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Server response: HTTP Status: $statusCode" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not connect to server" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Recent logs:" -ForegroundColor Yellow
    docker logs --tail 50 intellichat-ui-test
}

Write-Host ""
Write-Host "🎉 Docker test complete!" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "📌 Container Information:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🌐 Access UI:     http://localhost:3001"
Write-Host "📊 View logs:     docker logs -f intellichat-ui-test"
Write-Host "🛑 Stop:          docker stop intellichat-ui-test"
Write-Host "🗑️  Remove:        docker rm intellichat-ui-test"
Write-Host "🧹 Clean image:   docker rmi intellichat-ui-test"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""
Write-Host "💡 Useful commands:" -ForegroundColor Yellow
Write-Host "  # Follow logs in real-time"
Write-Host "  docker logs -f intellichat-ui-test"
Write-Host ""
Write-Host "  # Execute shell in container"
Write-Host "  docker exec -it intellichat-ui-test sh"
Write-Host ""
Write-Host "  # Restart container"
Write-Host "  docker restart intellichat-ui-test"
Write-Host ""
Write-Host "  # Stop and remove everything"
Write-Host "  docker stop intellichat-ui-test; docker rm intellichat-ui-test; docker rmi intellichat-ui-test"
Write-Host ""
