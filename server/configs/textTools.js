// Registry of Gemini-backed text tools.
// Each entry owns its DB `type`, token budget, and prompt construction, so the
// generic `generateText` controller stays tool-agnostic. Adding a tool here
// (plus a display entry on the client) is all a new text feature needs.

export const textTools = {
  // --- 11. Text utilities ---
  summarize: {
    type: 'summarize',
    maxTokens: 800,
    buildPrompt: ({ input, length = 'Medium' }) =>
      `Summarize the following text in a ${String(length).toLowerCase()} length. Use clear language and keep the key points.\n\nText:\n${input}`,
  },
  paraphrase: {
    type: 'paraphrase',
    maxTokens: 1000,
    buildPrompt: ({ input, tone = 'Standard' }) =>
      `Paraphrase and rewrite the following text in a ${String(tone).toLowerCase()} tone while preserving its original meaning.\n\nText:\n${input}`,
  },
  grammar: {
    type: 'grammar',
    maxTokens: 1000,
    buildPrompt: ({ input, tone = 'Original' }) =>
      `Correct all grammar, spelling, and punctuation mistakes in the following text${
        tone && tone !== 'Original' ? ` and adjust the tone to be ${String(tone).toLowerCase()}` : ''
      }. Return only the corrected text.\n\nText:\n${input}`,
  },
  translate: {
    type: 'translate',
    maxTokens: 1000,
    buildPrompt: ({ input, language = 'English' }) =>
      `Translate the following text into ${language}. Return only the translation, no commentary.\n\nText:\n${input}`,
  },

  // --- 12. Email / social ---
  'cold-email': {
    type: 'cold-email',
    maxTokens: 800,
    buildPrompt: ({ input, tone = 'Professional' }) =>
      `Write a concise, compelling cold email in a ${String(tone).toLowerCase()} tone for the following purpose. Include a subject line.\n\nPurpose:\n${input}`,
  },
  'social-post': {
    type: 'social-post',
    maxTokens: 600,
    buildPrompt: ({ input, platform = 'LinkedIn', tone = 'Professional' }) =>
      `Write an engaging ${platform} post in a ${String(tone).toLowerCase()} tone about the following topic. Include relevant hashtags.\n\nTopic:\n${input}`,
  },
  'product-description': {
    type: 'product-description',
    maxTokens: 700,
    buildPrompt: ({ input, tone = 'Persuasive' }) =>
      `Write a ${String(tone).toLowerCase()} product description for the following product. Highlight benefits and key features.\n\nProduct details:\n${input}`,
  },

  // --- 13. Code helper ---
  'explain-code': {
    type: 'explain-code',
    maxTokens: 1200,
    buildPrompt: ({ input }) =>
      `Explain what the following code does, step by step, in clear language. Describe its purpose, the key logic, and any potential issues or improvements.\n\nCode:\n${input}`,
  },
  'generate-code': {
    type: 'generate-code',
    maxTokens: 1200,
    buildPrompt: ({ input, language = 'JavaScript' }) =>
      `Write clean, well-commented ${language} code for the following requirement, followed by a short explanation of how it works.\n\nRequirement:\n${input}`,
  },
};
