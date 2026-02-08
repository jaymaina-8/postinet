type YouTubeTokenRefreshResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

export type YouTubeChannelInfo = {
  id: string;
  title: string;
};

function getYouTubeClientId(): string | undefined {
  return process.env.GOOGLE_CLIENT_ID?.trim();
}

function getYouTubeClientSecret(): string | undefined {
  return process.env.GOOGLE_CLIENT_SECRET?.trim();
}

export async function refreshYouTubeAccessToken(refreshToken: string) {
  const clientId = getYouTubeClientId();
  const clientSecret = getYouTubeClientSecret();

  if (!clientId || !clientSecret) {
    throw new Error('Missing Google OAuth client configuration');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: params.toString(),
  });

  const data = (await response.json()) as Partial<YouTubeTokenRefreshResponse> & {
    error?: string;
    error_description?: string;
  };

  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || 'Failed to refresh YouTube access token');
  }

  if (!data.access_token || typeof data.expires_in !== 'number') {
    throw new Error('Invalid YouTube token refresh response');
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

export async function fetchYouTubeChannel(accessToken: string): Promise<YouTubeChannelInfo> {
  const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to fetch YouTube channel info');
  }

  const channel = data?.items?.[0];
  if (!channel?.id) {
    throw new Error('No YouTube channel found for this account');
  }

  return {
    id: channel.id,
    title: channel?.snippet?.title || 'YouTube Channel',
  };
}
