/**
 * Facebook Graph API posting helper
 * Handles posting text and images to Facebook Pages
 */

export interface FacebookPostOptions {
  pageId: string;
  pageAccessToken: string;
  message: string;
  imageUrl?: string;
}

export interface FacebookPostResponse {
  id: string;
  post_id?: string;
}

export interface FacebookErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
  };
}

const FACEBOOK_GRAPH_API_VERSION = process.env.FACEBOOK_GRAPH_API_VERSION || 'v19.0';

/**
 * Post text-only content to Facebook Page
 */
async function postTextToFacebook(
  pageId: string,
  pageAccessToken: string,
  message: string
): Promise<FacebookPostResponse> {
  const url = `https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/${pageId}/feed`;
  
  const params = new URLSearchParams({
    message: message,
    access_token: pageAccessToken,
  });

  const response = await fetch(`${url}?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const error = data as FacebookErrorResponse;
    throw new Error(
      `Facebook API error: ${error.error?.message || response.statusText} (Code: ${error.error?.code || response.status})`
    );
  }

  return data as FacebookPostResponse;
}

/**
 * Post image with caption to Facebook Page
 */
async function postImageToFacebook(
  pageId: string,
  pageAccessToken: string,
  caption: string,
  imageUrl: string
): Promise<FacebookPostResponse> {
  const url = `https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/${pageId}/photos`;
  
  const params = new URLSearchParams({
    url: imageUrl,
    caption: caption,
    access_token: pageAccessToken,
  });

  const response = await fetch(`${url}?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const error = data as FacebookErrorResponse;
    throw new Error(
      `Facebook API error: ${error.error?.message || response.statusText} (Code: ${error.error?.code || response.status})`
    );
  }

  return data as FacebookPostResponse;
}

/**
 * Post content to Facebook Page
 * Automatically chooses text-only or image post based on imageUrl
 */
export async function postToFacebook(
  options: FacebookPostOptions
): Promise<FacebookPostResponse> {
  const { pageId, pageAccessToken, message, imageUrl } = options;

  if (!pageId) {
    throw new Error('Facebook Page ID is required');
  }

  if (!pageAccessToken) {
    throw new Error('Facebook Page access token is required');
  }

  if (!message && !imageUrl) {
    throw new Error('Either message or imageUrl must be provided');
  }

  // If image URL exists, use photo endpoint
  if (imageUrl) {
    return await postImageToFacebook(pageId, pageAccessToken, message || '', imageUrl);
  }

  // Otherwise, use feed endpoint for text-only post
  return await postTextToFacebook(pageId, pageAccessToken, message);
}











































