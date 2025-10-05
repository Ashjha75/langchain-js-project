import fs from 'fs/promises';
import path from 'path';
import globPkg from 'glob';
const { glob } = globPkg;
import { logger } from './logger.js';

export class UniversalCodebaseAnalyzer {
  constructor() {
    this.supportedLanguages = new Map([
      ['.js', 'javascript'],
      ['.jsx', 'javascript'],
      ['.ts', 'typescript'],
      ['.tsx', 'typescript'],
      ['.py', 'python'],
      ['.java', 'java'],
      ['.php', 'php'],
      ['.rb', 'ruby'],
      ['.go', 'golang'],
      ['.cs', 'csharp'],
      ['.cpp', 'cpp'],
      ['.c', 'c'],
      ['.rs', 'rust'],
      ['.kt', 'kotlin'],
      ['.swift', 'swift'],
      ['.scala', 'scala'],
      ['.r', 'r'],
      ['.dart', 'dart'],
      ['.vue', 'vue'],
      ['.svelte', 'svelte'],
      ['.html', 'html'],
      ['.css', 'css'],
      ['.scss', 'scss'],
      ['.less', 'less'],
      ['.sql', 'sql'],
      ['.sh', 'shell'],
      ['.yaml', 'yaml'],
      ['.yml', 'yaml'],
      ['.json', 'json'],
      ['.xml', 'xml'],
      ['.md', 'markdown']
    ]);

    this.frameworkSignatures = new Map([
      // JavaScript/TypeScript frameworks
      ['react', ['react', 'jsx', 'useState', 'useEffect', 'Component']],
      ['vue', ['vue', 'v-', 'Vue.', '@click', 'ref(']],
      ['angular', ['@Component', '@Injectable', 'NgModule', 'angular']],
      ['nextjs', ['next/', 'getServerSideProps', 'getStaticProps', 'useRouter']],
      ['nuxt', ['nuxt', 'asyncData', 'fetch()', '$nuxt']],
      ['express', ['express', 'app.get', 'app.post', 'req.', 'res.']],
      ['fastify', ['fastify', 'fastify.register', 'reply.']],
      ['nestjs', ['@nestjs', '@Controller', '@Service', '@Module']],
      
      // Python frameworks
      ['django', ['django', 'from django', 'models.Model', 'HttpResponse']],
      ['flask', ['flask', 'from flask', '@app.route', 'render_template']],
      ['fastapi', ['fastapi', 'FastAPI', '@app.get', 'Depends(']],
      ['tornado', ['tornado', 'RequestHandler', 'tornado.web']],
      
      // Java frameworks
      ['spring', ['@RestController', '@Service', '@Autowired', 'springframework']],
      ['springboot', ['@SpringBootApplication', 'SpringApplication', '@EnableAutoConfiguration']],
      
      // PHP frameworks
      ['laravel', ['Laravel', 'Illuminate', 'Eloquent', 'Route::']],
      ['symfony', ['Symfony', 'use Symfony', '@Route', 'Controller']],
      
      // Ruby frameworks
      ['rails', ['Rails', 'ActiveRecord', 'has_many', 'belongs_to']],
      ['sinatra', ['Sinatra', 'get \'/', 'post \'/']],
      
      // Go frameworks
      ['gin', ['gin', 'gin.Default', 'c.JSON', 'gin.Context']],
      ['echo', ['echo', 'echo.New', 'c.String', 'echo.Context']],
      
      // Mobile frameworks
      ['flutter', ['flutter', 'StatelessWidget', 'StatefulWidget', 'BuildContext']],
      ['react-native', ['react-native', 'StyleSheet', 'TouchableOpacity', 'NavigationContainer']],
      
      // Testing frameworks
      ['jest', ['jest', 'describe(', 'it(', 'expect(']],
      ['mocha', ['mocha', 'describe(', 'it(', 'chai']],
      ['pytest', ['pytest', 'def test_', 'assert ', 'fixture']],
      ['junit', ['@Test', 'JUnit', 'assertEquals', 'assertTrue']]
    ]);

    this.architecturalPatterns = new Map([
      ['mvc', ['controller', 'model', 'view', 'Controller', 'Model', 'View']],
      ['mvvm', ['viewmodel', 'ViewModel', 'ObservableObject', 'Binding']],
      ['microservices', ['microservice', 'api-gateway', 'service-mesh', 'circuit-breaker']],
      ['layered', ['service', 'repository', 'dao', 'dto', 'Service', 'Repository']],
      ['hexagonal', ['port', 'adapter', 'domain', 'infrastructure', 'application']],
      ['clean-architecture', ['entity', 'usecase', 'gateway', 'presenter', 'interactor']],
      ['event-driven', ['event', 'EventBus', 'EventHandler', 'publish', 'subscribe']],
      ['cqrs', ['command', 'query', 'CommandHandler', 'QueryHandler', 'CQRS']],
      ['ddd', ['aggregate', 'entity', 'value-object', 'domain-service', 'repository']]
    ]);

    this.businessDomains = new Map([
      ['ecommerce', ['product', 'cart', 'order', 'payment', 'customer', 'inventory', 'shipping', 'checkout']],
      ['fintech', ['account', 'transaction', 'payment', 'wallet', 'transfer', 'balance', 'banking', 'financial']],
      ['healthcare', ['patient', 'doctor', 'appointment', 'medical', 'treatment', 'diagnosis', 'prescription']],
      ['education', ['student', 'teacher', 'course', 'lesson', 'grade', 'assignment', 'enrollment', 'academic']],
      ['hr', ['employee', 'payroll', 'recruitment', 'performance', 'attendance', 'leave', 'benefits']],
      ['crm', ['lead', 'contact', 'opportunity', 'customer', 'sales', 'pipeline', 'campaign']],
      ['social', ['user', 'post', 'comment', 'like', 'share', 'follow', 'feed', 'notification']],
      ['analytics', ['metric', 'dashboard', 'report', 'chart', 'data', 'insight', 'visualization']],
      ['iot', ['device', 'sensor', 'telemetry', 'monitoring', 'control', 'automation', 'gateway']],
      ['gaming', ['player', 'game', 'score', 'level', 'achievement', 'leaderboard', 'match']]
    ]);
  }

