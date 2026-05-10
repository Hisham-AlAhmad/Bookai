# Bookai

Bookai is a Next.js application for managing business bookings, customer scheduling, and related operational workflows. The project uses Prisma with MySQL for persistence and includes authentication, booking, dashboard, and public booking pages.

## Prerequisites

Before you start, make sure you have the following installed:

- Node.js 18 or newer
- npm
- MySQL

You also need accounts or credentials for the external services used by the app:

- OpenRouter
- Twilio
- UploadThing
- A `NEXTAUTH_SECRET` value for NextAuth

## Clone the repository

1. Open a terminal.
2. Clone the repository.

```bash
git clone https://github.com/Hisham-AlAhmad/Bookai.git
```

3. Change into the project directory.

```bash
cd Bookai
```

## Install dependencies

Install the project dependencies with npm:

```bash
npm install
```

## Configure environment variables

1. Create a .env with this data:

```env
DATABASE_URL="mysql://root:@localhost:3306/bookai"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
OPENROUTER_API_KEY="your-key"
TWILIO_ACCOUNT_SID="your-sid"
TWILIO_AUTH_TOKEN="your-token"
TWILIO_PHONE_NUMBER="+1..."
UPLOADTHING_TOKEN="your-token"
```


## Set up the database

1. Make sure your MySQL database is running and the `DATABASE_URL` points to it.
2. Apply the Prisma schema to create the tables.

```bash
npx prisma migrate dev
```

3. If you want to load the sample data used by the project, run the seed script.

```bash
npm run seed
```

## Run the application

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Useful scripts

- `npm run dev` starts the local development server.
- `npm run seed` runs the Prisma seed script.

## Project structure

- `src/app` contains the Next.js App Router routes and API endpoints.
- `src/components` contains reusable UI and feature components.
- `src/lib` contains shared application utilities.
- `prisma/schema.prisma` defines the database schema.
- `prisma/seed.js` contains the database seed data.
