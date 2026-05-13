/**
 * backend/src/controllers/socialAuthController.js
 * Meta (Facebook + Instagram) OAuth Connect/Callback/Publish/Schedule
 */

import axios from 'axios';
import crypto from 'crypto';
import User from '../models/User.js';
import { createUserNotification } from '../utils/notificationHelper.js';

const FRONTEND_URL = () => process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = () => process.env.BACKEND_URL || 'http://localhost:4000';
const META_APP_ID = () => process.env.META_APP_ID || process.env.FACEBOOK_APP_ID;
const META_APP_SECRET = () => process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET;
const META_REDIRECT_URI = () =>
  process.env.META_REDIRECT_URI || `${BACKEND_URL()}/api/social/meta/callback`;
const LINKEDIN_CLIENT_ID = () => process.env.LINKEDIN_CLIENT_ID || process.env.LINKEDIN_APP_ID;
const LINKEDIN_CLIENT_SECRET = () => process.env.LINKEDIN_CLIENT_SECRET || process.env.LINKEDIN_APP_SECRET;
const LINKEDIN_REDIRECT_URI = () =>
  process.env.LINKEDIN_REDIRECT_URI || `${BACKEND_URL()}/api/social/linkedin/callback`;
const LINKEDIN_VERSION = () => process.env.LINKEDIN_VERSION || '202504';
const TWITTER_CLIENT_ID = () => process.env.TWITTER_CLIENT_ID || process.env.X_CLIENT_ID;
const TWITTER_CLIENT_SECRET = () => process.env.TWITTER_CLIENT_SECRET || process.env.X_CLIENT_SECRET;
const TWITTER_REDIRECT_URI = () =>
  process.env.TWITTER_REDIRECT_URI || `${BACKEND_URL()}/api/social/twitter/callback`;
const TIKTOK_CLIENT_KEY = () => process.env.TIKTOK_CLIENT_KEY || process.env.TIKTOK_CLIENT_ID;
const TIKTOK_CLIENT_SECRET = () => process.env.TIKTOK_CLIENT_SECRET;
const TIKTOK_REDIRECT_URI = () =>
  process.env.TIKTOK_REDIRECT_URI || `${BACKEND_URL()}/api/social/tiktok/callback`;
const PINTEREST_CLIENT_ID = () => process.env.PINTEREST_CLIENT_ID || process.env.PINTEREST_APP_ID;
const PINTEREST_CLIENT_SECRET = () => process.env.PINTEREST_CLIENT_SECRET || process.env.PINTEREST_APP_SECRET;
const PINTEREST_REDIRECT_URI = () =>
  process.env.PINTEREST_REDIRECT_URI || `${BACKEND_URL()}/api/social/pinterest/callback`;
const YOUTUBE_CLIENT_ID = () => process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_OAUTH_CLIENT_ID;
const YOUTUBE_CLIENT_SECRET = () => process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const YOUTUBE_REDIRECT_URI = () =>
  process.env.YOUTUBE_REDIRECT_URI || `${BACKEND_URL()}/api/social/youtube/callback`;

const META_DELETE_STATUS_URL = (code) =>
  `${BACKEND_URL()}/api/social/meta/delete-data/status?code=${encodeURIComponent(code)}`;

// ─── Helper: Encrypt / Decrypt tokens at rest ────────────────────────────────
const ENC_KEY = () => {
  const k = process.env.TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET || 'fallback-32-char-encryption-key!!';
  return Buffer.from(k.padEnd(32, '0').slice(0, 32));
};

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

const decrypt = (text) => {
  if (!text || !text.includes(':')) return text;
  const [ivHex, encHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY(), iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
};

const encodeState = (payload) => Buffer.from(JSON.stringify({ ...payload, ts: Date.now() })).toString('base64url');

const decodeState = (state) => {
  const parsed = JSON.parse(Buffer.from(state, 'base64url').toString());
  if (Date.now() - parsed.ts > 10 * 60 * 1000) {
    throw new Error('state_expired');
  }
  return parsed;
};

const base64UrlDecode = (value = '') => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (normalized.length % 4 || 4)) % 4;
  return Buffer.from(`${normalized}${'='.repeat(padding)}`, 'base64');
};

const verifyAndParseMetaSignedRequest = (signedRequest) => {
  if (!signedRequest || typeof signedRequest !== 'string' || !signedRequest.includes('.')) {
    throw new Error('Missing signed_request');
  }

  const [encodedSignature, encodedPayload] = signedRequest.split('.', 2);
  const payloadBuffer = base64UrlDecode(encodedPayload);
  const payload = JSON.parse(payloadBuffer.toString('utf8'));

  if (payload.algorithm !== 'HMAC-SHA256') {
    throw new Error('Unsupported signed_request algorithm');
  }

  const appSecret = META_APP_SECRET();
  if (!appSecret) {
    throw new Error('META_APP_SECRET is not configured');
  }

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(encodedPayload)
    .digest();
  const receivedSignature = base64UrlDecode(encodedSignature);

  if (
    expectedSignature.length !== receivedSignature.length ||
    !crypto.timingSafeEqual(expectedSignature, receivedSignature)
  ) {
    throw new Error('Invalid signed_request signature');
  }

  return payload;
};

const getMetaSignedRequest = (req) =>
  req.body?.signed_request || req.query?.signed_request || req.body?.signedRequest || '';

const getMetaDeletionRequestsFromUser = (user) => user?.metadata?.get?.('metaDeletionRequests') || [];

const setMetaDeletionRequestsOnUser = (user, requests) => {
  user.metadata = user.metadata || new Map();
  user.metadata.set('metaDeletionRequests', requests);
  user.markModified('metadata');
};

const removeMetaConnectionsFromUser = (user, metaUserId) => {
  const beforeCount = user.connectedAccounts?.length || 0;

  user.connectedAccounts = (user.connectedAccounts || []).filter((account) => {
    if (account.provider !== 'meta') {
      return true;
    }

    if (account.platform === 'instagram') {
      return false;
    }

    if (account.platform === 'facebook') {
      return account.accountId !== metaUserId;
    }

    return true;
  });

  user.stats.connectedAccounts = user.connectedAccounts.length;

  if (user.facebookId && String(user.facebookId) === String(metaUserId)) {
    user.facebookId = null;
  }

  if (user.metadata?.get?.('metaPages')) {
    user.metadata.delete('metaPages');
    user.markModified('metadata');
  }

  return beforeCount - user.connectedAccounts.length;
};

const findUsersForMetaUserId = async (metaUserId) =>
  User.find({
    $or: [
      { facebookId: metaUserId },
      {
        connectedAccounts: {
          $elemMatch: {
            provider: 'meta',
            platform: 'facebook',
            accountId: metaUserId
          }
        }
      }
    ]
  }).select('+connectedAccounts metadata facebookId stats');

