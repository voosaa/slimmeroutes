# Environment Variables Setup for DriveWise

This document explains how to set up environment variables for the DriveWise application.

## Required Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://frvgobihuyhvjowjxduw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZydmdvYmlodXlodmpvd2p4ZHV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTc2MjMsImV4cCI6MjA1Nzk3MzYyM30.be8V_xpURRaC17UcrGW3476tmuRjisPwFwW6wZWeOg8
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBCNiM4uU_fEfvaWiFDqWsvCBH8sltgm60
```

## Using the Setup Script

For convenience, you can use the included PowerShell script to set up your environment variables:

```powershell
.\setup-env.ps1
```

This script will create the `.env.local` file with all the required variables.

## Important Notes

- The `.env.local` file is excluded from git in the `.gitignore` file to prevent exposing sensitive keys
- After changing environment variables, you need to restart the development server
- You can restart the server with `npm run dev`

## Troubleshooting

If you encounter issues with environment variables not being loaded:

1. Make sure the `.env.local` file is in the root directory of your project
2. Check that there are no spaces before or after the equal sign
3. Restart the development server after making changes
4. Check the console logs for any error messages

## API Keys

- **Supabase**: Used for authentication and database storage
- **Google Maps API**: Used for address autocomplete and map functionality
