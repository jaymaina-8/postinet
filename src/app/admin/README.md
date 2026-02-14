# Admin area

The `/admin` section is **only** available to users with `user_profile.is_admin = true`. It is not linked anywhere in the main app; you reach it by going directly to **/admin** or **/admin/feature-requests**.

## How to give yourself admin access

1. Run the migration that adds `is_admin` to `user_profile`:
   - `supabase/migrations/20250213100000_add_user_profile_is_admin.sql`

2. In **Supabase Dashboard** → **Table Editor** → **user_profile**, find your row (by your user `id` from Auth → Users) and set **is_admin** to `true`.

   Or in **SQL Editor** run (replace `YOUR_USER_ID` with your auth user UUID):
   ```sql
   update public.user_profile set is_admin = true where id = 'YOUR_USER_ID';
   ```

3. Log in and open **https://your-domain.com/admin** (or `/admin/feature-requests`). Other users will be redirected to the dashboard if they try to access `/admin`.

## What’s protected

- **Admin layout** (`/admin/*`): Checks auth and `user_profile.is_admin`; non-admins are redirected to `/dashboard`.
- **GET /api/feature-requests**: Returns 403 unless the request is from an authenticated user with `is_admin = true`.
- **POST /api/feature-requests**: Stays public so the feature request form can submit without auth.
