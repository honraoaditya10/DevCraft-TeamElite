import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Process rulebook PDF using LangChain integration
 */
export async function processRulebookWithLangChain(pdfUrl) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      path.join(__dirname, '../ai/langchain_integration.py'),
      pdfUrl
    ], {
      windowsHide: true,
      env: {
        ...process.env,
        PYTHONPATH: path.join(__dirname, '../ai')
      }
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`LangChain process exited with code ${code}: ${stderr}`);
        return reject({
          error: 'LangChain processing failed',
          details: stderr
        });
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (e) {
        reject({
          error: 'Invalid response from LangChain',
          raw: stdout
        });
      }
    });

    pythonProcess.on('error', (err) => {
      reject({
        error: 'Failed to spawn LangChain process',
        details: err.message
      });
    });
  });
}

/**
 * Query rulebook using LangChain RAG
 */
export async function queryRulebookWithLangChain(query) {
  return new Promise((resolve, reject) => {
    const pythonScript = `
import json
import sys
sys.path.insert(0, '${path.join(__dirname, '../ai').replace(/\\/g, '/')}')
from langchain_integration import RulebookProcessor

processor = RulebookProcessor()
result = processor.query_eligibility('${query.replace(/'/g, "\\'")}')
print(json.dumps(result))
`;

    const pythonProcess = spawn('python3', [
      '-c',
      pythonScript
    ], {
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.warn(`LangChain query ended with code ${code}`);
        return resolve({
          error: 'Query processing failed',
          fallback: true
        });
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (e) {
        resolve({
          error: 'Invalid response',
          fallback: true
        });
      }
    });

    pythonProcess.on('error', (err) => {
      resolve({
        error: 'Process error',
        details: err.message,
        fallback: true
      });
    });
  });
}

export default {
  processRulebookWithLangChain,
  queryRulebookWithLangChain
};
