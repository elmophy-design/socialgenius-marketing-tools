// src/utils/database.js
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Social Media Post Schema
const socialMediaPostSchema = new mongoose.Schema({
    id: {
        type: String,
        default: uuidv4,
        unique: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    brandName: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        required: true,
        enum: ['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok']
    },
    variations: [{
        content: String,
        engagement_score: Number,
        tone: String,
        hashtags: [String],
        explanation: String
    }],
    hashtags: [String],
    insights: String,
    aiGenerated: {
        type: Boolean,
        default: true
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }
});

// User History Schema
const userHistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        enum: ['post_generation', 'analysis', 'hashtag_generation']
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Create models
const SocialMediaPost = mongoose.model('SocialMediaPost', socialMediaPostSchema);
const UserHistory = mongoose.model('UserHistory', userHistorySchema);

// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meritlives-tools');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Save generated content to database
const saveToDatabase = async (postData) => {
    try {
        const post = new SocialMediaPost(postData);
        await post.save();
        
        // Also save to user history
        const history = new UserHistory({
            userId: postData.userId,
            action: 'post_generation',
            data: {
                postId: post.id,
                topic: postData.topic,
                platform: postData.platform
            }
        });
        await history.save();
        
        return post;
    } catch (error) {
        console.error('Error saving to database:', error);
        throw new Error('Failed to save post to database');
    }
};

// Get user history
const getUserHistory = async (userId, limit = 10) => {
    try {
        const posts = await SocialMediaPost.find({ userId })
            .sort({ generatedAt: -1 })
            .limit(limit)
            .select('-__v');
        
        const history = await UserHistory.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .select('-__v');
        
        return {
            posts,
            history
        };
    } catch (error) {
        console.error('Error fetching user history:', error);
        throw new Error('Failed to fetch user history');
    }
};

// Save analysis results
const saveAnalysis = async (analysisData) => {
    try {
        const history = new UserHistory({
            userId: analysisData.userId,
            action: 'analysis',
            data: analysisData
        });
        await history.save();
        return history;
    } catch (error) {
        console.error('Error saving analysis:', error);
        throw new Error('Failed to save analysis');
    }
};

// Save hashtag generation results
const saveHashtags = async (hashtagData) => {
    try {
        const history = new UserHistory({
            userId: hashtagData.userId,
            action: 'hashtag_generation',
            data: hashtagData
        });
        await history.save();
        return history;
    } catch (error) {
        console.error('Error saving hashtags:', error);
        throw new Error('Failed to save hashtags');
    }
};

// Get post by ID
const getPostById = async (postId) => {
    try {
        const post = await SocialMediaPost.findOne({ id: postId });
        return post;
    } catch (error) {
        console.error('Error fetching post:', error);
        throw new Error('Failed to fetch post');
    }
};

// Delete post by ID
const deletePost = async (postId, userId) => {
    try {
        const result = await SocialMediaPost.deleteOne({ id: postId, userId });
        return result;
    } catch (error) {
        console.error('Error deleting post:', error);
        throw new Error('Failed to delete post');
    }
};

// Export all functions at once - no duplicates
export {
    connectDB,
    saveToDatabase,
    getUserHistory,
    saveAnalysis,
    saveHashtags,
    getPostById,
    deletePost,
    SocialMediaPost,
    UserHistory
};

export default connectDB;