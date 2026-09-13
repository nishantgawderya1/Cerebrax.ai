import {
  FileText,
  Repeat,
  SpellCheck,
  Languages,
  Mail,
  Share2,
  Tag,
  FileCode,
  Code2,
} from 'lucide-react';

// Display config for every Gemini-backed text tool. `slug` must match a key in
// the server's configs/textTools.js. The generic TextTool page renders each of
// these; adding a tool is a new entry here + one on the server.
export const textTools = [
  // --- Text Utilities ---
  {
    slug: 'summarize',
    title: 'Text Summarizer',
    subtitle: 'Condense long text into its key points',
    Icon: FileText,
    accent: '#4A7AFF',
    category: 'Text Utilities',
    input: { label: 'Text to summarize', placeholder: 'Paste the text you want summarized...', rows: 6 },
    options: [{ name: 'length', label: 'Length', choices: ['Short', 'Medium', 'Detailed'], default: 'Medium' }],
    submitLabel: 'Summarize',
  },
  {
    slug: 'paraphrase',
    title: 'Paraphraser',
    subtitle: 'Rewrite text while keeping the meaning',
    Icon: Repeat,
    accent: '#8E37EB',
    category: 'Text Utilities',
    input: { label: 'Text to rewrite', placeholder: 'Paste the text you want to paraphrase...', rows: 6 },
    options: [{ name: 'tone', label: 'Tone', choices: ['Standard', 'Formal', 'Casual', 'Fluent'], default: 'Standard' }],
    submitLabel: 'Paraphrase',
  },
  {
    slug: 'grammar',
    title: 'Grammar & Tone Fixer',
    subtitle: 'Fix mistakes and adjust the tone',
    Icon: SpellCheck,
    accent: '#00AD25',
    category: 'Text Utilities',
    input: { label: 'Text to correct', placeholder: 'Paste the text you want corrected...', rows: 6 },
    options: [{ name: 'tone', label: 'Tone', choices: ['Original', 'Professional', 'Friendly', 'Confident'], default: 'Original' }],
    submitLabel: 'Fix Text',
  },
  {
    slug: 'translate',
    title: 'Translator',
    subtitle: 'Translate text into another language',
    Icon: Languages,
    accent: '#FF4938',
    category: 'Text Utilities',
    input: { label: 'Text to translate', placeholder: 'Paste the text you want translated...', rows: 6 },
    options: [{
      name: 'language',
      label: 'Translate to',
      choices: ['English', 'Spanish', 'French', 'German', 'Hindi', 'Chinese', 'Japanese', 'Arabic'],
      default: 'English',
    }],
    submitLabel: 'Translate',
  },

  // --- Email & Social ---
  {
    slug: 'cold-email',
    title: 'Cold Email Writer',
    subtitle: 'Draft a compelling outreach email',
    Icon: Mail,
    accent: '#4A7AFF',
    category: 'Email & Social',
    input: { label: 'Email purpose', placeholder: 'e.g. Introduce our design service to a startup founder...', rows: 5 },
    options: [{ name: 'tone', label: 'Tone', choices: ['Professional', 'Friendly', 'Persuasive'], default: 'Professional' }],
    submitLabel: 'Write Email',
  },
  {
    slug: 'social-post',
    title: 'Social Post Generator',
    subtitle: 'Create posts for LinkedIn, X and more',
    Icon: Share2,
    accent: '#8E37EB',
    category: 'Email & Social',
    input: { label: 'Post topic', placeholder: 'e.g. Announcing our new AI image generator...', rows: 4 },
    options: [
      { name: 'platform', label: 'Platform', choices: ['LinkedIn', 'Twitter', 'Instagram', 'Facebook'], default: 'LinkedIn' },
      { name: 'tone', label: 'Tone', choices: ['Professional', 'Casual', 'Excited', 'Informative'], default: 'Professional' },
    ],
    submitLabel: 'Generate Post',
  },
  {
    slug: 'product-description',
    title: 'Product Description',
    subtitle: 'Write persuasive product copy',
    Icon: Tag,
    accent: '#00AD25',
    category: 'Email & Social',
    input: { label: 'Product details', placeholder: 'e.g. Wireless noise-cancelling headphones, 30h battery...', rows: 5 },
    options: [{ name: 'tone', label: 'Tone', choices: ['Persuasive', 'Professional', 'Playful', 'Luxury'], default: 'Persuasive' }],
    submitLabel: 'Write Description',
  },

  // --- Code ---
  {
    slug: 'explain-code',
    title: 'Explain Code',
    subtitle: 'Understand what a snippet does',
    Icon: FileCode,
    accent: '#00DA83',
    category: 'Code',
    input: { label: 'Code to explain', placeholder: 'Paste the code you want explained...', rows: 8 },
    options: [],
    submitLabel: 'Explain Code',
  },
  {
    slug: 'generate-code',
    title: 'Code Generator',
    subtitle: 'Generate code from a description',
    Icon: Code2,
    accent: '#4A7AFF',
    category: 'Code',
    input: { label: 'What should the code do?', placeholder: 'e.g. A function that debounces another function...', rows: 5 },
    options: [{
      name: 'language',
      label: 'Language',
      choices: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'SQL'],
      default: 'JavaScript',
    }],
    submitLabel: 'Generate Code',
  },
];

export const getTextTool = (slug) => textTools.find((t) => t.slug === slug);
