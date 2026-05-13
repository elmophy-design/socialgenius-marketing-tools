import { sendPlainEmail } from './emailController.js';

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    const supportEmail = process.env.SUPPORT_EMAIL || process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;
    
    if (!supportEmail) {
      return res.status(500).json({
        success: false,
        message: 'Support email not configured'
      });
    }

    await sendPlainEmail({
      to: supportEmail,
      replyTo: email,
      subject: `[Contact Form] ${subject || `New Message from ${name}`}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || 'N/A'}\nSource: Website Contact Page\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background: #1d4ed8; color: white; padding: 20px;">
            <h2 style="margin: 0;">New Contact Form Submission</h2>
          </div>
          <div style="padding: 20px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
            <p><strong>Source:</strong> Website Contact Page</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};
