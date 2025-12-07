-- Seed predefined templates
-- Run this SQL in Supabase SQL Editor to add starter templates
-- IMPORTANT: Run db/supabase_migrations.sql first to ensure all columns exist

-- Insert templates, handling both old and new schema
-- If is_custom column exists, use it; otherwise just insert title and prompt
DO $$
BEGIN
  -- Check if is_custom column exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'templates' 
    AND column_name = 'is_custom'
  ) THEN
    -- New schema: include is_custom
    INSERT INTO templates (title, prompt, is_custom) VALUES
    ('Quote Post', 'Create an inspiring quote post about {topic}. Include a powerful quote, brief context, and relevant hashtags. Keep it under 280 characters.', false),
    ('Storytelling Post', 'Write a storytelling post about {topic}. Start with a hook, share a personal or relatable story, and end with a valuable takeaway. Make it engaging and authentic.', false),
    ('Sales Post', 'Create a sales-focused post about {product/service}. Highlight key benefits, address pain points, include a clear call-to-action, and use persuasive language without being pushy.', false),
    ('Carousel Outline', 'Generate an outline for a carousel post about {topic}. Provide 5-7 key points or tips, each with a brief description. Format as a numbered list.', false),
    ('Tweet Hook Generator', 'Generate 3 attention-grabbing hooks for a tweet about {topic}. Each hook should be under 50 characters and designed to stop the scroll.', false),
    ('Video Script Intro', 'Write an engaging video script intro (first 15-30 seconds) about {topic}. Include a hook, what viewers will learn, and why they should keep watching.', false)
    ON CONFLICT DO NOTHING;
  ELSE
    -- Old schema: only title and prompt
    INSERT INTO templates (title, prompt) VALUES
    ('Quote Post', 'Create an inspiring quote post about {topic}. Include a powerful quote, brief context, and relevant hashtags. Keep it under 280 characters.'),
    ('Storytelling Post', 'Write a storytelling post about {topic}. Start with a hook, share a personal or relatable story, and end with a valuable takeaway. Make it engaging and authentic.'),
    ('Sales Post', 'Create a sales-focused post about {product/service}. Highlight key benefits, address pain points, include a clear call-to-action, and use persuasive language without being pushy.'),
    ('Carousel Outline', 'Generate an outline for a carousel post about {topic}. Provide 5-7 key points or tips, each with a brief description. Format as a numbered list.'),
    ('Tweet Hook Generator', 'Generate 3 attention-grabbing hooks for a tweet about {topic}. Each hook should be under 50 characters and designed to stop the scroll.'),
    ('Video Script Intro', 'Write an engaging video script intro (first 15-30 seconds) about {topic}. Include a hook, what viewers will learn, and why they should keep watching.')
    ON CONFLICT DO NOTHING;
  END IF;
END
$$;

