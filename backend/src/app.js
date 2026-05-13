import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import adCopyRoutes from "./routes/tools/ad-copy.js";
import contentIdeaRoutes from "./routes/tools/content-idea.js";
import emailTesterRoutes from "./routes/tools/email-tester.js";
import funnelBuilderRoutes from "./routes/tools/funnel-builder.js";
import headlineRoutes from "./routes/tools/headline.js";
import seoMetaRoutes from "./routes/tools/seo-meta.js";
import socialMediaRoutes from "./routes/tools/social-media.js";
import valuePropRoutes from "./routes/tools/value-prop.js";
import paymentRoutes from "./routes/payment.routes.js";
import usersRoutes from "./routes/users.js";
import toolsRoutes from "./routes/tools.js";
import notificationRoutes from "./routes/notifications.js";
import socialRoutes from "./routes/social.js";
import healthRoutes from "./routes/health.js";
import contactRoutes from "./routes/contact.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { sendPlainEmail, getEmailStatus } from "./controllers/emailController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const createApp = () => {
  const app = express();
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    "http://localhost:3000",
    "http://localhost:4000",
    "http://127.0.0.1:3000",
  ].filter(Boolean);

  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      if (process.env.NODE_ENV !== "production") {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID", "X-User-ID"],
  }));

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  app.get("/", (req, res) => {
    res.json({
      name: "Meritlives Tools API",
      version: "2.1.0",
      description: "Unified API for auth, billing, notifications, and content tools",
      endpoints: {
        auth: "/api/auth",
        tools: "/api/tools",
        payment: "/api/payment",
        users: "/api/users",
        notifications: "/api/notifications",
        social: "/api/social",
        health: "/health",
      },
      email: getEmailStatus(),
    });
  });

  app.get("/test-email", async (req, res) => {
    try {
      const to = req.query.to || process.env.TEST_EMAIL_TO || process.env.EMAIL_TEST_TO || process.env.EMAIL_FROM;

      if (!to) {
        return res.status(400).json({
          success: false,
          message: "Provide a recipient with ?to=email@example.com or set TEST_EMAIL_TO in the backend environment.",
        });
      }

      await sendPlainEmail({
        to,
        subject: "Meritlives backend email test",
        text: "Your shared backend email service is working correctly.",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937;">
            <h2 style="color: #1d4ed8;">Meritlives backend email test</h2>
            <p>This confirms your shared backend email service is working correctly.</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          </div>
        `,
      });

      return res.json({
        success: true,
        message: "Test email sent successfully",
        to,
        provider: getEmailStatus().provider,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to send test email",
        email: getEmailStatus(),
      });
    }
  });

  app.use("/health", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/tools/ad-copy", adCopyRoutes);
  app.use("/api/tools/content-idea", contentIdeaRoutes);
  app.use("/api/tools/email-tester", emailTesterRoutes);
  app.use("/api/tools/funnel-builder", funnelBuilderRoutes);
  app.use("/api/tools/headline", headlineRoutes);
  app.use("/api/tools/seo-meta", seoMetaRoutes);
  app.use("/api/tools/social-media", socialMediaRoutes);
  app.use("/api/tools/value-prop", valuePropRoutes);
  app.use("/api/tools", toolsRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/social", socialRoutes);
  app.use("/api/contact", contactRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

const app = createApp();

export default app;
