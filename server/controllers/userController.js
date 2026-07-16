import sql from "../configs/db.js";
import { FREE_USAGE_LIMIT } from "../configs/plans.js";


// Report the current user's free-usage budget so the client can show a meter
export const getUsage = async (req, res) => {
    try {
        const plan = req.plan;
        const free_usage = req.free_usage ?? 0;
        const remaining = plan === 'premium'
            ? null
            : Math.max(FREE_USAGE_LIMIT - free_usage, 0);

        res.json({
            success: true,
            plan,
            free_usage,
            limit: FREE_USAGE_LIMIT,
            remaining,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getUserCreations= async(req, res) => {
    try {
        const {userId} = req.auth()

        const creations = await sql `SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;

        res.json({success: true, creations});

    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}

export const getPublishedCreations= async(req, res) => {
    try {

        const creations = await sql `SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;

        res.json({success: true, creations});

    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}


export const toogleLikeCreation= async(req, res) => {
    try {
        const {userId} = req.auth()
        const {id}=req.body

        const [creation] = await sql `SELECT * FROM creations WHERE id = ${id}`

        if(!creation) {
            return res.status(404).json({success: false, message: "Creation not found"})
        }

        // `likes` can be NULL for older rows that were inserted without a value
        const currentLikes = creation.likes || [];
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if (currentLikes.includes(userIdStr)) {
            updatedLikes = currentLikes.filter((user) => user !== userIdStr);
            message = "Creation unliked successfully"
        }else {
            updatedLikes = [...currentLikes, userIdStr]
            message = "Creation liked successfully"
        }

        const formattedArray = `{${updatedLikes.join(',')}}`

        await sql `UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`;

        res.json({success: true, message});

    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}


export const deleteCreation = async (req, res) => {
    try {
        const {userId} = req.auth()
        const {id} = req.params

        // Only allow users to delete their own creations
        const [deleted] = await sql `DELETE FROM creations WHERE id = ${id} AND user_id = ${userId} RETURNING id`;

        if (!deleted) {
            return res.status(404).json({success: false, message: "Creation not found"});
        }

        res.json({success: true, message: "Creation deleted successfully"});

    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}
