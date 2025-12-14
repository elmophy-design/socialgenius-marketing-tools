// Simple in-memory rate limiting (replace with Redis in production)
const rateLimitStore = new Map();

export const rateLimit = (req, res, next) => {
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100; // Maximum requests per window
    const ip = req.ip;

    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [key, data] of rateLimitStore.entries()) {
        if (data.timestamp < windowStart) {
            rateLimitStore.delete(key);
        }
    }

    const clientData = rateLimitStore.get(ip) || { count: 0, timestamp: now };

    if (clientData.timestamp < windowStart) {
        // Reset counter for new window
        clientData.count = 1;
        clientData.timestamp = now;
    } else {
        clientData.count++;
    }

    rateLimitStore.set(ip, clientData);

    // Check if rate limit exceeded
    if (clientData.count > maxRequests) {
        return res.status(429).json({
            success: false,
            error: 'Too many requests. Please try again later.'
        });
    }

    next();
};