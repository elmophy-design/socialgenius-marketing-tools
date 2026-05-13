import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Mock database - replace with real database in production
let users = [];

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId, userId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

// ===============================
// 🧪 TEST ROUTES
// ===============================

// Test route to verify auth routes are working
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Auth routes are working! 🎉',
        timestamp: new Date().toISOString(),
        routes: [
            'GET /api/auth/test',
            'GET /api/auth/test-config', 
            'GET /api/auth/google',
            'POST /api/auth/login',
            'POST /api/auth/signup'
        ]
    });
});

// Test Google OAuth configuration
router.get('/test-config', (req, res) => {
    res.json({
        success: true,
        google_client_id: process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Missing',
        google_redirect_uri: process.env.GOOGLE_REDIRECT_URI || '❌ Not set',
        frontend_url: process.env.FRONTEND_URL || '❌ Not set',
        environment: process.env.NODE_ENV || 'development'
    });
});

// ===============================
// 🔐 GOOGLE OAUTH ROUTES
// ===============================

// Google OAuth - Start flow
router.get('/google', (req, res) => {
    console.log('🔐 Starting Google OAuth flow...');
    
    if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(500).json({
            success: false,
            error: 'Google OAuth not configured - missing GOOGLE_CLIENT_ID'
        });
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=profile email&` +
        `access_type=online&` +
        `prompt=select_account`;
    
    console.log('🔄 Redirecting to Google OAuth...');
    res.redirect(authUrl);
});

// Google OAuth - Callback
router.get('/google/callback', async (req, res) => {
    try {
        console.log('📨 Google callback received');
        const { code, error } = req.query;

        if (error) {
            console.error('❌ Google OAuth error:', error);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_oauth_failed`);
        }

        if (!code) {
            console.error('❌ No authorization code received');
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
        }

        console.log('🔄 Exchanging code for tokens...');
        
        // Exchange authorization code for tokens
        const { tokens } = await googleClient.getToken({
            code,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI
        });

        console.log('✅ Tokens received, verifying ID token...');
        
        // Verify the ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture, email_verified } = payload;

        console.log('👤 Google user:', { email, name });

        // Find or create user
        let user = users.find(u => u.email === email);
        
        if (!user) {
            user = {
                id: 'user_' + Math.random().toString(36).substr(2, 9),
                email,
                name,
                picture,
                isVerified: email_verified || true,
                isGoogleAuth: true,
                createdAt: new Date(),
                lastLogin: new Date(),
                loginCount: 1
            };
            users.push(user);
            console.log('✅ New user created:', user.id);
        } else {
            user.lastLogin = new Date();
            user.loginCount = (user.loginCount || 0) + 1;
            console.log('✅ Existing user updated:', user.id);
        }

        // Generate JWT token
        const token = generateToken(user.id);
        console.log('🔑 JWT token generated');

        // Redirect to frontend with token
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/google-callback.html?token=${token}`;
        console.log('🔄 Redirecting to:', redirectUrl);
        res.redirect(redirectUrl);

    } catch (error) {
        console.error('❌ Google OAuth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
});

// ===============================
// 📧 EMAIL/PASSWORD AUTH ROUTES
// ===============================

// Login with email
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        user.lastLogin = new Date();
        user.loginCount = (user.loginCount || 0) + 1;

        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isVerified: user.isVerified
            },
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    isVerified: user.isVerified
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to login'
        });
    }
});

// Sign up with email
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists with this email'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            email,
            password: hashedPassword,
            name,
            isVerified: false,
            createdAt: new Date(),
            lastLogin: null,
            loginCount: 0
        };

        users.push(user);

        // Generate token
        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Account created successfully!',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                isVerified: user.isVerified
            },
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    isVerified: user.isVerified
                },
                token
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create account'
        });
    }
});

export default router;