const getScheduledPostsFromUser = (user) => user?.metadata?.get?.('scheduledPosts') || [];

const setScheduledPostsOnUser = (user, posts) => {
  user.metadata = user.metadata || new Map();
  user.metadata.set('scheduledPosts', posts);
  user.markModified('metadata');
};

const getOAuthStateStore = (user) => user?.metadata?.get?.('socialOauthStates') || {};

const setOAuthStateStore = (user, value) => {
  user.metadata = user.metadata || new Map();
  user.metadata.set('socialOauthStates', value);
  user.markModified('metadata');
};

const createPkceChallenge = (verifier) =>
  crypto.createHash('sha256').update(verifier).digest('base64url');

const VIDEO_MIME_TYPES = {
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.m4v': 'video/x-m4v',
  '.webm': 'video/webm',
  '.avi': 'video/x-msvideo',
  '.mkv': 'video/x-matroska'
};

const getVideoMimeType = (url = '', headerValue = '') => {
  if (headerValue && headerValue.startsWith('video/')) {
    return headerValue.split(';')[0].trim();
  }

  const normalizedUrl = url.toLowerCase().split('?')[0];
  const matchedExtension = Object.keys(VIDEO_MIME_TYPES).find((extension) => normalizedUrl.endsWith(extension));
  return matchedExtension ? VIDEO_MIME_TYPES[matchedExtension] : '';
};

