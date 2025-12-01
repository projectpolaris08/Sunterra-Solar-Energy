# Database Setup Guide for Admin Features

This guide will help you set up the Supabase database tables for the admin features (Clients, Calendar, Reports, Notifications, Settings).

## Prerequisites

- A Supabase project (you should already have one for monitoring)
- Access to your Supabase SQL Editor

## Step 1: Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `database-schema.sql` in this project
4. Copy the entire SQL script
5. Paste it into the SQL Editor
6. Click **Run** to execute the script

This will create the following tables:
- `clients` - Store client information
- `appointments` - Store calendar appointments
- `reports` - Store generated reports
- `notifications` - Store system notifications
- `settings` - Store application settings

## Step 2: Verify Environment Variables

Make sure these environment variables are set in your Vercel project:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key (or service role key)

You can find these in:
- Supabase Dashboard → Settings → API

## Step 3: Test the API Endpoints

After deploying, test the endpoints:

- `GET /api/admin/clients` - Should return empty array `[]`
- `GET /api/admin/appointments` - Should return empty array `[]`
- `GET /api/admin/reports` - Should return empty array `[]`
- `GET /api/admin/notifications` - Should return empty array `[]`
- `GET /api/admin/settings` - Should return empty object `{}`

## Step 4: Update Frontend to Use API

The frontend pages need to be updated to fetch data from these API endpoints instead of using local state. The API endpoints are ready and will work with both Supabase (if configured) or in-memory fallback (for development).

## API Endpoints Created

### Clients
- `GET /api/admin/clients` - Get all clients
- `POST /api/admin/clients` - Create new client
- `PUT /api/admin/clients` - Update client (include `id` in body)
- `DELETE /api/admin/clients?id={id}` - Delete client

### Appointments
- `GET /api/admin/appointments?startDate={date}&endDate={date}` - Get appointments
- `POST /api/admin/appointments` - Create new appointment
- `PUT /api/admin/appointments` - Update appointment (include `id` in body)
- `DELETE /api/admin/appointments?id={id}` - Delete appointment

### Reports
- `GET /api/admin/reports` - Get all reports
- `POST /api/admin/reports` - Create new report

### Notifications
- `GET /api/admin/notifications?limit={number}` - Get notifications
- `POST /api/admin/notifications` - Create notification
- `POST /api/admin/notifications` with `{action: "mark_read", id: {id}}` - Mark as read

### Settings
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings

## Notes

- All endpoints support CORS and OPTIONS preflight requests
- If Supabase is not configured, the system will use in-memory storage (data will be lost on server restart)
- For production, make sure to configure Supabase properly
- Row Level Security (RLS) policies are set to allow all operations - you may want to restrict these based on your authentication setup

