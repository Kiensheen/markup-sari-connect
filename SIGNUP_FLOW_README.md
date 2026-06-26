# MarketUp Custom Registration Flow

## Overview
A multi-step registration system for Consumer and Rider account types with complete profile data collection.

## Files Created/Modified

### New Files
- `src/routes/signup.tsx` - Main 5-step registration page (Consumer only)
- `src/components/signup/PersonalInfoStep.tsx` - Step 1: Name information
- `src/components/signup/AddressStep.tsx` - Step 2: Delivery address
- `src/components/signup/ContactLoginStep.tsx` - Step 3: Email, phone, password
- `src/components/signup/ProfilePictureStep.tsx` - Step 4: Avatar upload
- `src/components/signup/ReviewStep.tsx` - Step 5: Review & submit
- `supabase/migrations/20250101_update_signup_trigger.sql` - Updated database trigger

### Modified Files
- `src/routes/auth.tsx` - Added link to new signup page

## Registration Flow

**Note**: Only Consumer accounts can be created through public signup. Rider accounts are created by admins.

### Step 1: Personal Information
- First Name (required)
- Middle Name (optional)
- Last Name (required)

### Step 2: Delivery Address
- Province (required)
- City/Municipality (required)
- Barangay (required)
- Street No./Block No./House No. (required)

### Step 3: Contact & Login
- Email Address / Username (required) - Used for login
- Contact Number (required) - For order updates
- Password (required, min 6 characters)
- Confirm Password (required)

### Step 4: Profile Picture (Optional)
- Take Photo (camera capture)
- Upload Photo (gallery)
- Skip option available

### Step 5: Review & Submit
- Shows all entered information
- Terms of Service notice
- Create Account button

## Database Changes

### Updated `handle_new_user()` Trigger
The trigger now:
1. Extracts custom fields from `raw_user_meta_data`:
   - `first_name`
   - `middle_name`
   - `last_name`
   - `account_type`
   - `phone`
2. Builds full name from components
3. Creates profile with all available data
4. Assigns correct role (consumer/rider)

### Migration SQL
Run this in Supabase Dashboard → SQL Editor:

```sql
-- Copy contents from: supabase/migrations/20250101_update_signup_trigger.sql
```

## How to Deploy

### 1. Run Database Migration
```bash
# Option A: Using Supabase CLI
supabase migration up

# Option B: Manual (copy SQL from migration file)
# Go to Supabase Dashboard → SQL Editor → New Query
# Paste and run the migration SQL
```

### 2. Test Locally
```bash
# Start development server
npm run dev

# Navigate to: http://localhost:5173/signup
```

### 3. Push to GitHub
```bash
git add .
git commit -m "feat: add custom multi-step registration flow

- Create 6-step signup process
- Add account type selection (consumer/rider)
- Collect complete profile data
- Update handle_new_user trigger
- Add profile picture upload
- Mobile-responsive design"

git push origin main
```

### 4. Deploy
- Lovable will auto-deploy when changes are pushed to GitHub
- Monitor deployment in Lovable dashboard

## Testing Checklist

### Manual Testing
- [ ] Step 1: Select Consumer → proceeds to Step 2
- [ ] Step 1: Select Rider → proceeds to Step 2
- [ ] Step 2: Fill name fields → validation works
- [ ] Step 3: Fill address fields → validation works
- [ ] Step 4: Email/password validation works
- [ ] Step 4: Password mismatch shows error
- [ ] Step 5: Photo upload/capture works
- [ ] Step 5: Skip option works
- [ ] Step 6: Review shows all data correctly
- [ ] Submit creates account successfully
- [ ] Redirect to login after success
- [ ] Error handling works (network errors, validation)

### Database Verification
After testing, verify in Supabase SQL Editor:

```sql
-- 1. Check new user was created
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Check profile was created with custom fields
SELECT id, email, first_name, middle_name, last_name, 
       province, city, barangay, street, phone
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check user role was assigned correctly
SELECT u.email, ur.role
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
ORDER BY ur.user_id DESC
LIMIT 5;

-- 4. Verify trigger is working
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

## Features

### Form Validation
- Required field validation per step
- Password match confirmation
- Minimum password length (6 characters)
- Email format validation

### User Experience
- Progress bar showing completion percentage
- Step indicators with checkmarks for completed steps
- Back/Next navigation buttons
- Mobile-responsive design
- Blue theme (#2563EB) matching app branding
- Toast notifications for success/error

### Security
- Password never shown in review (masked with dots)
- Email verification required
- RLS policies enforce data access
- SECURITY DEFINER on database functions

## Customization

### Change Theme Color
Replace `#2563EB` with your brand color in:
- `src/routes/signup.tsx` (buttons, progress, focus rings)
- All step components

### Add More Fields
1. Add field to `SignupData` interface in `signup.tsx`
2. Add to appropriate step component
3. Update `handleSubmit()` to save to database
4. Update `handle_new_user()` trigger if needed

### Modify Steps
- Reorder steps in `signup.tsx` `renderStep()` function
- Update `totalSteps` constant
- Adjust validation in `validateStep()`

## Troubleshooting

### Route Not Found Error
- Ensure `src/routes/signup.tsx` exists
- Restart dev server after creating new route
- Check `routeTree.gen.ts` was regenerated

### TypeScript Errors
- Run `npm run build` to check for type errors
- Ensure all imports are correct
- Check component prop types match

### Database Trigger Not Working
- Verify trigger exists: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created'`
- Check function exists: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user'`
- Review Supabase logs for errors

### Profile Not Populated
- Check `raw_user_meta_data` in auth.users
- Verify trigger fires on INSERT
- Check RLS policies allow INSERT

## Next Steps

1. **Upload Avatar to Storage**: Currently uses local preview. Implement Supabase Storage upload:
   ```typescript
   // In ProfilePictureStep.tsx
   const uploadToStorage = async (file: File) => {
     const fileName = `${userId}-${Date.now()}.jpg`;
     const { data, error } = await supabase.storage
       .from('avatars')
       .upload(fileName, file);
     return data?.path;
   };
   ```

2. **Add Email Templates**: Customize verification email in Supabase Dashboard

3. **Add Terms Modal**: Show full Terms of Service before submission

4. **Social Login**: Add Google/Facebook login options

5. **Phone Verification**: Add SMS verification for phone numbers

## Support

For issues or questions:
- Check Supabase logs: Dashboard → Logs
- Review browser console for client errors
- Verify database schema matches expectations