require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert meeting intelligence extractor for The Ear Academy, an EdTech company providing music education platforms to South African schools (and UK/Kenya). The CEO is Rus Nerwich.

Extract structured intelligence from meeting notes and return ONLY valid JSON:
{
  "party": "Full name and role/organisation of the other party. Infer from context.",
  "type": "Customer|Investor|Partner|Advisory|Sales",
  "date": "YYYY-MM-DD. Infer from content. Use today if not found.",
  "context": "One sentence background on this meeting",
  "insights": ["insight1", "insight2", "insight3"],
  "tasks": [
    {"title": "task description", "priority": "urgent|high|medium", "category": "sales|product|ops|general", "notes": "why this matters"}
  ],
  "redFlags": ["risk or concern"],
  "opportunities": ["opportunity identified"],
  "signals": ["strategic market signal"],
  "commitments_from_them": ["what they committed to"],
  "commitments_from_us": ["what Ear Academy committed to"]
}

Priority: urgent = next 24-48h, high = this week, medium = this month.
Categories: sales = pipeline/outreach/demos, product = platform/content/features, ops = admin/logistics, general = other.
Return ONLY the JSON object, no other text.`;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/process', async (req, res) => {
  const { filename, content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'No content provided' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Filename: ${filename || 'meeting-notes'}\n\n${content}`,
        },
      ],
    });

    const raw = message.content[0].text.trim();

    let parsed;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      return res.status(500).json({ error: 'Model returned invalid JSON', raw });
    }

    res.json(parsed);
  } catch (err) {
    console.error('Anthropic API error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`CEO Intel proxy running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
