// Google Calendar API integration

// Google OAuth 2.0 configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Track API loading state
let isLoading = false;
let isLoaded = false;
let loadError: Error | null = null;

// Debug function to safely log credential info without exposing full values
const debugCredentials = () => {
  console.log('Environment variables check:');
  console.log('NEXT_PUBLIC_GOOGLE_CLIENT_ID exists:', !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  console.log('NEXT_PUBLIC_GOOGLE_API_KEY exists:', !!process.env.NEXT_PUBLIC_GOOGLE_API_KEY);
  
  const clientIdLength = GOOGLE_CLIENT_ID?.length || 0;
  const apiKeyLength = GOOGLE_API_KEY?.length || 0;
  
  console.log('Credential lengths:', {
    clientId: clientIdLength > 0 ? `${clientIdLength} chars` : 'Empty',
    apiKey: apiKeyLength > 0 ? `${apiKeyLength} chars` : 'Empty'
  });
  
  if (clientIdLength > 0) {
    console.log('Client ID prefix:', GOOGLE_CLIENT_ID.substring(0, 8) + '...');
  }
  
  if (apiKeyLength > 0) {
    console.log('API Key prefix:', GOOGLE_API_KEY.substring(0, 4) + '...');
  }
};

// Load the Google API client library
export const loadGoogleCalendarApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isBrowser) {
      const error = new Error('Google Calendar API can only be loaded in browser environment');
      loadError = error;
      reject(error);
      return;
    }
    
    // Debug credential information
    debugCredentials();
    
    // Validate credentials
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.trim() === '') {
      const error = new Error('Google Calendar API Client ID is not configured');
      console.error('Missing Google Client ID');
      console.error('Please check your .env.local file and make sure NEXT_PUBLIC_GOOGLE_CLIENT_ID is set correctly');
      loadError = error;
      reject(error);
      return;
    }
    
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY.trim() === '') {
      const error = new Error('Google Calendar API Key is not configured');
      console.error('Missing Google API Key');
      console.error('Please check your .env.local file and make sure NEXT_PUBLIC_GOOGLE_API_KEY is set correctly');
      loadError = error;
      reject(error);
      return;
    }

    // If we're already loading, don't start another load
    if (isLoading) {
      console.log('Google Calendar API is already loading');
      reject(new Error('Google Calendar API is already loading'));
      return;
    }

    // If already loaded, resolve immediately
    if (isLoaded) {
      console.log('Google Calendar API is already loaded');
      resolve();
      return;
    }

    // Reset any previous load errors
    loadError = null;
    isLoading = true;

    console.log('Loading Google Calendar API...');
    
    // Load the Google API client library
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google API script loaded, loading client...');
      window.gapi.load('client', async () => {
        try {
          console.log('Initializing GAPI client with API key and discovery doc...');
          try {
            console.log('GAPI client initialization starting...');
            console.log('API Key length:', GOOGLE_API_KEY.length);
            console.log('Discovery Doc:', DISCOVERY_DOC);
            
            await window.gapi.client.init({
              apiKey: GOOGLE_API_KEY,
              discoveryDocs: [DISCOVERY_DOC],
            });
            console.log('GAPI client initialized successfully');
          } catch (initError) {
            console.error('GAPI client initialization error details:', initError);
            if (initError instanceof Error) {
              console.error('Error message:', initError.message);
              console.error('Error name:', initError.name);
              console.error('Error stack:', initError.stack);
            } else {
              console.error('Non-Error object thrown:', typeof initError, JSON.stringify(initError));
            }
            throw initError;
          }
          
          console.log('Loading Google Identity Services script...');
          // Load Google Identity Services
          const identityScript = document.createElement('script');
          identityScript.src = 'https://accounts.google.com/gsi/client';
          identityScript.async = true;
          identityScript.defer = true;
          
          identityScript.onload = () => {
            console.log('Google Identity Services loaded successfully');
            isLoaded = true;
            isLoading = false;
            resolve();
          };
          
          identityScript.onerror = (error) => {
            console.error('Error loading Google Identity Services:', error);
            isLoading = false;
            loadError = new Error('Failed to load Google Identity Services');
            reject(loadError);
          };
          
          document.body.appendChild(identityScript);
        } catch (error) {
          console.error('Error initializing GAPI client:', error);
          isLoading = false;
          loadError = error instanceof Error ? error : new Error('Unknown error initializing GAPI client');
          reject(loadError);
        }
      });
    };
    
    script.onerror = (error) => {
      console.error('Error loading Google API script:', error);
      isLoading = false;
      loadError = new Error('Failed to load Google API script');
      reject(loadError);
    };
    
    document.body.appendChild(script);
  });
};

