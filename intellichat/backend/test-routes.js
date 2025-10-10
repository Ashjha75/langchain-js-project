/**
 * Quick test script to verify routes are registered
 * Run: node test-routes.js
 */

const express = require('express');

// Simulate the route structure
const router = express.Router();

router.post('/send', (req, res) => {
  res.json({ message: 'Send route working' });
});

router.post('/conversations', (req, res) => {
  res.json({ message: 'Create conversation route working' });
});

router.get('/conversations', (req, res) => {
  res.json({ message: 'List conversations route working' });
});

const app = express();
app.use(express.json());
app.use('/api/chat', router);

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('\nTest these endpoints:');
  console.log(`  POST http://localhost:${PORT}/api/chat/send`);
  console.log(`  POST http://localhost:${PORT}/api/chat/conversations`);
  console.log(`  GET  http://localhost:${PORT}/api/chat/conversations`);
  console.log('\nPress Ctrl+C to stop');
});
