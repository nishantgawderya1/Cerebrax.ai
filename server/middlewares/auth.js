import { clerkClient } from '@clerk/express';

//MIDDLE WARE TO CHECK USER ID AND HAS PREMIUM PLAN

export const auth = async (req, res, next) => {
  try {
    const {userId, has} = await req.auth(); // Assuming user ID is stored in req.user

    const hasPremiumPlan = await has({plan: 'premium'}); // Assuming premium status is stored in req.user


    const user = await clerkClient.users.getUser(userId);

    if (!hasPremiumPlan && user.privateMetadata.free_usage) {req.free_usage = user.privateMetadata.free_usage
     } else {
        await clerkClient.users.updateUserMetadata(userId, { privateMetadata: { free_usage: 0 } })
        req.free_usage = 0;
     }
    req.plan = hasPremiumPlan ? 'premium' : 'free';
    next()
  } catch (error) {
    res.json({success: false, message : error.message })
  }
}