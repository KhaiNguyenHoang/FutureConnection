export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const HUB_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');

export const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '';
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const OAUTH_REDIRECT = {
  github: `${APP_URL}/oauth/callback/github`,
  google: `${APP_URL}/oauth/callback/google`,
};

export const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(OAUTH_REDIRECT.github)}&scope=user:email`;

export const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(OAUTH_REDIRECT.google)}&response_type=code&scope=openid%20email%20profile`;

export const PASSWORD_MIN_LENGTH = 8;

export const LOCATION_TYPES = ['Remote', 'Hybrid', 'OnSite'] as const;
export const SENIORITY_LEVELS = ['Junior', 'Mid', 'Senior', 'Lead', 'Principal'] as const;
export const USER_ROLES = ['Freelancer', 'Employer'] as const;
