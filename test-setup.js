import { logger } from './src/utils/logger.js';
import { validateEnvironment } from './src/utils/validation.js';

console.log('🚀 LangChain.js Code Generation Agent - Setup Test\n');

try {
  // Test logging
  logger.info('Testing logger functionality');
  console.log('✅ Logger: Working');

  // Test environment validation (this will warn about missing GOOGLE_API_KEY but won't fail)
  try {
    validateEnvironment();
    console.log('✅ Environment: Valid');
  } catch (error) {
    console.log('⚠️  Environment: Missing GOOGLE_API_KEY (expected for initial setup)');
  }

  // Test imports
  const { CodeGenerationAgent } = await import('./src/agents/CodeGenerationAgent.js');
  console.log('✅ Agent Import: Working');

  const { NEXTJS_TEMPLATES } = await import('./src/templates/index.js');
  console.log('✅ Templates: Loaded');

  console.log('\n🎉 Setup Complete! Next steps:');
  console.log('1. Add your Google API key to .env file');
  console.log('2. Run: npm start');
  console.log('3. Test API at: http://localhost:3000/health');

} catch (error) {
  console.error('❌ Setup Error:', error.message);
  process.exit(1);
}