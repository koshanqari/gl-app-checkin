# Quick Setup Guide

Follow these steps to get the Golden Lotus Attendance Module up and running.

## Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

## Step 2: Configure Environment

Copy the example environment file and update it with your PostgreSQL credentials:

```bash
cp .env.example .env
```

Edit `.env` and set your database URL:
```
DATABASE_URL="postgresql://username:password@localhost:5432/attendance_db?schema=public"
```

**Database URL Format:**
```
postgresql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE_NAME]?schema=public
```

### Example Configurations:

**Local PostgreSQL:**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/attendance_db?schema=public"
```

**Supabase:**
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres?schema=public"
```

**Railway:**
```
DATABASE_URL="postgresql://postgres:[PASSWORD]@[REGION].railway.app:[PORT]/railway?schema=public"
```

## Step 3: Set Up Database

The `postinstall` script will automatically generate the Prisma client. Next, create and migrate your database:

```bash
npm run db:migrate
```

This will:
- Create the database if it doesn't exist
- Create all necessary tables
- Generate the Prisma client

## Step 4: Start the Development Server

```bash
npm run dev
```

## Step 5: Access the Application

- **User Check-In Form**: http://localhost:3000
- **Intellsys Panel**: http://localhost:3000/intellsys

## Optional: View Database with Prisma Studio

To view and edit your database visually:

```bash
npm run db:studio
```

This will open Prisma Studio at http://localhost:5555

## Troubleshooting

### "Cannot connect to database"
- Verify PostgreSQL is running
- Check your DATABASE_URL is correct
- Ensure the database user has proper permissions

### "Prisma Client not generated"
Run manually:
```bash
npm run db:generate
```

### Need to reset the database?
```bash
npm run db:reset
```

### Port 3000 already in use?
Run on a different port:
```bash
PORT=3001 npm run dev
```

## Next Steps

1. **Test the User Form**: Go to http://localhost:3000 and submit a test check-in
2. **View in Intellsys Panel**: Navigate to http://localhost:3000/intellsys to see your entry
3. **Test Query Parameters**: Try http://localhost:3000?client=TestClient&project=TestProject&activity=TestActivity

## Production Deployment

See the main README.md for detailed deployment instructions.

