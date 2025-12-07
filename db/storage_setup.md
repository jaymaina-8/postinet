# Supabase Storage Setup

## Create the Content Bucket

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **New bucket**
5. Configure the bucket:
   - **Name**: `content`
   - **Public bucket**: ✅ Yes (or No if you want private URLs)
   - **File size limit**: 10MB (or your preferred limit)
   - **Allowed MIME types**: `image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm`

## Set Up Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies:

### Option 1: Using Supabase Dashboard

1. Go to **Storage** → **Policies** → Select the `content` bucket
2. Click **New Policy**
3. Create a policy for uploads:
   - **Policy name**: `Users can upload own files`
   - **Allowed operation**: INSERT
   - **Policy definition**:
     ```sql
     (bucket_id = 'content'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
     ```
4. Create a policy for reads:
   - **Policy name**: `Users can read own files`
   - **Allowed operation**: SELECT
   - **Policy definition**:
     ```sql
     (bucket_id = 'content'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
     ```
5. Create a policy for deletes:
   - **Policy name**: `Users can delete own files`
   - **Allowed operation**: DELETE
   - **Policy definition**:
     ```sql
     (bucket_id = 'content'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
     ```

### Option 2: Using SQL Editor

Run this SQL in the Supabase SQL Editor:

```sql
-- Enable RLS on the content bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload files to their own folder
CREATE POLICY "Users can upload own files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'content' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own files
CREATE POLICY "Users can read own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'content' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'content' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Verify Setup

After setting up, test the upload endpoint:
- The `/api/upload` endpoint should work with authenticated requests
- Files should be stored in the `content` bucket under `{user_id}/{filename}`
- Public URLs should be accessible (if bucket is public)

