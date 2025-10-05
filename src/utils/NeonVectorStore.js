import { neon } from '@neondatabase/serverless';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { logger } from './logger.js';

export class NeonVectorStore {
  constructor() {
    this.sql = neon(process.env.NEON_DATABASE_URL);
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY || process.env.GOOGLE_API_KEY, // Fallback to Google if no OpenAI
      modelName: 'text-embedding-3-small'
    });
    this.tableName = process.env.NEON_VECTOR_TABLE || 'langchain_vectors';
    this.contextTableName = process.env.NEON_CONTEXT_TABLE || 'langchain_context';
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Create extension for vector operations
      await this.sql`CREATE EXTENSION IF NOT EXISTS vector`;
      
      // Create vectors table
      await this.sql`
        CREATE TABLE IF NOT EXISTS ${this.sql(this.tableName)} (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          metadata JSONB DEFAULT '{}',
          embedding vector(1536),
          project_id TEXT,
          document_type TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;

      // Create context table
      await this.sql`
        CREATE TABLE IF NOT EXISTS ${this.sql(this.contextTableName)} (
          id SERIAL PRIMARY KEY,
          project_id TEXT NOT NULL,
          context_type TEXT NOT NULL,
          context_data JSONB NOT NULL,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(project_id, context_type)
        )
      `;

      // Create indexes for better performance
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_vectors_project_id ON ${this.sql(this.tableName)} (project_id)
      `;
      
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_vectors_embedding ON ${this.sql(this.tableName)} 
        USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_context_project_id ON ${this.sql(this.contextTableName)} (project_id)
      `;

      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_context_type ON ${this.sql(this.contextTableName)} (context_type)
      `;

      this.initialized = true;
      logger.info('🚀 Neon vector store initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Neon vector store:', error);
      throw error;
    }
  }

  async addDocuments(documents, projectId, documentType = 'general') {
    await this.initialize();

    try {
      const embeddings = await this.embeddings.embedDocuments(
        documents.map(doc => doc.pageContent)
      );

      const insertData = documents.map((doc, index) => ({
        content: doc.pageContent,
        metadata: JSON.stringify(doc.metadata || {}),
        embedding: `[${embeddings[index].join(',')}]`,
        project_id: projectId,
        document_type: documentType
      }));

      await this.sql`
        INSERT INTO ${this.sql(this.tableName)} 
        (content, metadata, embedding, project_id, document_type)
        SELECT * FROM ${this.sql(insertData)}
      `;

      logger.info(`📚 Added ${documents.length} documents to Neon vector store`, {
        projectId,
        documentType
      });

      return documents.length;
    } catch (error) {
      logger.error('❌ Failed to add documents to Neon vector store:', error);
      throw error;
    }
  }

  async similaritySearch(query, projectId, options = {}) {
    await this.initialize();

    const {
      k = 5,
      documentType = null,
      threshold = 0.7,
      includeMetadata = true
    } = options;

    try {
      const queryEmbedding = await this.embeddings.embedQuery(query);
      
      let whereClause = this.sql`project_id = ${projectId}`;
      if (documentType) {
        whereClause = this.sql`project_id = ${projectId} AND document_type = ${documentType}`;
      }

      const results = await this.sql`
        SELECT 
          content,
          metadata,
          1 - (embedding <=> ${`[${queryEmbedding.join(',')}]`}) as similarity
        FROM ${this.sql(this.tableName)}
        WHERE ${whereClause}
          AND 1 - (embedding <=> ${`[${queryEmbedding.join(',')}]`}) > ${threshold}
        ORDER BY embedding <=> ${`[${queryEmbedding.join(',')}]`}
        LIMIT ${k}
      `;

      return results.map(row => ({
        content: row.content,
        metadata: includeMetadata ? JSON.parse(row.metadata) : {},
        similarity: row.similarity
      }));
    } catch (error) {
      logger.error('❌ Failed to perform similarity search:', error);
      throw error;
    }
  }

  async storeContext(projectId, contextType, contextData, metadata = {}) {
    await this.initialize();

    try {
      await this.sql`
        INSERT INTO ${this.sql(this.contextTableName)} 
        (project_id, context_type, context_data, metadata)
        VALUES (${projectId}, ${contextType}, ${JSON.stringify(contextData)}, ${JSON.stringify(metadata)})
        ON CONFLICT (project_id, context_type) 
        DO UPDATE SET 
          context_data = ${JSON.stringify(contextData)},
          metadata = ${JSON.stringify(metadata)},
          updated_at = NOW()
      `;

      logger.info(`💾 Stored context in Neon database`, {
        projectId,
        contextType
      });

      return true;
    } catch (error) {
      logger.error('❌ Failed to store context in Neon:', error);
      throw error;
    }
  }

  async getContext(projectId, contextType = null) {
    await this.initialize();

    try {
      let results;
      if (contextType) {
        results = await this.sql`
          SELECT context_type, context_data, metadata, created_at, updated_at
          FROM ${this.sql(this.contextTableName)}
          WHERE project_id = ${projectId} AND context_type = ${contextType}
        `;
      } else {
        results = await this.sql`
          SELECT context_type, context_data, metadata, created_at, updated_at
          FROM ${this.sql(this.contextTableName)}
          WHERE project_id = ${projectId}
          ORDER BY updated_at DESC
        `;
      }

      return results.map(row => ({
        contextType: row.context_type,
        contextData: JSON.parse(row.context_data),
        metadata: JSON.parse(row.metadata),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      logger.error('❌ Failed to get context from Neon:', error);
      throw error;
    }
  }

  async deleteProject(projectId) {
    await this.initialize();

    try {
      const vectorsDeleted = await this.sql`
        DELETE FROM ${this.sql(this.tableName)} WHERE project_id = ${projectId}
      `;

      const contextDeleted = await this.sql`
        DELETE FROM ${this.sql(this.contextTableName)} WHERE project_id = ${projectId}
      `;

      logger.info(`🗑️ Deleted project data from Neon`, {
        projectId,
        vectorsDeleted: vectorsDeleted.count,
        contextDeleted: contextDeleted.count
      });

      return {
        vectorsDeleted: vectorsDeleted.count,
        contextDeleted: contextDeleted.count
      };
    } catch (error) {
      logger.error('❌ Failed to delete project from Neon:', error);
      throw error;
    }
  }

  async getStats() {
    await this.initialize();

    try {
      const [vectorStats, contextStats] = await Promise.all([
        this.sql`
          SELECT 
            COUNT(*) as total_vectors,
            COUNT(DISTINCT project_id) as unique_projects,
            COUNT(DISTINCT document_type) as document_types
          FROM ${this.sql(this.tableName)}
        `,
        this.sql`
          SELECT 
            COUNT(*) as total_contexts,
            COUNT(DISTINCT project_id) as unique_projects,
            COUNT(DISTINCT context_type) as context_types
          FROM ${this.sql(this.contextTableName)}
        `
      ]);

      return {
        vectors: vectorStats[0],
        contexts: contextStats[0],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('❌ Failed to get Neon stats:', error);
      throw error;
    }
  }
}