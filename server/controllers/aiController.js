import OpenAI from "openai";
import sql from "../configs/db.js";
import cloudinaryConfig from "../configs/cloudinary.js";
import {v2 as cloudinary} from 'cloudinary';
import axios from 'axios';
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'




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

    if (plan !== 'premium' && free_usage >= 10) {
        return res.json({ success: false, message: 'Free usage limit exceeded. Upgrade to premium for more requests.' })
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
    res.json({ success: false, message: error.message })
  }
}

// Function to generate blog title
export const generateBlogTitle = async (req, res) => {
  try {
    const {userId} = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== 'premium' && free_usage >= 10) {
        return res.json({ success: false, message: 'Free usage limit exceeded. Upgrade to premium for more requests.' })
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
    res.json({ success: false, message: error.message })
  }
}

// Function to generate image
export const generateImage = async (req, res) => {
  try {
    const {userId} = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (plan !== 'premium' ) { //ADD && free_usage >= 10 INSIDE IF CONDITION TO LIMIT FREE USAGE
        return res.json({ success: false, message: 'THIS FEATURE IS ONLY FOR PREMIUM USERS' })
    }

    const formData = new FormData()
    formData.append('prompt', prompt)
    const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
        headers: {
            'x-api-key': process.env.CLIPDROP_API_KEY,
        },
        responseType: 'arraybuffer',
    })

    const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;

    const {secure_url}=await cloudinary.uploader.upload(base64Image)

    await sql`INSERT INTO creations (user_id, prompt, content, type, publish ) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

    //if (plan !== 'premium') {
    //    await clerkClient.users.updateUserMetadata(userId, {
    //        privateMetadata: {
    //            free_usage: free_usage + 1
    //        }
    //    })
    //}

    res.json({ success: true, content: secure_url })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}

// Function to Remove background from image
export const removeImageBackground = async (req, res) => {
  try {
    const {userId} = req.auth();
    const image = req.file;
    const plan=req.plan;

    if (plan !== 'premium' ) { 
        return res.json({ success: false, message: 'THIS FEATURE IS ONLY FOR PREMIUM USERS' })
    }

    const{secure_url}=await cloudinary.uploader.upload(image.path, {transformation: [{effect: 'background_removal',
      background_removal: 'remove_the_background'
     }]})
 
     //To store the image in database
    await sql`INSERT INTO creations (user_id, prompt, content, type ) VALUES (${userId}, 'Remove background from the image', ${secure_url}, 'image')`;

    res.json({ success: true, content: secure_url })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}



// Function to Remove Object from image
export const removeImageObject = async (req, res) => {
  try {
    const {userId} = req.auth();
    const {object}= req.body;
    //const { prompt, publish } = req.body;
    const image = req.file;
    //const free_usage = req.free_usage; To MAKE IMAGE GENRATION FREE
    const plan=req.plan;
    

    if (plan !== 'premium' ) { //ADD && free_usage >= 10 INSIDE IF CONDITION TO LIMIT FREE USAGE
        return res.json({ success: false, message: 'THIS FEATURE IS ONLY FOR PREMIUM USERS' })
    }

    
    const{public_id}= await cloudinary.uploader.upload(image.path)

    const imageUrl = cloudinary.url(public_id, {
      effect: `gen_remove:${object}`, // Use the object to be removed
      resource_type: 'image'})
 
     //To store the image in database
    await sql `INSERT INTO creations (user_id, prompt, content, type ) VALUES (${userId}, ${ 'Removed ${object} from image'}, ${imageUrl}, 'image')`;


    res.json({ success: true, content: imageUrl })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}



// Function to Review Resume
export const resumeReview = async (req, res) => {
  try {
    const {userId} = req.auth();
    const resume= req.file;
    //const { prompt, publish } = req.body;
    //const free_usage = req.free_usage; To MAKE IMAGE GENRATION FREE
    const plan=req.plan;
    

    if (plan !== 'premium' ) { //ADD && free_usage >= 10 INSIDE IF CONDITION TO LIMIT FREE USAGE
        return res.json({ success: false, message: 'THIS FEATURE IS ONLY FOR PREMIUM USERS' })
    }

    if(resume.size > 5 * 1024 * 1024) { // Check if file size is greater than 5MB
        return res.json({ success: false, message: 'File size exceeds the limit of 5MB.' })
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

    

    res.json({ success: true, content })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}