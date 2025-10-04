import { logger } from './logger.js';

/**
 * Manages business context, rules, and domain knowledge
 */
export class BusinessContextManager {
  constructor() {
    this.businessRules = new Map();
    this.domainConcepts = new Map();
    this.workflows = new Map();
    this.constraints = new Map();
    this.stakeholders = new Map();
  }

  /**
   * Initialize with business context
   */
  async initialize(businessContext = {}) {
    logger.info('🏢 Initializing Business Context Manager');

    try {
      // Load business rules
      if (businessContext.rules) {
        for (const rule of businessContext.rules) {
          this.addBusinessRule(rule);
        }
      }

      // Load domain concepts
      if (businessContext.domains) {
        for (const domain of businessContext.domains) {
          this.addDomainConcept(domain);
        }
      }

      // Load workflows
      if (businessContext.workflows) {
        for (const workflow of businessContext.workflows) {
          this.addWorkflow(workflow);
        }
      }

      // Load constraints
      if (businessContext.constraints) {
        for (const constraint of businessContext.constraints) {
          this.addConstraint(constraint);
        }
      }

      logger.info('✅ Business Context Manager initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize Business Context Manager:', error);
      throw error;
    }
  }

  /**
   * Add a business rule
   */
  addBusinessRule(rule) {
    const ruleId = rule.id || this.generateId(rule.name);
    this.businessRules.set(ruleId, {
      id: ruleId,
      name: rule.name,
      description: rule.description,
      category: rule.category || 'general',
      priority: rule.priority || 'medium',
      conditions: rule.conditions || [],
      actions: rule.actions || [],
      exceptions: rule.exceptions || [],
      appliesTo: rule.appliesTo || [],
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Add a domain concept
   */
  addDomainConcept(concept) {
    const conceptId = concept.id || this.generateId(concept.name);
    this.domainConcepts.set(conceptId, {
      id: conceptId,
      name: concept.name,
      description: concept.description,
      properties: concept.properties || [],
      relationships: concept.relationships || [],
      businessValue: concept.businessValue || '',
      constraints: concept.constraints || [],
      examples: concept.examples || []
    });
  }

  /**
   * Add a business workflow
   */
  addWorkflow(workflow) {
    const workflowId = workflow.id || this.generateId(workflow.name);
    this.workflows.set(workflowId, {
      id: workflowId,
      name: workflow.name,
      description: workflow.description,
      steps: workflow.steps || [],
      triggers: workflow.triggers || [],
      outcomes: workflow.outcomes || [],
      stakeholders: workflow.stakeholders || [],
      businessRules: workflow.businessRules || []
    });
  }

  /**
   * Add a business constraint
   */
  addConstraint(constraint) {
    const constraintId = constraint.id || this.generateId(constraint.name);
    this.constraints.set(constraintId, {
      id: constraintId,
      name: constraint.name,
      type: constraint.type || 'business', // business, technical, legal
      description: constraint.description,
      severity: constraint.severity || 'medium',
      appliesTo: constraint.appliesTo || [],
      validationRules: constraint.validationRules || []
    });
  }

  /**
   * Get relevant business rules for a specific intent or goal
   */
  getRelevantRules(intent, businessGoal) {
    const relevantRules = [];

    for (const [id, rule] of this.businessRules) {
      if (this.isRuleRelevant(rule, intent, businessGoal)) {
        relevantRules.push(rule);
      }
    }

    // Sort by priority
    return relevantRules.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Check if code aligns with business rules
   */
  checkAlignment(codeAnalysis) {
    const alignmentReport = {
      overallScore: 0,
      violations: [],
      recommendations: [],
      compliantAreas: []
    };

    let totalChecks = 0;
    let passedChecks = 0;

    for (const [id, rule] of this.businessRules) {
      const check = this.checkRuleCompliance(rule, codeAnalysis);
      totalChecks++;
      
      if (check.compliant) {
        passedChecks++;
        alignmentReport.compliantAreas.push({
          rule: rule.name,
          reason: check.reason
        });
      } else {
        alignmentReport.violations.push({
          rule: rule.name,
          severity: rule.priority,
          issue: check.issue,
          suggestion: check.suggestion
        });
      }
    }

    alignmentReport.overallScore = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 100;

    return alignmentReport;
  }

  /**
   * Get business context for a specific domain
   */
  getDomainContext(domainName) {
    const context = {
      concepts: [],
      rules: [],
      workflows: [],
      constraints: []
    };

    // Find related domain concepts
    for (const [id, concept] of this.domainConcepts) {
      if (concept.name.toLowerCase().includes(domainName.toLowerCase()) ||
          concept.description.toLowerCase().includes(domainName.toLowerCase())) {
        context.concepts.push(concept);
      }
    }

    // Find related business rules
    for (const [id, rule] of this.businessRules) {
      if (rule.appliesTo.includes(domainName) ||
          rule.name.toLowerCase().includes(domainName.toLowerCase())) {
        context.rules.push(rule);
      }
    }

    // Find related workflows
    for (const [id, workflow] of this.workflows) {
      if (workflow.name.toLowerCase().includes(domainName.toLowerCase())) {
        context.workflows.push(workflow);
      }
    }

    // Find related constraints
    for (const [id, constraint] of this.constraints) {
      if (constraint.appliesTo.includes(domainName)) {
        context.constraints.push(constraint);
      }
    }

    return context;
  }

  /**
   * Validate business logic against rules
   */
  validateBusinessLogic(logicDescription, context = {}) {
    const validation = {
      isValid: true,
      violations: [],
      warnings: [],
      suggestions: []
    };

    for (const [id, rule] of this.businessRules) {
      const check = this.validateLogicAgainstRule(logicDescription, rule, context);
      
      if (!check.valid) {
        validation.isValid = false;
        
        if (check.severity === 'error') {
          validation.violations.push({
            rule: rule.name,
            message: check.message,
            suggestion: check.suggestion
          });
        } else {
          validation.warnings.push({
            rule: rule.name,
            message: check.message,
            suggestion: check.suggestion
          });
        }
      }
    }

    return validation;
  }

  /**
   * Get business impact analysis
   */
  getBusinessImpact(changeDescription, affectedAreas = []) {
    const impact = {
      level: 'low', // low, medium, high, critical
      affectedStakeholders: [],
      businessRisks: [],
      opportunities: [],
      recommendations: []
    };

    // Analyze against workflows
    for (const [id, workflow] of this.workflows) {
      if (this.isWorkflowAffected(workflow, changeDescription, affectedAreas)) {
        impact.affectedStakeholders.push(...workflow.stakeholders);
        impact.level = this.escalateImpactLevel(impact.level, 'medium');
      }
    }

    // Analyze against constraints
    for (const [id, constraint] of this.constraints) {
      if (this.isConstraintAffected(constraint, changeDescription, affectedAreas)) {
        if (constraint.severity === 'high') {
          impact.businessRisks.push({
            constraint: constraint.name,
            risk: `Potential violation of ${constraint.type} constraint`,
            mitigation: 'Review constraint requirements before implementation'
          });
          impact.level = this.escalateImpactLevel(impact.level, 'high');
        }
      }
    }

    return impact;
  }

  // Helper methods
  generateId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  isRuleRelevant(rule, intent, businessGoal) {
    const intentLower = intent.toLowerCase();
    const goalLower = (businessGoal || '').toLowerCase();
    
    return rule.name.toLowerCase().includes(intentLower) ||
           rule.description.toLowerCase().includes(intentLower) ||
           rule.description.toLowerCase().includes(goalLower) ||
           rule.appliesTo.some(area => 
             intentLower.includes(area.toLowerCase()) ||
             goalLower.includes(area.toLowerCase())
           );
  }

  checkRuleCompliance(rule, codeAnalysis) {
    // Basic rule compliance checking
    // This would be enhanced based on specific business rules
    
    const check = {
      compliant: true,
      reason: '',
      issue: '',
      suggestion: ''
    };

    // Example checks based on common business rules
    if (rule.category === 'security') {
      if (rule.name.toLowerCase().includes('authentication') && 
          !this.hasAuthenticationPatterns(codeAnalysis)) {
        check.compliant = false;
        check.issue = 'Missing authentication implementation';
        check.suggestion = 'Implement authentication middleware';
      }
    }

    if (rule.category === 'data') {
      if (rule.name.toLowerCase().includes('validation') &&
          !this.hasValidationPatterns(codeAnalysis)) {
        check.compliant = false;
        check.issue = 'Missing data validation';
        check.suggestion = 'Add input validation';
      }
    }

    return check;
  }

  hasAuthenticationPatterns(codeAnalysis) {
    // Check if authentication patterns exist in the code
    return codeAnalysis.patterns?.architecturalPatterns?.includes('Authentication') ||
           codeAnalysis.dependencies?.some(dep => dep.includes('auth'));
  }

  hasValidationPatterns(codeAnalysis) {
    // Check if validation patterns exist in the code
    return codeAnalysis.patterns?.designPatterns?.includes('Validation') ||
           codeAnalysis.dependencies?.some(dep => dep.includes('joi') || dep.includes('yup'));
  }

  validateLogicAgainstRule(logicDescription, rule, context) {
    const validation = {
      valid: true,
      severity: 'warning',
      message: '',
      suggestion: ''
    };

    // Basic validation logic
    // This would be enhanced with more sophisticated rule checking
    
    if (rule.conditions.length > 0) {
      for (const condition of rule.conditions) {
        if (!this.checkCondition(condition, logicDescription, context)) {
          validation.valid = false;
          validation.message = `Logic violates business rule: ${rule.name}`;
          validation.suggestion = `Ensure logic complies with: ${condition}`;
          break;
        }
      }
    }

    return validation;
  }

  checkCondition(condition, logicDescription, context) {
    // Basic condition checking
    // This would be enhanced with more sophisticated logic
    return true;
  }

  isWorkflowAffected(workflow, changeDescription, affectedAreas) {
    return workflow.steps.some(step => 
      affectedAreas.some(area => 
        step.toLowerCase().includes(area.toLowerCase())
      )
    ) || changeDescription.toLowerCase().includes(workflow.name.toLowerCase());
  }

  isConstraintAffected(constraint, changeDescription, affectedAreas) {
    return constraint.appliesTo.some(area => 
      affectedAreas.includes(area)
    ) || affectedAreas.some(area => 
      constraint.description.toLowerCase().includes(area.toLowerCase())
    );
  }

  escalateImpactLevel(currentLevel, newLevel) {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    const current = levels[currentLevel] || 1;
    const proposed = levels[newLevel] || 1;
    
    const result = Math.max(current, proposed);
    return Object.keys(levels).find(key => levels[key] === result);
  }

  /**
   * Export business context for sharing or backup
   */
  exportContext() {
    return {
      businessRules: Array.from(this.businessRules.values()),
      domainConcepts: Array.from(this.domainConcepts.values()),
      workflows: Array.from(this.workflows.values()),
      constraints: Array.from(this.constraints.values()),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import business context from backup or external source
   */
  importContext(contextData) {
    if (contextData.businessRules) {
      for (const rule of contextData.businessRules) {
        this.businessRules.set(rule.id, rule);
      }
    }

    if (contextData.domainConcepts) {
      for (const concept of contextData.domainConcepts) {
        this.domainConcepts.set(concept.id, concept);
      }
    }

    if (contextData.workflows) {
      for (const workflow of contextData.workflows) {
        this.workflows.set(workflow.id, workflow);
      }
    }

    if (contextData.constraints) {
      for (const constraint of contextData.constraints) {
        this.constraints.set(constraint.id, constraint);
      }
    }
  }
}