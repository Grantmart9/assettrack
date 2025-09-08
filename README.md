# Asset Tracking SaaS Application

This is a comprehensive asset tracking application built with Next.js, Supabase, and TypeScript.

## Features

- Asset management with QR code scanning
- User authentication and authorization
- Company management
- Asset assignment to users, sites, or vehicles
- Inspection tracking with scheduling
- Offline support with IndexedDB

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Supabase account

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd asset-tracking-saas
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up Supabase:
   - Create a new project in your Supabase dashboard
   - Get your Project URL and Anon Key from Project Settings > API
   - Update the `.env` file with your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
     NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
     ```

4. Set up the database:
   - Run the SQL commands from `init.sql` in your Supabase SQL editor
   - This will create all necessary tables and relationships

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

The application requires the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `DATABASE_URL`: Your PostgreSQL database connection string (for Prisma)

## Troubleshooting

### CORS Error

If you see a "CORS Failed" error when trying to sign up or log in, it means the application cannot connect to your Supabase project. To fix this:

1. Make sure you've updated the `.env` file with your actual Supabase credentials
2. Check that your Supabase project URL is correct (it should look like `https://your-project-id.supabase.co`)
3. Check that your Supabase anon key is correct
4. Make sure your Supabase project's CORS settings allow requests from localhost:
   - Go to your Supabase project dashboard
   - Click on "Settings" in the sidebar
   - Click on "API"
   - In the "CORS" section, make sure `http://localhost:3000` is in the list of allowed URLs

### Other Common Issues

- If you get "Invalid login credentials" errors, make sure you're using the correct email and password
- If you get database connection errors, make sure you've run the SQL commands from `init.sql`
- If you see "Module not found" errors, try restarting the development server

### Starting the Development Server

To start the development server, run:

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Folder Structure

- `src/app`: Next.js app router pages
- `src/components`: React components
- `src/lib`: Utility functions and services
- `prisma`: Prisma schema (for potential future use)
- `public`: Static assets

## Services

The application uses several services for different functionalities:

- `userService`: User authentication and management
- `companyService`: Company management
- `assetService`: Asset management with offline support
- `inspectionService`: Inspection scheduling and tracking
- `qrService`: QR code generation
- `cameraService`: Camera access and QR scanning
- `indexedDBService`: Offline storage

## Authentication

The application uses Supabase Auth for user authentication. Users can sign up and log in using email and password. Each user is associated with a company.

## Database

The application uses Supabase PostgreSQL database with the following tables:

- `companies`: Company information
- `users`: User information
- `assets`: Asset information
- `asset_tags`: Asset tags (QR codes, barcodes, etc.)
- `assignments`: Asset assignments to users/sites/vehicles
- `inspections`: Asset inspections
- `location_events`: Asset location tracking
- `job_sites`: Job site information
- `vehicles`: Vehicle information
- `audit_logs`: Audit trail of actions

## Offline Support

The application uses IndexedDB for offline support. Assets, assignments, and inspections are stored locally and synced with the server when online.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
