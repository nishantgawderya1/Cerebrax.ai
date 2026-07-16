import { clerkClient } from '@clerk/express';

//MIDDLE WARE TO CHECK USER ID AND HAS PREMIUM PLAN

export const auth = async (req, res, next) => {
  try {
    const {userId, has} = await req.auth();

    const hasPremiumPlan = await has({plan: 'premium'});

    const user = await clerkClient.users.getUser(userId);
    const storedUsage = user.privateMetadata.free_usage;

    if (hasPremiumPlan) {
      // Premium users don't consume free usage — no metadata write needed.
      req.free_usage = storedUsage || 0;
    } else if (storedUsage === undefined || storedUsage === null) {
      // First-time free user: initialize the counter once.
      await clerkClient.users.updateUserMetadata(userId, { privateMetadata: { free_usage: 0 } });
      req.free_usage = 0;
    } else {
      // Existing free user (including 0): reuse the stored value, no write.
      req.free_usage = storedUsage;
    }

    req.plan = hasPremiumPlan ? 'premium' : 'free';
    next()
  } catch (error) {
    res.status(500).json({success: false, message : error.message })
  }
}