  /**
   * Analyze any codebase comprehensively
   */
  async analyzeProject(projectPath, options = {}) {
    try {
      logger.info(`🔍 Starting universal analysis of: ${projectPath}`);
      
      const {
        maxFileSize = 500000, // 500KB
        maxFiles = 1000,
        includePatterns = ['**/*'],
        excludePatterns = [
          'node_modules/**', 'vendor/**', 'dist/**', 'build/**', 
          '.git/**', 'coverage/**', 'target/**', 'bin/**', 'obj/**',
          '*.log', '*.tmp', '*.cache', '.DS_Store', 'Thumbs.db'
        ]
      } = options;

      // Step 1: Discover project structure
      const projectStructure = await this.discoverProjectStructure(projectPath, includePatterns, excludePatterns);
      
      // Step 2: Analyze files in batches
      const fileAnalysis = await this.analyzeFilesInBatches(projectStructure.files, maxFileSize, maxFiles);
      
      // Step 3: Detect technologies and frameworks
      const technologyStack = this.detectTechnologyStack(fileAnalysis);
      
      // Step 4: Identify architectural patterns
      const architecturalPatterns = this.identifyArchitecturalPatterns(fileAnalysis);
      
      // Step 5: Extract business domain
      const businessDomain = this.extractBusinessDomain(fileAnalysis);
      
      // Step 6: Analyze code quality and complexity
      const qualityMetrics = this.calculateQualityMetrics(fileAnalysis);
      
      // Step 7: Build dependency graph
      const dependencyGraph = this.buildDependencyGraph(fileAnalysis);
      
      // Step 8: Extract code patterns and conventions
      const codePatterns = this.extractCodePatterns(fileAnalysis);
      
      // Step 9: Identify key business logic
      const businessLogic = this.identifyBusinessLogic(fileAnalysis);

      const analysis = {
        projectPath,
        analyzedAt: new Date().toISOString(),
        summary: {
          totalFiles: projectStructure.totalFiles,
          analyzedFiles: fileAnalysis.length,
          languages: Array.from(technologyStack.languages),
          frameworks: Array.from(technologyStack.frameworks),
          primaryDomain: businessDomain.primary,
          architecturalStyle: architecturalPatterns.primary,
          codeQuality: qualityMetrics.overall
        },
        structure: projectStructure,
        technologies: technologyStack,
        architecture: architecturalPatterns,
        business: businessDomain,
        quality: qualityMetrics,
        dependencies: dependencyGraph,
        patterns: codePatterns,
        businessLogic: businessLogic,
        recommendations: this.generateRecommendations(technologyStack, architecturalPatterns, qualityMetrics)
      };

      logger.info(`✅ Analysis complete: ${analysis.summary.analyzedFiles} files, ${analysis.summary.languages.length} languages`);
      return analysis;

    } catch (error) {
      logger.error('Error in universal codebase analysis:', error);
      throw error;
    }
  }

