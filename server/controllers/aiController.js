import OpenAI from "openai";
import sql from "../configs/db.js";
import cloudinaryConfig from "../configs/cloudinary.js";
import {v2 as cloudinary} from 'cloudinary';
import { clerkClient } from '@clerk/express';
import axios from 'axios';
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'
import { FREE_USAGE_LIMIT } from "../configs/plans.js";


const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

//Function to generate article
export const generateArticle = async (req, res) => {
  try {
    const {userId} = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= FREE_USAGE_LIMIT) {
        return res.status(403).json({ success: false, message: 'Free usage limit exceeded. Upgrade to premium for more requests.' })
    }

    const response = await AI.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
        {
            role: "user",
            content: prompt,
        },
    ],
    temperature : 0.7,
    max_tokens: length ,
    });

    const content = response.choices[0].message.content

    await sql `INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article')`;

    if (plan !== 'premium') {
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: {
                free_usage: free_usage + 1
            }
        })
    }

    res.json({ success: true, content })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Function to generate blog title
export const generateBlogTitle = async (req, res) => {
  try {
    const {userId} = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= FREE_USAGE_LIMIT) {
        return res.status(403).json({ success: false, message: 'Free usage limit exceeded. Upgrade to premium for more requests.' })
    }

    const response = await AI.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [{role: "user",content: prompt,}],
    temperature : 0.7,
    max_tokens: 100,
    });

    const content = response.choices[0].message.content

    await sql `INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

    if (plan !== 'premium') {
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: {
                free_usage: free_usage + 1
            }
        })
    }

    res.json({ success: true, content })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ success: false, message: error.message })
  }
}

// --- Image generation ---------------------------------------------------------
// ClipDrop's public API was discontinued (out-of-credit accounts get HTTP 402),
// so image generation now uses Google's Gemini native image model — reusing the
// existing GEMINI_API_KEY that already powers the text tools — with a keyless
// Pollinations fallback so a tier/quota problem on the Gemini key can never take
// the feature down. Both paths return a base64 data URI that Cloudinary stores.

const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

// Generate via Gemini; returns a base64 data URI, or null so the caller can fall back.
const generateImageWithGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`,
      { contents: [{ parts: [{ text: prompt }] }] },
      {
        headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
        timeout: 90000,
      }
    );

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const inline = parts.map((p) => p.inlineData || p.inline_data).find(Boolean);
    if (!inline?.data) {
      console.warn('Gemini image: response contained no inline image data');
      return null;
    }
    const mime = inline.mimeType || inline.mime_type || 'image/png';
    return `data:${mime};base64,${inline.data}`;
  } catch (error) {
    const body = error.response?.data;
    const detail = Buffer.isBuffer(body) ? body.toString('utf8') : JSON.stringify(body ?? error.message);
    console.warn(`Gemini image failed (${error.response?.status || error.code}): ${String(detail).slice(0, 300)}`);
    return null;
  }
};

// Keyless fallback via Pollinations; returns a base64 data URI or throws.
const generateImageWithPollinations = async (prompt) => {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
  const { data } = await axios.get(url, { responseType: 'arraybuffer', timeout: 120000 });
  const base64 = Buffer.from(data, 'binary').toString('base64');
  return `data:image/jpeg;base64,${base64}`;
};

// Try Gemini first, fall back to Pollinations. Returns a base64 data URI.
const createImageDataUri = async (prompt) => {
  // Escape hatch: set IMAGE_PROVIDER=pollinations to skip Gemini entirely.
  if (process.env.IMAGE_PROVIDER !== 'pollinations') {
    const viaGemini = await generateImageWithGemini(prompt);
    if (viaGemini) return viaGemini;
    console.log('Image generation: falling back to Pollinations');
  }
  return generateImageWithPollinations(prompt);
};

