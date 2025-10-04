import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger.js';

/**
 * Analyzes entire codebase to understand architecture, patterns, and dependencies
 */
export class CodebaseAnalyzer {
  constructor() {
    this.supportedExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rb']);
    this.ignorePatterns = ['node_modules', '.git', 'dist', 'build', '.next', '__pycache__'];
  }

  /**
   * Analyze the entire project structure and code patterns
   */
  async analyzeProject(projectPath) {
    logger.info('🔍 Starting comprehensive project analysis');

    try {
      const projectStats = await this.gatherProjectStats(projectPath);
      const architecture = await this.analyzeArchitecture(projectPath);
      const patterns = await this.identifyCodePatterns(projectPath);
      const dependencies = await this.analyzeDependencies(projectPath);
      const businessLogic = await this.extractBusinessLogic(projectPath);

      const analysis = {
        projectPath,
        analyzedAt: new Date().toISOString(),
        stats: projectStats,
        architecture,
        patterns,
        dependencies,
        businessLogic,
        summary: this.generateProjectSummary(projectStats, architecture, patterns)
      };

      logger.info('✅ Project analysis completed');
      return analysis;

    } catch (error) {
      logger.error('❌ Project analysis failed:', error);
      throw error;
    }
  }

  /**
   * Gather basic project statistics
   */
  async gatherProjectStats(projectPath) {
    const stats = {
      totalFiles: 0,
      codeFiles: 0,
      totalLines: 0,
      languages: new Map(),
      directories: [],
      largestFiles: [],
      recentChanges: []
    };

    const files = await this.getAllFiles(projectPath);
    
    for (const file of files) {
      const relativePath = path.relative(projectPath, file);
      const ext = path.extname(file);
      
      if (this.supportedExtensions.has(ext)) {
        stats.codeFiles++;
        
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n').length;
        stats.totalLines += lines;
        
        const language = this.getLanguageFromExtension(ext);
        stats.languages.set(language, (stats.languages.get(language) || 0) + 1);
        
        if (lines > 100) {
          stats.largestFiles.push({
            path: relativePath,
            lines,
            language
          });
        }
      }
      
      stats.totalFiles++;
    }

    // Sort largest files
    stats.largestFiles.sort((a, b) => b.lines - a.lines);
    stats.largestFiles = stats.largestFiles.slice(0, 10);

    return stats;
  }

  /**
   * Analyze project architecture and structure
   */
  async analyzeArchitecture(projectPath) {
    const architecture = {
      type: 'unknown',
      framework: 'unknown',
      patterns: [],
      layers: [],
      modules: [],
      entryPoints: []
    };

    // Check for common frameworks and patterns
    const packageJsonPath = path.join(projectPath, 'package.json');
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      // Detect framework
      if (packageJson.dependencies?.['next'] || packageJson.devDependencies?.['next']) {
        architecture.framework = 'Next.js';
        architecture.type = 'fullstack';
      } else if (packageJson.dependencies?.['react']) {
        architecture.framework = 'React';
        architecture.type = 'frontend';
      } else if (packageJson.dependencies?.['express']) {
        architecture.framework = 'Express.js';
        architecture.type = 'backend';
      }

      // Analyze project structure
      const srcPath = path.join(projectPath, 'src');
      if (await this.pathExists(srcPath)) {
        architecture.layers = await this.analyzeLayerStructure(srcPath);
      }

    } catch (error) {
      logger.warn('Could not analyze package.json:', error.message);
    }

