import { logger } from './logger.js';

/**
 * Analyzes the impact of code changes on the overall system
 */
export class ChangeImpactAnalyzer {
  constructor() {
    this.riskFactors = new Map();
    this.dependencyGraph = new Map();
    this.changeHistory = [];
  }

  /**
   * Analyze the impact of a proposed change
   */
  async analyzeImpact(targetFiles, changeType, projectKnowledge) {
    logger.info('📊 Analyzing change impact');

    try {
      const impact = {
        riskLevel: 'low',
        affectedComponents: [],
        requiredTests: [],
        deploymentConsiderations: [],
        rollbackPlan: [],
        performanceImpact: null,
        securityImpact: null,
        businessImpact: null,
        technicalDebt: null,
        dependencies: [],
        breakingChanges: [],
        migrationSteps: []
      };

      // Analyze each target file
      for (const filePath of targetFiles) {
        const fileImpact = await this.analyzeFileImpact(
          filePath, 
          changeType, 
          projectKnowledge
        );
        this.mergeImpact(impact, fileImpact);
      }

      // Calculate overall risk level
      impact.riskLevel = this.calculateOverallRisk(impact);

      // Generate recommendations
      impact.recommendations = this.generateRecommendations(impact, changeType);

      logger.info(`✅ Impact analysis completed - Risk Level: ${impact.riskLevel}`);
      return impact;

    } catch (error) {
      logger.error('❌ Impact analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze impact of changes to a specific file
   */
  async analyzeFileImpact(filePath, changeType, projectKnowledge) {
    const impact = {
      riskLevel: 'low',
      affectedComponents: [],
      requiredTests: [],
      dependencies: [],
      breakingChanges: []
    };

    // Analyze based on file type and location
    const fileAnalysis = this.analyzeFileCharacteristics(filePath, projectKnowledge);
    
    // Core system files have higher impact
    if (fileAnalysis.isCoreFile) {
      impact.riskLevel = this.escalateRisk(impact.riskLevel, 'high');
      impact.affectedComponents.push(...fileAnalysis.dependentComponents);
    }

    // API changes have broader impact
    if (fileAnalysis.isAPIFile) {
      impact.riskLevel = this.escalateRisk(impact.riskLevel, 'medium');
      impact.breakingChanges.push(...this.identifyPotentialBreakingChanges(filePath, changeType));
    }

    // Database changes require special consideration
    if (fileAnalysis.isDatabaseFile) {
      impact.riskLevel = this.escalateRisk(impact.riskLevel, 'high');
      impact.requiredTests.push('database migration tests', 'data integrity tests');
    }

    // Configuration changes affect entire system
    if (fileAnalysis.isConfigFile) {
      impact.riskLevel = this.escalateRisk(impact.riskLevel, 'medium');
      impact.affectedComponents.push('entire system');
    }

    return impact;
  }

  /**
   * Analyze file characteristics to understand its role in the system
   */
  analyzeFileCharacteristics(filePath, projectKnowledge) {
    const fileName = filePath.toLowerCase();
    const fileDir = filePath.split('/').slice(0, -1).join('/').toLowerCase();

    const characteristics = {
      isCoreFile: false,
      isAPIFile: false,
      isDatabaseFile: false,
      isConfigFile: false,
      isTestFile: false,
      isComponentFile: false,
      isUtilityFile: false,
      dependentComponents: [],
      complexity: 'low'
    };

    // Identify file types
    if (fileName.includes('config') || fileName.includes('.env') || fileName.includes('package.json')) {
      characteristics.isConfigFile = true;
    }

    if (fileName.includes('api') || fileName.includes('route') || fileName.includes('endpoint')) {
      characteristics.isAPIFile = true;
    }

    if (fileName.includes('model') || fileName.includes('schema') || fileName.includes('migration')) {
      characteristics.isDatabaseFile = true;
    }

    if (fileName.includes('test') || fileName.includes('spec') || fileDir.includes('test')) {
      characteristics.isTestFile = true;
    }

    if (fileName.includes('component') || fileDir.includes('component')) {
      characteristics.isComponentFile = true;
    }

    if (fileName.includes('util') || fileName.includes('helper') || fileDir.includes('util')) {
      characteristics.isUtilityFile = true;
    }

    // Identify core files based on project structure
    const corePatterns = ['index', 'main', 'app', 'server', 'client'];
    if (corePatterns.some(pattern => fileName.includes(pattern))) {
      characteristics.isCoreFile = true;
    }

    // Find dependent components
    characteristics.dependentComponents = this.findDependentComponents(
      filePath, 
      projectKnowledge
    );

    return characteristics;
  }

  /**
   * Find components that depend on the given file
   */
  findDependentComponents(filePath, projectKnowledge) {
    const dependents = [];

    // Check dependencies map from project knowledge
    if (projectKnowledge.dependencies) {
      for (const [component, deps] of projectKnowledge.dependencies) {
        if (deps.usage && deps.usage.includes(filePath)) {
          dependents.push(component);
        }
      }
    }

    // Analyze based on common patterns
    const fileName = filePath.split('/').pop();
    if (fileName.includes('service')) {
      dependents.push('controllers', 'components');
    }
    
    if (fileName.includes('model')) {
      dependents.push('services', 'repositories');
    }

    if (fileName.includes('component')) {
      dependents.push('pages', 'layouts');
    }

    return dependents;
  }

  /**
   * Identify potential breaking changes
   */
  identifyPotentialBreakingChanges(filePath, changeType) {
    const breakingChanges = [];

    if (changeType === 'refactor') {
      breakingChanges.push(
        'Function signature changes',
        'API endpoint modifications',
        'Data structure changes'
      );
    }

    if (changeType === 'feature') {
      breakingChanges.push(
        'New required parameters',
        'Changed default behavior'
      );
    }

    if (changeType === 'optimization') {
      breakingChanges.push(
        'Performance characteristics changes',
        'Memory usage patterns'
      );
    }

    return breakingChanges;
  }

  /**
   * Calculate overall risk level
   */
  calculateOverallRisk(impact) {
    let riskScore = 0;

    // Base risk from individual assessments
    const riskLevels = { low: 1, medium: 3, high: 5, critical: 8 };
    riskScore += riskLevels[impact.riskLevel] || 1;

    // Additional risk factors
    if (impact.affectedComponents.length > 5) riskScore += 2;
    if (impact.breakingChanges.length > 0) riskScore += 3;
    if (impact.affectedComponents.includes('entire system')) riskScore += 4;
    if (impact.affectedComponents.includes('database')) riskScore += 3;
    if (impact.affectedComponents.includes('authentication')) riskScore += 3;

    // Determine final risk level
    if (riskScore >= 8) return 'critical';
    if (riskScore >= 5) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }

  /**
   * Generate recommendations based on impact analysis
   */
  generateRecommendations(impact, changeType) {
    const recommendations = [];

    // Risk-based recommendations
    if (impact.riskLevel === 'critical') {
      recommendations.push(
        'Require architecture review before implementation',
        'Create comprehensive rollback plan',
        'Implement feature flags for gradual rollout',
        'Conduct thorough security review'
      );
    }

    if (impact.riskLevel === 'high') {
      recommendations.push(
        'Implement comprehensive testing suite',
        'Create detailed documentation',
        'Plan staged deployment',
        'Notify all stakeholders'
      );
    }

    if (impact.riskLevel === 'medium') {
      recommendations.push(
        'Add integration tests',
        'Update relevant documentation',
        'Consider backward compatibility'
      );
    }

    // Change type specific recommendations
    if (changeType === 'feature') {
      recommendations.push(
        'Add feature documentation',
        'Update API documentation if applicable',
        'Consider feature flags for controlled release'
      );
    }

    if (changeType === 'bugfix') {
      recommendations.push(
        'Add regression tests',
        'Verify fix doesn\'t introduce new issues',
        'Document root cause analysis'
      );
    }

    if (changeType === 'refactor') {
      recommendations.push(
        'Maintain API compatibility',
        'Add performance benchmarks',
        'Update code documentation'
      );
    }

    // Component-specific recommendations
    if (impact.affectedComponents.includes('database')) {
      recommendations.push(
        'Create database migration scripts',
        'Test with production-like data',
        'Plan for rollback scenarios'
      );
    }

    if (impact.affectedComponents.includes('authentication')) {
      recommendations.push(
        'Conduct security review',
        'Test all authentication flows',
        'Update security documentation'
      );
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Merge impact analysis from multiple files
   */
  mergeImpact(mainImpact, fileImpact) {
    // Escalate risk level
    mainImpact.riskLevel = this.escalateRisk(mainImpact.riskLevel, fileImpact.riskLevel);

    // Merge affected components
    mainImpact.affectedComponents.push(...fileImpact.affectedComponents);
    mainImpact.affectedComponents = [...new Set(mainImpact.affectedComponents)];

    // Merge required tests
    mainImpact.requiredTests.push(...fileImpact.requiredTests);
    mainImpact.requiredTests = [...new Set(mainImpact.requiredTests)];

    // Merge breaking changes
    mainImpact.breakingChanges.push(...fileImpact.breakingChanges);
    mainImpact.breakingChanges = [...new Set(mainImpact.breakingChanges)];

    // Merge dependencies
    mainImpact.dependencies.push(...fileImpact.dependencies);
    mainImpact.dependencies = [...new Set(mainImpact.dependencies)];
  }

  /**
   * Escalate risk level
   */
  escalateRisk(currentRisk, newRisk) {
    const riskLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const currentLevel = riskLevels[currentRisk] || 1;
    const newLevel = riskLevels[newRisk] || 1;
    
    const maxLevel = Math.max(currentLevel, newLevel);
    return Object.keys(riskLevels).find(key => riskLevels[key] === maxLevel);
  }

  /**
   * Analyze performance impact
   */
  analyzePerformanceImpact(changeType, affectedComponents) {
    const impact = {
      level: 'low',
      areas: [],
      metrics: [],
      recommendations: []
    };

    if (affectedComponents.includes('database')) {
      impact.level = 'medium';
      impact.areas.push('query performance', 'data access patterns');
      impact.metrics.push('query response time', 'database load');
      impact.recommendations.push('Profile database queries', 'Monitor connection pool usage');
    }

    if (affectedComponents.includes('api')) {
      impact.level = 'medium';
      impact.areas.push('response times', 'throughput');
      impact.metrics.push('API response time', 'requests per second');
      impact.recommendations.push('Load test API endpoints', 'Monitor response times');
    }

    if (changeType === 'optimization') {
      impact.level = 'high';
      impact.areas.push('algorithm efficiency', 'resource usage');
      impact.metrics.push('CPU usage', 'memory consumption', 'execution time');
      impact.recommendations.push(
        'Benchmark before and after changes',
        'Profile critical code paths',
        'Monitor resource usage in production'
      );
    }

    return impact;
  }

  /**
   * Analyze security impact
   */
  analyzeSecurityImpact(changeType, affectedComponents) {
    const impact = {
      level: 'low',
      concerns: [],
      recommendations: []
    };

    if (affectedComponents.includes('authentication')) {
      impact.level = 'high';
      impact.concerns.push('Authentication bypass', 'Session management', 'Access control');
      impact.recommendations.push(
        'Security review required',
        'Test all authentication flows',
        'Verify access control mechanisms'
      );
    }

    if (affectedComponents.includes('api')) {
      impact.level = 'medium';
      impact.concerns.push('Input validation', 'Data exposure', 'Rate limiting');
      impact.recommendations.push(
        'Validate all input parameters',
        'Review data exposure',
        'Test rate limiting mechanisms'
      );
    }

    if (affectedComponents.includes('database')) {
      impact.level = 'medium';
      impact.concerns.push('SQL injection', 'Data integrity', 'Access permissions');
      impact.recommendations.push(
        'Review database queries for injection vulnerabilities',
        'Verify data validation',
        'Check database permissions'
      );
    }

    return impact;
  }

  /**
   * Generate deployment plan
   */
  generateDeploymentPlan(impact, changeType) {
    const plan = {
      strategy: 'standard',
      steps: [],
      rollbackPlan: [],
      monitoring: [],
      validation: []
    };

    // Determine deployment strategy based on risk
    if (impact.riskLevel === 'critical') {
      plan.strategy = 'blue-green';
      plan.steps.push(
        'Deploy to blue environment',
        'Run comprehensive tests',
        'Gradual traffic migration',
        'Monitor all metrics',
        'Full cutover after validation'
      );
    } else if (impact.riskLevel === 'high') {
      plan.strategy = 'canary';
      plan.steps.push(
        'Deploy to canary environment',
        'Route 5% of traffic',
        'Monitor key metrics',
        'Gradually increase traffic',
        'Full deployment after validation'
      );
    } else {
      plan.strategy = 'rolling';
      plan.steps.push(
        'Deploy to staging',
        'Run automated tests',
        'Deploy to production',
        'Monitor for issues'
      );
    }

    // Add rollback plan
    plan.rollbackPlan = [
      'Identify rollback trigger conditions',
      'Prepare rollback scripts',
      'Test rollback procedure',
      'Monitor post-rollback'
    ];

    // Add monitoring requirements
    plan.monitoring = [
      'Application performance metrics',
      'Error rates and logs',
      'Business metrics',
      'Infrastructure metrics'
    ];

    return plan;
  }

  /**
   * Record change for future analysis
   */
  recordChange(changeData) {
    this.changeHistory.push({
      ...changeData,
      timestamp: new Date().toISOString()
    });

    // Keep only last 100 changes
    if (this.changeHistory.length > 100) {
      this.changeHistory = this.changeHistory.slice(-100);
    }
  }

  /**
   * Get change patterns and trends
   */
  getChangePatterns() {
    const patterns = {
      frequentlyChangedFiles: new Map(),
      commonChangeTypes: new Map(),
      riskTrends: [],
      averageRiskLevel: 'low'
    };

    // Analyze change history
    for (const change of this.changeHistory) {
      // Track frequently changed files
      if (change.targetFiles) {
        for (const file of change.targetFiles) {
          const count = patterns.frequentlyChangedFiles.get(file) || 0;
          patterns.frequentlyChangedFiles.set(file, count + 1);
        }
      }

      // Track change types
      const changeType = change.changeType || 'unknown';
      const count = patterns.commonChangeTypes.get(changeType) || 0;
      patterns.commonChangeTypes.set(changeType, count + 1);

      // Track risk trends
      patterns.riskTrends.push({
        date: change.timestamp,
        riskLevel: change.impactAnalysis?.riskLevel || 'low'
      });
    }

    return patterns;
  }
}