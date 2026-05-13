import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import { createUserNotification } from "../utils/notificationHelper.js";

const DAY_MS = 24 * 60 * 60 * 1000;
let jobStarted = false;

const wholeDaysBetween = (futureDate, baseDate = new Date()) => (
  Math.ceil((futureDate.getTime() - baseDate.getTime()) / DAY_MS)
);

const sendTrialReminders = async () => {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + (3 * DAY_MS));

  const users = await User.find({
    "subscription.plan": "trial",
    "subscription.trialEndDate": { $lte: threeDaysFromNow },
    deletedAt: null,
  }).select("_id subscription isActive");

  for (const user of users) {
    const trialEndDate = new Date(user.subscription.trialEndDate);
    const daysLeft = wholeDaysBetween(trialEndDate, now);

    if (daysLeft > 3) {
      continue;
    }

    if (daysLeft <= 0) {
      if (user.subscription.status !== "expired" || user.subscription.isActive) {
        user.subscription.status = "expired";
        user.subscription.isActive = false;
        await user.save();
      }

      await createUserNotification(user._id, {
        type: "warning",
        category: "subscription",
        title: "Your trial has expired",
        message: "Upgrade your subscription to restore premium features and continue generating content.",
        action: {
          label: "Upgrade now",
          url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/upgrade`,
        },
      }, {
        sendEmail: true,
        dedupeWindowMinutes: 1440,
      });

      continue;
    }

    await createUserNotification(user._id, {
      type: "info",
      category: "subscription",
      title: `Trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
      message: "Upgrade now to keep your workflows, posting access, and generated content uninterrupted.",
      action: {
        label: "View plans",
        url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/upgrade`,
      },
    }, {
      sendEmail: true,
      dedupeWindowMinutes: 1440,
    });
  }
};

const sendRenewalReminders = async () => {
  const subscriptions = await Subscription.getExpiringSoon(3);

  for (const subscription of subscriptions) {
    if (!subscription.userId || !subscription.nextBillingDate || subscription.cancelAtPeriodEnd) {
      continue;
    }

    const daysLeft = wholeDaysBetween(new Date(subscription.nextBillingDate));

    if (daysLeft > 3 || daysLeft < 1) {
      continue;
    }

    await createUserNotification(subscription.userId, {
      type: "billing",
      category: "billing",
      title: `Subscription renews in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
      message: `Your ${subscription.plan} subscription will renew soon. Please make sure your billing details are up to date.`,
      action: {
        label: "Manage billing",
        url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/settings`,
      },
    }, {
      sendEmail: true,
      dedupeWindowMinutes: 1440,
    });
  }
};

export const runSubscriptionNotificationCycle = async () => {
  try {
    await Promise.all([
      sendTrialReminders(),
      sendRenewalReminders(),
    ]);
  } catch (error) {
    console.error("Subscription notification cycle failed:", error.message);
  }
};

export const startSubscriptionNotificationJob = () => {
  if (jobStarted) {
    return;
  }

  jobStarted = true;

  setTimeout(() => {
    runSubscriptionNotificationCycle();
  }, 10 * 1000);

  setInterval(() => {
    runSubscriptionNotificationCycle();
  }, 6 * 60 * 60 * 1000);
};
