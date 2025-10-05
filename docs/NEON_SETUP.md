# Neon PostgreSQL Integration

This document explains how to set up and use Neon PostgreSQL for vector storage and context management in the LangChain.js Code Generation Agent.

## What is Neon?

Neon is a serverless PostgreSQL platform that provides:
- ✅ **Vector Extensions**: Built-in support for pgvector for similarity search
- ✅ **Serverless Architecture**: Automatic scaling and hibernation
- ✅ **Branching**: Database branching for development workflows
- ✅ **High Performance**: Fast queries with connection pooling
- ✅ **Cost Effective**: Pay only for what you use

## Setup Instructions

### 1. Create a Neon Account

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project

### 2. Get Connection Details

After creating your project, you'll get:
- **Database URL**: `postgresql://username:password@hostname/dbname`
- **API Key**: For programmatic access
- **Project ID**: Your project identifier

### 3. Configure Environment Variables

Update your `.env` file with your Neon credentials:

```env
# Vector Database Configuration
VECTOR_STORE_TYPE=neon
NEON_DATABASE_URL=postgresql://username:password@hostname/dbname
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here

# Table Names (optional - defaults provided)
NEON_VECTOR_TABLE=langchain_vectors
NEON_CONTEXT_TABLE=langchain_context

# OpenAI API Key (for embeddings)
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Install Dependencies

The required dependencies are already included:
```bash
npm install @neondatabase/serverless pg @langchain/community
```

## Features

### Vector Storage
- **Semantic Search**: Store and search code embeddings
- **Multi-language Support**: Works with any programming language
- **Metadata Filtering**: Filter by project, file type, language, etc.
- **Similarity Thresholds**: Configurable similarity matching

### Context Management
- **Persistent Memory**: Context survives server restarts
- **Hierarchical Storage**: Different context types (codebase, patterns, business)
- **Temporal Tracking**: Track how context evolves over time
- **Relationship Graphs**: Store code dependencies and relationships

### Performance Benefits
- **Connection Pooling**: Efficient database connections
- **Vector Indexes**: Fast similarity search with ivfflat indexes
- **Bulk Operations**: Efficient batch insertions and updates
- **Automatic Optimization**: Neon handles performance tuning

## API Usage

### Analyze and Store Codebase
```javascript
POST /universal/analyze
{
  "projectPath": "/path/to/your/project",
  "options": {
    "includeTests": true,
    "analyzeQuality": true
  }
}
```

### Generate Code with Context
```javascript
POST /universal/generate
{
  "requirement": "Add user authentication",
  "codebasePath": "/path/to/your/project",
  "targetLanguage": "JavaScript",
  "businessGoals": ["security", "scalability"]
}
```

### Store Custom Context
```javascript
POST /universal/context/store
{
  "projectId": "my-project",
  "contextData": {
    "businessRules": ["must use JWT tokens"],
    "codingStandards": ["use TypeScript"],
    "patterns": ["repository pattern", "dependency injection"]
  }
}
```

### Retrieve Context
```javascript
GET /universal/context/my-project?requirement=authentication&includeCodebase=true
```

## Database Schema

The system automatically creates the following tables:

### langchain_vectors
```sql
CREATE TABLE langchain_vectors (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),
  project_id TEXT,
  document_type TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### langchain_context
```sql
CREATE TABLE langchain_context (
  id SERIAL PRIMARY KEY,
  project_id TEXT NOT NULL,
  context_type TEXT NOT NULL,
  context_data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, context_type)
);
```

## Monitoring and Stats

Get system statistics:
```javascript
GET /universal/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "context": {
      "totalProjects": 5,
      "storageType": "neon"
    },
    "agent": {
      "totalGenerations": 42,
      "codebaseMemory": 15
    }
  }
}
```

## Troubleshooting

### Connection Issues
- Verify your `NEON_DATABASE_URL` is correct
- Check if your Neon project is active (not hibernated)
- Ensure your IP is allowed (Neon allows all by default)

### Performance Issues
- Monitor your Neon dashboard for query performance
- Consider upgrading your Neon plan for more compute
- Check vector index usage with `EXPLAIN ANALYZE`

### Storage Issues
- Monitor your storage usage in Neon dashboard
- Use `GET /universal/stats` to see data distribution
- Clean up old projects with `DELETE /universal/context/:projectId`

## Migration from Memory Store

To migrate from memory-based storage to Neon:

1. Set up Neon as described above
2. Change `VECTOR_STORE_TYPE=neon` in your `.env`
3. Re-analyze your projects to populate Neon
4. The system will automatically use Neon for new data

## Security Best Practices

1. **Environment Variables**: Keep credentials in `.env` file, never commit to git
2. **Connection Security**: Neon uses SSL by default
3. **Access Control**: Use Neon's role-based access control
4. **API Keys**: Rotate API keys regularly
5. **Monitoring**: Enable Neon's query monitoring

## Cost Optimization

1. **Data Retention**: Regularly clean up old projects
2. **Query Optimization**: Use appropriate similarity thresholds
3. **Compute Scaling**: Neon auto-scales, but monitor usage
4. **Storage Optimization**: Remove unused embeddings and context

---

With Neon integration, your LangChain.js Code Generation Agent now has:
- 🚀 **Persistent, scalable vector storage**
- 🧠 **Advanced context memory across sessions** 
- 📊 **Professional-grade database performance**
- 💰 **Cost-effective serverless scaling**

Your universal code generation system is now production-ready!