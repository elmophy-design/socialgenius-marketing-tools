import { processScheduledPostsCycle } from '../controllers/socialAuthController.js';

let jobStarted = false;

export const runSocialPublishingCycle = async () => {
  try {
    await processScheduledPostsCycle();
  } catch (error) {
    console.error('Social publishing cycle failed:', error.message);
  }
};

export const startSocialPublishingJob = () => {
  if (jobStarted) {
    return;
  }

  jobStarted = true;

  setTimeout(() => {
    runSocialPublishingCycle();
  }, 15 * 1000);

  setInterval(() => {
    runSocialPublishingCycle();
  }, 60 * 1000);
};
