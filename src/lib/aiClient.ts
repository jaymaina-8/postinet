import OpenAI from 'openai';

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.warn('OPENAI_API_KEY is not set. AI features will not work.');
}

const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

export interface UserProfile {
  niche?: string;
  content_goals?: string;
  tone?: string;
  frequency?: string;
  audience?: string;
  competitors?: string;
}

export interface GenerateContentRequest {
  input: string;
  mediaType?: 'image' | 'video' | 'text';
  userProfile?: UserProfile;
}

export interface GeneratedContent {
  title: string;
  caption: string;
  hashtags: string[];
  optimalTime?: string;
  variants?: Array<{
    title: string;
    caption: string;
  }>;
}

export async function generateContent(
  request: GenerateContentRequest
): Promise<GeneratedContent> {
  if (!openai) {
    throw new Error('OpenAI API key is not configured');
  }

  const { input, mediaType = 'text', userProfile } = request;

  // Build context from user profile
  const contextParts: string[] = [];
  if (userProfile?.niche) {
    contextParts.push(`Niche: ${userProfile.niche}`);
  }
  if (userProfile?.tone) {
    contextParts.push(`Tone: ${userProfile.tone}`);
  }
  if (userProfile?.audience) {
    contextParts.push(`Target Audience: ${userProfile.audience}`);
  }
  if (userProfile?.content_goals) {
    contextParts.push(`Content Goals: ${userProfile.content_goals}`);
  }

  const context = contextParts.length > 0 ? `\n\nUser Context:\n${contextParts.join('\n')}` : '';

  const systemPrompt = `You are an expert social media content creator. 
Generate engaging, authentic content that resonates with the target audience.
${context}

Generate content that:
- Is optimized for social media (concise, engaging, platform-appropriate)
- Includes relevant hashtags (3-5 hashtags)
- Has a compelling title/hook
- Matches the user's tone and style preferences
- Is appropriate for ${mediaType} content`;

  const userPrompt = `Generate social media content based on this input:\n\n${input}\n\nProvide:
1. A compelling title/hook (short, attention-grabbing)
2. A main caption (engaging, authentic, platform-appropriate)
3. 3-5 relevant hashtags
4. An optimal posting time suggestion (e.g., "9:00 AM EST" or "Best: Weekday mornings")
5. 2 alternative caption variants`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    const parsed = JSON.parse(content);
    
    return {
      title: parsed.title || 'Untitled',
      caption: parsed.caption || parsed.description || '',
      hashtags: Array.isArray(parsed.hashtags) 
        ? parsed.hashtags 
        : typeof parsed.hashtags === 'string'
        ? parsed.hashtags.split(',').map((h: string) => h.trim())
        : [],
      optimalTime: parsed.optimalTime || parsed.optimal_time || undefined,
      variants: parsed.variants || [
        { title: parsed.title || 'Variant 1', caption: parsed.variant1 || '' },
        { title: parsed.title || 'Variant 2', caption: parsed.variant2 || '' },
      ],
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
}

export async function regenerateWithModification(
  originalContent: string,
  modification: 'shorter' | 'longer' | 'more_professional' | 'more_casual' | 'regenerate',
  userProfile?: UserProfile
): Promise<GeneratedContent> {
  if (!openai) {
    throw new Error('OpenAI API key is not configured');
  }

  const modificationPrompts: Record<string, string> = {
    shorter: 'Make this caption significantly shorter while keeping the core message.',
    longer: 'Expand this caption with more detail and context.',
    more_professional: 'Rewrite this caption in a more professional, business-oriented tone.',
    more_casual: 'Rewrite this caption in a more casual, friendly, conversational tone.',
    regenerate: 'Regenerate this caption with a fresh approach while keeping the same core message.',
  };

  const systemPrompt = `You are an expert social media content creator. Modify the given content according to the user's request while maintaining authenticity and engagement.`;

  const userPrompt = `Original content:\n${originalContent}\n\nModification request: ${modificationPrompts[modification]}\n\nProvide the modified content in the same format as before.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    const parsed = JSON.parse(content);
    
    return {
      title: parsed.title || 'Untitled',
      caption: parsed.caption || parsed.description || '',
      hashtags: Array.isArray(parsed.hashtags) 
        ? parsed.hashtags 
        : typeof parsed.hashtags === 'string'
        ? parsed.hashtags.split(',').map((h: string) => h.trim())
        : [],
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to modify content. Please try again.');
  }
}