// Function to generate image
export const generateImage = async (req, res) => {
  try {
    const {userId} = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= FREE_USAGE_LIMIT) {
        return res.status(403).json({ success: false, message: 'Free usage limit exceeded. Upgrade to premium for more requests.' })
    }

    if (!prompt || !prompt.trim()) {
        return res.status(400).json({ success: false, message: 'A prompt is required to generate an image.' })
    }

    const imageDataUri = await createImageDataUri(prompt)

    const {secure_url} = await cloudinary.uploader.upload(imageDataUri)

    await sql`INSERT INTO creations (user_id, prompt, content, type, publish ) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

    if (plan !== 'premium') {
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: {
                free_usage: free_usage + 1
            }
        })
    }

    res.json({ success: true, content: secure_url })
  } catch (error) {
    console.error('generateImage failed:', error.message)
    res.status(500).json({ success: false, message: `Image generation failed: ${error.message}` })
  }
}

// Function to Remove background from image
export const removeImageBackground = async (req, res) => {
  try {
    const {userId} = req.auth();
    const image = req.file;
    const plan=req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= FREE_USAGE_LIMIT) {
        return res.status(403).json({ success: false, message: 'Free usage limit exceeded. Upgrade to premium for more requests.' })
    }

    const{secure_url}=await cloudinary.uploader.upload(image.path, {transformation: [{effect: 'background_removal',
      background_removal: 'remove_the_background'
     }]})

     //To store the image in database
    await sql`INSERT INTO creations (user_id, prompt, content, type ) VALUES (${userId}, 'Remove background from the image', ${secure_url}, 'image')`;

    if (plan !== 'premium') {
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: {
                free_usage: free_usage + 1
            }
        })
    }

    res.json({ success: true, content: secure_url })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ success: false, message: error.message })
  }
}



// Function to Remove Object from image
export const removeImageObject = async (req, res) => {
  try {
    const {userId} = req.auth();
    const {object}= req.body;
    const image = req.file;
    const plan=req.plan;
    const free_usage = req.free_usage;


    if (plan !== 'premium' && free_usage >= FREE_USAGE_LIMIT) {
        return res.status(403).json({ success: false, message: 'Free usage limit exceeded. Upgrade to premium for more requests.' })
    }


    const{public_id}= await cloudinary.uploader.upload(image.path)

    const imageUrl = cloudinary.url(public_id, {
      effect: `gen_remove:${object}`, // Use the object to be removed
      resource_type: 'image'})

     //To store the image in database
    await sql `INSERT INTO creations (user_id, prompt, content, type ) VALUES (${userId}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')`;

    if (plan !== 'premium') {
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: {
                free_usage: free_usage + 1
            }
        })
    }

    res.json({ success: true, content: imageUrl })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ success: false, message: error.message })
  }
}



// Function to Review Resume
export const resumeReview = async (req, res) => {
  try {
    const {userId} = req.auth();
    const resume= req.file;
    const plan=req.plan;
    const free_usage = req.free_usage;


    if (plan !== 'premium' && free_usage >= FREE_USAGE_LIMIT) {
        return res.status(403).json({ success: false, message: 'Free usage limit exceeded. Upgrade to premium for more requests.' })
    }

    if(resume.size > 5 * 1024 * 1024) { // Check if file size is greater than 5MB
        return res.status(413).json({ success: false, message: 'File size exceeds the limit of 5MB.' })
    }

    const dataBuffer = fs.readFileSync(resume.path) // Assuming the file is uploaded as a buffer
    const pdfData=await pdf(dataBuffer)

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weakness and areas for improvement. Resume Content:\n\n${pdfData.text}`

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{role: "user",content: prompt,}],
      temperature : 0.7,
      max_tokens: 1000 ,
      });

    const content = response.choices[0].message.content
    

    //To store the image in database
    await sql`INSERT INTO creations (user_id, prompt, content, type ) VALUES (${userId}, 'Review the uploaded resume', ${content}, 'review-resume')`;

    if (plan !== 'premium') {
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: {
                free_usage: free_usage + 1
            }
        })
    }

    res.json({ success: true, content })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ success: false, message: error.message })
  }
}