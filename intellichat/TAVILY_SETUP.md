# 🔑 Tavily API Key Setup Guide

## Quick Setup (2 minutes)

### 1. Get Your Tavily API Key

Visit: **https://tavily.com**

1. Click **"Sign Up Free"** or **"Get Started"**
2. Create account (email + password)
3. Verify your email
4. Go to **Dashboard** → **API Keys**
5. Copy your API key (looks like: `tvly-xxxxxxxxxxxx`)

**Free Tier Includes:**
- ✅ 1,000 searches per month
- ✅ Full API access
- ✅ No credit card required

---

### 2. Add Key to Backend

Open `backend/.env` and add:

```env
# External APIs (Optional)
TAVILY_API_KEY=tvly-your-actual-key-here
```

**Example:**
```env
TAVILY_API_KEY=tvly-AbCd1234EfGh5678IjKl
```

---

### 3. Restart Backend

```bash
cd backend
npm run dev
```

**Look for this in logs:**
```
✅ Groq provider initialized
   webSearchEnabled: true
```

If you see `webSearchEnabled: true`, web search is ready! 🎉

---

## Testing Web Search

### Try These Queries:

1. **News/Current Events:**
   ```
   "What's the latest news about AI?"
   "Recent updates on climate change"
   "Current tech news 2025"
   ```

2. **Real-time Data:**
   ```
   "What's the weather in New York today?"
   "Latest stock market updates"
   "Recent SpaceX launches"
   ```

3. **Recent Information:**
   ```
   "Who won the latest Nobel Prize?"
   "Recent scientific breakthroughs"
   "What happened in tech this week?"
   ```

### Expected Response:
```
Based on current web search results...

1. [Source Title] (https://example.com)
   [Content from web]

2. [Another Source] (https://another.com)
   [More current info]

*Last updated: [timestamp]*
```

---

## Trigger Keywords

Web search is automatically triggered when your message contains:

### Time-related:
- latest, recent, current, today, now
- 2024, 2025, this year, this month

### Action words:
- search, find, browse, look up, google

### Questions:
- what's, what is, who is, when did
- what happened, tell me about recent

### Generic:
- news, update, web, internet, online

**Example:**
- ❌ "Explain quantum physics" → No search (general knowledge)
- ✅ "Latest quantum computing news" → Triggers search
- ✅ "What's happening with AI today?" → Triggers search
- ❌ "How does a car work?" → No search (general knowledge)

---

## Troubleshooting

### Web Search Not Working?

#### Check 1: API Key
```bash
# In backend directory
cat .env | grep TAVILY_API_KEY
```

Should show:
```
TAVILY_API_KEY=tvly-xxxxx
```

Not showing? **Action:** Add the key to `.env`

#### Check 2: Backend Logs
```bash
npm run dev
```

Look for:
```
[INFO] Groq provider initialized
   webSearchEnabled: true
```

Seeing `webSearchEnabled: false`? **Action:** API key is missing or invalid

#### Check 3: Test API Key
Visit: https://tavily.com/dashboard

- Check remaining searches
- Verify key is active
- Check for any errors

---

## Advanced Configuration

### Search Depth

Edit `backend/src/ai/providers/groq.ts`:

```typescript
const searchResults = await tavilySearch.searchAndFormat({
  query: lastMessage.content,
  searchDepth: "advanced",  // Change to "advanced" for deeper search
  maxResults: 10,            // Increase for more results (1-10)
  includeAnswer: true,
  includeImages: false,      // Set to true for image results
});
```

**Options:**
- `searchDepth`: `"basic"` (fast) or `"advanced"` (comprehensive)
- `maxResults`: 1-10 (more results = more context)
- `includeAnswer`: Quick summary before results
- `includeImages`: Include relevant images

---

## Monitoring Usage

### Check API Usage:
1. Visit https://tavily.com/dashboard
2. Go to **Usage** tab
3. See:
   - Searches used this month
   - Remaining searches
   - Usage history

### Free Tier Limits:
- **1,000 searches/month** (resets monthly)
- **5 requests/second** rate limit
- **Basic search depth** included
- **Advanced search** uses 2x credits

---

## Cost Optimization

### Tips to Save Searches:

1. **Smart Detection** (Already Implemented ✅)
   - Only searches when keywords detected
   - Not every message triggers search

2. **Caching** (Optional Enhancement)
   ```typescript
   // Cache results for 1 hour
   const cacheKey = `search:${query}`;
   const cached = await redis.get(cacheKey);
   if (cached) return JSON.parse(cached);
   ```

3. **Manual Toggle** (Future Feature)
   ```
   User: "search: latest AI news"  // Forces search
   User: "explain AI"              // No search
   ```

---

## API Key Security

### ✅ DO:
- Keep `.env` in `.gitignore`
- Use environment variables
- Rotate keys periodically
- Monitor usage for anomalies

### ❌ DON'T:
- Commit `.env` to git
- Share keys publicly
- Hardcode keys in source
- Use same key across projects

---

## Upgrading Tavily

### Free → Pro:
- **$99/month** or **$990/year**
- **100,000 searches/month**
- **Advanced search** included
- **Priority support**
- **Custom integrations**

Visit: https://tavily.com/pricing

---

## Alternative: Disable Web Search

Don't want web search? Simply remove or comment out the API key:

```env
# TAVILY_API_KEY=tvly-your-key
```

Backend will log:
```
[WARN] Tavily API key not configured. Web search will be unavailable.
```

Chat will work normally, just without web search capability.

---

## Summary

**Setup Checklist:**
- [ ] Got Tavily API key from https://tavily.com
- [ ] Added `TAVILY_API_KEY=tvly-xxx` to `backend/.env`
- [ ] Restarted backend (`npm run dev`)
- [ ] Checked logs for `webSearchEnabled: true`
- [ ] Tested with "What's the latest news about AI?"
- [ ] Saw web search results with sources

**All done?** You now have full web browsing capabilities! 🎉🔍

---

## Quick Links

- **Tavily Website:** https://tavily.com
- **API Docs:** https://docs.tavily.com
- **Dashboard:** https://tavily.com/dashboard
- **Pricing:** https://tavily.com/pricing
- **Support:** support@tavily.com

---

**Your chat can now browse the web!** 🌐✨