    return architecture;
  }

  /**
   * Identify common code patterns and practices
   */
  async identifyCodePatterns(projectPath) {
    const patterns = {
      designPatterns: [],
      codingStyles: {},
      architecturalPatterns: [],
      commonPractices: []
    };

    const files = await this.getAllFiles(projectPath);
    const codeFiles = files.filter(file => this.supportedExtensions.has(path.extname(file)));

    for (const file of codeFiles.slice(0, 50)) { // Analyze first 50 files for patterns
      try {
        const content = await fs.readFile(file, 'utf-8');
        this.analyzeFilePatterns(content, patterns, file);
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return patterns;
  }

  /**
   * Analyze dependencies and their relationships
   */
  async analyzeDependencies(projectPath) {
    const dependencies = new Map();

    // Analyze package.json dependencies
    const packageJsonPath = path.join(projectPath, 'package.json');
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
        ...packageJson.peerDependencies
      };

      for (const [name, version] of Object.entries(allDeps)) {
        dependencies.set(name, {
          version,
          type: this.categorizeDependency(name),
          usage: await this.findDependencyUsage(projectPath, name)
        });
      }

    } catch (error) {
      logger.warn('Could not analyze dependencies:', error.message);
    }

    return dependencies;
  }

  /**
   * Extract business logic and domain concepts
   */
  async extractBusinessLogic(projectPath) {
    const businessLogic = {
      entities: [],
      services: [],
      repositories: [],
      controllers: [],
      domainConcepts: []
    };

    const files = await this.getAllFiles(projectPath);
    
    for (const file of files) {
      const fileName = path.basename(file, path.extname(file));
      const relativePath = path.relative(projectPath, file);

      // Identify business layer components
      if (fileName.toLowerCase().includes('service')) {
        businessLogic.services.push(relativePath);
      } else if (fileName.toLowerCase().includes('repository') || fileName.toLowerCase().includes('repo')) {
        businessLogic.repositories.push(relativePath);
      } else if (fileName.toLowerCase().includes('controller') || fileName.toLowerCase().includes('handler')) {
        businessLogic.controllers.push(relativePath);
      } else if (fileName.toLowerCase().includes('model') || fileName.toLowerCase().includes('entity')) {
        businessLogic.entities.push(relativePath);
      }
    }

    return businessLogic;
  }

  /**
   * Analyze specific files for change context
   */
  async analyzeChangeContext(targetFiles, changeType) {
    const context = {
      affectedFiles: [],
      patterns: [],
      dependenciesImpact: [],
      relatedFiles: []
    };

    for (const filePath of targetFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const fileAnalysis = this.analyzeFileContext(content, filePath, changeType);
        
        context.affectedFiles.push({
          path: filePath,
          analysis: fileAnalysis
        });

        // Find related files
        const related = await this.findRelatedFiles(filePath, content);
        context.relatedFiles.push(...related);

      } catch (error) {
        logger.warn(`Could not analyze file ${filePath}:`, error.message);
      }
    }

    return context;
  }

  // Helper methods
  async getAllFiles(dir) {
    const files = [];
    
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      if (this.shouldIgnore(item.name)) continue;
      
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        files.push(...await this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  shouldIgnore(name) {
    return this.ignorePatterns.some(pattern => name.includes(pattern));
  }

  getLanguageFromExtension(ext) {
    const mapping = {
      '.js': 'JavaScript',
      '.jsx': 'JavaScript',
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript',
      '.py': 'Python',
      '.java': 'Java',
      '.go': 'Go',
      '.rb': 'Ruby'
    };
    return mapping[ext] || 'Unknown';
  }

  async pathExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async analyzeLayerStructure(srcPath) {
    const layers = [];
    const items = await fs.readdir(srcPath, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        layers.push({
          name: item.name,
          type: this.identifyLayerType(item.name)
        });
      }
    }
    
    return layers;
  }

  identifyLayerType(dirName) {
    const name = dirName.toLowerCase();
    if (name.includes('component')) return 'presentation';
    if (name.includes('service')) return 'business';
    if (name.includes('data') || name.includes('repo')) return 'data';
    if (name.includes('util')) return 'utility';
    if (name.includes('api')) return 'api';
    return 'unknown';
  }

  analyzeFilePatterns(content, patterns, filePath) {
    // Detect design patterns
    if (content.includes('class') && content.includes('extends')) {
      patterns.designPatterns.push('Inheritance');
    }
    if (content.includes('interface') || content.includes('implements')) {
      patterns.designPatterns.push('Interface');
    }
    if (content.match(/function.*\(.*\).*=>/)) {
      patterns.designPatterns.push('Arrow Functions');
    }

    // Detect architectural patterns
    if (content.includes('useState') || content.includes('useEffect')) {
      patterns.architecturalPatterns.push('React Hooks');
    }
    if (content.includes('async') && content.includes('await')) {
      patterns.architecturalPatterns.push('Async/Await');
    }
  }

  categorizeDependency(name) {
    if (name.includes('react') || name.includes('vue') || name.includes('angular')) {
      return 'frontend-framework';
    }
    if (name.includes('express') || name.includes('koa') || name.includes('fastify')) {
      return 'backend-framework';
    }
    if (name.includes('test') || name.includes('jest') || name.includes('mocha')) {
      return 'testing';
    }
    if (name.includes('eslint') || name.includes('prettier') || name.includes('babel')) {
      return 'tooling';
    }
    return 'library';
  }

  async findDependencyUsage(projectPath, depName) {
    const usage = [];
    const files = await this.getAllFiles(projectPath);
    
    for (const file of files.slice(0, 20)) { // Check first 20 files
      try {
        const content = await fs.readFile(file, 'utf-8');
        if (content.includes(depName)) {
          usage.push(path.relative(projectPath, file));
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    return usage;
  }

  analyzeFileContext(content, filePath, changeType) {
    return {
      size: content.length,
      complexity: this.calculateComplexity(content),
      dependencies: this.extractImports(content),
      exports: this.extractExports(content),
      functions: this.extractFunctions(content),
      classes: this.extractClasses(content)
    };
  }

  calculateComplexity(content) {
    const lines = content.split('\n').length;
    const functions = (content.match(/function/g) || []).length;
    const conditions = (content.match(/if|switch|while|for/g) || []).length;
    
    return {
      lines,
      functions,
      conditions,
      score: functions + conditions
    };
  }

  extractImports(content) {
    const importRegex = /import.*from\s+['"`]([^'"`]+)['"`]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  extractExports(content) {
    const exportRegex = /export\s+(default\s+)?(\w+)/g;
    const exports = [];
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[2]);
    }
    
    return exports;
  }

  extractFunctions(content) {
    const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=.*=>|(\w+)\s*\()/g;
    const functions = [];
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
      functions.push(match[1] || match[2] || match[3]);
    }
    
    return functions;
  }

  extractClasses(content) {
    const classRegex = /class\s+(\w+)/g;
    const classes = [];
    let match;
    
    while ((match = classRegex.exec(content)) !== null) {
      classes.push(match[1]);
    }
    
    return classes;
  }

  async findRelatedFiles(filePath, content) {
    const related = [];
    const imports = this.extractImports(content);
    
    for (const importPath of imports) {
      if (importPath.startsWith('.')) {
        // Local import - find the actual file
        const dir = path.dirname(filePath);
        const resolvedPath = path.resolve(dir, importPath);
        related.push(resolvedPath);
      }
    }
    
    return related;
  }

  generateProjectSummary(stats, architecture, patterns) {
    return {
      description: `${architecture.framework} ${architecture.type} application`,
      scale: this.determineProjectScale(stats),
      complexity: this.determineComplexity(stats, patterns),
      mainLanguages: Array.from(stats.languages.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([lang]) => lang),
      keyFeatures: this.identifyKeyFeatures(architecture, patterns)
    };
  }

  determineProjectScale(stats) {
    if (stats.codeFiles < 50) return 'small';
    if (stats.codeFiles < 200) return 'medium';
    return 'large';
  }

  determineComplexity(stats, patterns) {
    const score = stats.totalLines / 1000 + patterns.designPatterns.length;
    if (score < 5) return 'low';
    if (score < 20) return 'medium';
    return 'high';
  }

  identifyKeyFeatures(architecture, patterns) {
    const features = [];
    
    if (architecture.framework === 'Next.js') {
      features.push('Server-Side Rendering', 'API Routes');
    }
    if (patterns.architecturalPatterns.includes('React Hooks')) {
      features.push('Modern React Patterns');
    }
    if (patterns.architecturalPatterns.includes('Async/Await')) {
      features.push('Asynchronous Programming');
    }
    
    return features;
  }
}