const buildYouTubeUploadMetadata = (content = '') => {
  const cleanContent = String(content || '').trim();
  const hashtags = Array.from(
    new Set(
      (cleanContent.match(/#[A-Za-z0-9_]+/g) || []).map((tag) => tag.replace(/^#/, ''))
    )
  ).slice(0, 10);

  const title = cleanContent
    .replace(/\s+/g, ' ')
    .replace(/[#@]/g, '')
    .slice(0, 100)
    .trim() || 'SocialGenius Upload';

  return {
    snippet: {
      title,
      description: cleanContent,
      tags: hashtags,
      categoryId: '22'
    },
    status: {
      privacyStatus: 'private',
      selfDeclaredMadeForKids: false
    }
  };
};

const refreshSocialToken = async (account) => {
  const { platform, provider } = account;
  const refreshToken = decrypt(account.refreshToken);

  if (!refreshToken) {
    throw new Error(`No refresh token available for ${platform}`);
  }

  if (platform === 'twitter' || provider === 'x') {
    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: TWITTER_CLIENT_ID(),
    });

    const basicAuth = Buffer.from(`${TWITTER_CLIENT_ID()}:${TWITTER_CLIENT_SECRET()}`).toString('base64');
    const tokenRes = await axios.post('https://api.x.com/2/oauth2/token', tokenParams.toString(), {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return {
      accessToken: tokenRes.data.access_token,
      refreshToken: tokenRes.data.refresh_token,
    };
  }

  if (platform === 'tiktok') {
    const tokenPayload = new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY(),
      client_secret: TIKTOK_CLIENT_SECRET(),
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const tokenRes = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', tokenPayload.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return {
      accessToken: tokenRes.data.access_token,
      refreshToken: tokenRes.data.refresh_token,
    };
  }

  if (platform === 'pinterest') {
    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const auth = Buffer.from(`${PINTEREST_CLIENT_ID()}:${PINTEREST_CLIENT_SECRET()}`).toString('base64');
    const tokenRes = await axios.post('https://api.pinterest.com/v5/oauth/token', tokenParams.toString(), {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return {
      accessToken: tokenRes.data.access_token,
      refreshToken: tokenRes.data.refresh_token,
    };
  }

  if (platform === 'youtube') {
    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: YOUTUBE_CLIENT_ID(),
      client_secret: YOUTUBE_CLIENT_SECRET(),
    });

    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', tokenParams.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return {
      accessToken: tokenRes.data.access_token,
      refreshToken: tokenRes.data.refresh_token || refreshToken, // Google might not return new refresh token
    };
  }

  throw new Error(`Token refresh not implemented for ${platform}`);
};

const publishConnectedAccountPost = async (account, { platform, accountId, content, imageUrl, link }, onTokenRefresh) => {
  let rawToken = decrypt(account.accessToken);

  try {
    if (platform === 'facebook') {
      const pageId = account.pageId || accountId;
      const body = { message: content, access_token: rawToken };
      if (link) body.link = link;

      const fbRes = await axios.post(`https://graph.facebook.com/v20.0/${pageId}/feed`, body);
      return { postId: fbRes.data.id };
    }

    if (platform === 'instagram') {
      const igUserId = accountId;
      const pageToken = rawToken;
      const containerPayload = {
        caption: content,
        access_token: pageToken
      };

      if (!imageUrl) {
        throw new Error('Instagram requires an imageUrl for publishing.');
      }

      containerPayload.image_url = imageUrl;
      containerPayload.media_type = 'IMAGE';

      const containerRes = await axios.post(
        `https://graph.facebook.com/v20.0/${igUserId}/media`,
        containerPayload
      );

      const publishRes = await axios.post(
        `https://graph.facebook.com/v20.0/${igUserId}/media_publish`,
        { creation_id: containerRes.data.id, access_token: pageToken }
      );

      return { postId: publishRes.data.id };
    }

    if (platform === 'linkedin') {
      const authorUrn = account.authorUrn || `urn:li:person:${accountId}`;
      const payload = {
        author: authorUrn,
        commentary: content,
        visibility: 'PUBLIC',
        lifecycleState: 'PUBLISHED',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        isReshareDisabledByAuthor: false,
      };

      const linkedInRes = await axios.post('https://api.linkedin.com/rest/posts', payload, {
        headers: {
          Authorization: `Bearer ${rawToken}`,
          'Content-Type': 'application/json',
          'Linkedin-Version': LINKEDIN_VERSION(),
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      return {
        postId: linkedInRes.headers['x-restli-id'] || linkedInRes.data?.id || null,
      };
    }

    if (platform === 'twitter') {
      try {
        const twitterRes = await axios.post(
          'https://api.x.com/2/tweets',
          { text: content },
          {
            headers: {
              Authorization: `Bearer ${rawToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        return {
          postId: twitterRes.data?.data?.id || null,
          text: twitterRes.data?.data?.text || content,
        };
      } catch (err) {
        if (err.response?.status === 401 && onTokenRefresh) {
          const newTokens = await refreshSocialToken(account);
          rawToken = newTokens.accessToken;
          await onTokenRefresh(newTokens);

          // Retry with new token
          const twitterRes = await axios.post(
            'https://api.x.com/2/tweets',
            { text: content },
            {
              headers: {
                Authorization: `Bearer ${rawToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          return {
            postId: twitterRes.data?.data?.id || null,
            text: twitterRes.data?.data?.text || content,
          };
        }
        throw err;
      }
    }

    if (platform === 'tiktok') {
      try {
        // TikTok Publishing API v2
        // Note: This is an initialization step. The actual media must be accessible via public URL.
        const isVideo = imageUrl && (imageUrl.endsWith('.mp4') || imageUrl.endsWith('.mov'));
        const endpoint = isVideo 
          ? 'https://open.tiktokapis.com/v2/post/publish/video/init/'
          : 'https://open.tiktokapis.com/v2/post/publish/content/init/';
        
        const payload = {
          post_info: {
            title: content.slice(0, 100), // TikTok title limit
            description: content,
          },
          source_info: {
            source: 'PULL_FROM_URL',
            video_url: isVideo ? imageUrl : undefined,
            photo_cover_index: isVideo ? 0 : undefined,
            photo_images: !isVideo ? [imageUrl] : undefined,
          }
        };

        const tiktokRes = await axios.post(endpoint, payload, {
          headers: {
            Authorization: `Bearer ${rawToken}`,
            'Content-Type': 'application/json',
          },
        });

        return {
          publishId: tiktokRes.data?.data?.publish_id || null,
          status: 'initiated'
        };
      } catch (err) {
        if (err.response?.status === 401 && onTokenRefresh) {
          const newTokens = await refreshSocialToken(account);
          rawToken = newTokens.accessToken;
          await onTokenRefresh(newTokens);

          // Retry
          const isVideo = imageUrl && (imageUrl.endsWith('.mp4') || imageUrl.endsWith('.mov'));
          const endpoint = isVideo 
            ? 'https://open.tiktokapis.com/v2/post/publish/video/init/'
            : 'https://open.tiktokapis.com/v2/post/publish/content/init/';
          
          const payload = {
            post_info: {
              title: content.slice(0, 100),
              description: content,
            },
            source_info: {
              source: 'PULL_FROM_URL',
              video_url: isVideo ? imageUrl : undefined,
              photo_cover_index: isVideo ? 0 : undefined,
              photo_images: !isVideo ? [imageUrl] : undefined,
            }
          };

          const tiktokRes = await axios.post(endpoint, payload, {
            headers: {
              Authorization: `Bearer ${rawToken}`,
              'Content-Type': 'application/json',
            },
          });

          return {
            publishId: tiktokRes.data?.data?.publish_id || null,
            status: 'initiated'
          };
        }
        throw err;
      }
    }

    if (platform === 'pinterest') {
      const publishPin = async (token) => {
        // First get boards to pick one (or use a default)
        const boardsRes = await axios.get('https://api.pinterest.com/v5/boards', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const boardId = boardsRes.data?.items?.[0]?.id;
        if (!boardId) throw new Error('No Pinterest boards found to pin to.');

        const pinRes = await axios.post('https://api.pinterest.com/v5/pins', {
          title: content.slice(0, 100),
          description: content,
          board_id: boardId,
          media_source: {
            source_type: 'image_url',
            url: imageUrl
          },
          link: link || undefined
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        return { postId: pinRes.data.id };
      };

      try {
        return await publishPin(rawToken);
      } catch (err) {
        if (err.response?.status === 401 && onTokenRefresh) {
          const newTokens = await refreshSocialToken(account);
          rawToken = newTokens.accessToken;
          await onTokenRefresh(newTokens);
          return await publishPin(rawToken);
        }
        throw err;
      }
    }

    if (platform === 'youtube') {
      const publishVideo = async (token) => {
        if (!imageUrl) {
          throw new Error('YouTube publishing requires a public video URL.');
        }

        const mediaRes = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 120000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        });

        const mimeType = getVideoMimeType(imageUrl, mediaRes.headers?.['content-type'] || '');
        if (!mimeType) {
          throw new Error('YouTube publishing requires a valid public video URL such as an MP4 or MOV file.');
        }

        const videoBuffer = Buffer.from(mediaRes.data);
        const metadata = buildYouTubeUploadMetadata(content);

        const initUploadRes = await axios.post(
          'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
          metadata,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json; charset=UTF-8',
              'X-Upload-Content-Length': String(videoBuffer.length),
              'X-Upload-Content-Type': mimeType
            },
            maxBodyLength: Infinity,
            validateStatus: (status) => status >= 200 && status < 400
          }
        );

        const uploadUrl = initUploadRes.headers?.location;
        if (!uploadUrl) {
          throw new Error('YouTube upload session could not be created.');
        }

        const uploadRes = await axios.put(uploadUrl, videoBuffer, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': mimeType,
            'Content-Length': videoBuffer.length
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        });

        return {
          postId: uploadRes.data?.id || null,
          videoId: uploadRes.data?.id || null,
          videoUrl: uploadRes.data?.id ? `https://www.youtube.com/watch?v=${uploadRes.data.id}` : null,
          privacyStatus: uploadRes.data?.status?.privacyStatus || 'private'
        };
      };

      try {
        return await publishVideo(rawToken);
      } catch (err) {
        if (err.response?.status === 401 && onTokenRefresh) {
          const newTokens = await refreshSocialToken(account);
          rawToken = newTokens.accessToken;
          await onTokenRefresh(newTokens);
          return await publishVideo(rawToken);
        }
        throw err;
      }
    }

    throw new Error(`Direct publishing for ${platform} is not supported yet`);
  } catch (err) {
    throw err;
  }
};

// ─── Step 1: Redirect user to Meta OAuth dialog ───────────────────────────────
export const initiateMetaConnect = async (req, res) => {
  try {
    if (!META_APP_ID()) {
      return res.status(503).json({
        success: false,
        message: 'Meta app credentials are not configured. Set META_APP_ID and META_APP_SECRET.'
      });
    }

    // State encodes userId for CSRF protection
    const userId = req.user.id || req.user._id;
    const state = encodeState({ userId: String(userId), provider: 'meta' });

    const scopes = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'instagram_basic',
      'instagram_content_publish',
      'public_profile',
      'email'
    ].join(',');

    const params = new URLSearchParams({
      client_id: META_APP_ID(),
      redirect_uri: META_REDIRECT_URI(),
      scope: scopes,
      response_type: 'code',
      state
    });

    const url = `https://www.facebook.com/v20.0/dialog/oauth?${params}`;
    return res.json({ success: true, redirectUrl: url });
  } catch (err) {
    console.error('Meta connect initiate error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const initiateLinkedInConnect = async (req, res) => {
  try {
    if (!LINKEDIN_CLIENT_ID() || !LINKEDIN_CLIENT_SECRET()) {
      return res.status(503).json({
        success: false,
        message: 'LinkedIn app credentials are not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET.',
      });
    }

    const userId = req.user.id || req.user._id;
    const state = encodeState({ userId: String(userId), provider: 'linkedin' });
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: LINKEDIN_CLIENT_ID(),
      redirect_uri: LINKEDIN_REDIRECT_URI(),
      state,
      scope: 'openid profile email w_member_social',
    });

    return res.json({
      success: true,
      redirectUrl: `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`,
    });
  } catch (err) {
    console.error('LinkedIn connect initiate error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const initiateTwitterConnect = async (req, res) => {
  try {
    if (!TWITTER_CLIENT_ID() || !TWITTER_CLIENT_SECRET()) {
      return res.status(503).json({
        success: false,
        message: 'Twitter/X app credentials are not configured. Set TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET.',
      });
    }

    const userId = req.user.id || req.user._id;
    const state = encodeState({ userId: String(userId), provider: 'twitter' });
    const codeVerifier = crypto.randomBytes(48).toString('base64url');
    const codeChallenge = createPkceChallenge(codeVerifier);

    const user = await User.findById(userId).select('metadata');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oauthStates = getOAuthStateStore(user);
    oauthStates[state] = {
      provider: 'twitter',
      codeVerifier,
      createdAt: new Date().toISOString(),
    };
    setOAuthStateStore(user, oauthStates);
    await user.save();

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: TWITTER_CLIENT_ID(),
      redirect_uri: TWITTER_REDIRECT_URI(),
      scope: 'tweet.read tweet.write users.read offline.access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    return res.json({
      success: true,
      redirectUrl: `https://x.com/i/oauth2/authorize?${params.toString()}`,
    });
  } catch (err) {
    console.error('Twitter connect initiate error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const initiateTikTokConnect = async (req, res) => {
  try {
    if (!TIKTOK_CLIENT_KEY() || !TIKTOK_CLIENT_SECRET()) {
      return res.status(503).json({
        success: false,
        message: 'TikTok app credentials are not configured. Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET.',
      });
    }

    const userId = req.user.id || req.user._id;
    const state = encodeState({ userId: String(userId), provider: 'tiktok' });

    const params = new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY(),
      response_type: 'code',
      scope: 'user.info.basic,video.publish,video.upload',
      redirect_uri: TIKTOK_REDIRECT_URI(),
      state,
    });

    return res.json({
      success: true,
      redirectUrl: `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`,
    });
  } catch (err) {
    console.error('TikTok connect initiate error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const initiatePinterestConnect = async (req, res) => {
  try {
    if (!PINTEREST_CLIENT_ID() || !PINTEREST_CLIENT_SECRET()) {
      return res.status(503).json({
        success: false,
        message: 'Pinterest app credentials not configured.',
      });
    }

    const userId = req.user.id || req.user._id;
    const state = encodeState({ userId: String(userId), provider: 'pinterest' });
    const params = new URLSearchParams({
      client_id: PINTEREST_CLIENT_ID(),
      redirect_uri: PINTEREST_REDIRECT_URI(),
      response_type: 'code',
      scope: 'boards:read,pins:read,pins:write,user_accounts:read',
      state,
    });

    return res.json({
      success: true,
      redirectUrl: `https://www.pinterest.com/oauth/?${params.toString()}`,
    });
  } catch (err) {
    console.error('Pinterest connect initiate error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const initiateYouTubeConnect = async (req, res) => {
  try {
    if (!YOUTUBE_CLIENT_ID() || !YOUTUBE_CLIENT_SECRET()) {
      return res.status(503).json({
        success: false,
        message: 'YouTube/Google app credentials not configured.',
      });
    }

    const userId = req.user.id || req.user._id;
    const state = encodeState({ userId: String(userId), provider: 'youtube' });
    const params = new URLSearchParams({
      client_id: YOUTUBE_CLIENT_ID(),
      redirect_uri: YOUTUBE_REDIRECT_URI(),
      response_type: 'code',
      scope: 'openid profile email https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return res.json({
      success: true,
      redirectUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    });
  } catch (err) {
    console.error('YouTube connect initiate error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Step 2: Handle OAuth callback ───────────────────────────────────────────
export const handleMetaCallback = async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=meta_auth_denied`);
    }

    if (!code || !state) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=meta_missing_params`);
    }

    let stateData;
    try {
      stateData = decodeState(state);
    } catch {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=meta_invalid_state`);
    }
    const { userId } = stateData;

    // Exchange code for access token
    const tokenRes = await axios.get('https://graph.facebook.com/v20.0/oauth/access_token', {
      params: {
        client_id: META_APP_ID(),
        client_secret: META_APP_SECRET(),
        redirect_uri: META_REDIRECT_URI(),
        code
      }
    });

    const { access_token: shortLivedToken } = tokenRes.data;

    // Exchange for long-lived token
    const longLivedRes = await axios.get('https://graph.facebook.com/v20.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: META_APP_ID(),
        client_secret: META_APP_SECRET(),
        fb_exchange_token: shortLivedToken
      }
    });

    const { access_token: longLivedToken } = longLivedRes.data;

    // Get user profile
    const profileRes = await axios.get('https://graph.facebook.com/v20.0/me', {
      params: {
        fields: 'id,name,email,picture',
        access_token: longLivedToken
      }
    });

    const metaProfile = profileRes.data;

    // Get connected Facebook pages
    const pagesRes = await axios.get('https://graph.facebook.com/v20.0/me/accounts', {
      params: { access_token: longLivedToken }
    });
    const pages = pagesRes.data?.data || [];

    const user = await User.findById(userId).select('+connectedAccounts');
    if (!user) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=meta_user_not_found`);
    }

    // Save/update Facebook personal account connection
    await upsertConnectedAccount(user, {
      platform: 'facebook',
      accountId: metaProfile.id,
      accountName: metaProfile.name,
      username: `@${metaProfile.name?.toLowerCase().replace(/\s+/g, '') || metaProfile.id}`,
      accessToken: encrypt(longLivedToken),
      profileUrl: `https://facebook.com/${metaProfile.id}`,
      profilePicture: metaProfile.picture?.data?.url || null,
      status: 'active',
      provider: 'meta'
    });

    user.facebookId = metaProfile.id;

    // Save each Page as a separate connectable entity (stored in user meta)
    const pageTokens = {};
    for (const page of pages) {
      pageTokens[page.id] = {
        name: page.name,
        token: encrypt(page.access_token),
        category: page.category
      };
    }

    // Try to get Instagram Business account linked to first page
    if (pages.length > 0) {
      try {
        const igRes = await axios.get(`https://graph.facebook.com/v20.0/${pages[0].id}`, {
          params: {
            fields: 'instagram_business_account',
            access_token: pages[0].access_token
          }
        });

        const igAccount = igRes.data?.instagram_business_account;

        if (igAccount?.id) {
          // Get Instagram profile info
          const igProfileRes = await axios.get(`https://graph.facebook.com/v20.0/${igAccount.id}`, {
            params: {
              fields: 'id,name,username,followers_count,profile_picture_url',
              access_token: pages[0].access_token
            }
          });

          const igProfile = igProfileRes.data;

          await upsertConnectedAccount(user, {
            platform: 'instagram',
            accountId: igAccount.id,
            accountName: igProfile.name || igProfile.username,
            username: `@${igProfile.username || igAccount.id}`,
            followers: igProfile.followers_count || 0,
            // Instagram publishes via page token
            accessToken: encrypt(pages[0].access_token),
            pageId: pages[0].id,
            profilePicture: igProfile.profile_picture_url || null,
            status: 'active',
            provider: 'meta'
          });
        }
      } catch (igErr) {
        console.warn('Instagram account fetch warning:', igErr.message);
      }
    }

    // Save page tokens on user metadata
    user.metadata = user.metadata || new Map();
    user.metadata.set('metaPages', pageTokens);
    user.stats.connectedAccounts = user.connectedAccounts.length;
    user.markModified('metadata');
    await user.save();

    await createUserNotification(userId, {
      type: 'success',
      category: 'social-connection',
      title: 'Meta accounts connected',
      message: `Facebook${pages.length > 0 ? ` (${pages.length} page${pages.length > 1 ? 's' : ''})` : ''} and Instagram are now linked to your workspace.`,
      action: {
        label: 'Open Social Media Generator',
        url: `${FRONTEND_URL()}/tools/social-media`
      }
    }, { sendEmail: false, dedupeWindowMinutes: 10 });

    return res.redirect(`${FRONTEND_URL()}/tools/social-media?connected=meta`);
  } catch (err) {
    console.error('Meta callback error:', err?.response?.data || err);
    return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=meta_callback_failed`);
  }
};

export const handleMetaDeauthorize = async (req, res) => {
  try {
    const signedRequest = getMetaSignedRequest(req);
    const payload = verifyAndParseMetaSignedRequest(signedRequest);
    const metaUserId = payload.user_id;

    if (!metaUserId) {
      return res.status(400).json({ success: false, message: 'Missing Meta user_id' });
    }

    const users = await findUsersForMetaUserId(metaUserId);
    for (const user of users) {
      removeMetaConnectionsFromUser(user, metaUserId);
      await user.save();
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Meta deauthorize error:', err.message || err);
    return res.status(400).json({ success: false, message: 'Invalid deauthorize request' });
  }
};

export const handleMetaDeleteData = async (req, res) => {
  try {
    const signedRequest = getMetaSignedRequest(req);
    const payload = verifyAndParseMetaSignedRequest(signedRequest);
    const metaUserId = payload.user_id;

    if (!metaUserId) {
      return res.status(400).json({ success: false, message: 'Missing Meta user_id' });
    }

    const confirmationCode = crypto.randomBytes(12).toString('hex');
    const users = await findUsersForMetaUserId(metaUserId);

    for (const user of users) {
      removeMetaConnectionsFromUser(user, metaUserId);
      const requests = getMetaDeletionRequestsFromUser(user);
      requests.push({
        code: confirmationCode,
        requestedAt: new Date(),
        status: 'completed',
        provider: 'meta',
        metaUserId
      });
      setMetaDeletionRequestsOnUser(user, requests);
      await user.save();
    }

    return res.status(200).json({
      url: META_DELETE_STATUS_URL(confirmationCode),
      confirmation_code: confirmationCode
    });
  } catch (err) {
    console.error('Meta delete data error:', err.message || err);
    return res.status(400).json({ success: false, message: 'Invalid deletion request' });
  }
};

export const getMetaDeleteDataStatus = async (req, res) => {
  const code = String(req.query.code || '').trim();

  if (!code) {
    return res.status(400).send('Missing deletion confirmation code.');
  }

  return res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Meta Data Deletion Status</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f7fafc; color: #1f2937; margin: 0; padding: 32px; }
          .card { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08); }
          h1 { margin-top: 0; color: #0f172a; }
          .code { display: inline-block; margin-top: 12px; padding: 10px 14px; background: #eff6ff; color: #1d4ed8; border-radius: 10px; font-family: Consolas, monospace; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Deletion request received</h1>
          <p>Your Meta/Facebook data deletion request has been processed for this application.</p>
          <p>Confirmation code:</p>
          <div class="code">${code}</div>
        </div>
      </body>
    </html>
  `);
};

export const handleLinkedInCallback = async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=linkedin_auth_denied`);
    }

    if (!code || !state) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=linkedin_missing_params`);
    }

    let stateData;
    try {
      stateData = decodeState(state);
    } catch (error) {
      const codeName = error.message === 'state_expired' ? 'linkedin_state_expired' : 'linkedin_invalid_state';
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=${codeName}`);
    }

    const { userId } = stateData;

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: LINKEDIN_REDIRECT_URI(),
      client_id: LINKEDIN_CLIENT_ID(),
      client_secret: LINKEDIN_CLIENT_SECRET(),
    });

    const tokenRes = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      tokenParams.toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token: accessToken } = tokenRes.data;

    const userInfoRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = userInfoRes.data;
    const user = await User.findById(userId).select('+connectedAccounts');
    if (!user) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=linkedin_user_not_found`);
    }

    const accountId = profile.sub;
    const authorUrn = `urn:li:person:${accountId}`;

    await upsertConnectedAccount(user, {
      platform: 'linkedin',
      accountId,
      accountName: profile.name || [profile.given_name, profile.family_name].filter(Boolean).join(' '),
      username: profile.email ? `@${profile.email.split('@')[0]}` : `@${accountId}`,
      accessToken: encrypt(accessToken),
      profileUrl: 'https://www.linkedin.com/feed/',
      profilePicture: profile.picture || '',
      status: 'active',
      provider: 'linkedin',
      authorUrn,
    });

    user.stats.connectedAccounts = user.connectedAccounts.length;
    await user.save();

    await createUserNotification(userId, {
      type: 'success',
      category: 'social-connection',
      title: 'LinkedIn connected',
      message: 'Your LinkedIn account is now connected and ready for professional content publishing.',
      action: {
        label: 'Open Social Media Generator',
        url: `${FRONTEND_URL()}/tools/social-media`,
      },
    }, { sendEmail: false });

    return res.redirect(`${FRONTEND_URL()}/tools/social-media?connected=linkedin`);
  } catch (err) {
    console.error('LinkedIn callback error:', err?.response?.data || err);
    return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=linkedin_callback_failed`);
  }
};

export const handleTwitterCallback = async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=twitter_auth_denied`);
    }

    if (!code || !state) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=twitter_missing_params`);
    }

    let stateData;
    try {
      stateData = decodeState(state);
    } catch (error) {
      const codeName = error.message === 'state_expired' ? 'twitter_state_expired' : 'twitter_invalid_state';
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=${codeName}`);
    }

    const { userId } = stateData;
    const user = await User.findById(userId).select('+connectedAccounts metadata');
    if (!user) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=twitter_user_not_found`);
    }

    const oauthStates = getOAuthStateStore(user);
    const storedState = oauthStates[state];
    if (!storedState?.codeVerifier) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=twitter_missing_verifier`);
    }

    const tokenParams = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: TWITTER_CLIENT_ID(),
      redirect_uri: TWITTER_REDIRECT_URI(),
      code_verifier: storedState.codeVerifier,
    });

    const basicAuth = Buffer.from(`${TWITTER_CLIENT_ID()}:${TWITTER_CLIENT_SECRET()}`).toString('base64');
    const tokenRes = await axios.post('https://api.x.com/2/oauth2/token', tokenParams.toString(), {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    delete oauthStates[state];
    setOAuthStateStore(user, oauthStates);

    const { access_token: accessToken, refresh_token: refreshToken } = tokenRes.data;
    const profileRes = await axios.get('https://api.x.com/2/users/me?user.fields=profile_image_url,public_metrics,username,name', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = profileRes.data?.data;
    await upsertConnectedAccount(user, {
      platform: 'twitter',
      accountId: profile.id,
      accountName: profile.name || profile.username || 'X Account',
      username: profile.username ? `@${profile.username}` : `@${profile.id}`,
      followers: profile.public_metrics?.followers_count || 0,
      accessToken: encrypt(accessToken),
      refreshToken: refreshToken ? encrypt(refreshToken) : '',
      profileUrl: profile.username ? `https://x.com/${profile.username}` : 'https://x.com',
      profilePicture: profile.profile_image_url || '',
      status: 'active',
      provider: 'x',
    });

    user.stats.connectedAccounts = user.connectedAccounts.length;
    await user.save();

    await createUserNotification(userId, {
      type: 'success',
      category: 'social-connection',
      title: 'X account connected',
      message: 'Your X account is connected and ready for live posting and scheduling.',
      action: {
        label: 'Open Social Media Generator',
        url: `${FRONTEND_URL()}/tools/social-media`,
      },
    }, { sendEmail: false });

    return res.redirect(`${FRONTEND_URL()}/tools/social-media?connected=twitter`);
  } catch (err) {
    console.error('Twitter callback error:', err?.response?.data || err);
    return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=twitter_callback_failed`);
  }
};

export const handleTikTokCallback = async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=tiktok_auth_denied`);
    }

    if (!code || !state) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=tiktok_missing_params`);
    }

    let stateData;
    try {
      stateData = decodeState(state);
    } catch (error) {
      const codeName = error.message === 'state_expired' ? 'tiktok_state_expired' : 'tiktok_invalid_state';
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=${codeName}`);
    }

    const { userId } = stateData;
    const tokenPayload = new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY(),
      client_secret: TIKTOK_CLIENT_SECRET(),
      code,
      grant_type: 'authorization_code',
      redirect_uri: TIKTOK_REDIRECT_URI(),
    });

    const tokenRes = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', tokenPayload.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const accessToken = tokenRes.data?.access_token;
    const refreshToken = tokenRes.data?.refresh_token;
    const userInfoRes = await axios.post(
      'https://open.tiktokapis.com/v2/user/info/',
      {
        fields: ['open_id', 'display_name', 'avatar_url', 'follower_count', 'profile_deep_link'],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const profile = userInfoRes.data?.data?.user;
    const user = await User.findById(userId).select('+connectedAccounts');
    if (!user) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=tiktok_user_not_found`);
    }

    await upsertConnectedAccount(user, {
      platform: 'tiktok',
      accountId: profile.open_id,
      accountName: profile.display_name || 'TikTok Account',
      username: profile.display_name ? `@${profile.display_name.replace(/\s+/g, '').toLowerCase()}` : `@${profile.open_id}`,
      followers: profile.follower_count || 0,
      accessToken: encrypt(accessToken),
      refreshToken: refreshToken ? encrypt(refreshToken) : '',
      profileUrl: profile.profile_deep_link || 'https://www.tiktok.com',
      profilePicture: profile.avatar_url || '',
      status: 'active',
      provider: 'tiktok',
    });

    user.stats.connectedAccounts = user.connectedAccounts.length;
    await user.save();

    await createUserNotification(userId, {
      type: 'success',
      category: 'social-connection',
      title: 'TikTok connected',
      message: 'Your TikTok account is connected. Posting remains media-driven and can be enabled when your TikTok publishing workflow is approved.',
      action: {
        label: 'Open Social Media Generator',
        url: `${FRONTEND_URL()}/tools/social-media`,
      },
    }, { sendEmail: false });

    return res.redirect(`${FRONTEND_URL()}/tools/social-media?connected=tiktok`);
  } catch (err) {
    console.error('TikTok callback error:', err?.response?.data || err);
    return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=tiktok_callback_failed`);
  }
};

