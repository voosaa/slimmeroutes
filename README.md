# RoutePlanner Pro

RoutePlanner Pro is a comprehensive route optimization application designed to help businesses efficiently plan and manage customer visits. The application offers advanced features for address management, route generation, real-time traffic updates, dynamic pricing models, and detailed reporting.

## Features

- **Address Management**: Add, edit, and organize customer addresses with notes and details
- **Google Maps Integration**: Visualize addresses and routes on an interactive map
- **Multi-stop Route Optimization**: Automatically calculate the most efficient route for multiple stops
- **Real-time Traffic Updates**: Get up-to-date traffic information to adjust routes dynamically
- **Dynamic Pricing Model**: Calculate estimated costs based on distance, time, and fuel prices
- **Reporting and Analytics**: Generate detailed reports on distance traveled, time saved, and cost efficiency
- **User-friendly Interface**: Clean, responsive design with intuitive controls

## Tech Stack

- **Frontend**: Next.js with React, TypeScript, and Tailwind CSS
- **UI Components**: ShadCN UI
- **Maps & Geocoding**: Google Maps API, Places API
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Visualization**: Recharts for analytics

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Google Maps API key
- Supabase account and project

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Add Addresses**: Enter customer addresses using the address input form with Google Places autocomplete
2. **Generate Routes**: Click "Generate Route" to calculate the optimal route between all addresses
3. **View Analytics**: Switch to the Analytics tab to view reports on distance, time, and costs
4. **Export Data**: Export your schedule as CSV or share it with others

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js, Tailwind CSS, and ShadCN UI
- Maps powered by Google Maps Platform
- Database and authentication by Supabase
