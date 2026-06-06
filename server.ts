/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load default settings
dotenv.config();
// Layer on custom local overrides if they exist
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON payloads
  app.use(express.json());

  // API router
  app.post('/api/gemini', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt field is required' });
      }

      let apiKey = req.headers['x-gemini-key'] as string;
      if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey.trim() === '') {
        apiKey = process.env.GEMINI_API_KEY || '';
      }

      if (!apiKey || apiKey === 'your_key_here') {
        return res.status(403).json({ 
          error: 'Missing API Key. Please click the "Configure Key" badge in the top right of the screen to paste your key' 
        });
      }

      // Try standard reliable models as fallback options
      const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash'];
      let text = '';
      let apiError: any = null;

      for (const model of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
            }),
          });

          if (response.ok) {
            const resData = await response.json();
            const parsedText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (parsedText) {
              text = parsedText;
              apiError = null;
              break;
            }
          } else {
            const errData = await response.json().catch(() => ({}));
            apiError = errData?.error || { message: `HTTP ${response.status} failed` };
          }
        } catch (err: any) {
          apiError = err;
        }
      }

      if (!text && apiError) {
        throw new Error(apiError?.message || JSON.stringify(apiError));
      }

      res.json({ text });
    } catch (error: any) {
      console.error('Error in /api/gemini:', error);
      res.status(500).json({ error: error.message || 'An error occurred calling Gemini API' });
    }
  });

  // Enable client-side asset serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();