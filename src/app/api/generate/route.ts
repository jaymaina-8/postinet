import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const text = formData.get('text') as string;
  const platform = formData.get('platform') as string;
  // Note: image is optional and may be null
  const image = formData.get('image');

  // Mocked AI response
  const response = {
    input: text,
    platform,
    result: {
      title: '10 Tips to Boost Your Engagement',
      description: 'Discover easy strategies to grow your following and maximize reach on social media.',
      hashtags: ['#SocialMediaTips', '#GrowYourAudience', '#Marketing'],
      variants: [
        {
          title: 'Boost Your Social Engagement',
          description: 'Simple ways to get more likes, followers, and views.'
        },
        {
          title: 'Maximize Your Social Media Impact',
          description: 'Proven tactics to engage and grow your audience.'
        }
      ]
    }
  };

  return NextResponse.json(response);
}
