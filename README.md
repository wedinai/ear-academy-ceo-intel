# Ear Academy — CEO Intelligence Dashboard

A personal daily intelligence tool for Rus Nerwich. Drop meeting notes (.txt, .md, .docx, .pdf) and the AI extracts tasks, insights, red flags, and opportunities — all stored locally in your browser.

## Architecture

```
Frontend (index.html)  →  Backend proxy (server.js)  →  Anthropic API
    GitHub Pages             Railway / Render               Claude
```

The frontend is a single static HTML file hosted on GitHub Pages. The backend is a small Express proxy that forwards requests to the Anthropic API (needed to keep your API key off the client).

---

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/ear-academy-ceo-intel.git
cd ear-academy-ceo-intel
npm install
```

### 2. Configure API key

```bash
cp .env.example .env
```

Edit `.env` and set your key:

```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

### 3. Start the proxy server

```bash
npm start
# → CEO Intel proxy running on http://localhost:3001
# → Health check: http://localhost:3001/health
```

### 4. Open the dashboard

Edit the top of `index.html` — change:

```js
const PROXY_URL = 'YOUR_RAILWAY_URL_HERE';
```

to:

```js
const PROXY_URL = 'http://localhost:3001';
```

Then open `index.html` directly in your browser (double-click or `open index.html`).

---

## Production Deployment

### Step 1 — Deploy backend to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Select this repository
3. Add environment variable: `ANTHROPIC_API_KEY` = your key
4. Railway will auto-detect `package.json` and run `npm start`
5. Copy your Railway deployment URL (e.g. `https://ear-academy-ceo-intel.up.railway.app`)

### Step 2 — Update frontend

Edit `index.html`, change `PROXY_URL` at the top:

```js
const PROXY_URL = 'https://ear-academy-ceo-intel.up.railway.app';
```

### Step 3 — Enable GitHub Pages

1. Push your changes to GitHub
2. Go to repo **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: **main** / root `/`
5. Save — your dashboard will be live at `https://YOUR_USERNAME.github.io/ear-academy-ceo-intel`

### Step 4 — Push

```bash
git add index.html
git commit -m "Set Railway proxy URL"
git push
```

GitHub Pages will update within ~60 seconds.

---

## Keyboard Shortcuts

| Key | Section |
|-----|---------|
| `1` | Dashboard |
| `2` | Action Items |
| `3` | Meeting Intelligence |
| `4` | Business Intel |
| `5` | Q1 Objectives |
| `6` | Ingestion Console |

---

## Supported File Formats

| Format | How it's read |
|--------|---------------|
| `.txt` | Native File API |
| `.md`  | Native File API |
| `.docx` | JSZip — extracts XML from Office package |
| `.pdf`  | pdf.js — reads text layer |

---

## Data Storage

All data is stored in `localStorage` under key `ear_academy_ceo_v2`. Nothing is sent to any server except the meeting content you drop (which goes to your own Railway proxy → Anthropic). No database, no accounts.

To reset: Ingestion Console → **Clear All Data** (reloads seed data).

---

## Project Structure

```
ear-academy-ceo-intel/
├── index.html     ← Complete dashboard (static, no build step)
├── server.js      ← Express proxy for Anthropic API
├── package.json   ← Node dependencies
├── .env           ← ANTHROPIC_API_KEY (gitignored)
├── .env.example   ← Template
├── .gitignore
└── README.md
```
