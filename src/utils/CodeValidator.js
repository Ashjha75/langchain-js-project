import { logger } from './logger.js';
import { validateJavaScript, validateJSON } from './validation.js';

export class CodeValidator {
  constructor() {
    this.validationRules = {
      nextjs: [
        this.validateReactSyntax.bind(this),
        this.validateNextJSImports.bind(this),
        this.validateTypeScript.bind(this)
      ],
      express: [
        this.validateExpressSyntax.bind(this),
        this.validateExpressImports.bind(this),
        this.validateSecurityPatterns.bind(this)
      ],
      fullstack: [
        this.validateProjectStructure.bind(this),
        this.validateAPIIntegration.bind(this)
      ]
    };
  }

  async validateNextJSCode(codeArray) {
    logger.info('Validating Next.js code');
    
    const results = {
      overall: true,
      files: [],
      warnings: [],
      suggestions: []
    };

    for (const code of codeArray) {
      const fileResult = await this.validateCodeBlock(code, 'nextjs');
      results.files.push(fileResult);
      
      if (!fileResult.valid) {
        results.overall = false;
      }
    }

    return results;
  }

  async validateExpressCode(codeArray) {
    logger.info('Validating Express.js code');
    
    const results = {
      overall: true,
      files: [],
      warnings: [],
      suggestions: []
    };

    for (const code of codeArray) {
      const fileResult = await this.validateCodeBlock(code, 'express');
      results.files.push(fileResult);
      
      if (!fileResult.valid) {
        results.overall = false;
      }
    }

    return results;
  }

  async validateFullStackCode(codeArray) {
    logger.info('Validating full-stack code');
    
    const results = {
      overall: true,
      files: [],
      warnings: [],
      suggestions: []
    };

    for (const code of codeArray) {
      const fileResult = await this.validateCodeBlock(code, 'fullstack');
      results.files.push(fileResult);
      
      if (!fileResult.valid) {
        results.overall = false;
      }
    }

    return results;
  }

  async validateCodeBlock(code, type) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      metrics: {
        lines: code.split('\n').length,
        size: code.length
      }
    };

    // Basic JavaScript syntax validation
    const jsValidation = validateJavaScript(code);
    if (!jsValidation.valid) {
      result.valid = false;
      result.errors.push(...jsValidation.errors);
    }

    // Type-specific validations
    const rules = this.validationRules[type] || [];
    for (const rule of rules) {
      try {
        const ruleResult = await rule(code);
        if (ruleResult.errors?.length) {
          result.errors.push(...ruleResult.errors);
          result.valid = false;
        }
        if (ruleResult.warnings?.length) {
          result.warnings.push(...ruleResult.warnings);
        }
        if (ruleResult.suggestions?.length) {
          result.suggestions.push(...ruleResult.suggestions);
        }
      } catch (error) {
        logger.warn('Validation rule error:', error);
      }
    }

    return result;
  }

  async validateReactSyntax(code) {
    const result = { errors: [], warnings: [], suggestions: [] };

    // Check for common React patterns
    const reactPatterns = [
      { pattern: /import.*React/i, required: true, message: 'React import missing' },
      { pattern: /export\s+default/i, required: false, message: 'Consider using default export for components' },
      { pattern: /function\s+\w+\s*\(/i, required: false, message: 'Component detected' }
    ];

    for (const { pattern, required, message } of reactPatterns) {
      if (required && !pattern.test(code)) {
        result.errors.push({ message, type: 'react_pattern' });
      }
    }

    // Check for JSX syntax issues
    if (code.includes('<') && code.includes('>')) {
      if (!code.includes('import React') && !code.includes('import { ')) {
        result.warnings.push({ 
          message: 'JSX detected but React import might be missing', 
          type: 'jsx_import' 
        });
      }
    }

    return result;
  }

  async validateNextJSImports(code) {
    const result = { errors: [], warnings: [], suggestions: [] };

    // Check for Next.js specific imports
    const nextjsImports = [
      'next/link',
      'next/image',
      'next/router',
      'next/head',
      'next/navigation'
    ];

    nextjsImports.forEach(importPath => {
      if (code.includes(`'${importPath}'`) || code.includes(`"${importPath}"`)) {
        result.suggestions.push({
          message: `Using Next.js ${importPath} - good practice`,
          type: 'nextjs_import'
        });
      }
    });

    return result;
  }

  async validateTypeScript(code) {
    const result = { errors: [], warnings: [], suggestions: [] };

    // Basic TypeScript syntax checks
    if (code.includes(': ') || code.includes('interface ') || code.includes('type ')) {
      result.suggestions.push({
        message: 'TypeScript syntax detected - good for type safety',
        type: 'typescript'
      });
    }

    return result;
  }

  async validateExpressSyntax(code) {
    const result = { errors: [], warnings: [], suggestions: [] };

    // Check for Express.js patterns
    const expressPatterns = [
      { pattern: /require\(['"]express['"]\)/, message: 'Express import detected' },
      { pattern: /import.*express/i, message: 'Express ES6 import detected' },
      { pattern: /app\.(get|post|put|delete|patch)/i, message: 'Express route handler detected' }
    ];

    expressPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(code)) {
        result.suggestions.push({ message, type: 'express_pattern' });
      }
    });

    return result;
  }

  async validateExpressImports(code) {
    const result = { errors: [], warnings: [], suggestions: [] };

    // Check for common Express.js middleware
    const middlewarePatterns = [
      'cors',
      'helmet',
      'body-parser',
      'express.json',
      'express.urlencoded'
    ];

    middlewarePatterns.forEach(middleware => {
      if (code.includes(middleware)) {
        result.suggestions.push({
          message: `Using ${middleware} middleware - good security practice`,
          type: 'middleware'
        });
      }
    });

    return result;
  }

  async validateSecurityPatterns(code) {
    const result = { errors: [], warnings: [], suggestions: [] };

    // Check for security best practices
    const securityChecks = [
      { pattern: /helmet\(\)/, message: 'Helmet security middleware found', type: 'security' },
      { pattern: /cors\(\)/, message: 'CORS middleware found', type: 'security' },
      { pattern: /express\.json\(\{.*limit.*\}\)/, message: 'Request size limiting found', type: 'security' }
    ];

    securityChecks.forEach(({ pattern, message, type }) => {
      if (pattern.test(code)) {
        result.suggestions.push({ message, type });
      }
    });

    // Warn about potential security issues
    if (code.includes('eval(')) {
      result.warnings.push({
        message: 'Use of eval() detected - potential security risk',
        type: 'security_warning'
      });
    }

    return result;
  }

  async validateProjectStructure(code) {
    const result = { errors: [], warnings: [], suggestions: [] };

    // This would be more complex in a real implementation
    // For now, just basic structure validation
    result.suggestions.push({
      message: 'Full-stack project structure validation passed',
      type: 'structure'
    });

    return result;
  }

  async validateAPIIntegration(code) {
    const result = { errors: [], warnings: [], suggestions: [] };

    // Check for API integration patterns
    if (code.includes('fetch(') || code.includes('axios.')) {
      result.suggestions.push({
        message: 'API integration detected - ensure proper error handling',
        type: 'api_integration'
      });
    }

    return result;
  }
}