export const handlePinterestCallback = async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=pinterest_auth_denied`);
    }

    if (!code || !state) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=pinterest_missing_params`);
    }

    let stateData = decodeState(state);
    const { userId } = stateData;

    const auth = Buffer.from(`${PINTEREST_CLIENT_ID()}:${PINTEREST_CLIENT_SECRET()}`).toString('base64');
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: PINTEREST_REDIRECT_URI(),
    });

    const tokenRes = await axios.post('https://api.pinterest.com/v5/oauth/token', tokenParams.toString(), {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token: accessToken, refresh_token: refreshToken } = tokenRes.data;

    const profileRes = await axios.get('https://api.pinterest.com/v5/user_account', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const profile = profileRes.data;
    const user = await User.findById(userId).select('+connectedAccounts');
    if (!user) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=pinterest_user_not_found`);
    }

    await upsertConnectedAccount(user, {
      platform: 'pinterest',
      accountId: profile.username,
      accountName: profile.username,
      username: `@${profile.username}`,
      accessToken: encrypt(accessToken),
      refreshToken: refreshToken ? encrypt(refreshToken) : '',
      profileUrl: `https://www.pinterest.com/${profile.username}/`,
      profilePicture: profile.profile_image || '',
      status: 'active',
      provider: 'pinterest',
    });

    user.stats.connectedAccounts = user.connectedAccounts.length;
    await user.save();

    await createUserNotification(userId, {
      type: 'success',
      category: 'social-connection',
      title: 'Pinterest connected',
      message: 'Your Pinterest account is connected and ready for pinning.',
      action: {
        label: 'Open Social Media Generator',
        url: `${FRONTEND_URL()}/tools/social-media`,
      },
    }, { sendEmail: false });

    return res.redirect(`${FRONTEND_URL()}/tools/social-media?connected=pinterest`);
  } catch (err) {
    console.error('Pinterest callback error:', err?.response?.data || err);
    return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=pinterest_callback_failed`);
  }
};

export const handleYouTubeCallback = async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=youtube_auth_denied`);
    }

    if (!code || !state) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=youtube_missing_params`);
    }

    let stateData = decodeState(state);
    const { userId } = stateData;

    const tokenParams = new URLSearchParams({
      code,
      client_id: YOUTUBE_CLIENT_ID(),
      client_secret: YOUTUBE_CLIENT_SECRET(),
      redirect_uri: YOUTUBE_REDIRECT_URI(),
      grant_type: 'authorization_code',
    });

    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', tokenParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token: accessToken, refresh_token: refreshToken } = tokenRes.data;

    // Get user info from Google
    const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const googleUser = userInfoRes.data;

    // Get YouTube channel info
    const channelRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'snippet,statistics',
        mine: true,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const channel = channelRes.data?.items?.[0];
    const user = await User.findById(userId).select('+connectedAccounts');
    if (!user) {
      return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=youtube_user_not_found`);
    }

    await upsertConnectedAccount(user, {
      platform: 'youtube',
      accountId: channel?.id || googleUser.sub,
      accountName: channel?.snippet?.title || googleUser.name,
      username: channel?.snippet?.customUrl || `@${googleUser.email.split('@')[0]}`,
      followers: parseInt(channel?.statistics?.subscriberCount || 0, 10),
      accessToken: encrypt(accessToken),
      refreshToken: refreshToken ? encrypt(refreshToken) : '',
      profileUrl: channel?.id ? `https://www.youtube.com/channel/${channel.id}` : 'https://www.youtube.com',
      profilePicture: channel?.snippet?.thumbnails?.default?.url || googleUser.picture || '',
      status: 'active',
      provider: 'youtube',
    });

    user.stats.connectedAccounts = user.connectedAccounts.length;
    await user.save();

    await createUserNotification(userId, {
      type: 'success',
      category: 'social-connection',
      title: 'YouTube connected',
      message: 'Your YouTube account is connected and ready for publishing videos.',
      action: {
        label: 'Open Social Media Generator',
        url: `${FRONTEND_URL()}/tools/social-media`,
      },
    }, { sendEmail: false });

    return res.redirect(`${FRONTEND_URL()}/tools/social-media?connected=youtube`);
  } catch (err) {
    console.error('YouTube callback error:', err?.response?.data || err);
    return res.redirect(`${FRONTEND_URL()}/tools/social-media?error=youtube_callback_failed`);
  }
};

