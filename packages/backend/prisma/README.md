# Prisma Seed Scripts

This directory contains seed scripts for initializing essential data in the database.

## All Category Seed

The `seed.ts` script ensures that the "All" category exists and is properly configured as a system category. This is critical for the product filtering functionality in the customer frontend.

### What the Script Does

- Checks if the "All" category exists in the database
- If it doesn't exist, creates it with `isSystemCategory` set to `true`
- If it exists but `isSystemCategory` is not `true`, updates it
- If it exists with the correct flag, simply logs that it's properly configured

### Running the Seed Script

There are two ways to run the seed script:

#### Option 1: Using Prisma CLI directly

```bash
npx prisma db seed
```

This is the preferred method as it uses Prisma's built-in seeding functionality.

#### Option 2: Using the npm script

```bash
npm run prisma:seed
```

This runs the seed script directly using ts-node.

### When to Run

The seed script should be run:

1. After initial database setup and migrations
2. After deploying to a new environment
3. If you notice the "All" category is missing or incorrectly configured

## Future Seed Scripts

Additional seed scripts can be added in the future for:

- Default user roles
- Admin user accounts
- Default product categories
- Service areas
- Other essential data required for application functionality

These could be incorporated into the same `seed.ts` file or organized in separate files as needed. 