import nodemailer from 'nodemailer';

// Create transporter (using Brevo SMTP)
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
        port: process.env.BREVO_SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_PASS,
        },
    });
};

// Mock email sending function (replace with actual implementation when credentials are available)
export const sendVerificationEmail = async (email, verificationToken, name) => {
    try {
        // For now, just log the verification token
        console.log(`📧 Verification email would be sent to: ${email}`);
        console.log(`🔗 Verification token: ${verificationToken}`);
        console.log(`👤 User: ${name}`);
        
        // In production, uncomment and configure this:
        /*
        const transporter = createTransporter();
        const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify/${verificationToken}`;
        
        await transporter.sendMail({
            from: process.env.BREVO_SMTP_USER,
            to: email,
            subject: 'Verify Your Meritlives Account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #004aad;">Welcome to Meritlives Tools, ${name}! 🎉</h2>
                    <p>Please verify your email address to complete your account setup.</p>
                    <div style="text-align: center; margin: 2rem 0;">
                        <a href="${verificationUrl}" 
                           style="background: #004aad; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 6px; display: inline-block;">
                            Verify Email Address
                        </a>
                    </div>
                    <p>Or copy this link: ${verificationUrl}</p>
                </div>
            `
        });
        */
        
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        // Don't throw error - allow user registration even if email fails
        return false;
    }
};

export const sendWelcomeEmail = async (email, name) => {
    try {
        console.log(`📧 Welcome email would be sent to: ${email}`);
        console.log(`👤 User: ${name}`);
        
        // In production, uncomment and configure this:
        /*
        const transporter = createTransporter();
        
        await transporter.sendMail({
            from: process.env.BREVO_SMTP_USER,
            to: email,
            subject: 'Welcome to Meritlives Tools!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #004aad;">Welcome to Meritlives Tools, ${name}! 🚀</h2>
                    <p>We're excited to have you on board. Get ready to supercharge your marketing efforts with our AI-powered tools.</p>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                        <h3>Quick Start Guide:</h3>
                        <ul>
                            <li>🎯 <strong>Value Proposition Generator</strong> - Create compelling business value statements</li>
                            <li>📱 <strong>Social Media Generator</strong> - AI-powered posts for all platforms</li>
                            <li>📊 <strong>Headline Analyzer</strong> - Optimize your content for maximum engagement</li>
                        </ul>
                    </div>
                    <p>Start creating amazing content at: ${process.env.FRONTEND_URL}</p>
                </div>
            `
        });
        */
        
        return true;
    } catch (error) {
        console.error('Welcome email error:', error);
        return false;
    }
};

export const sendPasswordResetEmail = async (email, resetToken, name) => {
    try {
        console.log(`📧 Password reset email would be sent to: ${email}`);
        console.log(`🔗 Reset token: ${resetToken}`);
        
        // Implementation for password reset emails
        return true;
    } catch (error) {
        console.error('Password reset email error:', error);
        return false;
    }
};