  async discoverProjectStructure(projectPath, includePatterns, excludePatterns) {
    try {
      const allFiles = [];
      
      for (const pattern of includePatterns) {
        const files = await glob(pattern, {
          cwd: projectPath,
          ignore: excludePatterns,
          absolute: true,
          nodir: true
        });
        allFiles.push(...files);
      }

      // Remove duplicates and get file stats
      const uniqueFiles = [...new Set(allFiles)];
      const fileStructure = {
        totalFiles: uniqueFiles.length,
        files: uniqueFiles,
        directories: new Set(),
        fileTypes: new Map(),
        sizeDist: { small: 0, medium: 0, large: 0 }
      };

      for (const file of uniqueFiles) {
        const dir = path.dirname(file);
        fileStructure.directories.add(dir);
        
        const ext = path.extname(file).toLowerCase();
        fileStructure.fileTypes.set(ext, (fileStructure.fileTypes.get(ext) || 0) + 1);
        
        try {
          const stats = await fs.stat(file);
          if (stats.size < 10000) fileStructure.sizeDist.small++;
          else if (stats.size < 100000) fileStructure.sizeDist.medium++;
          else fileStructure.sizeDist.large++;
        } catch (error) {
          // File might have been deleted, skip
        }
      }

      return fileStructure;

    } catch (error) {
      logger.error('Error discovering project structure:', error);
      throw error;
    }
  }

  async analyzeFilesInBatches(files, maxFileSize, maxFiles) {
    const batchSize = 20;
    const filesToAnalyze = files.slice(0, maxFiles);
    const results = [];

    for (let i = 0; i < filesToAnalyze.length; i += batchSize) {
      const batch = filesToAnalyze.slice(i, i + batchSize);
      const batchPromises = batch.map(file => this.analyzeFile(file, maxFileSize));
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
        }
      }
      
