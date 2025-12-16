#!/bin/bash

# Setup environment variables for Vercel deployment
echo "Setting up Vercel environment variables..."

# Note: Replace these with your actual values when running
echo "You need to run these commands manually in your terminal:"
echo ""
echo "vercel env add NEXT_PUBLIC_SUPABASE_URL"
echo "Value: https://zyiipgydbyiayotsskmn.supabase.co"
echo ""
echo "vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5aWlwZ3lkYnlpYXlvdHNza21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDQzMDksImV4cCI6MjA4MTEyMDMwOX0.-bJgNUchNApUeOcXDty-g5R8l7TYWxZnwbc03YewAVc"
echo ""
echo "vercel env add SUPABASE_SERVICE_ROLE_KEY"
echo "Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5aWlwZ3lkYnlpYXlvdHNza21uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU0NDMwOSwiZXhwIjoyMDgxMTIwMzA5fQ.QV-CefjIc02hhpKgyJahp8J8duPD7r7icnHtFCH93Tc"
echo ""
echo "After adding these, run 'vercel --prod' to redeploy"