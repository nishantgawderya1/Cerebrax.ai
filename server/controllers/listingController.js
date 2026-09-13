import sql from "../configs/db.js";
import { v2 as cloudinary } from 'cloudinary';
import { clerkClient } from '@clerk/express';
import { FREE_USAGE_LIMIT } from "../configs/plans.js";
import { listingStyles } from "../configs/listingStyles.js";

// Product Listing Studio — Phase 1 (furniture).
// One uploaded product photo becomes a pack of marketplace-ready images, all
// derived from a single Cloudinary upload:
//   - White Hero: background removed + padded on pure white at 1600px (compliant main)
//   - Lifestyle x2: generative background replace keeps the product, regenerates the scene
// We return Cloudinary transformation URLs immediately; Cloudinary renders each
// on first access, so no long-running request or queue is needed for this slice.
export const generateProductListing = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;
    const free_usage = req.free_usage;
    const { style = 'scandinavian', category = 'furniture' } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: 'Please upload a product image' });
    }

    if (plan !== 'premium' && free_usage >= FREE_USAGE_LIMIT) {
      return res.status(403).json({ success: false, message: 'Free usage limit exceeded. Upgrade to premium for more requests.' });
    }

    const styleConfig = listingStyles[style] || listingStyles.scandinavian;

    // Upload the source once; every variation is a derived transformation of it.
    const { public_id } = await cloudinary.uploader.upload(image.path, { folder: 'listings' });

    const assets = [];

    // 1) Compliant white-background hero — deterministic, no generation cost.
    const heroUrl = cloudinary.url(public_id, {
      secure: true,
      transformation: [
        { effect: 'background_removal' },
        { width: 1600, height: 1600, crop: 'pad', background: 'white' },
        { quality: 'auto', fetch_format: 'jpg' },
      ],
    });
    assets.push({ role: 'main', type: 'White Hero', marketplace: 'Amazon / Flipkart', url: heroUrl });

    // 2) Lifestyle scenes — generative background replace preserves the product.
    // Prompt is wrapped in parentheses so its spaces don't break the URL, and the
    // prompts are kept comma-free (commas separate Cloudinary transformations).
    styleConfig.scenes.forEach((scene, i) => {
      const url = cloudinary.url(public_id, {
        secure: true,
        transformation: [
          { effect: `gen_background_replace:prompt_(${scene})` },
          { width: 1600, height: 1200, crop: 'fill', gravity: 'auto' },
          { quality: 'auto', fetch_format: 'jpg' },
        ],
      });
      assets.push({ role: 'secondary', type: `Lifestyle ${i + 1}`, marketplace: 'Lifestyle', url });
    });

    // Persist each variation as a creation (type 'image' so it renders everywhere).
    for (const asset of assets) {
      await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`${category} listing – ${asset.type} (${styleConfig.label})`}, ${asset.url}, 'image')`;
    }

    // Count the whole pack as a single free-usage creation.
    if (plan !== 'premium') {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.json({ success: true, assets, style: styleConfig.label });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
