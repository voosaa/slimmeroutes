// Google Calendar API integration

// Google OAuth 2.0 configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Load the Google API client library
export const loadGoogleCalendarApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isBrowser) {
      reject(new Error('Google Calendar API can only be loaded in browser environment'));
      return;
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
      reject(new Error('Google Calendar API credentials are not configured'));
      return;
    }

    // Load the Google API client library
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      // Initialize the gapi client
      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            clientId: GOOGLE_CLIENT_ID,
            discoveryDocs: [DISCOVERY_DOC],
            scope: SCOPES
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    };
    script.onerror = (error) => reject(error);
    document.body.appendChild(script);
  });
};

// Check if the user is signed in to Google
export const isSignedInToGoogle = (): boolean => {
  if (!isBrowser || !window.gapi?.auth2) return false;
  return window.gapi.auth2.getAuthInstance().isSignedIn.get();
};

// Sign in to Google
export const signInToGoogle = async (): Promise<void> => {
  if (!isBrowser || !window.gapi?.auth2) {
    throw new Error('Google API not loaded');
  }
  
  try {
    await window.gapi.auth2.getAuthInstance().signIn();
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
  if (!isBrowser || !window.gapi?.client?.calendar) {
    throw new Error('Google Calendar API not loaded');
  }
  
  if (!isSignedInToGoogle()) {
    throw new Error('Not signed in to Google');
  }
  
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
        description: address.notes || 'Route stop from RoutePlanner Pro',
        start: {
          dateTime: startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };
      
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });
      
      eventIds.push(response.result.id);
      
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
  if (!isBrowser || !window.gapi?.client?.calendar) {
    throw new Error('Google Calendar API not loaded');
  }
  
  if (!isSignedInToGoogle()) {
    throw new Error('Not signed in to Google');
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
