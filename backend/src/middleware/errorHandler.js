// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================

// Not Found Middleware
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Error Handler Middleware
export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode);
    res.json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
        ...(process.env.NODE_ENV === 'development' && {
            error: err
        })
    });
};

// Async Handler - Wraps async routes to catch errors
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Mongoose Bad ObjectId
export const validateObjectId = (req, res, next) => {
    const { id } = req.params;
    
    if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400);
        throw new Error('Invalid ID format');
    }
    
    next();
};

// Handle Mongoose Duplicate Key Errors
export const handleDuplicateKeyError = (err, req, res, next) => {
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} already exists`;
        
        return res.status(400).json({
            success: false,
            message
        });
    }
    next(err);
};

// Handle Mongoose Validation Errors
export const handleValidationError = (err, req, res, next) => {
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        const message = `Validation Error: ${errors.join(', ')}`;
        
        return res.status(400).json({
            success: false,
            message,
            errors
        });
    }
    next(err);
};

// Handle JWT Errors
export const handleJWTError = (err, req, res, next) => {
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }
    
    next(err);
};

// Combined Error Handler
export const globalErrorHandler = (err, req, res, next) => {
    // Handle different error types
    handleDuplicateKeyError(err, req, res, (err) => {
        handleValidationError(err, req, res, (err) => {
            handleJWTError(err, req, res, (err) => {
                errorHandler(err, req, res, next);
            });
        });
    });
};