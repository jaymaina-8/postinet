# POSTINET AI — SLC MVP Blueprint (Dec 1 Launch)

This plan follows the SLC (Simple, Lovable, Complete) principle. It focuses only on essential features, premium UX, and robust, finished flows for a production-quality MVP with no placeholders or non-functional pieces.

## SIMPLE (Core Essentials)

- Email/password authentication (Supabase Auth)
- Onboarding 6-question survey, stored in `user_profile`
- Connect Twitter/X via OAuth (only X; store in `connected_accounts`)
- Upload content: image, video, or text (Supabase Storage integration)
- AI Content Analysis (GPT-4/5): Caption, Hashtags, Title, Optimal time
- Magic AI buttons: Regenerate, Tone, Length, Hashtag
- "Post Now" to Twitter/X via API (store in `posts`)
- Content history: Drafts, posted content, simple analytics

## LOVABLE (UX That Feels Magical)

- Dashboard with 3 tabs: Create, Schedule, History
- Sidebar and navbar with clean, premium UI (ShadCN + TailwindCSS, light mode only)
- Delightful AI/UX touches: Smart time suggestion, "This will perform best..." insights
- Templates page: 6 starter prompts for quick text generation, ultra-simple and reliable
- Smooth, finished navigation: user is always guided, never lost

## COMPLETE (No Placeholders, Fully Functional)

- All navigation and flows work end-to-end
- Supabase: Schema given by user, with users, user_profile, connected_accounts, posts, templates
- Minimal but reliable analytics: ER, likes, reposts, best hashtags
- Never show incomplete or broken screens/pages

## Implementation Todos
- **init-nextjs-app**: Create Next.js 14 app with TS, TailwindCSS, ShadCN UI
- **setup-supabase**: Configure supabaseClient, match schema, enable Auth, Storage
- **auth-pages**: Implement login, signup, and redirect handling with Supabase
- **onboarding-page**: 6-question onboarding survey page, inserts to user_profile
- **dashboard-layout**: Sidebar/navbar, 3 main tabs (Create, Schedule, History)
- **connect-x**: Twitter/X OAuth with access token/refresh flow, store in connected_accounts
- **upload-content**: UI for image/video/text uploads, store in Supabase Storage
- **ai-analysis**: OpenAI API integration for captions, hashtags, title, and posting time; magic AI buttons
- **post-now**: Post to X, store in posts, update history
- **history-page**: Show drafts/posted + metrics (likes, reposts, ER, best hashtags)
- **templates-page**: 6 simple templates for text post, all working
- **navigation-flow**: All navigation, redirects, and role protection work seamlessly
- **error-handling**: Robust and polished error handling/UX throughout

## Files Structure

- `/app`
  - `/auth/login/page.tsx`
  - `/auth/signup/page.tsx`
  - `/onboarding/page.tsx`
  - `/dashboard/page.tsx`
  - `/create/page.tsx`
  - `/history/page.tsx`
  - `/templates/page.tsx`
  - `/api/auth`
  - `/api/ai`
  - `/api/upload`
  - `/api/post`
  - `/api/twitter`
- `/lib` (supabaseClient.ts, twitterClient.ts, aiClient.ts)
- `/components` (Navbar.tsx, Sidebar.tsx, UploadBox.tsx, TemplateCard.tsx, PostCard.tsx, AnalyticsCard.tsx)
- `/db` (schema for reference)

## Non-Goals

- No extra platforms (only Twitter/X)
- No overbuilt scheduling (Schedule tab is visual/UX placeholder only for now)
- Templates are only for text, simple and reliable
- No dark mode or unnecessary customization features

This blueprint is what the implementation step-by-step will follow for launch.
