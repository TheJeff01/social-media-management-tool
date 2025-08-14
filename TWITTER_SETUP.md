# Twitter Integration Setup Guide

## Overview
This guide will help you set up Twitter integration for your social media app. The integration includes:
- OAuth 2.0 authentication with PKCE
- Account connection and management
- Posting tweets with text and images
- Testing connection status

## Prerequisites
1. A Twitter Developer Account
2. A Twitter App created in the Twitter Developer Portal
3. OAuth 2.0 enabled on your Twitter App

## Step 1: Create Twitter App

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Sign in with your Twitter account
3. Create a new app or use an existing one
4. Navigate to your app's settings

## Step 2: Configure OAuth 2.0

1. In your app settings, enable **OAuth 2.0**
2. Set the **Type of App** to "Web App, Automated App or Bot"
3. Add the following **Callback URLs**:
   - Development: `http://localhost:5173/twitter/callback`
   - Production: `https://yourdomain.com/twitter/callback`
4. Enable the following **App permissions**:
   - Read
   - Write
   - Direct message (optional)

## Step 3: Configure Scopes

Ensure your app has the following OAuth 2.0 scopes:
- `tweet.read` - Read tweets and user information
- `tweet.write` - Post tweets
- `users.read` - Read user profile information
- `offline.access` - Refresh token access

## Step 4: Get Your Credentials

1. In your app settings, find the **Keys and tokens** section
2. Copy your **Client ID** (public)
3. Copy your **Client Secret** (keep this private!)

## Step 5: Update Your Code

1. Open `src/pages/Accounts/Accounts.jsx`
2. Find the `TWITTER_CONFIG` object (around line 35)
3. Replace the placeholder values with your actual credentials:

```javascript
const TWITTER_CONFIG = {
  CLIENT_ID: 'YOUR_ACTUAL_CLIENT_ID',
  CLIENT_SECRET: 'YOUR_ACTUAL_CLIENT_SECRET',
  SCOPES: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'].join(' '),
  REDIRECT_URI: `${window.location.origin}/twitter/callback`
};
```

## Step 6: Test the Integration

1. Start your development server
2. Go to the Accounts page
3. Click "Connect Twitter"
4. Complete the OAuth flow
5. Test the connection using the "Test" button

## Features Available

### Account Management
- Connect Twitter accounts via OAuth 2.0
- View connected account information
- Test connection status
- Disconnect accounts

### Posting
- Post text tweets
- Post tweets with images (file upload or URL)
- Character limit: 280 characters
- Support for multiple platform posting

### Security
- OAuth 2.0 with PKCE for secure authentication
- Tokens stored in sessionStorage (cleared on logout)
- No password storage
- Revocable access

## Rate Limits

Twitter API v2 has the following rate limits:
- **Tweet creation**: 300 requests per 15-minute window
- **Media upload**: 300 requests per 15-minute window
- **User lookup**: 300 requests per 15-minute window

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Ensure your callback URL exactly matches what's configured in Twitter
   - Check for trailing slashes or protocol mismatches

2. **"App not approved" error**
   - Twitter requires app approval for production use
   - For development, you can use your own account
   - Apply for elevated access if needed

3. **CORS errors**
   - Twitter API may block requests from certain origins
   - Consider using a proxy for production environments

4. **Token expiration**
   - Access tokens expire after 2 hours
   - Refresh tokens are used automatically
   - Users may need to re-authenticate if refresh fails

### Debug Mode

Enable console logging to debug issues:
```javascript
// Add this to your browser console
localStorage.setItem('debug', 'twitter:*');
```

## Production Considerations

1. **Environment Variables**: Store credentials in environment variables
2. **HTTPS**: Use HTTPS in production for secure OAuth flow
3. **Token Storage**: Consider more secure token storage for production
4. **Error Handling**: Implement comprehensive error handling
5. **Rate Limiting**: Implement rate limiting to avoid API restrictions

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Twitter App configuration
3. Ensure all required scopes are enabled
4. Check that your callback URLs are correct

## Security Notes

- Never commit your Client Secret to version control
- Use environment variables for production deployments
- Implement proper session management
- Regularly rotate your app credentials
- Monitor your app's usage and permissions
