import connectDB from "./config/database.js";
import app from "./app.js";
import { startSubscriptionNotificationJob } from "./services/subscriptionNotificationService.js";
import { startSocialPublishingJob } from "./services/socialPublishingService.js";

const PORT = process.env.PORT || 4000;

await connectDB();
startSubscriptionNotificationJob();
startSocialPublishingJob();

app.listen(PORT, "0.0.0.0", () => {
  console.log("\n==========================================");
  console.log("Meritlives Tools API Server Started");
  console.log("==========================================");
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`API Root: http://localhost:${PORT}/`);
  console.log(`Notifications: http://localhost:${PORT}/api/notifications`);
  console.log("==========================================\n");
});

export default app;
