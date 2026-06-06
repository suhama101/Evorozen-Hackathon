/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default async function handler(req: any, res: any) {
  // Set CORS headers so that client-side SPA fetching works fine, and handle preflight requests (OPTIONS).
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-gemini-key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Robustly handle parsed or unparsed JSON body
    let body = req.body;
    if (typeof body === 'string' && body.trim() !== '') {
      try {
        body = JSON.parse(body);
      } catch (_) {}
    }

    const prompt = body?.prompt;
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

    // Try a list of standard reliable models as fallback options to guarantee successful generation
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
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

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('Error in Vercel serverless /api/gemini:', error);
    return res.status(500).json({ error: error.message || 'An error occurred calling Gemini API' });
  }
}