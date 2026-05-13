import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import {
  initiateMetaConnect,
  initiateLinkedInConnect,
  initiateTwitterConnect,
  initiateTikTokConnect,
  initiatePinterestConnect,
  initiateYouTubeConnect,
  handleMetaCallback,
  handleMetaDeauthorize,
  handleMetaDeleteData,
  getMetaDeleteDataStatus,
  handleLinkedInCallback,
  handleTwitterCallback,
  handleTikTokCallback,
  handlePinterestCallback,
  handleYouTubeCallback,
  getConnections,
  disconnectAccount,
  publishPost,
  schedulePost,
  getScheduledPosts,
  deleteScheduledPost,
  retryScheduledPost,
} from '../controllers/socialAuthController.js';

const router = express.Router();

const hasMetaCredentials = () => Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
const hasLinkedInCredentials = () => Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
const hasTwitterCredentials = () => Boolean(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET);
const hasTikTokCredentials = () => Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
const hasPinterestCredentials = () => Boolean(process.env.PINTEREST_CLIENT_ID && process.env.PINTEREST_CLIENT_SECRET);
const hasYouTubeCredentials = () =>
  Boolean(
    (process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_OAUTH_CLIENT_ID) &&
    (process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_OAUTH_CLIENT_SECRET)
  );

const createProviderDescriptor = ({
  platform,
  provider,
  live,
  isPublishReady,
  supportsConnection = true,
  supportsPublishing = true,
  supportsScheduling = true,
  status,
  statusMessage,
  notes = []
}) => ({
  platform,
  provider,
  live,
  supportsConnection,
  supportsPublishing,
  supportsScheduling,
  isPublishReady,
  status,
  statusMessage,
  notes
});

router.get('/connect/meta', authenticateToken, asyncHandler(initiateMetaConnect));
router.get('/connect/linkedin', authenticateToken, asyncHandler(initiateLinkedInConnect));
router.get('/connect/twitter', authenticateToken, asyncHandler(initiateTwitterConnect));
router.get('/connect/tiktok', authenticateToken, asyncHandler(initiateTikTokConnect));
router.get('/connect/pinterest', authenticateToken, asyncHandler(initiatePinterestConnect));
router.get('/connect/youtube', authenticateToken, asyncHandler(initiateYouTubeConnect));
router.get('/meta/callback', asyncHandler(handleMetaCallback));
router.post('/meta/deauthorize', asyncHandler(handleMetaDeauthorize));
router.post('/meta/delete-data', asyncHandler(handleMetaDeleteData));
router.get('/meta/delete-data/status', asyncHandler(getMetaDeleteDataStatus));
router.get('/linkedin/callback', asyncHandler(handleLinkedInCallback));
router.get('/twitter/callback', asyncHandler(handleTwitterCallback));
router.get('/tiktok/callback', asyncHandler(handleTikTokCallback));
router.get('/pinterest/callback', asyncHandler(handlePinterestCallback));
router.get('/youtube/callback', asyncHandler(handleYouTubeCallback));
router.get('/connections', authenticateToken, asyncHandler(getConnections));
router.delete('/connections/:platform/:accountId', authenticateToken, asyncHandler(disconnectAccount));
router.post('/publish', authenticateToken, asyncHandler(publishPost));
router.post('/schedule', authenticateToken, asyncHandler(schedulePost));
router.get('/scheduled', authenticateToken, asyncHandler(getScheduledPosts));
router.delete('/scheduled/:jobId', authenticateToken, asyncHandler(deleteScheduledPost));
router.post('/scheduled/:jobId/retry', authenticateToken, asyncHandler(retryScheduledPost));

router.get('/providers', authenticateToken, (req, res) => {
  const metaReady = hasMetaCredentials();
  const linkedInReady = hasLinkedInCredentials();
  const twitterReady = hasTwitterCredentials();
  const tikTokReady = hasTikTokCredentials();
  const pinterestReady = hasPinterestCredentials();
  const youTubeReady = hasYouTubeCredentials();

  res.json({
    success: true,
    data: [
      createProviderDescriptor({
        platform: 'facebook',
        provider: 'meta',
        live: metaReady,
        isPublishReady: metaReady,
        status: metaReady ? 'live-publishing-ready' : 'credentials-missing',
        statusMessage: metaReady
          ? 'Live Publishing Ready'
          : 'Credentials Missing',
        notes: metaReady ? ['Pages posting enabled through Meta OAuth.'] : []
      }),
      createProviderDescriptor({
        platform: 'instagram',
        provider: 'meta',
        live: metaReady,
        isPublishReady: metaReady,
        status: metaReady ? 'live-publishing-ready' : 'credentials-missing',
        statusMessage: metaReady
          ? 'Business Publishing Ready'
          : 'Credentials Missing',
        notes: metaReady
          ? ['Requires an Instagram business account linked to a Facebook page.']
          : []
      }),
      createProviderDescriptor({
        platform: 'linkedin',
        provider: 'linkedin',
        live: linkedInReady,
        isPublishReady: linkedInReady,
        status: linkedInReady ? 'live-publishing-ready' : 'credentials-missing',
        statusMessage: linkedInReady
          ? 'Live Publishing Ready'
          : 'Credentials Missing',
      }),
      createProviderDescriptor({
        platform: 'twitter',
        provider: 'x',
        live: twitterReady,
        isPublishReady: twitterReady,
        status: twitterReady ? 'live-publishing-ready' : 'credentials-missing',
        statusMessage: twitterReady
          ? 'Live Publishing Ready'
          : 'Credentials Missing',
      }),
      createProviderDescriptor({
        platform: 'tiktok',
        provider: 'tiktok',
        live: tikTokReady,
        isPublishReady: false,
        status: tikTokReady ? 'approval-required' : 'credentials-missing',
        statusMessage: tikTokReady
          ? 'Publishing Approval Required'
          : 'Credentials Missing',
        notes: tikTokReady
          ? [
              'TikTok direct posting requires Content Posting API product approval.',
              'Unaudited apps may be restricted to private visibility.'
            ]
          : []
      }),
      createProviderDescriptor({
        platform: 'pinterest',
        provider: 'pinterest',
        live: pinterestReady,
        isPublishReady: pinterestReady,
        status: pinterestReady ? 'live-publishing-ready' : 'credentials-missing',
        statusMessage: pinterestReady
          ? 'Live Publishing Ready'
          : 'Credentials Missing',
      }),
      createProviderDescriptor({
        platform: 'youtube',
        provider: 'youtube',
        live: youTubeReady,
        isPublishReady: youTubeReady,
        status: youTubeReady ? 'live-publishing-ready' : 'credentials-missing',
        statusMessage: youTubeReady
          ? 'Video Upload Ready'
          : 'Credentials Missing',
        notes: youTubeReady
          ? [
              'Uses Google OAuth credentials if dedicated YouTube credentials are not set.',
              'Uploads are sent through the YouTube resumable upload API.'
            ]
          : []
      }),
    ],
  });
});

export default router;
