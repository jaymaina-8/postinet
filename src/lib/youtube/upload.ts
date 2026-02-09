type UploadInput = {
  accessToken: string;
  title: string;
  description?: string | null;
  visibility: 'public' | 'unlisted' | 'private';
  mediaUrl: string;
};

type UploadResult = {
  videoId: string;
};

async function fetchMediaStream(mediaUrl: string) {
  const response = await fetch(mediaUrl);
  if (!response.ok || !response.body) {
    throw new Error('Failed to fetch video from storage');
  }

  const contentLength = response.headers.get('content-length');
  const contentType = response.headers.get('content-type') || 'application/octet-stream';

  return {
    stream: response.body,
    contentLength,
    contentType,
  };
}

export async function uploadYouTubeVideo(input: UploadInput): Promise<UploadResult> {
  const metadata = {
    snippet: {
      title: input.title,
      description: input.description || '',
    },
    status: {
      privacyStatus: input.visibility,
    },
  };

  const initResponse = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        Accept: 'application/json',
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!initResponse.ok) {
    const errorBody = await initResponse.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || 'Failed to initialize YouTube upload');
  }

  const uploadUrl = initResponse.headers.get('location');
  if (!uploadUrl) {
    throw new Error('Missing YouTube resumable upload URL');
  }

  const { stream, contentLength, contentType } = await fetchMediaStream(input.mediaUrl);

  const uploadResponse = await fetch(
    uploadUrl,
    {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      'Content-Type': contentType,
      ...(contentLength ? { 'Content-Length': contentLength } : {}),
    },
    body: stream,
    duplex: 'half',
    } as RequestInit & { duplex: 'half' }
  );

  const result = await uploadResponse.json().catch(() => ({}));
  if (!uploadResponse.ok) {
    throw new Error(result?.error?.message || 'Failed to upload YouTube video');
  }

  if (!result?.id) {
    throw new Error('YouTube upload succeeded but no video ID returned');
  }

  return { videoId: result.id as string };
}
