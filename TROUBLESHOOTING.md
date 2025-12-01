# Troubleshooting: Data Not Saving to Supabase

## Issue
Data is showing in the UI but not appearing in Supabase database.

## Common Causes & Solutions

### 1. **Database Tables Not Created**
**Problem:** The `clients` table doesn't exist in Supabase.

**Solution:**
1. Open `database-schema.sql` in your project
2. Copy the entire SQL script
3. Go to Supabase Dashboard → SQL Editor
4. Paste and run the script
5. Verify tables are created: Check Table Editor → you should see `clients`, `appointments`, etc.

### 2. **Environment Variables Not Set in Vercel**
**Problem:** The API can't connect to Supabase because credentials are missing.

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:
   - `SUPABASE_URL` = Your Supabase project URL (from Supabase Dashboard → Settings → API)
   - `SUPABASE_ANON_KEY` = Your Supabase anonymous key (from Supabase Dashboard → Settings → API)
3. **Important:** After adding, redeploy your project

### 3. **API Endpoints Not Deployed**
**Problem:** The `/api/admin/clients` endpoint doesn't exist on Vercel.

**Solution:**
1. Make sure you've committed and pushed your code to GitHub
2. Vercel should auto-deploy, or manually trigger a deployment
3. Check Vercel Dashboard → Functions to see if `api/admin/clients` is listed

### 4. **CORS Issues (Less Likely)**
**Problem:** Browser blocking the API request.

**Solution:**
- Check browser console (F12) for CORS errors
- The code already handles CORS, but verify `vercel.json` has the correct headers

### 5. **Testing the API Connection**

**Test if API is working:**
1. Open browser console (F12)
2. Try adding a client
3. Look for console logs:
   - "Saving client to: https://sunterra-solar-energy.vercel.app/api/admin/clients"
   - "API Response status: 201" (success) or error code
   - "API Response data: ..." (shows the response)

**Test API directly:**
```bash
# Test GET request
curl https://sunterra-solar-energy.vercel.app/api/admin/clients

# Test POST request
curl -X POST https://sunterra-solar-energy.vercel.app/api/admin/clients \
  -H "Content-Type: application/json" \
  -d '{"clientName":"Test Client","email":"test@example.com","phone":"1234567890","location":"Test Location","projectAmount":100000,"date":"2025-12-01","joinDate":"2025-12-01"}'
```

### 6. **Check Vercel Logs**
1. Go to Vercel Dashboard → Your Project → Logs
2. Look for errors when you try to save a client
3. Common errors:
   - "Supabase credentials not configured" → Environment variables missing
   - "relation 'clients' does not exist" → Tables not created
   - "permission denied" → RLS policies too restrictive

### 7. **Verify Supabase Connection**
1. Go to Supabase Dashboard → Settings → API
2. Copy your `Project URL` and `anon public` key
3. Test connection in Supabase Dashboard → SQL Editor:
```sql
SELECT * FROM clients;
```
If this works, the table exists and is accessible.

## Quick Checklist

- [ ] SQL schema has been run in Supabase
- [ ] `clients` table exists in Supabase Table Editor
- [ ] Environment variables are set in Vercel (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)
- [ ] Vercel project has been redeployed after adding environment variables
- [ ] API endpoints are deployed (check Vercel Functions)
- [ ] Browser console shows no errors
- [ ] Vercel logs show no errors

## Next Steps

After fixing the issues:
1. Try adding a client again
2. Check browser console for success/error messages
3. Check Supabase Table Editor to see if data appears
4. If still not working, check Vercel logs for detailed error messages

