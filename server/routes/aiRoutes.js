import express from 'express';
import { upload } from '../configs/multer.js';
import multer from 'multer';
import { auth } from '../middlewares/auth.js';
import { generateArticle, generateBlogTitle, generateImage, removeImageBackground, removeImageObject, resumeReview } from '../controllers/aiController.js';
import { generateProductListing } from '../controllers/listingController.js';

const aiRouter = express.Router();

aiRouter.post('/generate-article', auth, generateArticle)
aiRouter.post('/generate-blog-title', auth, generateBlogTitle)
aiRouter.post('/generate-image', auth, generateImage)
aiRouter.post('/remove-image-background', auth, upload.single('image'), removeImageBackground )
aiRouter.post('/remove-image-object', auth, upload.single('image'), removeImageObject)
aiRouter.post('/review-resume', auth, upload.single('resume'), resumeReview)
aiRouter.post('/generate-listing', auth, upload.single('image'), generateProductListing)

export default aiRouter