# AI Interview Coach

A complete, full-stack adaptive **AI Interview Coach** simulator web application running in modern React (Vite) and an Express.js backend. 

Candidates can choose from 6 professional pathways, taking part in a tailored 5-stage progressive tech screen evaluated in real-time by the Gemini AI Engine.

---

## 🚀 Core Features

1. **Role Customization Selection**
   - Software Engineer
   - Frontend Developer
   - Full Stack Developer
   - Data Scientist
   - Product Manager
   - DevOps Engineer

2. **Progressive Interview Engine**
   - **5 Adaptive Scenarios**: Prompts get progressively advanced as the candidate advances.
   - **Interactive Answer Suite**: Real-time solution submission and feedback cycles.
   - **Strict API Formulations**: Prompt guidelines ensure balanced scoring and detailed advice tips.
   - **Total Analytics scorecard**: Cumulative score ratings out of 50 upon final session wrap.

3. **Production Design & Aesthetics**
   - Eye-friendly, high-contrast dark space visual theme.
   - Fluid motion card entrances and state transformations (using Framer Motion).
   - Polished Google Fonts "DM Sans" rendering.
   - Mobile responsive grids and comfortable interactive touch ranges.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite SPA) + Tailwind CSS (v4) + Framer Motion
- **Backend Services**: Express.js + Node types
- **AI capabilities**: Google Gemini model (`gemini-3.5-flash` powered via secure server-side SDK `@google/genai`)
- **API Forwarding**: Zero browser API exposure. Direct POST requests handled in `/api/gemini`.

---

## 🔑 Environment Configuration

Key settings are configured in `.env` and `.env.local`:

```bash
# GEMINI_API_KEY is automatically loaded via AI Studio Secrets at runtime.
# For local environments, write this into your .env.local file:
GEMINI_API_KEY="your_actual_gemini_api_key"
```

*Note: `.env.local` is listed in `.gitignore` to prevent any structural secrets from leaking.*

---

## 💻 Commands

To boot up the full-stack process:

```bash
# Install required modules
npm install

# Start the dev server combining Express + Vite
npm run dev

# Bundle source for production execution
npm run build

# Start production server
npm run start
```
