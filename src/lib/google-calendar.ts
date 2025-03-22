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

// Load the Google API client library
export const loadGoogleCalendarApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isBrowser) {
      const error = new Error('Google Calendar API can only be loaded in browser environment');
      loadError = error;
      reject(error);
      return;
    }

    // More detailed logging of credentials format
    console.log('Google Calendar API credentials check:', { 
      clientId: GOOGLE_CLIENT_ID ? 
        `${GOOGLE_CLIENT_ID.substring(0, 8)}... (${GOOGLE_CLIENT_ID.length} chars, ends with .apps.googleusercontent.com: ${GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com')})` : 
        'Missing', 
      apiKey: GOOGLE_API_KEY ? 
        `${GOOGLE_API_KEY.substring(0, 8)}... (${GOOGLE_API_KEY.length} chars)` : 
        'Missing' 
    });

    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
      const error = new Error('Google Calendar API credentials are not configured');
      console.error('Missing Google Calendar API credentials');
      loadError = error;
      reject(error);
      return;
    }

    // Validate Client ID format
    if (!GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com')) {
      const error = new Error('Google Client ID is not in the correct format');
      console.error('Google Client ID should end with .apps.googleusercontent.com');
      loadError = error;
      reject(error);
      return;
    }

    // If already loaded, resolve immediately
    if (isLoaded && window.gapi?.client?.calendar) {
      console.log('Google Calendar API already loaded, resolving immediately');
      resolve();
      return;
    }

    // If already loading, wait for it to complete
    if (isLoading) {
      console.log('Google Calendar API already loading, waiting...');
      const checkLoaded = setInterval(() => {
        if (isLoaded) {
          clearInterval(checkLoaded);
          resolve();
        }
        if (loadError) {
          clearInterval(checkLoaded);
          reject(loadError);
        }
      }, 100);
      return;
    }

    isLoading = true;
    console.log('Starting Google Calendar API load process...');

    // First, check if gapi is already loaded
    if (window.gapi) {
      console.log('GAPI already exists, initializing client...');
      initializeGapiClient().then(resolve).catch(err => {
        loadError = err;
        isLoading = false;
        reject(err);
      });
      return;
    }

    // Load the Google API client library
    console.log('Loading gapi.js script...');
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google API script loaded successfully');
      initializeGapiClient().then(resolve).catch(err => {
        loadError = err;
        isLoading = false;
        reject(err);
      });
    };
    
    script.onerror = (error) => {
      console.error('Error loading Google API script:', error);
      loadError = new Error('Failed to load Google API script');
      isLoading = false;
      reject(error);
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
