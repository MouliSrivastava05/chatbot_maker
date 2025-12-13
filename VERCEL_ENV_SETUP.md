# Vercel Environment Variables Setup

## Required Environment Variables

To fix the Firebase authentication error on Vercel, you need to add the following environment variables in your Vercel project settings.

### Firebase Environment Variables

Add these in Vercel Dashboard → Your Project → Settings → Environment Variables:

1. `NEXT_PUBLIC_FIREBASE_API_KEY`
   - Get from: Firebase Console → Project Settings → General → Your apps → Web app config
   - Example: `AIzaSy...`

2. `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - Format: `your-project-id.firebaseapp.com`
   - Example: `myapp.firebaseapp.com`

3. `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - Your Firebase project ID
   - Example: `myapp-12345`

4. `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - Format: `your-project-id.appspot.com`
   - Example: `myapp-12345.appspot.com`

5. `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - Messaging sender ID (number)
   - Example: `123456789012`

6. `NEXT_PUBLIC_FIREBASE_APP_ID`
   - App ID
   - Example: `1:123456789012:web:abc123def456`

### Other Required Environment Variables

7. `GROQ_API_KEY`
   - Your Groq API key for AI functionality
   - Get from: https://console.groq.com/keys
   - Example: `gsk_...`

## How to Add Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable:
   - **Key**: The variable name (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - **Value**: The actual value
   - **Environment**: Select **Production**, **Preview**, and **Development** (or just Production if you want)
6. Click **Save**
7. **Important**: After adding all variables, go to **Deployments** tab and redeploy your project (or push a new commit)

## Notes

- All `NEXT_PUBLIC_*` variables are exposed to the browser, so they're safe to use in client-side code
- The `GROQ_API_KEY` is server-side only (not prefixed with `NEXT_PUBLIC_`)
- After adding environment variables, you **must redeploy** for them to take effect
- You can verify variables are set by checking the build logs

## Alternative: Disable Google Sign-In

If you don't want to use Google sign-in, you can remove the Google sign-in button from the login/signup pages. The email/password authentication will work without Firebase.

## Getting Firebase Config Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project settings**
4. Scroll down to **Your apps** section
5. If you don't have a web app, click **Add app** → **Web** (</> icon)
6. Copy the config values from the `firebaseConfig` object

```javascript
const firebaseConfig = {
  apiKey: "AIza...",           // → NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "...",            // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "...",             // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "...",         // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "...",     // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "..."                  // → NEXT_PUBLIC_FIREBASE_APP_ID
};
```

## Troubleshooting

- **Still seeing errors after adding variables?** Make sure you redeployed the project
- **Google sign-in not working?** Check that all 6 Firebase variables are set correctly
- **Email/password works but Google doesn't?** This means Firebase variables are missing/invalid
- **Want to test locally?** Make sure your `.env.local` file has all these variables