      // Progress logging
      if (i % 100 === 0) {
        logger.info(`📊 Analyzed ${i}/${filesToAnalyze.length} files`);
      }
    }

    return results;
  }

  async analyzeFile(filePath, maxFileSize) {
    try {
      const stats = await fs.stat(filePath);
      if (stats.size > maxFileSize) {
        return null; // Skip large files
      }

      const content = await fs.readFile(filePath, 'utf-8');
      const extension = path.extname(filePath).toLowerCase();
      const language = this.supportedLanguages.get(extension) || 'unknown';

      return {
        filePath,
        fileName: path.basename(filePath),
        directory: path.dirname(filePath),
        extension,
        language,
        size: stats.size,
        lines: content.split('\n').length,
        content,
        
        // Analysis results
        imports: this.extractImports(content, language),
        exports: this.extractExports(content, language),
        functions: this.extractFunctions(content, language),
        classes: this.extractClasses(content, language),
        variables: this.extractVariables(content, language),
        comments: this.extractComments(content, language),
        
        // Quality metrics
        complexity: this.calculateFileComplexity(content, language),
        maintainability: this.calculateMaintainability(content, language),
        testCoverage: this.estimateTestCoverage(content, filePath),
        
        // Business context
        businessTerms: this.extractBusinessTerms(content),
        domainConcepts: this.extractDomainConcepts(content),
        
        // Metadata
        lastModified: stats.mtime,
        createdAt: stats.birthtime
      };

    } catch (error) {
      logger.error(`Error analyzing file ${filePath}:`, error.message);
      return null;
    }
  }

  extractImports(content, language) {
    const imports = [];
    
    switch (language) {
      case 'javascript':
      case 'typescript':
        // ES6 imports
        const es6Imports = content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g) || [];
        // CommonJS requires
        const cjsRequires = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
        imports.push(...es6Imports, ...cjsRequires);
        break;
        
      case 'python':
        const pythonImports = content.match(/(?:from\s+\S+\s+)?import\s+\S+/g) || [];
        imports.push(...pythonImports);
        break;
        
      case 'java':
        const javaImports = content.match(/import\s+[\w.]+;/g) || [];
        imports.push(...javaImports);
        break;
        
      case 'csharp':
        const csharpUsings = content.match(/using\s+[\w.]+;/g) || [];
        imports.push(...csharpUsings);
        break;
    }
    
    return imports;
  }

  extractExports(content, language) {
    const exports = [];
    
    switch (language) {
      case 'javascript':
      case 'typescript':
        const namedExports = content.match(/export\s+(?:const|let|var|function|class)\s+(\w+)/g) || [];
        const defaultExports = content.match(/export\s+default\s+(\w+)/g) || [];
        exports.push(...namedExports, ...defaultExports);
        break;
        
      case 'python':
        // Python doesn't have explicit exports, but we can find __all__
        const allExports = content.match(/__all__\s*=\s*\[(.*?)\]/s);
        if (allExports) {
          exports.push(allExports[0]);
        }
        break;
    }
    
    return exports;
  }

  extractFunctions(content, language) {
    const functions = [];
    
    switch (language) {
      case 'javascript':
      case 'typescript':
        const funcDeclarations = content.match(/function\s+(\w+)/g) || [];
        const arrowFunctions = content.match(/(?:const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g) || [];
        const methods = content.match(/(\w+)\s*\([^)]*\)\s*{/g) || [];
        functions.push(...funcDeclarations, ...arrowFunctions, ...methods);
        break;
        
      case 'python':
        const pythonFunctions = content.match(/def\s+(\w+)/g) || [];
        functions.push(...pythonFunctions);
        break;
        
      case 'java':
        const javaMethods = content.match(/(?:public|private|protected)?\s*(?:static)?\s*\w+\s+(\w+)\s*\(/g) || [];
        functions.push(...javaMethods);
        break;
    }
    
    return functions.map(f => f.replace(/function\s+|def\s+|const\s+|let\s+|var\s+/, '').split(/[(\s]/)[0]);
  }

  extractClasses(content, language) {
    const classes = [];
    
    switch (language) {
      case 'javascript':
      case 'typescript':
      case 'python':
      case 'java':
      case 'csharp':
        const classMatches = content.match(/class\s+(\w+)/g) || [];
        classes.push(...classMatches.map(c => c.replace('class ', '')));
        break;
    }
    
    return classes;
  }

  extractVariables(content, language) {
    const variables = [];
    
    switch (language) {
      case 'javascript':
      case 'typescript':
        const jsVars = content.match(/(?:const|let|var)\s+(\w+)/g) || [];
        variables.push(...jsVars);
        break;
        
      case 'python':
        const pyVars = content.match(/^(\w+)\s*=/gm) || [];
        variables.push(...pyVars);
        break;
    }
    
    return variables.map(v => v.replace(/const\s+|let\s+|var\s+|=.*/, '').trim());
  }

  extractComments(content, language) {
    const comments = [];
    
    switch (language) {
      case 'javascript':
      case 'typescript':
      case 'java':
      case 'csharp':
        const singleLine = content.match(/\/\/.*$/gm) || [];
        const multiLine = content.match(/\/\*[\s\S]*?\*\//g) || [];
        comments.push(...singleLine, ...multiLine);
        break;
        
      case 'python':
        const pythonComments = content.match(/#.*$/gm) || [];
        const pythonDocstrings = content.match(/"""[\s\S]*?"""/g) || [];
        comments.push(...pythonComments, ...pythonDocstrings);
        break;
    }
    
    return comments;
  }

  calculateFileComplexity(content, language) {
    const lines = content.split('\n').length;
    const functions = this.extractFunctions(content, language).length;
    const conditions = (content.match(/if|else|switch|case|for|while|do|\?/g) || []).length;
    const classes = this.extractClasses(content, language).length;
    const nesting = this.calculateNestingDepth(content);
    
    // Cyclomatic complexity approximation
    const cyclomaticComplexity = conditions + functions + 1;
    
    return {
      lines,
      functions,
      conditions,
      classes,
      nesting,
      cyclomatic: cyclomaticComplexity,
      score: Math.min(10, Math.round(cyclomaticComplexity / functions || 1))
    };
  }

  calculateNestingDepth(content) {
    let maxDepth = 0;
    let currentDepth = 0;
    
    for (const char of content) {
      if (char === '{' || char === '(' || char === '[') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === '}' || char === ')' || char === ']') {
        currentDepth--;
      }
    }
    
    return maxDepth;
  }

  calculateMaintainability(content, language) {
    const lines = content.split('\n').length;
    const comments = this.extractComments(content, language);
    const commentRatio = comments.length / lines;
    const avgLineLength = content.split('\n').reduce((sum, line) => sum + line.length, 0) / lines;
    
    // Simple maintainability score
    let score = 10;
    if (commentRatio < 0.1) score -= 2; // Too few comments
    if (avgLineLength > 100) score -= 2; // Lines too long
    if (lines > 500) score -= 1; // File too large
    
    return {
      commentRatio: Math.round(commentRatio * 100),
      avgLineLength: Math.round(avgLineLength),
      score: Math.max(1, score)
    };
  }

  estimateTestCoverage(content, filePath) {
    const isTestFile = /test|spec/.test(path.basename(filePath));
    const hasTestKeywords = /describe|it|test|assert|expect/.test(content);
    
    return {
      isTestFile,
      hasTestKeywords,
      estimatedCoverage: isTestFile ? 90 : hasTestKeywords ? 60 : 10
    };
  }

  extractBusinessTerms(content) {
    const terms = [];
    const businessKeywords = [
      'user', 'customer', 'client', 'account', 'profile', 'order', 'product', 'service',
      'payment', 'transaction', 'invoice', 'billing', 'subscription', 'plan',
      'authentication', 'authorization', 'login', 'signup', 'register',
      'dashboard', 'admin', 'manager', 'employee', 'role', 'permission',
      'report', 'analytics', 'metric', 'data', 'export', 'import',
      'notification', 'email', 'message', 'alert', 'campaign',
      'inventory', 'stock', 'shipping', 'delivery', 'warehouse',
      'discount', 'coupon', 'promotion', 'offer', 'sale'
    ];
    
    const lowerContent = content.toLowerCase();
    businessKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        terms.push(keyword);
      }
    });
    
    return [...new Set(terms)];
  }

  extractDomainConcepts(content) {
    const concepts = [];
    
    for (const [domain, keywords] of this.businessDomains) {
      const matchCount = keywords.filter(keyword => 
        content.toLowerCase().includes(keyword)
      ).length;
      
      if (matchCount > 0) {
        concepts.push({
          domain,
          confidence: matchCount / keywords.length,
          matchedKeywords: keywords.filter(k => content.toLowerCase().includes(k))
        });
      }
    }
    
    return concepts.sort((a, b) => b.confidence - a.confidence);
  }

  detectTechnologyStack(fileAnalysis) {
    const languages = new Set();
    const frameworks = new Set();
    const libraries = new Set();
    const databases = new Set();
    const tools = new Set();

    for (const file of fileAnalysis) {
      languages.add(file.language);
      
      // Detect frameworks
      for (const [framework, signatures] of this.frameworkSignatures) {
        if (signatures.some(sig => file.content.includes(sig))) {
          frameworks.add(framework);
        }
      }
      
      // Extract libraries from imports
      file.imports.forEach(imp => {
        const libName = this.extractLibraryName(imp);
        if (libName) libraries.add(libName);
      });
    }

    return {
      languages: Array.from(languages),
      frameworks: Array.from(frameworks),
      libraries: Array.from(libraries),
      databases: Array.from(databases),
      tools: Array.from(tools),
      confidence: this.calculateTechStackConfidence(fileAnalysis)
    };
  }

  extractLibraryName(importStatement) {
    // Extract library name from import statement
    const match = importStatement.match(/(?:from ['"]|require\(['"]|import.*from ['"])([^'"]+)/);
    return match ? match[1].split('/')[0] : null;
  }

  calculateTechStackConfidence(fileAnalysis) {
    const totalFiles = fileAnalysis.length;
    const confidenceScores = {};
    
    // Calculate confidence based on file distribution
    const languageCount = {};
    fileAnalysis.forEach(file => {
      languageCount[file.language] = (languageCount[file.language] || 0) + 1;
    });
    
    for (const [lang, count] of Object.entries(languageCount)) {
      confidenceScores[lang] = count / totalFiles;
    }
    
    return confidenceScores;
  }

  identifyArchitecturalPatterns(fileAnalysis) {
    const patterns = new Map();
    
    for (const [pattern, keywords] of this.architecturalPatterns) {
      let matchCount = 0;
      let totalFiles = 0;
      
      for (const file of fileAnalysis) {
        totalFiles++;
        const hasPattern = keywords.some(keyword => 
          file.content.toLowerCase().includes(keyword.toLowerCase()) ||
          file.filePath.toLowerCase().includes(keyword.toLowerCase())
        );
        if (hasPattern) matchCount++;
      }
      
      if (matchCount > 0) {
        patterns.set(pattern, {
          confidence: matchCount / totalFiles,
          matchedFiles: matchCount,
          totalFiles
        });
      }
    }
    
    const sortedPatterns = Array.from(patterns.entries())
      .sort((a, b) => b[1].confidence - a[1].confidence);
    
    return {
      detected: sortedPatterns,
      primary: sortedPatterns.length > 0 ? sortedPatterns[0][0] : 'unknown',
      confidence: sortedPatterns.length > 0 ? sortedPatterns[0][1].confidence : 0
    };
  }

  extractBusinessDomain(fileAnalysis) {
    const domainScores = new Map();
    
    for (const [domain, keywords] of this.businessDomains) {
      let score = 0;
      let totalMatches = 0;
      
      for (const file of fileAnalysis) {
        const content = file.content.toLowerCase();
        const matches = keywords.filter(keyword => content.includes(keyword));
        score += matches.length;
        totalMatches += matches.length;
      }
      
      if (score > 0) {
        domainScores.set(domain, {
          score,
          totalMatches,
          confidence: score / (keywords.length * fileAnalysis.length)
        });
      }
    }
    
    const sortedDomains = Array.from(domainScores.entries())
      .sort((a, b) => b[1].score - a[1].score);
    
    return {
      detected: sortedDomains,
      primary: sortedDomains.length > 0 ? sortedDomains[0][0] : 'general',
      confidence: sortedDomains.length > 0 ? sortedDomains[0][1].confidence : 0,
      businessTerms: this.aggregateBusinessTerms(fileAnalysis)
    };
  }

  aggregateBusinessTerms(fileAnalysis) {
    const termCounts = new Map();
    
    fileAnalysis.forEach(file => {
      file.businessTerms.forEach(term => {
        termCounts.set(term, (termCounts.get(term) || 0) + 1);
      });
    });
    
    return Array.from(termCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // Top 20 business terms
  }

  calculateQualityMetrics(fileAnalysis) {
    const metrics = {
      totalLines: 0,
      totalFunctions: 0,
      totalClasses: 0,
      avgComplexity: 0,
      avgMaintainability: 0,
      testCoverage: 0,
      commentRatio: 0,
      codeSmells: []
    };
    
    let complexitySum = 0;
    let maintainabilitySum = 0;
    let testFiles = 0;
    let commentLines = 0;
    
    fileAnalysis.forEach(file => {
      metrics.totalLines += file.lines;
      metrics.totalFunctions += file.functions.length;
      metrics.totalClasses += file.classes.length;
      
      complexitySum += file.complexity.score;
      maintainabilitySum += file.maintainability.score;
      
      if (file.testCoverage.isTestFile) testFiles++;
      commentLines += file.comments.length;
      
      // Detect code smells
      if (file.lines > 1000) metrics.codeSmells.push({ file: file.fileName, smell: 'large-file' });
      if (file.complexity.cyclomatic > 20) metrics.codeSmells.push({ file: file.fileName, smell: 'high-complexity' });
      if (file.maintainability.score < 5) metrics.codeSmells.push({ file: file.fileName, smell: 'low-maintainability' });
    });
    
    const fileCount = fileAnalysis.length;
    metrics.avgComplexity = Math.round(complexitySum / fileCount * 10) / 10;
    metrics.avgMaintainability = Math.round(maintainabilitySum / fileCount * 10) / 10;
    metrics.testCoverage = Math.round((testFiles / fileCount) * 100);
    metrics.commentRatio = Math.round((commentLines / metrics.totalLines) * 100);
    
    // Overall quality score
    metrics.overall = Math.round(
      (metrics.avgMaintainability * 0.3 +
       (10 - metrics.avgComplexity) * 0.3 +
       (metrics.testCoverage / 10) * 0.2 +
       (metrics.commentRatio / 10) * 0.2) * 10
    ) / 10;
    
    return metrics;
  }

  buildDependencyGraph(fileAnalysis) {
    const graph = new Map();
    
    fileAnalysis.forEach(file => {
      const dependencies = file.imports.map(imp => this.extractLibraryName(imp)).filter(Boolean);
      
      graph.set(file.filePath, {
        dependencies,
        dependents: [],
        type: file.language,
        exports: file.exports
      });
    });
    
    // Build dependents relationships
    for (const [filePath, data] of graph) {
      data.dependencies.forEach(dep => {
        const depFile = Array.from(graph.keys()).find(fp => fp.includes(dep));
        if (depFile && graph.has(depFile)) {
          graph.get(depFile).dependents.push(filePath);
        }
      });
    }
    
    return Object.fromEntries(graph);
  }

  extractCodePatterns(fileAnalysis) {
    const patterns = {
      naming: this.analyzeNamingConventions(fileAnalysis),
      structure: this.analyzeStructuralPatterns(fileAnalysis),
      style: this.analyzeCodeStyle(fileAnalysis),
      architecture: this.analyzeArchitecturalPatterns(fileAnalysis)
    };
    
    return patterns;
  }

  analyzeNamingConventions(fileAnalysis) {
    const conventions = {
      files: { camelCase: 0, kebabCase: 0, snakeCase: 0, PascalCase: 0 },
      functions: { camelCase: 0, snakeCase: 0, PascalCase: 0 },
      classes: { PascalCase: 0, camelCase: 0 },
      variables: { camelCase: 0, snakeCase: 0, UPPER_CASE: 0 }
    };
    
    fileAnalysis.forEach(file => {
      // Analyze file naming
      const fileName = path.basename(file.fileName, path.extname(file.fileName));
      if (/^[a-z][a-zA-Z0-9]*$/.test(fileName)) conventions.files.camelCase++;
      else if (/^[a-z][a-z0-9-]*$/.test(fileName)) conventions.files.kebabCase++;
      else if (/^[a-z][a-z0-9_]*$/.test(fileName)) conventions.files.snakeCase++;
      else if (/^[A-Z][a-zA-Z0-9]*$/.test(fileName)) conventions.files.PascalCase++;
      
      // Analyze function naming
      file.functions.forEach(func => {
        if (/^[a-z][a-zA-Z0-9]*$/.test(func)) conventions.functions.camelCase++;
        else if (/^[a-z][a-z0-9_]*$/.test(func)) conventions.functions.snakeCase++;
        else if (/^[A-Z][a-zA-Z0-9]*$/.test(func)) conventions.functions.PascalCase++;
      });
      
      // Analyze class naming
      file.classes.forEach(cls => {
        if (/^[A-Z][a-zA-Z0-9]*$/.test(cls)) conventions.classes.PascalCase++;
        else if (/^[a-z][a-zA-Z0-9]*$/.test(cls)) conventions.classes.camelCase++;
      });
    });
    
    return conventions;
  }

  analyzeStructuralPatterns(fileAnalysis) {
    const patterns = {
      avgFileSize: 0,
      avgFunctionsPerFile: 0,
      avgClassesPerFile: 0,
      directoryStructure: new Set(),
      commonFileTypes: new Map()
    };
    
    let totalSize = 0;
    let totalFunctions = 0;
    let totalClasses = 0;
    
    fileAnalysis.forEach(file => {
      totalSize += file.size;
      totalFunctions += file.functions.length;
      totalClasses += file.classes.length;
      
      patterns.directoryStructure.add(path.dirname(file.filePath));
      patterns.commonFileTypes.set(file.extension, 
        (patterns.commonFileTypes.get(file.extension) || 0) + 1);
    });
    
    patterns.avgFileSize = Math.round(totalSize / fileAnalysis.length);
    patterns.avgFunctionsPerFile = Math.round(totalFunctions / fileAnalysis.length * 10) / 10;
    patterns.avgClassesPerFile = Math.round(totalClasses / fileAnalysis.length * 10) / 10;
    
    return patterns;
  }

  analyzeCodeStyle(fileAnalysis) {
    const style = {
      indentation: { spaces: 0, tabs: 0 },
      quotes: { single: 0, double: 0 },
      semicolons: { present: 0, absent: 0 },
      bracketStyle: { sameLine: 0, newLine: 0 }
    };
    
    fileAnalysis.forEach(file => {
      const content = file.content;
      
      // Analyze indentation
      const spaceIndent = (content.match(/^  /gm) || []).length;
      const tabIndent = (content.match(/^\t/gm) || []).length;
      if (spaceIndent > tabIndent) style.indentation.spaces++;
      else if (tabIndent > spaceIndent) style.indentation.tabs++;
      
      // Analyze quotes
      const singleQuotes = (content.match(/'/g) || []).length;
      const doubleQuotes = (content.match(/"/g) || []).length;
      if (singleQuotes > doubleQuotes) style.quotes.single++;
      else if (doubleQuotes > singleQuotes) style.quotes.double++;
      
      // Analyze semicolons
      const withSemicolons = (content.match(/;$/gm) || []).length;
      const lines = content.split('\n').length;
      if (withSemicolons > lines * 0.5) style.semicolons.present++;
      else style.semicolons.absent++;
    });
    
    return style;
  }

  analyzeArchitecturalPatterns(fileAnalysis) {
    // This would be more sophisticated in a real implementation
    const patterns = {
      layered: false,
      modular: false,
      objectOriented: false,
      functional: false
    };
    
    const totalFiles = fileAnalysis.length;
    let hasLayers = 0;
    let hasModules = 0;
    let hasClasses = 0;
    let hasFunctions = 0;
    
    fileAnalysis.forEach(file => {
      if (file.filePath.includes('/service/') || file.filePath.includes('/repository/')) hasLayers++;
      if (file.imports.length > 0) hasModules++;
      if (file.classes.length > 0) hasClasses++;
      if (file.functions.length > 0) hasFunctions++;
    });
    
    patterns.layered = hasLayers / totalFiles > 0.3;
    patterns.modular = hasModules / totalFiles > 0.7;
    patterns.objectOriented = hasClasses / totalFiles > 0.5;
    patterns.functional = hasFunctions / totalFiles > 0.8;
    
    return patterns;
  }

  identifyBusinessLogic(fileAnalysis) {
    const businessLogic = {
      coreBusinessFiles: [],
      businessEntities: [],
      businessProcesses: [],
      businessRules: []
    };
    
    fileAnalysis.forEach(file => {
      const businessTermCount = file.businessTerms.length;
      const isBusinessFile = businessTermCount > 3 || 
        file.filePath.includes('/business/') ||
        file.filePath.includes('/domain/') ||
        file.filePath.includes('/service/');
      
      if (isBusinessFile) {
        businessLogic.coreBusinessFiles.push({
          file: file.filePath,
          businessTerms: file.businessTerms,
          confidence: businessTermCount / 10 // Normalize to 0-1
        });
      }
      
      // Extract business entities (classes with business terms)
      file.classes.forEach(className => {
        const hasBusinessTerm = file.businessTerms.some(term => 
          className.toLowerCase().includes(term)
        );
        if (hasBusinessTerm) {
          businessLogic.businessEntities.push({
            name: className,
            file: file.filePath,
            type: 'entity'
          });
        }
      });
    });
    
    return businessLogic;
  }

  generateRecommendations(techStack, architecture, quality) {
    const recommendations = [];
    
    // Technology recommendations
    if (techStack.languages.includes('javascript') && !techStack.frameworks.includes('typescript')) {
      recommendations.push({
        type: 'technology',
        priority: 'medium',
        title: 'Consider TypeScript',
        description: 'Adding TypeScript can improve code quality and maintainability'
      });
    }
    
    // Architecture recommendations
    if (architecture.primary === 'unknown') {
      recommendations.push({
        type: 'architecture',
        priority: 'high',
        title: 'Define Architecture Pattern',
        description: 'Consider implementing a clear architectural pattern like MVC or layered architecture'
      });
    }
    
    // Quality recommendations
    if (quality.testCoverage < 50) {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        title: 'Improve Test Coverage',
        description: `Current test coverage is ${quality.testCoverage}%. Aim for at least 70%`
      });
    }
    
    if (quality.avgComplexity > 7) {
      recommendations.push({
        type: 'quality',
        priority: 'medium',
        title: 'Reduce Code Complexity',
        description: 'Consider refactoring complex functions to improve maintainability'
      });
    }
    
    if (quality.commentRatio < 15) {
      recommendations.push({
        type: 'documentation',
        priority: 'low',
        title: 'Add More Documentation',
        description: 'Consider adding more comments and documentation to improve code understanding'
      });
    }
    
    return recommendations;
  }
}