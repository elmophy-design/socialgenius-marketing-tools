import { sendPlainEmail } from "./src/controllers/emailController.js";

const sendEmail = async (to, subject, text, html = null) => (
  sendPlainEmail({
    to,
    subject,
    text,
    html,
  })
);

export default sendEmail;