// Initialize the GAPI client
const initializeGapiClient = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Loading GAPI client...');
      window.gapi.load('client:auth2', async () => {
        try {
          console.log('Initializing GAPI client with credentials...');
          console.log('Client ID:', GOOGLE_CLIENT_ID.substring(0, 8) + '...');
          console.log('API Key:', GOOGLE_API_KEY.substring(0, 4) + '...');
          
          await window.gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            clientId: GOOGLE_CLIENT_ID,
            discoveryDocs: [DISCOVERY_DOC],
            scope: SCOPES
          });
          
          console.log('Google Calendar API loaded successfully');
          isLoaded = true;
          isLoading = false;
          resolve();
        } catch (error) {
          console.error('Error initializing GAPI client:', error);
          // More detailed error logging
          if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
          }
          isLoading = false;
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error loading GAPI client:', error);
      isLoading = false;
      reject(error);
    }
  });
};

// Check if the user is signed in to Google
export const isSignedInToGoogle = (): boolean => {
  if (!isBrowser || !window.gapi?.auth2) return false;
  try {
    return window.gapi.auth2.getAuthInstance().isSignedIn.get();
  } catch (error) {
    console.error('Error checking Google sign-in status:', error);
    return false;
  }
};

// Sign in to Google
export const signInToGoogle = async (): Promise<void> => {
  if (!isBrowser) {
    throw new Error('Google API can only be used in browser environment');
  }
  
  if (!isLoaded) {
    console.log('API not loaded, loading before sign in...');
    await loadGoogleCalendarApi();
  }
  
  if (!window.gapi?.auth2) {
    throw new Error('Google API not loaded correctly');
  }
  
  try {
    console.log('Attempting to sign in to Google...');
    await window.gapi.auth2.getAuthInstance().signIn();
    console.log('Successfully signed in to Google');
  } catch (error) {
    console.error('Error signing in to Google:', error);
    throw error;
  }
};

// Sign out from Google
export const signOutFromGoogle = async (): Promise<void> => {
  if (!isBrowser || !window.gapi?.auth2) {
    throw new Error('Google API not loaded');
  }
  
  try {
    await window.gapi.auth2.getAuthInstance().signOut();
  } catch (error) {
    console.error('Error signing out from Google:', error);
    throw error;
  }
};

// Create calendar events for a route
export const exportRouteToGoogleCalendar = async (
  addresses: Array<{
    id: string;
    address: string;
    lat: number;
    lng: number;
    notes?: string;
    time_spent?: number;
  }>,
  routeDate: Date = new Date()
): Promise<string[]> => {
  if (!isBrowser) {
    throw new Error('Google Calendar API can only be used in browser environment');
  }
  
  if (!isLoaded) {
    console.log('API not loaded, loading before export...');
    await loadGoogleCalendarApi();
  }
  
  if (!window.gapi?.client?.calendar) {
    throw new Error('Google Calendar API not loaded correctly');
  }
  
  if (!isSignedInToGoogle()) {
    console.log('User not signed in, signing in before export...');
    await signInToGoogle();
  }
  
  console.log('Exporting route to Google Calendar...');
  const eventIds: string[] = [];
  let currentTime = new Date(routeDate);
  
  // Create an event for each address in the route
  for (const address of addresses) {
    const eventDuration = address.time_spent || 30; // Default to 30 minutes if not specified
    
    const startTime = new Date(currentTime);
    const endTime = new Date(currentTime);
    endTime.setMinutes(endTime.getMinutes() + eventDuration);
    
    try {
      const event = {
        summary: `Visit: ${address.address}`,
        location: address.address,
        description: address.notes || 'Route stop from DriveWise',
        start: {
          dateTime: startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };
      
      console.log('Creating calendar event for address:', address.address);
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });
      
      eventIds.push(response.result.id);
      console.log('Calendar event created successfully');
      
      // Update current time for the next event
      // Add travel time (estimated as 15 minutes between stops)
      currentTime = new Date(endTime);
      currentTime.setMinutes(currentTime.getMinutes() + 15);
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }
  
  return eventIds;
};

// Get user's Google Calendar list
export const getCalendarList = async (): Promise<any[]> => {
  if (!isBrowser) {
    throw new Error('Google Calendar API can only be used in browser environment');
  }
  
  if (!isLoaded) {
    await loadGoogleCalendarApi();
  }
  
  if (!window.gapi?.client?.calendar) {
    throw new Error('Google Calendar API not loaded correctly');
  }
  
  if (!isSignedInToGoogle()) {
    await signInToGoogle();
  }
  
  try {
    const response = await window.gapi.client.calendar.calendarList.list();
    return response.result.items || [];
  } catch (error) {
    console.error('Error getting calendar list:', error);
    throw error;
  }
};

// Add TypeScript interface for the global window object
declare global {
  interface Window {
    gapi: any;
  }
}
