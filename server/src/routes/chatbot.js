import express from 'express';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python';
const scriptPath = path.resolve(__dirname, '..', '..', 'ai', 'text_extractor.py');

const fallbackReply = (message) => {
  const text = (message || '').toLowerCase();
  if (text.includes('document') || text.includes('doc') || text.includes('upload')) {
    return 'Missing documents detected. Upload Income and Caste certificates in the Documents page to unlock more schemes.';
  }
  if (text.includes('profile') || text.includes('details')) {
    return 'Update your profile details to improve eligibility matching accuracy.';
  }
  if (text.includes('scheme') || text.includes('eligibility')) {
    return 'Check My Schemes to see what you are eligible for right now.';
  }
  return 'I can help with documents, profile updates, or scheme eligibility.';
};

router.post('/', async (req, res) => {
  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ reply: 'Please share your question.' });
  }

  const child = spawn(pythonExecutable, [scriptPath, message], {
    windowsHide: true
  });

  let output = '';
  let errorOutput = '';

  child.stdout.on('data', (data) => {
    output += data.toString();
  });

  child.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  child.on('close', (code) => {
    if (code !== 0 || !output) {
      return res.json({ reply: fallbackReply(message), error: errorOutput || 'Python extractor failed.' });
    }

    try {
      const parsed = JSON.parse(output);
      return res.json({ reply: parsed.reply || fallbackReply(message), matched: parsed.matched || [] });
    } catch {
      return res.json({ reply: fallbackReply(message), error: 'Invalid response from extractor.' });
    }
  });
});

export default router;
