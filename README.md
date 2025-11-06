# Golden Lotus Attendance Module

A modern attendance/check-in system built for Golden Lotus company employees.

## Features

### User Panel (Home Page)
- Employee check-in form with the following fields:
  - Employee ID
  - Employee Name
  - Mobile Number
  - Department
  - Location
  - Number of kids below 3 feet height (with +/- controls)
  - Number of members above 3 feet height (with +/- controls)
- Automatic capture of Client Name, Project Name, and Activity Name via URL query parameters
- Beautiful, responsive UI with Atlassian Design System

### Intellsys Panel
- Comprehensive table view of all check-ins
- Search functionality (by Employee ID, Name, Mobile, Department, Location)
- Sort functionality on all columns
- CRUD operations:
  - Add new check-in entries
  - Edit existing entries
  - Delete entries
- Modal-based editing interface

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Atlassian Design System (Atlaskit)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or remote)
- npm or yarn package manager

## Installation

1. **Clone and navigate to the project:**
   ```bash
   cd attendance-app
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```
   Note: We use `--legacy-peer-deps` due to React version compatibility between Next.js 16 and Atlaskit components.

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the `DATABASE_URL` with your PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/attendance_db?schema=public"
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Create database and run migrations
   npx prisma migrate dev --name init
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   - User Panel: http://localhost:3000
   - Intellsys Panel: http://localhost:3000/intellsys

## Usage

### User Check-In

1. Navigate to the home page (http://localhost:3000)
2. Fill in the employee details
3. Use +/- buttons to adjust the number of kids and members
4. Submit the form
5. Optional: Add query parameters to the URL for automatic client/project/activity capture:
   ```
   http://localhost:3000?client=ClientName&project=ProjectName&activity=ActivityName
   ```

### Intellsys Panel

1. Navigate to http://localhost:3000/intellsys
2. View all check-ins in the table
3. Use the search bar to filter entries
4. Click on column headers to sort
5. Use "Add New Check-In" button to create entries
6. Use "Edit" button on any row to modify entries
7. Use "Delete" button to remove entries

## Database Schema

The application uses a single `CheckIn` model with the following fields:

- `id`: Auto-incrementing primary key
- `srNo`: Unique serial number
- `empId`: Employee ID
- `empName`: Employee name
- `empMobileNo`: Employee mobile number
- `department`: Department name
- `location`: Work location
- `kidsBelow3Feet`: Number of kids below 3 feet height
- `membersAbove3Feet`: Number of members above 3 feet height
- `clientName`: Client name (optional, from query params)
- `projectName`: Project name (optional, from query params)
- `activityName`: Activity name (optional, from query params)
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update

## API Endpoints

- `GET /api/checkins` - Get all check-ins (with optional search/sort)
- `POST /api/checkins` - Create a new check-in
- `GET /api/checkins/[id]` - Get a specific check-in
- `PUT /api/checkins/[id]` - Update a check-in
- `DELETE /api/checkins/[id]` - Delete a check-in

## Project Structure

```
attendance-app/
├── app/
│   ├── api/
│   │   └── checkins/
│   │       ├── route.ts          # GET all, POST new
│   │       └── [id]/
│   │           └── route.ts      # GET, PUT, DELETE by ID
│   ├── intellsys/
│   │   └── page.tsx              # Intellsys panel
│   ├── page.tsx                  # User check-in form
│   └── layout.tsx
├── lib/
│   └── prisma.ts                 # Prisma client singleton
├── prisma/
│   └── schema.prisma             # Database schema
├── .env                          # Environment variables
└── package.json
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma Studio (database GUI)
npx prisma studio

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset database
npx prisma migrate reset
```

## Deployment

### Database Setup

1. Create a PostgreSQL database on your hosting provider (e.g., Supabase, Railway, Neon)
2. Update the `DATABASE_URL` in your environment variables
3. Run migrations: `npx prisma migrate deploy`

### Next.js Deployment

Deploy to Vercel (recommended):
```bash
vercel
```

Or build and deploy manually:
```bash
npm run build
npm start
```

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check firewall settings for remote databases

### Prisma Client Errors
- Run `npx prisma generate` to regenerate the client
- Clear `.next` folder and restart dev server

### Package Installation Issues
- Always use `--legacy-peer-deps` flag with npm install
- Clear `node_modules` and reinstall if needed

## License

Proprietary - Golden Lotus Company

## Support

For issues or questions, contact your IT administrator.
