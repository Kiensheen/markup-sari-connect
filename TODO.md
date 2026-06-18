# MarkUp — TODO

## Phase A: Admin login fix
- [x] Update `src/routes/admin_.login.tsx` to validate admin role *after* successful auth
- [x] Query role via existing `isAdmin()` helper
- [x] If not admin: sign out + show error
- [x] Add console.log debugging

## Phase B: Google OAuth across apps
- [x] Create `src/components/auth/GoogleLoginButton.tsx`
- [x] Add Google button to:
  - [x] `src/routes/rider/RiderLogin.tsx`
  - [x] Consumer login: `src/routes/auth.tsx` (URL `/auth`)
- [x] Implement `src/routes/auth/callback.tsx` to role-check `user_roles` and redirect
- [ ] Verify OAuth redirect integration (Supabase config/env) and ensure callback reaches TanStack route


## Testing
- [ ] Admin login works for admin account, blocks non-admin accounts
- [ ] Google login works for consumer/rider/admin and redirects correctly
- [ ] No-role / missing role case redirects to login with error

