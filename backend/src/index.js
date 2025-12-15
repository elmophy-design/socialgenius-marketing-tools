import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// Load environment variables FIRST
dotenv.config();

// Create Express app EARLY (before using it)
const app = express();
const PORT = process.env.PORT || 4000;

// Database Connection
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// IMPORT ROUTES (After app is created)
// ============================================

// Auth Routes
import authRoutes from './routes/auth.js';

// Individual Tool Routes (from tools folder)
import adCopyRoutes from "./routes/tools/ad-copy.js";
import contentIdeaRoutes from "./routes/tools/content-idea.js";
import emailTesterRoutes from "./routes/tools/email-tester.js";
import funnelBuilderRoutes from "./routes/tools/funnel-builder.js";
import headlineRoutes from "./routes/tools/headline.js";
import seoMetaRoutes from "./routes/tools/seo-meta.js";
import socialMediaRoutes from "./routes/tools/social-media.js";
import valuePropRoutes from "./routes/tools/value-prop.js";

// Main tool index (if it exists and works)
import toolsIndexRoutes from "./routes/tools/index.js";

// Other Routes
import paymentRoutes from "./routes/payment.routes.js";
import usersRoutes from "./routes/users.js";
import toolsRoutes from "./routes/tools.js";

// ============================================
// REGISTER ROUTES
// ============================================

// Auth
app.use("/api/auth", authRoutes);

// Individual Marketing Tools (detailed routes)
app.use("/api/tools/ad-copy", adCopyRoutes);
app.use("/api/tools/content-idea", contentIdeaRoutes);
app.use("/api/tools/email-tester", emailTesterRoutes);
app.use("/api/tools/funnel-builder", funnelBuilderRoutes);
app.use("/api/tools/headline", headlineRoutes);
app.use("/api/tools/seo-meta", seoMetaRoutes);
app.use("/api/tools/social-media", socialMediaRoutes);
app.use("/api/tools/value-prop", valuePropRoutes);

// General tools route (if you have tools.js with aggregated routes)
app.use("/api/tools", toolsRoutes);

// Other routes
app.use("/api/payment", paymentRoutes);
app.use("/api/users", usersRoutes);

// ============================================
// HEALTH CHECK & ROOT ROUTES
// ============================================

app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        service: "Meritlives Tools API",
        timestamp: new Date().toISOString(),
        version: "2.0.0",
        tools: 8
    });
});

app.get("/", (req, res) => {
    res.json({
        name: "Meritlives Tools API",
        version: "2.0.0",
        description: "8 Marketing Tools + AI Integration",
        endpoints: {
            auth: "/api/auth",
            tools: {
                adCopy: "/api/tools/ad-copy",
                contentIdea: "/api/tools/content-idea",
                emailTester: "/api/tools/email-tester",
                funnelBuilder: "/api/tools/funnel-builder",
                headline: "/api/tools/headline",
                seoMeta: "/api/tools/seo-meta",
                socialMedia: "/api/tools/social-media",
                valueProp: "/api/tools/value-prop"
            },
            payment: "/api/payment",
            users: "/api/users",
            health: "/health"
        }
    });
});

// ============================================
// ERROR HANDLING (MUST BE LAST)
// ============================================

app.use(notFound);
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✨ ==========================================`);
    console.log(`🚀 MERITLIVES TOOLS - UNIFIED SERVER`);
    console.log(`✨ ==========================================`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health: http://localhost:${PORT}/health`);
    console.log(`🛠️  Tools API: http://localhost:${PORT}/api/tools`);
    console.log(`📊 Total Tools: 8`);
    console.log(`✨ Tools Available:`);
    console.log(`   • Ad Copy: /api/tools/ad-copy`);
    console.log(`   • Content Ideas: /api/tools/content-idea`);
    console.log(`   • Email Tester: /api/tools/email-tester`);
    console.log(`   • Funnel Builder: /api/tools/funnel-builder`);
    console.log(`   • Headline Analyzer: /api/tools/headline`);
    console.log(`   • SEO Meta: /api/tools/seo-meta`);
    console.log(`   • Social Media: /api/tools/social-media`);
    console.log(`   • Value Proposition: /api/tools/value-prop`);
    console.log(`✨ ==========================================\n`);
});

export default app;