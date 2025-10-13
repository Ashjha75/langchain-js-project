# 🐳 Docker Build & Deployment Guide for Next.js 15

## Key Changes Made to Fix Your Dockerfile

### 1. **Node Version Changed**
- **Old**: `node:20-alpine`
- **New**: `node:18-alpine`
- **Why**: Next.js 15 works best with Node 18 LTS for stability

### 2. **Peer Dependencies Fixed**
- **Added**: `RUN npm ci --legacy-peer-deps`
- **Why**: Handles peer dependency conflicts automatically

### 3. **Standalone Mode Support**
- **Old**: Copied `.next` folder and `node_modules` separately
- **New**: Copies `.next/standalone` folder (includes optimized server)
- **Why**: Next.js 15 with `output: 'standalone'` creates self-contained build

### 4. **Startup Command Changed**
- **Old**: `CMD ["npm", "start"]`
- **New**: `CMD ["node", "server.js"]`
- **Why**: Standalone mode provides optimized `server.js` for production

### 5. **Added Required Dependencies**
- **Added**: `libc6-compat` package
- **Why**: Required for some npm packages in Alpine Linux

---

## Quick Start

### Windows (PowerShell)

```powershell
cd intellichat\intellichatUI
.\test-docker.ps1
```

### Linux/Mac (Bash)

```bash
cd intellichat/intellichatUI
chmod +x test-docker.sh
./test-docker.sh
```

---

## Manual Build & Run

### Build the Image

```bash
docker build -t intellichat-ui:latest .
```

### Run the Container

```bash
docker run -d \
  --name intellichat-ui \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3002/api \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  -e NEXT_PUBLIC_AUTH_ENABLED=true \
  intellichat-ui:latest
```

### View Logs

```bash
docker logs -f intellichat-ui
```

### Stop Container

```bash
docker stop intellichat-ui
docker rm intellichat-ui
```

---

## Environment Variables

All `NEXT_PUBLIC_*` variables must be set at **build time** or **runtime**:

```bash
docker run -d \
  --name intellichat-ui \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api \
  -e NEXT_PUBLIC_APP_URL=https://your-app.onrender.com \
  -e NEXT_PUBLIC_AUTH_ENABLED=true \
  -e NEXT_PUBLIC_ENABLE_VOICE_INPUT=true \
  -e NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true \
  -e NEXT_PUBLIC_ENABLE_TOOLS=true \
  -e NEXT_PUBLIC_ENABLE_SHARING=true \
  -e NEXT_PUBLIC_MOCK_API=false \
  intellichat-ui:latest
```

---

## Troubleshooting

### Issue: Peer Dependency Errors

**Symptoms:**
```
npm ERR! peer dep missing: react@^18.0.0
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Fixed by:**
- Using `npm ci --legacy-peer-deps` in Dockerfile

### Issue: "Cannot find module" Errors

**Symptoms:**
```
Error: Cannot find module 'next'
```

**Solution:**
- Ensure `output: 'standalone'` is in `next.config.js`
- Verify `.next/standalone` folder is created during build

### Issue: Build Takes Too Long

**Solution:**
```bash
# Use Docker layer caching
docker build --cache-from intellichat-ui:latest -t intellichat-ui:latest .

# Or clean build
docker build --no-cache -t intellichat-ui:latest .
```

### Issue: Server Not Responding

**Check logs:**
```bash
docker logs intellichat-ui
```

**Common causes:**
- Port already in use (change `-p 3001:3000`)
- Environment variables not set
- Build failed but container started

---

## Production Deployment

### For Render.com

**Dockerfile location:** `intellichat/intellichatUI/Dockerfile`

**Root Directory:** `intellichat/intellichatUI`

**Build Command:** (Leave empty, Render will use Dockerfile)

**Start Command:** (Leave empty, Render will use CMD from Dockerfile)

**Environment Variables (Set in Render Dashboard):**
```
NEXT_PUBLIC_API_URL=https://intellichat-backend.onrender.com/api
NEXT_PUBLIC_APP_URL=https://intellichat-frontend.onrender.com
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_ENABLE_VOICE_INPUT=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true
NEXT_PUBLIC_ENABLE_TOOLS=true
NEXT_PUBLIC_ENABLE_SHARING=true
NEXT_PUBLIC_MOCK_API=false
```

### For Docker Hub

```bash
# Tag the image
docker tag intellichat-ui:latest yourusername/intellichat-ui:latest

# Push to Docker Hub
docker push yourusername/intellichat-ui:latest

# Pull and run on server
docker pull yourusername/intellichat-ui:latest
docker run -d -p 3000:3000 -e NEXT_PUBLIC_API_URL=... yourusername/intellichat-ui:latest
```

---

## Performance Optimization

### Image Size Comparison

- **Old Dockerfile**: ~1.2 GB (with full node_modules)
- **New Dockerfile**: ~150-250 MB (standalone mode)

### Build Time

- **First build**: 5-10 minutes (downloads dependencies)
- **Cached build**: 1-2 minutes (uses layer cache)

### Runtime Performance

- **Memory usage**: ~100-200 MB
- **Startup time**: 2-5 seconds
- **Cold start**: Very fast (no npm overhead)

---

## Multi-Architecture Support

Build for both AMD64 and ARM64:

```bash
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t intellichat-ui:latest .
```

---

## Health Checks

Add to `docker run` or `docker-compose.yml`:

```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## Docker Compose Example

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3002/api
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
      - NEXT_PUBLIC_AUTH_ENABLED=true
    depends_on:
      - backend
    restart: unless-stopped
```

---

## Security Best Practices

✅ **Implemented:**
- Non-root user (`nextjs:nodejs`)
- Multi-stage build (minimal final image)
- No unnecessary files (`.dockerignore`)
- Production NODE_ENV
- Telemetry disabled

🔒 **Additional recommendations:**
- Scan for vulnerabilities: `docker scan intellichat-ui:latest`
- Use specific Node version: `node:18.17.0-alpine`
- Keep dependencies updated
- Use secrets for API keys (not env vars in production)

---

## Next Steps

1. ✅ Test locally: `./test-docker.ps1` or `./test-docker.sh`
2. ✅ Verify in browser: http://localhost:3001
3. ✅ Check logs: `docker logs -f intellichat-ui-test`
4. ✅ Deploy to Render using this Dockerfile
5. ✅ Monitor production logs

---

## Support

If you encounter issues:

1. Check logs: `docker logs <container_name>`
2. Verify Next.js config has `output: 'standalone'`
3. Ensure all `NEXT_PUBLIC_*` env vars are set
4. Try clean build: `docker build --no-cache`
5. Check Node version compatibility (18.x recommended)

---

**Last Updated:** October 13, 2025
**Next.js Version:** 15.5.1
**Node Version:** 18-alpine
