import { GoogleGenAI } from '@google/genai';
import { retrieveRelevantKnowledge } from '../data/bankingKnowledge.js';

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── Reliability config ────────────────────────────────────────
const MAX_CONTEXT_MESSAGES = 10;
const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [1000, 2000, 4000];
const RETRYABLE_CODES = [429, 500, 502, 503, 504];
const FALLBACK_MESSAGE =
  'HyperOne AI is currently experiencing heavy demand. Please try again in a few moments.';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryable(err) {
  const msg = String(err?.message || '');
  if (RETRYABLE_CODES.some(c => msg.includes(String(c)))) return true;
  return /service.unavailable|overloaded|UNAVAILABLE|quota|rate.limit/i.test(msg);
}

// Keep only the last MAX_CONTEXT_MESSAGES, ensuring the sequence starts with a user turn.
// This prevents ballooning context that exhausts free-tier quotas.
function trimContext(messages) {
  if (messages.length <= MAX_CONTEXT_MESSAGES) return messages;
  const tail = messages.slice(-(MAX_CONTEXT_MESSAGES));
  // Gemini requires the first turn to be from 'user'
  let start = 0;
  while (start < tail.length && tail[start].role !== 'user') start++;
  return tail.slice(start);
}

function buildSystemPrompt(knowledgeContext) {
  return `You are HyperOne, an AI-powered banking onboarding assistant for State Bank of India (SBI). You help customers discover the right banking products through friendly, natural conversation.

PERSONALITY:
- Warm, professional, and conversational
- Use the customer's name once you have it (keep it natural)
- Be concise — max 3-4 sentences per response
- Ask only ONE question at a time
- Use simple, friendly language
- Occasionally use relevant emojis for warmth (not excessive)

CONVERSATION PHASES (guide the user through these in order):

PHASE 1 - GREETING:
Warmly introduce yourself as HyperOne, SBI's AI banking assistant. Tell them you'll help find the perfect banking products for them. Ask for their name.

PHASE 2 - INFORMATION COLLECTION (collect ONE at a time, naturally):
Collect in this order:
1. Name (first message)
2. Age (ask naturally: "How old are you, [Name]? Just to find the right products for you")
3. Occupation (ask: "What do you currently do for work — are you a student, working professional, or do you run your own business?")
4. Monthly income range (ask: "To recommend the best accounts and features, could you share your approximate monthly income? — Below ₹25,000 / ₹25K–₹50K / ₹50K–₹1 Lakh / Above ₹1 Lakh")
5. Primary financial goal (ask: "What's your main financial goal right now? For example — building savings, investment, education, emergency fund, or growing a business?")

PHASE 3 - PROFILE CONFIRMATION:
Once you have all 5 details (name, age, occupation, income, goals), say something like:
"Perfect! I've got everything I need. Let me analyse your profile and find your ideal banking products..."
Then include the PROFILE_COMPLETE marker.

PHASE 4 - RECOMMENDATIONS:
After PROFILE_COMPLETE, say you've found perfect products tailored for them and you'll show them now. Include SHOW_PRODUCTS marker.

PHASE 5 - KYC GUIDANCE:
After showing products, say:
"Excellent! Your personalised banking package is ready 🎉. The last step is to verify your identity — it takes just 2 minutes. I'll need your PAN Card and Aadhaar Card to open your account instantly."
Then include GOTO_KYC marker.

BANKING KNOWLEDGE BASE (use this to answer product questions):
${knowledgeContext}

SPECIAL MARKERS (include EXACTLY as shown, on a new line, when appropriate):

When you have collected name, age, occupation, income range, and financial goal — append:
[PROFILE_COMPLETE]
{"name":"<full name>","age":<age as number>,"occupation":"<occupation>","income":"<income range>","goals":"<financial goal>","category":"<student|salaried|business>"}
[/PROFILE_COMPLETE]

Category rules:
- "student" → age under 25 OR occupation is student
- "business" → occupation is business owner / entrepreneur / self-employed / freelancer
- "salaried" → everyone else (employed, professional, etc.)

When ready to display product recommendations:
[SHOW_PRODUCTS]

When guiding user to KYC:
[GOTO_KYC]

RULES:
- NEVER mention phases, markers, or JSON to the user — they are invisible to them
- If user asks banking questions, answer from the knowledge base above
- Always respond in English
- Keep responses concise and warm
- If you don't know something specific, say you'll have a specialist follow up`;
}

export async function streamChatResponse(messages, res) {
  const reqStart = Date.now();
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  const knowledgeContext = retrieveRelevantKnowledge(lastUserMessage);
  const systemPrompt = buildSystemPrompt(knowledgeContext);

  // Context windowing — limit messages sent to Gemini
  const trimmed = trimContext(messages);
  const promptChars = systemPrompt.length + trimmed.reduce((s, m) => s + m.content.length, 0);

  console.log(
    `[Gemini] → request | msgs: ${messages.length}→${trimmed.length} | ~${Math.round(promptChars / 4)} tokens`
  );

  const contents = trimmed.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  let fullText = '';
  let attempt = 0;

  const doStream = async () => {
    try {
      const streamResult = await genai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemPrompt,
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
        contents,
      });

      for await (const chunk of streamResult) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          res.write(`data: ${JSON.stringify({ type: 'delta', text })}\n\n`);
        }
      }
    } catch (err) {
      attempt++;
      // Only retry if no data has been streamed yet (safe to start fresh)
      if (fullText === '' && attempt <= MAX_RETRIES && isRetryable(err)) {
        const delay = RETRY_DELAYS_MS[attempt - 1] ?? 4000;
        console.warn(`[Gemini] attempt ${attempt} failed (${err.message}), retrying in ${delay}ms…`);
        await sleep(delay);
        return doStream();
      }
      throw err;
    }
  };

  try {
    await doStream();
    const parsed = parseMarkers(fullText);
    const duration = Date.now() - reqStart;
    console.log(
      `[Gemini] ✓ done | ${attempt + 1} attempt(s) | ${duration}ms | ${fullText.length} chars`
    );
    res.write(`data: ${JSON.stringify({ type: 'done', fullText, ...parsed })}\n\n`);
    res.end();
  } catch (err) {
    const duration = Date.now() - reqStart;
    console.error(`[Gemini] ✗ failed after ${attempt} retries in ${duration}ms:`, err.message);
    res.write(`data: ${JSON.stringify({ type: 'error', message: FALLBACK_MESSAGE })}\n\n`);
    res.end();
  }
}

function parseMarkers(text) {
  const result = {
    profile: null,
    showProducts: false,
    gotoKyc: false,
    cleanText: text,
  };

  const profileMatch = text.match(/\[PROFILE_COMPLETE\]\s*([\s\S]*?)\s*\[\/PROFILE_COMPLETE\]/);
  if (profileMatch) {
    try { result.profile = JSON.parse(profileMatch[1].trim()); } catch (_) {}
    result.cleanText = result.cleanText.replace(/\[PROFILE_COMPLETE\][\s\S]*?\[\/PROFILE_COMPLETE\]/g, '').trim();
  }

  if (text.includes('[SHOW_PRODUCTS]')) {
    result.showProducts = true;
    result.cleanText = result.cleanText.replace('[SHOW_PRODUCTS]', '').trim();
  }

  if (text.includes('[GOTO_KYC]')) {
    result.gotoKyc = true;
    result.cleanText = result.cleanText.replace('[GOTO_KYC]', '').trim();
  }

  return result;
}
