import express from 'express';
const router = express.Router();

// Temporary users storage
let users = [];

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Simple validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        // Check if user exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user (in production, hash password!)
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        // Create simple token (in production, use JWT!)
        const token = `mock-token-${Date.now()}`;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            token,
            user: newUser
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user (in production, check password!)
        const user = users.find(user => user.email === email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create simple token
        const token = `mock-token-${Date.now()}`;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
    // This is a mock endpoint
    res.json({
        success: true,
        message: 'Auth endpoints are working (mock mode)',
        note: 'For production, implement proper authentication with JWT'
    });
});

export default router;