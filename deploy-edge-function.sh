#!/bin/bash
# Скрипт для деплоя Edge Function send-contact-email
# Требуется SUPABASE_ACCESS_TOKEN

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "Error: SUPABASE_ACCESS_TOKEN not set"
    echo "Please set it using: export SUPABASE_ACCESS_TOKEN=your_token"
    exit 1
fi

echo "Deploying send-contact-email edge function..."
supabase functions deploy send-contact-email \
    --project-ref azlrxwfbgyednniyxuhe \
    --no-verify-jwt

echo "Setting RESEND_API_KEY secret..."
supabase secrets set RESEND_API_KEY=re_2yETijD1_P4NwjgV2BQXhJH3RibdmRypM \
    --project-ref azlrxwfbgyednniyxuhe

echo "Done!"