// ─── Get connected social accounts for a user ─────────────────────────────────
export const getConnections = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('connectedAccounts stats');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const connections = (user.connectedAccounts || []).map((acc) => ({
      platform: acc.platform,
      accountId: acc.accountId,
      accountName: acc.accountName,
      username: acc.username,
      followers: acc.followers,
      status: acc.status,
      isActive: acc.isActive,
      profilePicture: acc.profilePicture,
      connectedAt: acc.connectedAt,
      lastSynced: acc.lastSynced,
      pageId: acc.pageId,
      provider: acc.provider,
      authorUrn: acc.authorUrn
    }));

    return res.json({
      success: true,
      data: { connections },
      total: connections.length
    });
  } catch (err) {
    console.error('Get connections error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Disconnect a social account ─────────────────────────────────────────────
export const disconnectAccount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { platform, accountId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.connectedAccounts = user.connectedAccounts.filter(
      (acc) => !(acc.platform === platform && acc.accountId === accountId)
    );
    user.stats.connectedAccounts = user.connectedAccounts.length;
    await user.save();

    await createUserNotification(userId, {
      type: 'warning',
      category: 'social-connection',
      title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected`,
      message: 'Auto-posting for this account is paused until you reconnect it.',
      action: {
        label: 'Reconnect',
        url: `${FRONTEND_URL()}/tools/social-media`
      }
    }, { sendEmail: false, dedupeWindowMinutes: 5 });

    return res.json({ success: true, message: 'Account disconnected successfully' });
  } catch (err) {
    console.error('Disconnect error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Publish a post NOW to Meta (Facebook Page or Instagram) ─────────────────
export const publishPost = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { platform, accountId, content, imageUrl, link } = req.body;

    if (!platform || !accountId || !content) {
      return res.status(400).json({ success: false, message: 'platform, accountId, and content are required' });
    }

    const user = await User.findById(userId).select('+connectedAccounts');
    const account = user?.connectedAccounts?.find(
      (acc) => acc.platform === platform && acc.accountId === accountId
    );

    if (!account) {
      return res.status(404).json({ success: false, message: 'Connected account not found' });
    }

    const result = await publishConnectedAccountPost(account, {
      platform,
      accountId,
      content,
      imageUrl,
      link,
    }, async (newTokens) => {
      account.accessToken = encrypt(newTokens.accessToken);
      if (newTokens.refreshToken) {
        account.refreshToken = encrypt(newTokens.refreshToken);
      }
      await user.save();
    });

    await User.findByIdAndUpdate(userId, { $inc: { 'stats.totalPosts': 1 } });

    await createUserNotification(userId, {
      type: 'success',
      category: 'publishing',
      title: `Post published on ${platform}`,
      message: `Your content was published successfully to ${account.accountName}.`,
      action: { label: 'View post', url: `${FRONTEND_URL()}/tools/social-media` }
    }, { sendEmail: false, dedupeWindowMinutes: 1 });

    return res.json({
      success: true,
      message: `Post published to ${platform}`,
      data: result
    });
  } catch (err) {
    const apiErr = err?.response?.data?.error;
    console.error('Publish error:', apiErr || err.message);
    return res.status(500).json({
      success: false,
      message: apiErr?.message || err.message || 'Failed to publish post'
    });
  }
};

export const schedulePost = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { platform, accountId, content, imageUrl, link, hashtags, contentType, scheduledAt } = req.body;

    if (!platform || !accountId || !content || !scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'platform, accountId, content, and scheduledAt are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const account = user.connectedAccounts?.find(
      (acc) => acc.platform === platform && acc.accountId === accountId
    );
    if (!account) {
      return res.status(404).json({ success: false, message: 'Connected account not found' });
    }

    // Dynamic import to avoid circular deps if ScheduledPost is added later
    // For now store in user metadata queue
    const scheduledPosts = getScheduledPostsFromUser(user);
    const jobId = crypto.randomUUID();
    scheduledPosts.push({
      jobId,
      platform,
      accountId,
      content,
      imageUrl: imageUrl || null,
      link: link || null,
      hashtags: Array.isArray(hashtags) ? hashtags : [],
      contentType: contentType || 'social-post',
      scheduledAt: new Date(scheduledAt),
      status: 'pending',
      attempts: 0,
      createdAt: new Date()
    });
    setScheduledPostsOnUser(user, scheduledPosts);
    user.stats.scheduledPosts = (user.stats.scheduledPosts || 0) + 1;
    await user.save();

    await createUserNotification(userId, {
      type: 'info',
      category: 'publishing',
      title: 'Post scheduled',
      message: `Post for ${platform} scheduled at ${new Date(scheduledAt).toLocaleString()}.`,
      action: { label: 'View schedule', url: `${FRONTEND_URL()}/tools/social-media` }
    }, { sendEmail: false, dedupeWindowMinutes: 1 });

    return res.json({
      success: true,
      message: 'Post scheduled successfully',
      data: { jobId, scheduledAt }
    });
  } catch (err) {
    console.error('Schedule error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── List scheduled posts ─────────────────────────────────────────────────────
export const getScheduledPosts = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    const posts = getScheduledPostsFromUser(user).filter(
      (p) => p.status !== 'deleted'
    );

    return res.json({
      success: true,
      data: posts,
      total: posts.length
    });
  } catch (err) {
    console.error('Get scheduled posts error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Delete scheduled post ────────────────────────────────────────────────────
export const deleteScheduledPost = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { jobId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const posts = getScheduledPostsFromUser(user);
    const idx = posts.findIndex((p) => p.jobId === jobId);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Scheduled post not found' });
    }

    posts[idx].status = 'deleted';
    setScheduledPostsOnUser(user, posts);
    user.stats.scheduledPosts = Math.max(0, (user.stats.scheduledPosts || 1) - 1);
    await user.save();

    return res.json({ success: true, message: 'Scheduled post removed' });
  } catch (err) {
    console.error('Delete scheduled post error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Internal helper ──────────────────────────────────────────────────────────
export const processScheduledPostsCycle = async () => {
  const now = new Date();
  const users = await User.find({
    'stats.scheduledPosts': { $gt: 0 }
  }).select('+connectedAccounts metadata stats');

  for (const user of users) {
    const posts = getScheduledPostsFromUser(user);
    let changed = false;

    for (const post of posts) {
      if (!post?.scheduledAt || post.status !== 'pending') {
        continue;
      }

      const scheduledTime = new Date(post.scheduledAt);
      if (Number.isNaN(scheduledTime.getTime()) || scheduledTime > now) {
        continue;
      }

      post.status = 'processing';
      post.processingStartedAt = new Date();
      post.attempts = (post.attempts || 0) + 1;
      changed = true;

      try {
        const account = user.connectedAccounts?.find(
          (acc) => acc.platform === post.platform && acc.accountId === post.accountId
        );

        if (!account) {
          throw new Error(`Connected ${post.platform} account not found for scheduled publish`);
        }

        const result = await publishConnectedAccountPost(account, {
          platform: post.platform,
          accountId: post.accountId,
          content: post.content,
          imageUrl: post.imageUrl,
          link: post.link
        }, async (newTokens) => {
          account.accessToken = encrypt(newTokens.accessToken);
          if (newTokens.refreshToken) {
            account.refreshToken = encrypt(newTokens.refreshToken);
          }
          await user.save();
        });

        post.status = 'published';
        post.publishedAt = new Date();
        post.result = result;
        post.errorMessage = '';
        user.stats.scheduledPosts = Math.max(0, (user.stats.scheduledPosts || 1) - 1);
        user.stats.totalPosts = (user.stats.totalPosts || 0) + 1;

        await createUserNotification(user._id, {
          type: 'success',
          category: 'publishing',
          title: `Scheduled post published on ${post.platform}`,
          message: `Your scheduled ${post.contentType || 'social'} post was published successfully.`,
          action: {
            label: 'Open Social Media Generator',
            url: `${FRONTEND_URL()}/tools/social-media`
          }
        }, { sendEmail: false });
      } catch (error) {
        post.status = 'failed';
        post.failedAt = new Date();
        post.errorMessage = error.message || 'Scheduled publishing failed';
        user.stats.scheduledPosts = Math.max(0, (user.stats.scheduledPosts || 1) - 1);

        await createUserNotification(user._id, {
          type: 'warning',
          category: 'publishing',
          title: `Scheduled post failed on ${post.platform}`,
          message: post.errorMessage,
          action: {
            label: 'Review queued content',
            url: `${FRONTEND_URL()}/tools/social-media`
          }
        }, { sendEmail: false });
      }
    }

    if (changed) {
      setScheduledPostsOnUser(user, posts);
      await user.save();
    }
  }
};

export const retryScheduledPost = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { jobId } = req.params;

    const user = await User.findById(userId).select('+connectedAccounts metadata stats');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const posts = getScheduledPostsFromUser(user);
    const post = posts.find((item) => item.jobId === jobId);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Scheduled post not found' });
    }

    const account = user.connectedAccounts?.find(
      (acc) => acc.platform === post.platform && acc.accountId === post.accountId
    );

    if (!account) {
      return res.status(404).json({ success: false, message: 'Connected account not found for retry' });
    }

    try {
      const result = await publishConnectedAccountPost(account, {
        platform: post.platform,
        accountId: post.accountId,
        content: post.content,
        imageUrl: post.imageUrl,
        link: post.link
      }, async (newTokens) => {
        account.accessToken = encrypt(newTokens.accessToken);
        if (newTokens.refreshToken) {
          account.refreshToken = encrypt(newTokens.refreshToken);
        }
        await user.save();
      });

      post.status = 'published';
      post.publishedAt = new Date();
      post.result = result;
      post.errorMessage = '';
      post.attempts = (post.attempts || 0) + 1;
      user.stats.scheduledPosts = Math.max(0, (user.stats.scheduledPosts || 1) - 1);
      user.stats.totalPosts = (user.stats.totalPosts || 0) + 1;

      await createUserNotification(user._id, {
        type: 'success',
        category: 'publishing',
        title: `Retry succeeded on ${post.platform}`,
        message: 'Your failed scheduled post has now been published successfully.',
        action: {
          label: 'Open Social Media Generator',
          url: `${FRONTEND_URL()}/tools/social-media`
        }
      }, { sendEmail: false });
    } catch (error) {
      post.status = 'failed';
      post.failedAt = new Date();
      post.errorMessage = error.message || 'Retry failed';
      post.attempts = (post.attempts || 0) + 1;
    }

    setScheduledPostsOnUser(user, posts);
    await user.save();

    return res.json({
      success: true,
      data: post,
      message: post.status === 'published' ? 'Scheduled post retried successfully' : 'Retry attempted but still failed'
    });
  } catch (err) {
    console.error('Retry scheduled post error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Internal helper
async function upsertConnectedAccount(user, accountData) {
  const idx = user.connectedAccounts.findIndex(
    (a) => a.platform === accountData.platform && a.accountId === accountData.accountId
  );

  if (idx >= 0) {
    Object.assign(user.connectedAccounts[idx], accountData, { lastSynced: new Date() });
  } else {
    user.connectedAccounts.push({ ...accountData, connectedAt: new Date(), lastSynced: new Date() });
  }
}
