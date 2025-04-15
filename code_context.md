# Project Code Context (2025-04-15 16:52:24)

## Key Configuration Files

---
### File: `project_docs.txt`

```text
# Project Documentation: Hybrid E-commerce Platform

## 1. Project Summary

A mobile-first Progressive Web App (PWA - future goal) enabling online product discovery, cart management, and checkout. Uniquely integrates a mandatory customer-initiated phone call post-checkout for order verification. Verification is facilitated by admin-managed service area checks (using customer location captured via browser Geolocation API) and dynamic assignment of an available company phone number for the customer to call. Includes a separate Admin Panel (Desktop Web App) for managing products, categories (future), orders, service zones (via GeoJSON paste), and phone number availability.

**Core Problem:** Provide a structured online sales channel for businesses requiring a human verification step (phone call) before fulfillment, while offering online browsing convenience. Addresses service area constraints and manages verification calls efficiently.

## 2. Goals

*   **Business:** Increase order volume, improve order accuracy, enhance operational control (Admin Panel), manage service areas, build brand credibility.
*   **Customer UX (Mobile-First):** Intuitive mobile browsing/checkout, clear post-order call instructions, order history, accessibility.
*   **Admin UX:** Efficient order/product/zone/phone management workflow, clear data visualization.
*   **Technical:** Reliability (especially checkout/location/phone assignment), Security (HTTPS, auth, input validation), Performance (fast FE/API), Maintainability (clean code, docs), Scalability (ready for growth).

## 3. High-Level Architecture & Tech Stack

*   **Architecture:** Monorepo (`npm` workspaces), Customer Frontend <-> Backend API <-> DB, Admin Panel <-> Backend API <-> DB.
*   **Monorepo:** `npm` workspaces.
*   **Customer Frontend:** React (Vite, TypeScript, Bootstrap + react-bootstrap) - **Mobile-First Design Priority**.
*   **Admin Frontend:** React (Vite, TypeScript, Bootstrap + react-bootstrap).
*   **Backend API:** Node.js (Express.js, TypeScript).
*   **Database:** PostgreSQL (local instance for development).
*   **ORM:** Prisma.
*   **Styling:** Bootstrap + `react-bootstrap` (supplemented by minimal custom CSS in `index.css` if needed).
*   **API:** RESTful JSON API.
*   **Authentication:** JWTs (via localStorage on frontend for MVP).
*   **Geospatial:** Turf.js library in backend for point-in-polygon.
*   **Validation:** Zod (backend).
*   **API Client:** Axios (frontends).
*   **Routing (FE):** `react-router-dom`.

## 4. Lean MVP Plan V1 (Prioritized)

Focuses on the absolute core flow: Online Order -> Location Capture -> Backend Location Check -> Backend Phone Assignment -> Customer Sees Number -> Minimal Admin View/Control.

*   **Sprint 1: Core Backend & Minimal Data (COMPLETED)**
    *   Setup Monorepo (`npm`), Backend API project (Node/Express/TS).
    *   Setup Local PostgreSQL, Minimal Schema (Prisma: Users, Products(basic), Orders(basic), ServiceAreas(geojson text), PhoneNumbers(status)).
    *   Implement Backend Auth API (`POST /api/auth/register`, `POST /api/auth/login` - JWT).
    *   Implement Backend Core Order/Phone API:
        *   `POST /api/orders` (Accepts data + lat/lon, performs location check via Turf.js, saves order/result, returns `orderId`).
        *   `GET /api/orders/assign-number/:orderId` (Finds/returns available number string, marks number 'Busy').
    *   Implement Backend Read/Write APIs (Admin): `GET /api/products`, `GET /api/admin/phonenumbers`, `POST /api/admin/phonenumbers/:id/status`, `GET /api/admin/serviceareas`, `POST /api/admin/serviceareas`, `GET /api/admin/orders`.
    *   Implemented utility scripts (`seed-user`, `fix-service-areas`, `generate-token`). Fixed JWT secret consistency.

*   **Sprint 2: Minimal Admin Interface (COMPLETED)**
    *   Setup Admin Frontend project (React/Vite/TS/Bootstrap). Switched from `pnpm` to `npm`. Replaced initial Tailwind attempt with Bootstrap + `react-bootstrap`.
    *   Implement Admin `LoginPage` component using `react-bootstrap`, handling API call, state, errors, token storage (localStorage).
    *   Implement basic Routing (`react-router-dom`): Login page, protected routes wrapper (`ProtectedRoute`), shared layout (`AdminLayout` using `react-bootstrap` Navbar/Nav), placeholder pages (Dashboard, Phones, Orders, Zones). Logout functionality.
    *   Implement `PhoneManagementPage`: Fetch list (`GET /api/admin/phonenumbers`), display in `react-bootstrap` Table, implement status toggle (`POST /api/admin/phonenumbers/:id/status`) with Buttons, handle loading/errors.
    *   Implement `OrderManagementPage` (Read-Only): Fetch list (`GET /api/admin/orders`), display in `react-bootstrap` Table with relevant fields and status Badges, handle loading/errors.
    *   Implement `ZoneManagementPage`: Fetch list (`GET /api/admin/serviceareas`), display in Table (previewing GeoJSON string); Implement 'Add Zone' form using `react-bootstrap` components (`Form`, `Card`, `Button`, `Alert`), handle input/submission (`POST /api/admin/serviceareas`), refresh list on success, handle loading/errors/validation.

*   **Sprint 3: Minimal Customer Frontend (IN PROGRESS)**
    *   **Task 1:** Setup Customer Frontend project (React/Vite/TS/Bootstrap) - **(COMPLETED)**.
    *   **Task 2:** Implement basic Routing (Home, basic Product List, Cart stub, Login/Register stubs, Order Success Page stub) - **(NEXT)**.
    *   **Task 3:** Implement Customer Auth UI (Register/Login pages/components calling backend).
    *   **Task 4:** Implement basic Product Display (fetch from `GET /api/products`, display in list/grid).
    *   **Task 5:** Implement simple Client-Side Cart (add to cart button, basic cart state/display).
    *   **Task 6:** Implement Checkout Page (single page): Inputs (Name, Phone, Address(TextArea)); Button triggers Geolocation `getCurrentPosition()`; On location success, POSTs data (auth token, details, lat, lon, cart items) to `/api/orders`; On API success, redirects to Success Page (`orderId`). Handle Geo/API errors.
    *   **Task 7:** Implement Order Success Page: Calls `/api/orders/assign-number/:orderId`; Displays assigned phone number prominently (`tel:` link).

*   **Deferred Features (Post-MVP):**
    PWA features, search/filter/sort (products/orders), password reset, saved addresses, user profiles, multi-language, admin dashboard widgets, admin map UI for zones, advanced phone assignment logic, category management, product variants/images, admin editing/deleting, detailed styling refinements, automated tests, deployment setup (Docker possibly revisited), order status updates beyond initial call, etc.

## 5. Current Progress

*   **Current State:** Sprint 3 (Minimal Customer Frontend) started.
*   **Current Focus:** Setting up the basic Customer Frontend project structure and implementing initial routing.
*   **Completed Sprints:** Sprint 1 (Core Backend), Sprint 2 (Minimal Admin Interface).
*   **Current Branch:** `main` (Will use feature branches for significant UI work).

## 6. Chat Summary

*   Project initiated; detailed requirements provided.
*   Initial plan proposed (Vue, Node, etc.).
*   Lean MVP plan adopted, prioritizing core backend flow.
*   **Sprint 1 Completed:** Backend API implemented (Auth, Admin CRUD for Phones/Zones, Public Products, Core Order flow w/ location check & number assignment). Addressed JWT secret issues. Tested via Postman.
*   **Sprint 2 Started:** Admin Frontend setup initiated (Vue attempt). Encountered tooling issues.
*   **Frontend Restart:** Decided to restart Admin Frontend using React + Vite + TS + Bootstrap. Removed old Vue attempt.
*   **Admin Frontend Rebuild:** Successfully scaffolded React project, integrated Bootstrap + `react-bootstrap`.
*   Implemented Admin Login page & functionality.
*   Implemented full Admin routing structure (`react-router-dom`), protected routes, shared layout. Resolved initial `react-router-bootstrap` conflict using `Link as={...}` pattern. Styled layout with `react-bootstrap`.
*   Implemented functional Admin Phone Management page (fetch, display, toggle status).
*   Implemented functional Admin Order Management page (read-only fetch, display).
*   Implemented functional Admin Zone Management page (fetch, display, add new zone form).
*   **Sprint 2 Completed.**
*   **Sprint 3 Started:** Initial Customer Frontend project scaffolded (React + Vite + TS + Bootstrap). Mobile-first priority noted.

## 7. Dev Notes / Lessons Learned

*   L1: UI Layout Brittleness (Mitigation: Simple initial UI, Component Libraries, Responsive utilities)
*   L2: Implicit Context & State (Mitigation: Clear state mgmt, API calls, Prop drilling awareness)
*   L3: Visual Feedback Loop is Critical (Mitigation: User validation + testing)
*   L4: Async & UI Responsiveness (Mitigation: Loading states, disable buttons during calls)
*   L5: Abstract vs. Concrete Styling (Mitigation: Component libraries like react-bootstrap)
*   L6: Component Boundaries (Mitigation: Encapsulation, Clear props)
*   L7: MVP Philosophy: Implement backend first / foundations first. Iterate.
*   L8: Manual Command Reliability: User must carefully execute manual commands (Git, npm, tests) and report results accurately.
*   L9: Build System Issues: Config errors (vite.config, tsconfig, postcss.config) require careful setup. Manual test (`npm run build`) is key.
*   L10: (Removed - Tool specific)
*   L11: Explicit Instructions: Prompts must clearly specify file paths and desired logic/structure.
*   L12: (Removed - Tool specific)
*   L13: CSS Specificity & Transforms: Less relevant now using Bootstrap, but complex CSS can break layout.
*   L14: Coder Proactivity vs. Scope: Coder might make unrequested changes; user validation crucial.
*   L15: Handling Existing Projects: Requires analysis, documentation, goal setting before workflow.
*   L16: Code Removal Caution: Verify code is dead before removing; check shared utilities.
*   L17: Switched from Dockerized PostgreSQL to local instance due to setup issues. Adjusted `.env`. Fixed `dev` script for Windows PowerShell.
*   L18: GeoJSON Handling - Parsing requires robust error handling. Invalid data breaks checks; utility scripts can help.
*   L19: Testing Auth Endpoints - Utility scripts (`generate-token`, `seed-user`) valuable for backend-only dev. Postman/Insomnia essential.
*   L20: State Management (Backend) - Critical ops (assigning phone) should update resource state ('Busy') to prevent race conditions.
*   L21: Customer Frontend - Prioritize mobile-first design principles (layout, navigation, touch targets). Use responsive utilities/components.
*   L22: JWT Secret Management: Ensure JWT secret is consistent across generation (login) and verification (middleware). Use `.env` file reliably.
*   L23: Frontend Tooling Conflicts: Frameworks (React/Vue), bundlers (Vite), CSS tools (Tailwind/PostCSS/Bootstrap) can have configuration conflicts. Switching tools (e.g., Tailwind -> Bootstrap) can resolve persistent issues. Check compatibility and follow official integration guides.
*   L24: Routing Integration: Component library wrappers (e.g., `react-router-bootstrap`) might have issues; standard router components (`Link`) with props (`as={...}`) can be a workaround.
```

---
### File: `package.json`

```json
{
  "name": "hybrid-ecommerce-platform",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev:backend": "npm run dev --workspace=backend",
    "dev:admin": "npm run dev --workspace=admin-frontend",
    "dev:customer": "npm run dev --workspace=customer-frontend",
    "build:backend": "npm run build --workspace=backend",
    "build:admin": "npm run build --workspace=admin-frontend",
    "build:customer": "npm run build --workspace=customer-frontend",
    "build": "npm run build:backend && npm run build:admin && npm run build:customer",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "workspaces": [
    "packages/*"
  ]
}
```

---
### File: `packages/backend/package.json`

```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon --watch src/**/*.ts --exec ts-node src/index.ts",
    "build": "prisma generate && tsc",
    "start": "node dist/index.js",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "generate-token": "node generate-token.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "@prisma/client": "^6.6.0",
    "@turf/boolean-point-in-polygon": "^7.2.0",
    "@turf/helpers": "^7.2.0",
    "@types/multer": "^1.4.12",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.2",
    "react-router-bootstrap": "^0.26.3",
    "react-router-dom": "^6.30.0",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.1",
    "@types/jsonwebtoken": "^9.0.9",
    "@types/node": "^22.14.1",
    "@types/turf": "^3.5.32",
    "nodemon": "^3.1.9",
    "prisma": "^6.6.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.8.3"
  }
}
```

---
### File: `packages/customer-frontend/package.json`

```json
{
  "name": "customer-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "bootstrap": "^5.3.5",
    "react": "^19.0.0",
    "react-bootstrap": "^2.10.9",
    "react-dom": "^19.0.0",
    "react-hot-toast": "^2.5.2",
    "react-icons": "^5.5.0",
    "react-router-bootstrap": "^0.26.2",
    "react-router-dom": "^6.30.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.21.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@types/react-router-bootstrap": "^0.26.6",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.21.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^15.15.0",
    "typescript": "~5.7.2",
    "typescript-eslint": "^8.24.1",
    "vite": "^6.2.0",
    "vite-plugin-pwa": "^1.0.0"
  }
}
```

---
### File: `packages/admin-frontend/package.json`

```json
{
  "name": "admin-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@types/leaflet": "^1.9.17",
    "@types/leaflet-draw": "^1.0.11",
    "axios": "^1.8.4",
    "bootstrap": "^5.3.5",
    "chart.js": "^4.4.8",
    "date-fns": "^4.1.0",
    "leaflet": "^1.9.4",
    "leaflet-draw": "^1.0.4",
    "react": "^19.0.0",
    "react-bootstrap": "^2.10.9",
    "react-chartjs-2": "^5.3.0",
    "react-dom": "^19.0.0",
    "react-hot-toast": "^2.5.2",
    "react-icons": "^5.5.0",
    "react-leaflet": "^5.0.0",
    "react-router-bootstrap": "^0.26.3",
    "react-router-dom": "^6.30.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.21.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react-swc": "^3.8.0",
    "eslint": "^9.21.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^15.15.0",
    "typescript": "~5.7.2",
    "typescript-eslint": "^8.24.1",
    "vite": "^6.2.0"
  }
}
```

---
### File: `packages/backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                   Int       @id @default(autoincrement())
  email                String    @unique
  passwordHash         String
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  passwordResetExpires DateTime?
  passwordResetToken   String?   @unique
  orders               Order[]
  reviews              Review[]
  cartItems            CartItem[]
  wishlistItems        WishlistItem[]
}

model Category {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  imageUrl    String?
  products    Product[]
}

model Product {
  id            Int         @id @default(autoincrement())
  name          String
  price         Float
  description   String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  imageUrl      String?
  stock         Int         @default(0)
  categoryId    Int?
  averageRating Float?
  reviewCount   Int         @default(0)
  orderItems    OrderItem[]
  category      Category?   @relation(fields: [categoryId], references: [id])
  reviews       Review[]
  cartItems     CartItem[]
  wishlistedBy  WishlistItem[]
}

model Order {
  id                  Int         @id @default(autoincrement())
  userId              Int
  latitude            Float?
  longitude           Float?
  status              String
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
  shippingDetails     Json?
  totalAmount         Float
  locationCheckResult String?
  user                User        @relation(fields: [userId], references: [id])
  items               OrderItem[]
}

model OrderItem {
  id          Int      @id @default(autoincrement())
  orderId     Int
  productId   Int
  productName String
  quantity    Int
  price       Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product     Product  @relation(fields: [productId], references: [id])
}

model ServiceArea {
  id             Int      @id @default(autoincrement())
  name           String   @unique
  geoJsonPolygon String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model PhoneNumber {
  id           Int      @id @default(autoincrement())
  numberString String   @unique
  status       String   @default("Offline")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Review {
  id        Int      @id @default(autoincrement())
  rating    Int
  comment   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  productId Int
  userId    Int
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
}

model CartItem {
  id        Int      @id @default(autoincrement())
  userId    Int
  productId Int
  quantity  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  product   Product  @relation(fields: [productId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, productId]) // Ensure uniqueness of product per user
}

model WishlistItem {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId Int
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, productId]) // User can only wishlist a product once
}
```

---
### File: `packages/backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2016",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```

---
### File: `packages/customer-frontend/tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

---
### File: `packages/admin-frontend/tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

## Source Code Files

---
### File: `packages/backend/src/index.ts`

```typescript
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import productRoutes from './routes/productRoutes';
import adminRoutes from './routes/adminRoutes';
import productAdminRoutes from './routes/productAdminRoutes';
import orderRoutes from './routes/orderRoutes';
import authRoutes from './routes/authRoutes';
import categoryAdminRoutes from './routes/categoryAdminRoutes';
import categoryRoutes from './routes/categoryRoutes';
import uploadRoutes from './routes/uploadRoutes';
import reviewRoutes from './routes/reviewRoutes';
import reportsAdminRoutes from './routes/reportsAdminRoutes';
import cartRoutes from './routes/cartRoutes';
import wishlistRoutes from './routes/wishlistRoutes';

dotenv.config(); // Load .env file variables

const app = express();
const port = process.env.PORT || 3001; // Use port from .env or default to 3001

// Middleware
app.use(cors()); // Allow requests from frontend (configure origin later for security)
app.use(express.json()); // Parse JSON request bodies

// Serve Static Files
app.use(express.static(path.join(__dirname, '..', 'public')));
// Example: A file at public/uploads/image.jpg will be accessible via http://localhost:3001/uploads/image.jpg

// Basic Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hybrid E-commerce Backend API is running!');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/products', productAdminRoutes);
app.use('/api/admin/categories', categoryAdminRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/admin/reports', reportsAdminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
```

---
### File: `packages/backend/src/middleware/authMiddleware.js`

```javascript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUser = exports.isAdmin = void 0;
// Replace the problematic import with direct require
var jwt = require('jsonwebtoken');
var JWT_SECRET = process.env.JWT_SECRET || 'default_secret_for_dev_only'; // Use environment variable or default for development
// Admin authentication middleware
var isAdmin = function (req, res, next) {
    console.log('isAdmin middleware called');
    var authHeader = req.headers.authorization;
    // Check if Authorization header exists and starts with 'Bearer '
    if (authHeader && authHeader.startsWith('Bearer ')) {
        var token = authHeader.split(' ')[1]; // Extract token
        console.log('Token found, verifying...');
        console.log('JWT_SECRET exists:', !!JWT_SECRET);
        try {
            // Verify the token
            var decoded = jwt.verify(token, JWT_SECRET);
            console.log('Token verified successfully:', decoded);
            // Attach decoded payload to request object
            req.user = decoded;
            // TODO (Future): Check if the decoded payload corresponds to an admin user in the DB.
            // For MVP V1, just verifying the token is enough to proceed.
            next(); // Token is valid (for MVP), proceed to the route handler
        }
        catch (error) {
            // Token verification failed (invalid or expired)
            console.error('Token verification failed:', error);
            res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
    }
    else {
        // No token provided
        console.log('No auth token provided in request');
        res.status(401).json({ message: 'Unauthorized: Token required' });
    }
};
exports.isAdmin = isAdmin;
// User authentication middleware - identical to isAdmin for now
// Will be differentiated in future for role-based access
var isUser = function (req, res, next) {
    var authHeader = req.headers.authorization;
    // Check if Authorization header exists and starts with 'Bearer '
    if (authHeader && authHeader.startsWith('Bearer ')) {
        var token = authHeader.split(' ')[1]; // Extract token
        try {
            // Verify the token
            var decoded = jwt.verify(token, JWT_SECRET);
            // Attach decoded payload to request object
            req.user = decoded;
            next(); // Token is valid, proceed to the route handler
        }
        catch (error) {
            // Token verification failed (invalid or expired)
            res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
    }
    else {
        // No token provided
        res.status(401).json({ message: 'Unauthorized: Token required' });
    }
};
exports.isUser = isUser;
```

---
### File: `packages/backend/src/middleware/authMiddleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
// Use require instead of import for jwt to avoid transpilation issues
const jwt = require('jsonwebtoken');
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Get JWT secret with a fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_for_dev_only';

// Interface for the JWT payload
interface UserPayload {
  userId: number;
  email: string;
  role?: string;
  exp?: number;
}

// Extend the Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// Admin authentication middleware
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log('isAdmin middleware called');
  const authHeader = req.headers.authorization;
  
  // Check if Authorization header exists and starts with 'Bearer '
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]; // Extract token
    console.log('Token found, verifying...');
    console.log('JWT_SECRET exists:', !!JWT_SECRET); // Debug
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token verified successfully:', decoded);
      
      // Attach decoded payload to request object
      req.user = decoded as UserPayload;
      
      // TODO (Future): Check if the decoded payload corresponds to an admin user in the DB.
      // For MVP V1, just verifying the token is enough to proceed.
      next(); // Token is valid (for MVP), proceed to the route handler
    } catch (error) {
      // Token verification failed (invalid or expired)
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  } else {
    // No token provided
    console.log('No auth token provided in request');
    res.status(401).json({ message: 'Unauthorized: Token required' });
  }
};

// User authentication middleware - identical to isAdmin for now
// Will be differentiated in future for role-based access
export const isUser = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  // Check if Authorization header exists and starts with 'Bearer '
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]; // Extract token
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Attach decoded payload to request object
      req.user = decoded as UserPayload;
      
      next(); // Token is valid, proceed to the route handler
    } catch (error) {
      // Token verification failed (invalid or expired)
      res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  } else {
    // No token provided
    res.status(401).json({ message: 'Unauthorized: Token required' });
  }
};
```

---
### File: `packages/backend/src/routes/adminRoutes.ts`

```typescript
import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod'; // Import Zod for validation
import { isAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/admin/stats - Fetch dashboard statistics
router.get('/stats', isAdmin, async (req: Request, res: Response) => {
    console.log('GET /api/admin/stats route hit');
    try {
        const [ // Use Promise.all with prisma.$transaction for potentially better type inference
            totalOrders,
            pendingOrders,
            verifiedOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            totalProducts,
            totalUsers,
            availablePhones,
            totalZones,
            revenueResult,
            ordersLast7Days
        ] = await prisma.$transaction([
            prisma.order.count(),
            prisma.order.count({ where: { status: 'Pending Call' } }),
            prisma.order.count({ where: { status: 'Verified' } }),
            prisma.order.count({ where: { status: 'Processing' } }),
            prisma.order.count({ where: { status: 'Shipped' } }),
            prisma.order.count({ where: { status: 'Delivered' } }),
            prisma.order.count({ where: { status: 'Cancelled' } }),
            prisma.product.count(),
            prisma.user.count(),
            prisma.phoneNumber.count({ where: { status: 'Available' } }),
            prisma.serviceArea.count(),
            // Calculate total revenue (excluding cancelled orders)
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: { 
                    status: { 
                        notIn: ['Cancelled', 'Pending Call'] 
                    } 
                }
            }),
            // Count orders from the last 7 days
            prisma.order.count({
                where: {
                    createdAt: { 
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                    }
                }
            })
        ]);

        // Fetch the latest 5 orders for dashboard display
        const recentOrders = await prisma.order.findMany({
            take: 5, // Limit to latest 5
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                status: true,
                totalAmount: true,
                createdAt: true,
                shippingDetails: true, // Fetch the JSON
            }
        });

        // Process shippingDetails to extract customer name if needed
        const processedRecentOrders = recentOrders.map(order => {
             let customerName = '(N/A)';
             if (typeof order.shippingDetails === 'object' && order.shippingDetails !== null && 'fullName' in order.shippingDetails) {
                  customerName = (order.shippingDetails as any).fullName || customerName;
             } else if (typeof order.shippingDetails === 'string') {
                 try {
                     const details = JSON.parse(order.shippingDetails);
                     customerName = details?.fullName || customerName;
                 } catch { /* ignore parse error */ }
             }
             return {
                 id: order.id,
                 customerName: customerName, // Add extracted name
                 status: order.status,
                 totalAmount: order.totalAmount,
                 createdAt: order.createdAt
             };
        });

        const stats = {
            totalOrders,
            pendingOrders,
            verifiedOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            totalProducts,
            totalUsers,
            availablePhones,
            totalZones,
            totalRevenue: revenueResult._sum.totalAmount ?? 0, // Handle null case
            ordersLast7Days,
            recentOrders: processedRecentOrders // Add recent orders
        };

        console.log('Admin stats fetched:', stats);
        res.status(200).json(stats);

    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: 'Failed to fetch dashboard statistics.' });
    }
});

// GET /api/admin/orders - Fetch all orders for admin view (now with status filter)
router.get('/orders', isAdmin, async (req: Request, res: Response) => {
  // Get optional status query parameter
  const statusFilter = req.query.status as string | undefined;
  console.log(`GET /api/admin/orders route hit. Status filter: ${statusFilter}`);

  try {
    // Build dynamic where clause
    const whereClause: Prisma.OrderWhereInput = {}; // Initialize empty where clause

    if (statusFilter && statusFilter.trim() !== '') {
        // Add status condition if filter is provided and not empty
        whereClause.status = statusFilter.trim();
        console.log(`Applying status filter: ${whereClause.status}`);
    }

    // Fetch orders from the database with relevant fields
    console.log('Fetching orders from database with where clause:', whereClause);
    const orders = await prisma.order.findMany({
      where: whereClause, // Apply the dynamic where clause
      select: {
        id: true,
        status: true,
        totalAmount: true,
        shippingDetails: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        user: {
          select: {
            email: true
          }
        },
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' 
      }
    });

    // Process orders to ensure consistent shippingDetails format
    const processedOrders = orders.map(order => {
      // Ensure shippingDetails exists and is properly formatted
      let formattedShippingDetails = order.shippingDetails;
      
      // If shippingDetails is a string (JSON), parse it
      if (typeof order.shippingDetails === 'string') {
        try {
          formattedShippingDetails = JSON.parse(order.shippingDetails);
        } catch (e) {
          console.warn(`Could not parse shippingDetails for order ${order.id}`);
          formattedShippingDetails = {};
        }
      }
      
      // If shippingDetails doesn't exist or is null, provide an empty object
      if (!formattedShippingDetails) {
        formattedShippingDetails = {};
      }
      
      return {
        ...order,
        shippingDetails: formattedShippingDetails
      };
    });

    console.log(`Found ${orders.length} orders matching filter.`);
    // Return the processed list as JSON
    res.status(200).json(processedOrders);
  } catch (error) {
    // Handle potential database errors
    console.error("Error fetching orders for admin:", error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

// POST /api/admin/orders/:orderId/status - Update an order's status
router.post('/orders/:orderId/status', isAdmin, async (req: Request, res: Response) => {
  // Define allowed statuses
  const allowedOrderStatuses = ["Pending Call", "Verified", "Processing", "Shipped", "Delivered", "Cancelled"];
  
  // Define validation schema using Zod
  const updateOrderStatusSchema = z.object({
    status: z.string().refine(val => allowedOrderStatuses.includes(val), {
      message: `Status must be one of: ${allowedOrderStatuses.join(', ')}`
    })
  });

  // 1. Validate orderId param (convert to int, check NaN)
  const orderIdInt = parseInt(req.params.orderId, 10);
  if (isNaN(orderIdInt)) {
    res.status(400).json({ message: 'Invalid order ID' });
    return;
  }

  // 2. Validate request body using Zod schema
  const validationResult = updateOrderStatusSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ 
      message: 'Validation failed', 
      errors: validationResult.error.errors 
    });
    return;
  }
  
  const { status: newStatus } = validationResult.data;

  try {
    // 3. Use Prisma `update` to change the status of the specified order
    const updatedOrder = await prisma.order.update({
      where: { id: orderIdInt },
      data: { status: newStatus },
      select: { // Return updated order status and ID
        id: true,
        status: true
      }
    });
    
    // 4. Return 200 OK with updated status
    res.status(200).json(updatedOrder);
  } catch (error: any) {
    // 5. Handle errors (Prisma P2025 for Not Found -> return 404, other errors -> 500)
    if (error.code === 'P2025') {
      res.status(404).json({ message: `Order with ID ${orderIdInt} not found` });
      return;
    }
    console.error(`Error updating order ${orderIdInt} status:`, error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

// GET /api/admin/orders/:orderId - Fetch a single order by ID with details
router.get('/orders/:orderId', isAdmin, async (req: Request, res: Response) => {
  // 1. Validate orderId param (convert to int, check NaN)
  const orderIdInt = parseInt(req.params.orderId, 10);
  if (isNaN(orderIdInt)) {
    res.status(400).json({ message: 'Invalid order ID' });
    return;
  }

  try {
    // 2. Use Prisma to find the order with the specified ID
    const orderDetails = await prisma.order.findUnique({
      where: { id: orderIdInt },
      include: {
        // Include user email for reference
        user: {
          select: { email: true }
        },
        // Include the items associated with this order
        items: {
          include: {
            product: {
              select: { name: true, price: true }
            }
          }
        }
      }
    });

    // 3. Handle case where order is not found
    if (!orderDetails) {
      res.status(404).json({ message: `Order with ID ${orderIdInt} not found` });
      return;
    }

    // 4. Return 200 OK with the detailed order object
    res.status(200).json(orderDetails);
  } catch (error) {
    // 5. Handle potential errors (e.g., database errors)
    console.error(`Error fetching order ${orderIdInt}:`, error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

// Zod schema for validating new phone number input
const createPhoneNumberSchema = z.object({
  numberString: z.string().min(5, { message: "Phone number seems too short" }), // Basic length check
  // status: z.enum(['Available', 'Busy', 'Offline']).optional() // Optional initial status, defaults to 'Offline' via Prisma
});

// GET /api/admin/phonenumbers - Fetch all phone numbers
router.get('/phonenumbers', isAdmin, async (req: Request, res: Response) => {
  try {
    // Fetch all records from the PhoneNumber table
    const phoneNumbers = await prisma.phoneNumber.findMany({
      // Select only the necessary fields for the admin view
      select: {
        id: true,
        numberString: true,
        status: true
      }
    });
    
    // Return the list as JSON
    res.status(200).json(phoneNumbers);
  } catch (error) {
    // Handle potential database errors
    console.error("Error fetching phone numbers:", error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

// POST /api/admin/phonenumbers - Create a new phone number
router.post('/phonenumbers', isAdmin, async (req: Request, res: Response) => {
  // Validate request body using Zod
  const validationResult = createPhoneNumberSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ 
      message: "Validation failed", 
      errors: validationResult.error.errors 
    });
    return;
  }

  // Extract validated data
  const validatedData = validationResult.data;

  try {
    // Use Prisma to create a new phone number
    const newPhoneNumber = await prisma.phoneNumber.create({
      data: validatedData, // Status will default to 'Offline' based on the schema default
      select: {
        id: true,
        numberString: true,
        status: true
      }
    });

    // Return the newly created phone number with 201 Created status
    res.status(201).json(newPhoneNumber);
  } catch (error: any) {
    // Handle unique constraint violation on numberString
    if (error.code === 'P2002' && error.meta?.target?.includes('numberString')) {
      res.status(409).json({ message: "This phone number already exists." });
      return;
    }
    
    // Handle other errors
    console.error("Error creating phone number:", error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

// POST /api/admin/phonenumbers/:id/status - Update a phone number's status
router.post('/phonenumbers/:id/status', isAdmin, async (req: Request, res: Response) => {
  // 1. Get the phone number ID from route parameters
  const { id } = req.params;
  // 2. Get the new status from the request body
  const { status } = req.body;

  // 3. Basic Input Validation
  const allowedStatuses = ['Available', 'Busy', 'Offline'];
  if (!status || !allowedStatuses.includes(status)) {
    res.status(400).json({ 
      message: 'Invalid status provided. Must be one of: ' + allowedStatuses.join(', ') 
    });
    return;
  }

  const phoneNumberId = parseInt(id, 10);
  if (isNaN(phoneNumberId)) {
    res.status(400).json({ message: 'Invalid phone number ID.' });
    return;
  }

  try {
    // 4. Update the phone number's status in the database
    const updatedPhoneNumber = await prisma.phoneNumber.update({
      where: { id: phoneNumberId },
      data: { status },
      select: { 
        id: true, 
        numberString: true, 
        status: true 
      }
    });

    // 5. Return the updated phone number
    res.status(200).json(updatedPhoneNumber);

  } catch (error: any) {
    // 6. Handle potential errors
    if (error.code === 'P2025') { // Prisma code for record not found
      res.status(404).json({ 
        message: `Phone number with ID ${phoneNumberId} not found.` 
      });
      return;
    }
    console.error(`Error updating phone number ${phoneNumberId} status:`, error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

// GET /api/admin/serviceareas - Fetch all service areas
router.get('/serviceareas', isAdmin, async (req: Request, res: Response) => {
  try {
    // 1. Fetch all records from the ServiceArea table
    const serviceAreas = await prisma.serviceArea.findMany({
      // 2. Select the fields needed: id, name, geoJsonPolygon
      select: {
        id: true,
        name: true,
        geoJsonPolygon: true // The string representation
      }
    });
    
    // 3. Return the list as JSON
    res.status(200).json(serviceAreas);
  } catch (error) {
    // 4. Handle potential database errors
    console.error("Error fetching service areas:", error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

// Define a Zod schema for input validation
const createServiceAreaSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  geoJsonPolygon: z.string().min(10, { message: "GeoJSON Polygon string is required and must be valid" }) // Basic check
  // Add more specific GeoJSON validation later if needed
});

// POST /api/admin/serviceareas - Create a new service area
router.post('/serviceareas', isAdmin, async (req: Request, res: Response) => {
  // 1. Validate Request Body using Zod
  const validationResult = createServiceAreaSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ 
      message: "Validation failed", 
      errors: validationResult.error.errors 
    });
    return;
  }

  // Extract validated data
  const { name, geoJsonPolygon } = validationResult.data;

  // Optional: Add further validation to check if geoJsonPolygon is valid JSON
  try {
    JSON.parse(geoJsonPolygon);
  } catch (e) {
    res.status(400).json({ 
      message: 'geoJsonPolygon field does not contain valid JSON string.' 
    });
    return;
  }

  try {
    // 2. Use Prisma client's `create` method to add a new ServiceArea record
    const newServiceArea = await prisma.serviceArea.create({
      data: {
        name,
        geoJsonPolygon
      },
      select: { // Select fields to return
        id: true,
        name: true,
        geoJsonPolygon: true
      }
    });

    // 3. Return the newly created service area object as JSON with a 201 Created status
    res.status(201).json(newServiceArea);

  } catch (error: any) {
    // 4. Handle potential errors
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      res.status(409).json({ 
        message: `Service area with name '${name}' already exists.` 
      });
      return;
    }
    console.error("Error creating service area:", error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

// GET /api/admin/users - Fetch all users with order counts
router.get('/users', isAdmin, async (req: Request, res: Response) => {
  try {
    // Fetch users from the database with order counts and relevant orders for total spent calculation
    const usersWithAggregates = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        _count: { // Include the count of related records
          select: { orders: true } // Select the count of orders for each user
        },
        orders: { // Include orders for aggregation (only relevant fields)
          where: {
            // Define which statuses count towards "Total Spent"
            status: { in: ['Verified', 'Processing', 'Shipped', 'Delivered'] }
          },
          select: {
            totalAmount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Manually calculate total spent for each user
    const users = usersWithAggregates.map(user => {
      const totalSpent = user.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      // Return a new object without the full orders array, just the calculated total
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { orders, ...userWithoutOrders } = user; // Exclude the orders array from final response
      return {
        ...userWithoutOrders,
        totalSpent: totalSpent
      };
    });
    
    // Return the processed user list as JSON
    res.status(200).json(users);
  } catch (error) {
    // Handle potential database errors
    console.error("Error fetching users:", error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

// Simple test route to verify the admin routes are accessible
router.get('/test', (req: Request, res: Response) => {
  console.log('GET /api/admin/test route hit');
  res.status(200).json({ message: 'Admin routes are working' });
});

export default router;
```

---
### File: `packages/backend/src/routes/authRoutes.ts`

```typescript
import { Router, Request, Response, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'hybrid_ecommerce_secret_key_for_development_only';
const SALT_ROUNDS = 10;

// Zod schema for password reset request
const requestResetSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

// Zod schema for resetting the password
const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Reset token is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Path of error
});

// Zod schema for change password request
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters long" }),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});

// POST /api/auth/register - Register new user
router.post('/register', (async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: passwordHash
      }
    });
    
    // Return success response
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: newUser.id 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
}) as RequestHandler);

// POST /api/auth/login - Login user
router.post('/login', (async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Compare provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Passwords don't match
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return the token
    res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
}) as RequestHandler);

// POST /api/auth/request-password-reset
router.post('/request-password-reset', (async (req: Request, res: Response) => {
  const genericSuccessMessage = "If an account with that email exists, a password reset link has been sent.";

  try {
    // Validate request body
    const validationResult = requestResetSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.flatten().fieldErrors 
      });
      return; // Exit function
    }

    const { email } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // User not found, log and send generic success message
      console.log(`Password reset requested for non-existent email: ${email}`);
      res.status(200).json({ message: genericSuccessMessage });
      return; // Exit function
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Hash the token before storing
    const hashedToken = await bcrypt.hash(resetToken, SALT_ROUNDS);

    // Calculate expiry time (1 hour from now)
    const expires = new Date(Date.now() + 3600000);

    // Update user record with HASHED token and expiry
    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: hashedToken, // Store the HASH
        passwordResetExpires: expires,
      },
    });

    // Simulate email sending by logging the link
    // Use environment variable for frontend URL, default to Vite default port
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const customerResetUrl = `http://localhost:3000/reset-password/${resetToken}`; // Customer FE Port - use PLAIN token in link
    const adminResetUrl = `http://localhost:5173/reset-password/${resetToken}`; // Admin FE Port - use PLAIN token in link
    
    console.log(`Password Reset Requested for ${email}. Token: ${resetToken}.`); // Log PLAIN token
    console.log(`   => Customer Link: ${customerResetUrl}`);
    console.log(`   => Admin Link: ${adminResetUrl}`);

    // Send generic success message
    res.status(200).json({ message: genericSuccessMessage });
    // No return needed here, function completes

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
    // No return needed here, function completes after sending error
  }
}) as RequestHandler); // Keep the type assertion

// POST /api/auth/reset-password
router.post('/reset-password', (async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = resetPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.flatten().fieldErrors 
      });
      return; // Exit function
    }

    const { token: plainTokenFromRequest, password } = validationResult.data;

    // Find potential users with active reset tokens
    const potentialUsers = await prisma.user.findMany({
      where: {
        passwordResetToken: { not: null },
        passwordResetExpires: { not: null, gt: new Date() } // Check expiry
      },
      select: { id: true, passwordResetToken: true, passwordResetExpires: true } // Select needed fields
    });

    let user: { id: number; passwordResetToken: string | null; passwordResetExpires: Date | null; } | null = null;

    // Compare the provided token hash with stored hashes
    for (const potentialUser of potentialUsers) {
      if (potentialUser.passwordResetToken) {
        // Compare the PLAIN token from request with the STORED HASH
        const isTokenMatch = await bcrypt.compare(plainTokenFromRequest, potentialUser.passwordResetToken);
        if (isTokenMatch) {
          user = potentialUser; // Found the matching user
          break;
        }
      }
    }

    // If user is not found or tokens don't match
    if (!user) {
      res.status(400).json({ message: "Password reset token is invalid or has expired." });
      return;
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Update user with new password and clear reset fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Return success
    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
}) as RequestHandler);

// POST /api/auth/change-password - Change password for authenticated user
router.post('/change-password', isUser, (async (req: Request, res: Response) => {
  try {
    // Get user ID from req.user (added by isUser middleware)
    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: "User not authenticated." });
      return;
    }
    const userId = req.user.userId;

    // Validate request body
    const validationResult = changePasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors
      });
      return;
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Fetch user from database
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId }
    }).catch(error => {
      console.error('Error fetching user:', error);
      throw new Error('User not found');
    });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: "Incorrect current password." });
      return;
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user record with new password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    // Return success response
    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
}) as RequestHandler);

// GET /api/auth/me - Get authenticated user info from token
router.get('/me', isUser, (async (req: Request, res: Response) => {
  // isUser middleware already attached user info if token was valid
  if (!req.user) {
    // This case should technically be caught by isUser, but good to double check
    res.status(401).json({ message: "User data not found in token." });
    return;
  }

  // Return only necessary, non-sensitive info from the token payload
  const userInfo = {
    id: req.user.userId,
    email: req.user.email
    // Add other safe fields from token if needed later (e.g., name if added to token)
  };

  res.status(200).json(userInfo);
}) as RequestHandler);

// GET /api/auth/validate-token - Validate token and get user info
router.get('/validate-token', isUser, (async (req: Request, res: Response) => {
  try {
    // Use user info from middleware
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(400).json({ message: 'User ID not found in token' });
      return;
    }
    
    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Return user info
    res.status(200).json(user);
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
}) as RequestHandler);

export default router;
```

---
### File: `packages/backend/src/routes/cartRoutes.ts`

```typescript
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Define schemas for cart operations
const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
});

const addCartItemSchema = z.object({
  productId: z.number().int().positive({ message: "Product ID must be a positive integer" }),
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
});

/**
 * @route POST /api/cart/item
 * @description Add/Update an item in the cart with a specific quantity
 * @access Private (User only)
 */
router.post('/item', isUser, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = addCartItemSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.errors
      });
      return;
    }

    // Extract validated data
    const { productId, quantity } = validationResult.data;

    // Get user ID from the JWT token (via middleware)
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Fetch the product to check stock availability
      const product = await tx.product.findUniqueOrThrow({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
          stock: true,
          description: true
        }
      });

      // Check if the item already exists in the cart
      const existingCartItem = await tx.cartItem.findUnique({
        where: {
          userId_productId: {
            userId: userId,
            productId: productId
          }
        }
      });

      const currentQuantityInCart = existingCartItem?.quantity ?? 0;

      // Check if adding the requested quantity would exceed available stock
      if (currentQuantityInCart + quantity > product.stock) {
        throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} available and you already have ${currentQuantityInCart} in your cart.`);
      }

      // Upsert the cart item - create if not exists, update quantity if exists
      const upsertedItem = await tx.cartItem.upsert({
        where: {
          userId_productId: {
            userId: userId,
            productId: productId
          }
        },
        create: {
          userId: userId,
          productId: productId,
          quantity: quantity // For new items, use the requested quantity
        },
        update: {
          quantity: { increment: quantity } // For existing items, increment by the requested quantity
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              stock: true,
              description: true
            }
          }
        }
      });

      return upsertedItem;
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error adding/updating cart item:', error);
    
    // Handle specific error messages
    if (error.message && (
      error.message.includes('Product not found') ||
      error.message.includes('Insufficient stock')
    )) {
      res.status(400).json({ message: error.message });
      return;
    }
    
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

/**
 * @route POST /api/cart/update/:productId
 * @description Update the quantity of a product in the cart
 * @access Private (User only)
 */
router.post('/update/:productId', isUser, async (req: Request, res: Response) => {
  try {
    // Validate Product ID param
    const productIdInt = parseInt(req.params.productId, 10);
    if (isNaN(productIdInt)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    // Validate request body
    const validationResult = updateCartItemSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors 
      });
      return;
    }

    // Extract validated quantity
    const { quantity } = validationResult.data;

    // Get user ID from the JWT token (via middleware)
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Fetch the product to check if it exists and has sufficient stock
      const product = await tx.product.findUnique({
        where: { id: productIdInt },
        select: { 
          id: true,
          name: true,
          price: true,
          imageUrl: true,
          stock: true,
          description: true
        }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Check if requested quantity exceeds available stock
      if (quantity > product.stock) {
        throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} available.`);
      }

      // Update the cart item with the new quantity
      const cartItem = await tx.cartItem.upsert({
        where: {
          userId_productId: {
            userId: userId,
            productId: productIdInt
          }
        },
        create: {
          userId: userId,
          productId: productIdInt,
          quantity: quantity
        },
        update: {
          quantity: quantity
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              stock: true,
              description: true
            }
          }
        }
      });

      return cartItem;
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    
    // Handle specific error messages
    if (error.message && (
      error.message.includes('Product not found') ||
      error.message.includes('Insufficient stock')
    )) {
      res.status(400).json({ message: error.message });
      return;
    }
    
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

/**
 * @route GET /api/cart
 * @description Get all cart items for the authenticated user
 * @access Private (User only)
 */
router.get('/', isUser, async (req: Request, res: Response) => {
  try {
    // Get user ID from the JWT token (via middleware)
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    // Fetch all cart items for the user, including product details
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            imageUrl: true,
            stock: true
          }
        }
      }
    });

    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

/**
 * @route DELETE /api/cart/item/:productId
 * @description Remove a specific item from the cart
 * @access Private (User only)
 */
router.delete('/item/:productId', isUser, async (req: Request, res: Response) => {
  try {
    // Validate product ID
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    // Get user ID from the JWT token
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId: userId,
          productId: productId
        }
      }
    });

    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error: any) {
    console.error('Error removing cart item:', error);
    
    // Handle "not found" Prisma error
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Item not found in cart' });
      return;
    }
    
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

/**
 * @route DELETE /api/cart
 * @description Clear the user's entire cart
 * @access Private (User only)
 */
router.delete('/', isUser, async (req: Request, res: Response) => {
  try {
    // Get user ID from the JWT token
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    // Delete all cart items for the user
    await prisma.cartItem.deleteMany({
      where: { userId: userId }
    });

    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

export default router;
```

---
### File: `packages/backend/src/routes/categoryAdminRoutes.ts`

```typescript
import { Router, Request, Response, RequestHandler } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { isAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const categorySchema = z.object({
  name: z.string().min(1, { message: "Category name is required" }).max(100),
  description: z.string().optional(),
  imageUrl: z.string().url({ message: "Invalid URL format" }).optional().or(z.literal('')), // Allow empty string or valid URL
});

const updateCategorySchema = categorySchema.partial();

/**
 * @route POST /api/admin/categories
 * @description Create a new category
 * @access Admin
 */
router.post('/', isAdmin, (async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = categorySchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors
      });
      return;
    }

    const { name, description, imageUrl } = validationResult.data;

    // Create the category with type safety
    const categoryData: Prisma.CategoryCreateInput = {
      name,
      description: description || null, // Ensure null if empty/undefined
      imageUrl: imageUrl || null // Ensure null if empty/undefined
    };

    const newCategory = await prisma.category.create({
      data: categoryData
    });

    res.status(201).json(newCategory);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 is the error code for unique constraint violation
      if (error.code === 'P2002') {
        res.status(409).json({ message: 'A category with this name already exists.' });
        return;
      }
    }

    console.error('Error creating category:', error);
    res.status(500).json({ message: 'An error occurred while creating the category.' });
  }
}) as RequestHandler);

/**
 * @route GET /api/admin/categories
 * @description Get all categories
 * @access Admin
 */
router.get('/', isAdmin, (async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'An error occurred while fetching categories.' });
  }
}) as RequestHandler);

/**
 * @route PUT /api/admin/categories/:categoryId
 * @description Update a category
 * @access Admin
 */
router.put('/:categoryId', isAdmin, (async (req: Request, res: Response) => {
  try {
    // Validate ID param
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) {
      res.status(400).json({ message: 'Invalid category ID.' });
      return;
    }

    // Validate request body
    const validationResult = updateCategorySchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors
      });
      return;
    }

    // Check if category exists (use findUniqueOrThrow for cleaner error handling)
    await prisma.category.findUniqueOrThrow({
      where: { id: categoryId }
    }).catch(() => { throw { status: 404, message: 'Category not found.' } });


    // Create update data with proper typing
    const updateData: Prisma.CategoryUpdateInput = {};

    if (validationResult.data.name !== undefined) {
      updateData.name = validationResult.data.name;
    }

    if (validationResult.data.description !== undefined) {
      updateData.description = validationResult.data.description || null; // Set to null if empty string
    }

    if (validationResult.data.imageUrl !== undefined) {
      updateData.imageUrl = validationResult.data.imageUrl || null; // Set to null if empty string
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData
    });

    res.status(200).json(updatedCategory);
  } catch (error: any) {
    // Handle specific errors first
    if (error?.status === 404) {
        return res.status(404).json({ message: error.message });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 is the error code for unique constraint violation
      if (error.code === 'P2002') {
        res.status(409).json({ message: 'A category with this name already exists.' });
        return;
      }
    }

    console.error('Error updating category:', error);
    res.status(500).json({ message: 'An error occurred while updating the category.' });
  }
}) as RequestHandler);

/**
 * @route DELETE /api/admin/categories/:categoryId
 * @description Delete a category
 * @access Admin
 */
router.delete('/:categoryId', isAdmin, (async (req: Request, res: Response) => {
  try {
    // Validate ID param
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) {
      res.status(400).json({ message: 'Invalid category ID.' });
      return;
    }

    // Check if category exists and if it has products in one go
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { _count: { select: { products: true } } } // Count associated products
    });

    if (!existingCategory) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }

    // Check if category has associated products
    if (existingCategory._count.products > 0) {
      res.status(409).json({ message: `Cannot delete category "${existingCategory.name}" as it has ${existingCategory._count.products} associated products.` });
      return;
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: categoryId }
    });

    res.status(204).send();
  } catch (error: any) {
    // Check for specific Prisma errors if needed, though findUnique handles not found
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
       // P2003 might still happen if relations change, though the check above should prevent it
       if (error.code === 'P2003') {
         return res.status(409).json({ message: 'Cannot delete category due to existing references.' });
       }
    }

    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'An error occurred while deleting the category.' });
  }
}) as RequestHandler);

export default router;
```

---
### File: `packages/backend/src/routes/categoryRoutes.ts`

```typescript
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * @route GET /api/categories
 * @description Get all categories (public, read-only access)
 * @access Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'An error occurred while fetching categories.' });
  }
});

export default router;
```

---
### File: `packages/backend/src/routes/orderRoutes.ts`

```typescript
import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma type
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point as turfPoint } from '@turf/helpers';

const router = Router();
const prisma = new PrismaClient();

// Define Zod schemas for order validation
// Ensure Product includes necessary fields for cart context
const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  // Price validation might be better handled by fetching product price server-side
  // For now, assume price sent from frontend is correct for the item
  price: z.number().positive({ message: "Item price must be positive" }),
  // Include potentially other needed fields like name, imageUrl if needed from cart
  name: z.string().optional(), // Optional: name might be fetched server-side
  imageUrl: z.string().optional(),
});


const shippingDetailsSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  address: z.string().optional(), // Made optional
  city: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

const locationSchema = z.object({
  lat: z.number({ invalid_type_error: "Latitude must be a number" }),
  lng: z.number({ invalid_type_error: "Longitude must be a number" })
}).optional(); // Location object itself is optional

const createOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1, { message: "At least one product is required" }),
  // Shipping details are required, but address fields within are optional
  shippingDetails: shippingDetailsSchema,
  location: locationSchema, // Location might not be provided
  totalAmount: z.number().positive({ message: "Total amount must be positive" })
});

// POST /api/orders - Create a new order
router.post('/', isUser, async (req: Request, res: Response) => {
  try {
    // Validate request body using Zod schema
    const validationResult = createOrderSchema.safeParse(req.body);
    if (!validationResult.success) {
      console.error("Order validation failed:", validationResult.error.flatten());
      res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors // Send detailed errors
      });
      return;
    }

    const { items, shippingDetails, location, totalAmount } = validationResult.data;
    const userId = req.user?.userId;

    if (!userId) {
      // This should technically be caught by isUser, but double-check
      res.status(401).json({ message: "User ID not found in token" });
      return;
    }

    // Extract lat/lng if location exists
    const latitude = location?.lat ?? null;
    const longitude = location?.lng ?? null;

    let locationCheckResult: string | null = null; // Initialize as null
    let checkedZoneName: string | null = null; // Optional: store name of zone found

    // --- Perform Location Check (only if coordinates provided) ---
    if (latitude !== null && longitude !== null) {
      locationCheckResult = "Outside Zone"; // Default to Outside if coords are provided
      console.log(`Performing location check for coords: Lat=${latitude}, Lon=${longitude}`);
      try {
        const serviceAreas = await prisma.serviceArea.findMany({
          select: { id: true, name: true, geoJsonPolygon: true }
        });
        console.log(`Checking against ${serviceAreas.length} service areas.`);

        const customerLocation = turfPoint([longitude, latitude]); // GeoJSON format: [Lon, Lat]

        for (const area of serviceAreas) {
          try {
            const polygon = JSON.parse(area.geoJsonPolygon);
            if (polygon && (polygon.type === 'Polygon' || polygon.type === 'MultiPolygon') && polygon.coordinates) {
              if (booleanPointInPolygon(customerLocation, polygon)) {
                locationCheckResult = `Inside Zone`; // Simplified result
                checkedZoneName = area.name;
                console.log(`Point IS INSIDE zone: ${area.name} (ID: ${area.id})`);
                break;
              } else {
                 console.log(`Point is outside zone: ${area.name} (ID: ${area.id})`);
              }
            } else {
              console.warn(`Skipping invalid GeoJSON structure for ServiceArea ID ${area.id}`);
            }
          } catch (parseError) {
            console.error(`Error parsing GeoJSON for ServiceArea ID ${area.id}:`, parseError);
          }
        }
      } catch (dbError) {
        console.error("Error fetching service areas for location check:", dbError);
        locationCheckResult = "Check Failed (DB Error)";
      }
    } else {
      console.log("Latitude/Longitude not provided, skipping location check.");
      locationCheckResult = "Not Provided"; // Indicate coords were missing
    }
    // --- End Location Check ---

    // Create the order and order items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // --- Stock Check ---
      console.log("Checking stock for items:", items);
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true }
        });
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }
        console.log(`Stock OK for ${product.name} (ID: ${item.productId}) - Available: ${product.stock}, Requested: ${item.quantity}`);
      }
      console.log("Stock check passed for all items.");
      // --- End Stock Check ---

      // --- Create Order ---
      console.log("Creating order record...");
      const newOrder = await tx.order.create({
        data: {
          userId: userId,
          status: 'Pending Call', // Initial status
          totalAmount: totalAmount,
          shippingDetails: shippingDetails as any, // Store the shippingDetails JSON
          latitude: latitude,
          longitude: longitude,
          locationCheckResult: locationCheckResult, // Save the result
        },
      });
      console.log(`Order created with ID: ${newOrder.id}`);

      // --- Create OrderItems and Decrement Stock ---
      for (const item of items) {
        // Fetch product again inside transaction to ensure consistency? Or trust validation?
        // Let's trust validation and use name/price from request for simplicity now.
        // const product = await tx.product.findUniqueOrThrow({ where: { id: item.productId }, select: { name: true, price: true } });

        console.log(`Creating order item for product ID: ${item.productId}, quantity: ${item.quantity}`);
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            productName: item.name || `Product ${item.productId}`, // Use name from cart or default
            quantity: item.quantity,
            price: item.price, // Price at time of order (from validated cart item)
          },
        });

        // Decrement stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        console.log(`Decremented stock for product ${item.productId} by ${item.quantity}`);
      }

      return newOrder; // Return the created order object
    }); // End transaction

    // Transaction successful if it reaches here
    console.log(`Order ${order.id} created successfully.`);
    res.status(201).json({
      message: "Order created successfully",
      orderId: order.id, // Return the order ID
    });

  } catch (error: any) {
    // Check for specific errors thrown from transaction
    if (error.message?.startsWith('Insufficient stock') || error.message?.startsWith('Product with ID')) {
       console.warn(`Order creation failed due to validation: ${error.message}`);
       return res.status(400).json({ message: error.message }); // Return specific stock/product error
    }
    // Handle other errors (DB errors, etc.)
    console.error("Error creating order:", error);
    res.status(500).json({ message: 'An internal server error occurred during order creation' });
  }
});

// GET /api/orders/:id - Get an order by ID (for the authenticated user)
router.get('/:id', isUser, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      res.status(400).json({ message: "Invalid order ID" });
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "User ID not found in token" });
      return;
    }

    // Fetch the order with its items, ensure it belongs to the user
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: userId // Security check: only fetch user's own order
      },
      include: {
        items: { // Include order items
           include: { // Include product details for each item
              product: {
                 select: { name: true, imageUrl: true } // Select needed product fields
              }
           }
        }
        // Optionally include user details if needed, but usually not required here
      }
    });

    if (!order) {
      // Return 404 if order not found OR doesn't belong to the user
      res.status(404).json({ message: "Order not found or access denied" });
      return;
    }

    // Parse shippingDetails if it's a string (it should be JSON from creation)
    let parsedShippingDetails = order.shippingDetails;
    if (typeof order.shippingDetails === 'string') {
        try {
            parsedShippingDetails = JSON.parse(order.shippingDetails);
        } catch (e) {
            console.error(`Failed to parse shippingDetails JSON for order ${order.id}`);
            // Keep it as null or original string if parse fails? Or return empty object?
            parsedShippingDetails = null;
        }
    }


    // Map items to include necessary details
    const processedItems = order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productName: item.product?.name || item.productName || 'Unknown Product', // Use name from relation or stored name
        imageUrl: item.product?.imageUrl // Get image URL from relation
    }));

    const responseOrder = {
        ...order,
        shippingDetails: parsedShippingDetails, // Send parsed JSON or null
        items: processedItems
    };


    res.status(200).json(responseOrder);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
});


// GET /api/orders - Get all orders for the authenticated user
router.get('/', isUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "User ID not found in token" });
      return;
    }

    // Fetch all orders for the user, select necessary fields for list view
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { // Select only fields needed for the history list
          id: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          // Optionally include a summary of items if needed for display
          // items: {
          //     take: 1, // Take only the first item for summary display maybe?
          //     select: { productName: true }
          // }
      }
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
});


// GET /api/orders/assign-number/:orderId - Assign a phone number to an order
router.get('/assign-number/:orderId', isUser, async (req: Request, res: Response) => {
  // 1. Extract and validate orderId from route parameters
  const { orderId } = req.params;
  const orderIdInt = parseInt(orderId, 10);
  if (isNaN(orderIdInt)) {
    res.status(400).json({ message: 'Invalid Order ID format.' });
    return;
  }

  // 2. Extract userId from JWT payload (attached by isUser middleware)
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: "User ID not found in token" });
    return;
  }

  try {
    // 3. Verify the order exists, belongs to the user, and is 'Pending Call'
    const order = await prisma.order.findUnique({
      where: {
        id: orderIdInt,
        // Ensure the order belongs to the authenticated user
        userId: userId,
      },
      select: { status: true, userId: true } // Select status for verification
    });

    if (!order) {
      // Use 404 to indicate not found or not belonging to user
      return res.status(404).json({ message: 'Order not found or does not belong to user.' });
    }
    // Allow fetching number even if status moved past Pending Call,
    // but log if status is unexpected. Assignment should only happen once ideally.
    if (order.status !== 'Pending Call') {
       console.warn(`Assign number called for order ${orderIdInt} with status ${order.status}.`);
       // Allow proceeding for now, maybe number was already assigned.
       // return res.status(409).json({ message: `Order status is '${order.status}', not 'Pending Call'. Cannot assign number.` }); // 409 Conflict
    }

    // 4. Find the first available phone number
    // Simple strategy: Find the first one marked 'Available'.
    const availablePhone = await prisma.phoneNumber.findFirst({
      where: {
        status: 'Available'
      },
      select: { id: true, numberString: true }
    });

    // 5. Handle case where no phone number is available
    if (!availablePhone) {
      console.warn("No available phone numbers found for order ID:", orderIdInt);
      // Return 503 Service Unavailable
      return res.status(503).json({ message: 'No verification phone lines are currently available. Please try again later.' });
    }

    // 6. Mark the phone number as busy (Consider if this should only happen once)
    // To prevent re-assigning/marking busy repeatedly, check if a number was already assigned
    // For now, we proceed with marking busy - needs refinement if called multiple times.
    await prisma.phoneNumber.update({
      where: { id: availablePhone.id },
      data: { status: 'Busy' }
    });
    console.log(`Marked phone number ${availablePhone.numberString} as Busy for order ${orderIdInt}`);

    // 7. Return the assigned phone number string
    res.status(200).json({ verificationPhoneNumber: availablePhone.numberString });

  } catch (error) {
    console.error(`Error assigning phone number for order ID ${orderIdInt}:`, error);
    res.status(500).json({ message: 'Error assigning verification phone number' });
  }
});


export default router;
```

---
### File: `packages/backend/src/routes/productAdminRoutes.ts`

```typescript
import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { isAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Define Zod schema for product creation
const productSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  price: z.number().positive({ message: "Price must be a positive number" }),
  description: z.string().optional(),
  stock: z.number().int().min(0, { message: "Stock cannot be negative" }).optional(),
  imageUrl: z.string().url({ message: "Invalid image URL" }).optional().or(z.literal('')), // Allow empty string
  categoryId: z.number().int().positive().optional().nullable(), // Allow null or positive int
});

// For updates, make all fields optional
const updateProductSchema = productSchema.partial();

// Define Zod schema for stock adjustment
const adjustStockSchema = z.object({
  adjustment: z.number().int({ message: "Adjustment must be an integer" }),
});

// GET /api/admin/products - Get all products with category info
router.get('/', isAdmin, async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true, // Include category ID
            name: true
          }
        }
      },
      orderBy: {
        id: 'desc' // Or name: 'asc' etc.
      }
    });

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products with categories:', error);
    res.status(500).json({ message: 'An error occurred while fetching products.' });
  }
});

// POST /api/admin/products - Create a new product
router.post('/', isAdmin, async (req: Request, res: Response) => {
  // Validate request body
  const validationResult = productSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: validationResult.error.flatten().fieldErrors // Send detailed errors
    });
    return;
  }

  // Prepare data, ensuring optional fields are handled correctly
  const { categoryId, stock, imageUrl, description, ...restData } = validationResult.data;
  const productData: Prisma.ProductCreateInput = {
      ...restData,
      description: description || null, // Set to null if undefined/empty
      imageUrl: imageUrl || null, // Set to null if undefined/empty
      stock: stock ?? 0, // Default stock to 0 if not provided
      // Connect to category only if categoryId is provided and valid
      ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
  };

  try {
    // Create product using Prisma
    const newProduct = await prisma.product.create({
      data: productData,
      include: { category: true } // Include category in response
    });

    // Return created product with 201 status
    res.status(201).json(newProduct);
  } catch (error: any) {
    // Check for specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') { // Unique constraint violation
            return res.status(409).json({ message: 'A product with this name/details might already exist.' });
        }
        if (error.code === 'P2003' || error.code === 'P2025') { // Foreign key constraint or related record not found (Category)
             console.error("Foreign key error:", error.meta);
             return res.status(400).json({ message: 'Invalid Category ID provided.' });
        }
    }

    console.error("Error creating product:", error);
    res.status(500).json({ message: 'An internal server error occurred while creating the product.' });
  }
});


// PUT /api/admin/products/:productId - Update an existing product
router.put('/:productId', isAdmin, async (req: Request, res: Response) => {
  // Validate productId parameter
  const productIdInt = parseInt(req.params.productId, 10);
  if (isNaN(productIdInt)) {
    res.status(400).json({ message: 'Invalid product ID' });
    return;
  }

  // Validate request body
  const validationResult = updateProductSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: validationResult.error.flatten().fieldErrors
    });
    return;
  }

  // Check if the request body is empty (no fields to update)
  if (Object.keys(validationResult.data).length === 0) {
    res.status(400).json({ message: 'No fields provided for update' });
    return;
  }

  // Prepare update data carefully
  const { categoryId, ...restData } = validationResult.data;
  const updateData: Prisma.ProductUpdateInput = { ...restData };

  // Handle optional fields explicitly setting null if empty string passed
  if ('description' in updateData) updateData.description = updateData.description || null;
  if ('imageUrl' in updateData) updateData.imageUrl = updateData.imageUrl || null;
  if ('stock' in updateData && updateData.stock === undefined) delete updateData.stock; // Don't update stock if undefined

  // Handle category connection/disconnection
  if (categoryId !== undefined) { // Check if categoryId was provided in the update request
      if (categoryId === null || categoryId === 0) { // Allow unsetting category
          updateData.category = { disconnect: true };
      } else {
          updateData.category = { connect: { id: categoryId } };
      }
  }


  try {
    // Update product using Prisma
    const updatedProduct = await prisma.product.update({
      where: { id: productIdInt },
      data: updateData,
      include: {
        category: true // Include category in response
      }
    });

    // Return updated product
    res.status(200).json(updatedProduct);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle "Not Found" error
        if (error.code === 'P2025') {
            return res.status(404).json({ message: `Product with ID ${productIdInt} not found.` });
        }
        // Handle foreign key constraint violation (invalid categoryId)
        if (error.code === 'P2003' || (error.code === 'P2025' && error.message.includes('constraint'))) {
             console.error("Foreign key error on update:", error.meta);
             return res.status(400).json({ message: 'Invalid Category ID provided for update.' });
        }
    }

    console.error(`Error updating product ${productIdInt}:`, error);
    res.status(500).json({ message: 'An internal server error occurred while updating the product.' });
  }
});


// POST /api/admin/products/:productId/adjust-stock - Adjust product stock
router.post('/:productId/adjust-stock', isAdmin, async (req: Request, res: Response) => {
    const productIdInt = parseInt(req.params.productId, 10);
    if (isNaN(productIdInt)) {
        res.status(400).json({ message: 'Invalid product ID' });
        return;
    }

    const validationResult = adjustStockSchema.safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({
            message: "Validation failed",
            errors: validationResult.error.flatten().fieldErrors
        });
        return;
    }
    const { adjustment } = validationResult.data;

    if (adjustment === 0) { // No change needed
         // Fetch current product data if no adjustment needed
         try {
            const product = await prisma.product.findUnique({
                where: { id: productIdInt },
                select: { id: true, name: true, stock: true }
            });
            if (!product) {
                res.status(404).json({ message: `Product with ID ${productIdInt} not found.` });
                return;
            }
            res.status(200).json(product); // Send current state
            return;
         } catch (error) {
            console.error(`Error fetching product ${productIdInt} for zero adjustment:`, error);
            res.status(500).json({ message: 'Error fetching product data.' });
            return;
         }
    }

    try {
        const updatedProduct = await prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({
                where: { id: productIdInt },
                select: { stock: true, name: true } // Select name for error message
            });

            if (!product) {
                throw new Error('ProductNotFound'); // Custom error flag for transaction handling
            }

            const newStock = product.stock + adjustment;
            if (newStock < 0) {
                // Prevent stock from going negative
                throw new Error(`Stock cannot be negative. Current stock for '${product.name}': ${product.stock}, Adjustment: ${adjustment}`);
            }

            // Perform the update within the transaction
            return await tx.product.update({
                where: { id: productIdInt },
                data: { stock: newStock },
                select: { id: true, name: true, stock: true } // Select fields to return
            });
        });

        // Transaction successful, return updated product
        res.status(200).json(updatedProduct);

    } catch (error: any) {
        // Handle custom and specific errors
        if (error.message === 'ProductNotFound') {
            res.status(404).json({ message: `Product with ID ${productIdInt} not found.` });
            return;
        }
        if (error.message?.startsWith('Stock cannot be negative')) {
            res.status(400).json({ message: error.message });
            return;
        }
        // Handle general errors
        console.error(`Error adjusting stock for product ${productIdInt}:`, error);
        res.status(500).json({ message: 'Error adjusting stock.' });
    }
});

// DELETE /api/admin/products/:productId - Delete a product
router.delete('/:productId', isAdmin, async (req: Request, res: Response) => {
  // Validate productId parameter
  const productIdInt = parseInt(req.params.productId, 10);
  if (isNaN(productIdInt)) {
    res.status(400).json({ message: 'Invalid product ID' });
    return;
  }

  try {
    // Delete product using Prisma
    // Prisma automatically handles relation checks based on schema (onDelete behavior)
    // If OrderItem relation has onDelete: Cascade/SetNull/Restrict, it behaves accordingly.
    // If it has Restrict (default if not specified), Prisma will throw P2003 if items exist.
    await prisma.product.delete({
      where: { id: productIdInt }
    });

    // Return 204 No Content on successful deletion
    res.status(204).send();
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle "Not Found" error
        if (error.code === 'P2025') {
            return res.status(404).json({ message: `Product with ID ${productIdInt} not found.` });
        }
        // Handle foreign key constraint violations (product referenced in OrderItem)
        if (error.code === 'P2003') {
             console.warn(`Attempted to delete product ${productIdInt} referenced in orders.`);
             return res.status(409).json({
                message: 'Cannot delete product because it is referenced in existing orders. Consider marking it as inactive instead.'
             });
        }
    }

    console.error(`Error deleting product ${productIdInt}:`, error);
    res.status(500).json({ message: 'An internal server error occurred while deleting the product.' });
  }
});


export default router;
```

---
### File: `packages/backend/src/routes/productRoutes.ts`

```typescript
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * @route GET /api/products
 * @description Get all products with optional search and filtering
 * @access Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('GET /api/products route hit');
    console.log('Query params:', req.query);
    
    // Extract query parameters
    const search = req.query.search as string | undefined;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    
    // Extract pagination parameters
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '12', 10); // Default limit 12
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
        return res.status(400).json({ message: 'Invalid pagination parameters.' });
    }
    const skip = (page - 1) * limit;
    
    // Build the where clause for filtering
    const whereClause: any = {};
    
    // Add search filter if provided
    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    // Add category filter if provided
    if (categoryId && !isNaN(categoryId)) {
      whereClause.categories = {
        some: {
          categoryId
        }
      };
    }
    
    // Get sorting configuration
    const orderByClause: any = {};
    if (['name', 'price', 'createdAt'].includes(sortBy)) {
      orderByClause[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      // Default to newest first if invalid sort field
      orderByClause.createdAt = 'desc';
    }
    
    // Get total count of products matching the filter
    const totalProducts = await prisma.product.count({
      where: whereClause
    });
    
    // Fetch products with the constructed filters and pagination
    const products = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        imageUrl: true,
        stock: true,
        averageRating: true,
        reviewCount: true,
        createdAt: true
      },
      orderBy: orderByClause,
      skip: skip,
      take: limit
    });
    
    console.log(`Found ${products.length} products (page ${page} of ${Math.ceil(totalProducts / limit)})`);
    
    // Return paginated response
    res.status(200).json({
      products: products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts: totalProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error retrieving products' });
  }
});

/**
 * @route GET /api/products/:productId
 * @description Get a single product by ID
 * @access Public
 */
router.get('/:productId', async (req: Request, res: Response) => {
  // Validate productId param (convert to int, check NaN)
  const productId = parseInt(req.params.productId, 10);
  if (isNaN(productId)) {
    res.status(400).json({ message: 'Invalid Product ID format.' });
    return;
  }

  try {
    // Fetch the product by ID
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        imageUrl: true,
        stock: true,
        createdAt: true,
        averageRating: true,
        reviewCount: true
      }
    });

    // Handle Not Found case
    if (!product) {
      res.status(404).json({ message: `Product with ID ${productId} not found.` });
      return;
    }

    // Return 200 OK with the product details
    res.status(200).json(product);
  } catch (error) {
    // Handle potential database errors -> return 500
    console.error(`Error fetching product ${productId}:`, error);
    res.status(500).json({ message: 'Error retrieving product details.' });
  }
});

/**
 * @route GET /api/products/:productId/reviews
 * @description Get all reviews for a product
 * @access Public
 */
router.get('/:productId/reviews', async (req: Request, res: Response) => {
  try {
    console.log(`GET /api/products/${req.params.productId}/reviews route hit`);
    console.log('Request params:', req.params);
    console.log('Request path:', req.path);
    console.log('Full URL:', req.originalUrl);
    
    // Validate productId param
    const productId = parseInt(req.params.productId, 10);
    console.log('Parsed productId:', productId);
    
    if (isNaN(productId)) {
      console.log('Invalid productId format');
      res.status(400).json({ message: 'Invalid Product ID format.' });
      return;
    }

    // Check if product exists
    console.log('Checking if product exists...');
    const productExists = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true }
    });
    console.log('Product exists check result:', productExists);

    if (!productExists) {
      console.log(`Product with ID ${productId} not found.`);
      res.status(404).json({ message: `Product with ID ${productId} not found.` });
      return;
    }

    // Fetch reviews for the product
    console.log('Fetching reviews for product...');
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            email: true // Include only necessary user info, not password
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`Found ${reviews.length} reviews for product ${productId}`);

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error in product reviews route:', error);
    res.status(500).json({ message: 'Error retrieving product reviews.', error: String(error) });
  }
});

// Export the router
export default router;
```

---
### File: `packages/backend/src/routes/reportsAdminRoutes.ts`

```typescript
import { Router, Request, Response, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { isAdmin } from '../middleware/authMiddleware';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Zod schema for date parameters validation
const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * @route GET /api/admin/reports/sales-over-time
 * @description Get aggregated sales data over a period
 * @access Admin only
 */
router.get('/sales-over-time', isAdmin, (async (req: Request, res: Response) => {
  try {
    // Parse and validate query parameters
    const validationResult = dateRangeSchema.safeParse(req.query);
    
    if (!validationResult.success) {
      res.status(400).json({
        message: 'Invalid date parameters',
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }
    
    // Extract parameters with defaults
    let { startDate, endDate } = validationResult.data;
    
    // Default to last 30 days if dates not provided
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate 
      ? new Date(startDate) 
      : new Date(endDateObj.getTime() - 30 * 24 * 60 * 60 * 1000);
      
    // Validate dates are parseable
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      res.status(400).json({
        message: 'Invalid date format. Please use ISO date string (YYYY-MM-DD).',
      });
      return;
    }
    
    // Using raw SQL for date grouping since Prisma doesn't directly support date truncation
    const salesData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt")::date as date,
        SUM("totalAmount") as "totalSales"
      FROM "Order"
      WHERE 
        "createdAt" >= ${startDateObj} AND 
        "createdAt" <= ${endDateObj} AND
        "status" NOT IN ('Cancelled')
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `;
    
    // Convert BigInt values to regular numbers for JSON serialization
    const serializedData = (salesData as any[]).map(item => ({
      date: item.date,
      totalSales: typeof item.totalSales === 'bigint' ? Number(item.totalSales) : item.totalSales
    }));
    
    res.status(200).json(serializedData);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({ message: 'An error occurred while generating the sales report.' });
  }
}) as RequestHandler);

/**
 * @route GET /api/admin/reports/users-over-time
 * @description Get new user registration data over a period
 * @access Admin only
 */
router.get('/users-over-time', isAdmin, (async (req: Request, res: Response) => {
  try {
    // Parse and validate query parameters
    const validationResult = dateRangeSchema.safeParse(req.query);
    
    if (!validationResult.success) {
      res.status(400).json({
        message: 'Invalid date parameters',
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }
    
    // Extract parameters with defaults
    let { startDate, endDate } = validationResult.data;
    
    // Default to last 30 days if dates not provided
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate 
      ? new Date(startDate) 
      : new Date(endDateObj.getTime() - 30 * 24 * 60 * 60 * 1000);
      
    // Validate dates are parseable
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      res.status(400).json({
        message: 'Invalid date format. Please use ISO date string (YYYY-MM-DD).',
      });
      return;
    }
    
    console.log('Fetching user data with date range:', {
      startDate: startDateObj.toISOString(),
      endDate: endDateObj.toISOString()
    });
    
    // Simpler approach: Just count users per day directly with SQL
    try {
      const userData = await prisma.$queryRaw`
        WITH days AS (
          SELECT d::date as date
          FROM generate_series(
            ${startDateObj}::date, 
            ${endDateObj}::date, 
            '1 day'::interval
          ) d
        ),
        user_counts AS (
          SELECT 
            DATE_TRUNC('day', "createdAt")::date as date,
            COUNT(*) as count
          FROM "User"
          WHERE 
            "createdAt" >= ${startDateObj} AND 
            "createdAt" <= ${endDateObj}
          GROUP BY DATE_TRUNC('day', "createdAt")
        )
        SELECT 
          days.date,
          COALESCE(user_counts.count, 0) as "newUsers"
        FROM 
          days
        LEFT JOIN 
          user_counts ON days.date = user_counts.date
        ORDER BY 
          days.date
      `;
      
      // Convert any BigInt values to regular numbers for JSON serialization
      const serializedData = (userData as any[]).map(item => ({
        date: item.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        newUsers: typeof item.newUsers === 'bigint' ? Number(item.newUsers) : item.newUsers
      }));
      
      console.log('Returning user data with', serializedData.length, 'entries');
      res.status(200).json(serializedData);
    } catch (queryError) {
      console.error('Database query error:', queryError);
      res.status(500).json({ 
        message: 'Database query error', 
        error: queryError instanceof Error ? queryError.message : String(queryError)
      });
    }
  } catch (error) {
    console.error('Error fetching user registration data:', error);
    res.status(500).json({ 
      message: 'An error occurred while generating the user report.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}) as RequestHandler);

export default router;
```

---
### File: `packages/backend/src/routes/reviewRoutes.ts`

```typescript
import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Define Zod validation schema for creating/updating reviews
const reviewSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional()
});

// POST /api/reviews - Submit a new review
router.post('/', isUser, async (req: Request, res: Response) => {
  console.log('POST /api/reviews route hit', req.body);
  try {
    // Get user ID from the authenticated request
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in the request' });
      return;
    }

    // Validate the request body
    const validationResult = reviewSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        message: 'Invalid review data', 
        errors: validationResult.error.errors 
      });
      return;
    }

    const { productId, rating, comment } = validationResult.data;

    // Create the review within a transaction to also update product aggregates
    const result = await prisma.$transaction(async (tx) => {
      // Create the review
      try {
        const review = await tx.review.create({
          data: {
            userId,
            productId,
            rating,
            comment
          }
        });

        // Recalculate the average rating and review count
        const aggregates = await tx.review.aggregate({
          where: { productId },
          _avg: { rating: true },
          _count: { id: true }
        });

        // Update the product with new rating data
        await tx.product.update({
          where: { id: productId },
          data: {
            averageRating: aggregates._avg.rating,
            reviewCount: aggregates._count.id
          }
        });

        return review;
      } catch (error) {
        // Handle unique constraint violation (user already reviewed this product)
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new Error('You have already reviewed this product');
        }
        throw error;
      }
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating review:', error);
    if (error instanceof Error && error.message === 'You have already reviewed this product') {
      res.status(409).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to create review' });
    }
  }
});

// GET /api/reviews/user - Get all reviews by the current user
router.get('/user', isUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in the request' });
      return;
    }

    const userReviews = await prisma.review.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(userReviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// PUT /api/reviews/:reviewId - Update an existing review
router.put('/:reviewId', isUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in the request' });
      return;
    }

    // Validate reviewId
    const reviewId = parseInt(req.params.reviewId);
    if (isNaN(reviewId)) {
      res.status(400).json({ message: 'Invalid review ID' });
      return;
    }

    // Validate request body
    const validationResult = z.object({
      rating: z.number().int().min(1).max(5),
      comment: z.string().optional()
    }).safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({ 
        message: 'Invalid review data', 
        errors: validationResult.error.errors 
      });
      return;
    }

    const { rating, comment } = validationResult.data;

    // Check if the review exists and belongs to the user
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    if (existingReview.userId !== userId) {
      res.status(403).json({ message: 'You can only update your own reviews' });
      return;
    }

    // Update the review and recalculate product aggregates in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the review
      const updatedReview = await tx.review.update({
        where: { id: reviewId },
        data: { rating, comment }
      });

      // Recalculate the average rating for the product
      const productId = existingReview.productId;
      const aggregates = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { id: true }
      });

      // Update the product with the new average
      await tx.product.update({
        where: { id: productId },
        data: {
          averageRating: aggregates._avg.rating,
          reviewCount: aggregates._count.id
        }
      });

      return updatedReview;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Failed to update review' });
  }
});

// DELETE /api/reviews/:reviewId - Delete a review
router.delete('/:reviewId', isUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in the request' });
      return;
    }

    // Validate reviewId
    const reviewId = parseInt(req.params.reviewId);
    if (isNaN(reviewId)) {
      res.status(400).json({ message: 'Invalid review ID' });
      return;
    }

    // Check if the review exists and belongs to the user
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    if (existingReview.userId !== userId) {
      res.status(403).json({ message: 'You can only delete your own reviews' });
      return;
    }

    // Get the product ID for recalculating aggregates later
    const productId = existingReview.productId;

    // Delete the review and update product aggregates in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete the review
      await tx.review.delete({
        where: { id: reviewId }
      });

      // Recalculate the average rating for the product
      const aggregates = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { id: true }
      });

      // Update the product with the new average rating (or set to null if no reviews left)
      await tx.product.update({
        where: { id: productId },
        data: {
          averageRating: aggregates._count.id > 0 ? aggregates._avg.rating : null,
          reviewCount: aggregates._count.id
        }
      });
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

// GET /api/reviews/product/:productId - Get all reviews for a product
router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    
    if (isNaN(productId)) {
      res.status(400).json({ message: 'Invalid Product ID format.' });
      return;
    }
    
    // Verify that the product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      res.status(404).json({ message: `Product with ID ${productId} not found.` });
      return;
    }
    
    // Get all reviews for the product, including user email
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json(reviews);
  } catch (error) {
    console.error(`Error fetching reviews for product:`, error);
    res.status(500).json({ message: 'Error retrieving product reviews.', error: String(error) });
  }
});

export default router;
```

---
### File: `packages/backend/src/routes/uploadRoutes.ts`

```typescript
import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { isAdmin } from '../middleware/authMiddleware'; // Protect upload

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req: any, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        cb(null, uploadsDir);
    },
    filename: function (req: any, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        // Generate a unique filename with timestamp and original extension
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniquePrefix + ext);
    }
});

// File filter to only allow specific image types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only images
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'));
    }
};

// Initialize multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: fileFilter
});

/**
 * @route POST /api/admin/upload
 * @description Upload a file (admin only)
 * @access Admin
 */
router.post('/', isAdmin, (req: Request, res: Response) => {
    // Handle file upload with manually typed callback
    upload.single('productImage')(req as any, res as any, (err: any) => {
        if (err) {
            let errorMessage = 'File upload failed.';
            
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading
                if (err.code === 'LIMIT_FILE_SIZE') {
                    errorMessage = 'File too large. Maximum file size is 5MB.';
                }
            } else {
                // A different error occurred
                errorMessage = err.message;
            }
            
            res.status(400).json({ message: errorMessage });
            return;
        }
        
        // No file was uploaded
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded. Please select a file.' });
            return;
        }
        
        // File upload successful
        const relativeUrl = `/uploads/${req.file.filename}`; // Path relative to the 'public' dir
        res.status(201).json({ 
            message: 'File uploaded successfully',
            imageUrl: relativeUrl
        });
    });
});

export default router;
```

---
### File: `packages/backend/src/routes/wishlistRoutes.ts`

```typescript
import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Define Zod validation schema for adding wishlist item
const addWishlistItemSchema = z.object({
  productId: z.number().int().positive({ message: "Product ID must be a positive integer" })
});

/**
 * @route GET /api/wishlist
 * @description Get all wishlist items for the authenticated user
 * @access Private (User only)
 */
router.get('/', isUser, async (req: Request, res: Response) => {
  try {
    // Get user ID from the JWT token (via middleware)
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    // Fetch all wishlist items for the user, including product details
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            stock: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist items:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

/**
 * @route POST /api/wishlist
 * @description Add an item to the wishlist
 * @access Private (User only)
 */
router.post('/', isUser, async (req: Request, res: Response) => {
  try {
    // Get user ID from the JWT token (via middleware)
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    // Validate request body
    const validationResult = addWishlistItemSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.errors
      });
      return;
    }

    // Extract validated data
    const { productId } = validationResult.data;

    try {
      // Check if product exists
      const product = await prisma.product.findUniqueOrThrow({
        where: { id: productId }
      });

      // Create wishlist item
      const wishlistItem = await prisma.wishlistItem.create({
        data: {
          userId,
          productId
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              stock: true
            }
          }
        }
      });

      res.status(201).json(wishlistItem);
    } catch (error) {
      // Handle specific errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation (item already in wishlist)
        if (error.code === 'P2002') {
          res.status(409).json({
            message: 'Item already in wishlist'
          });
          return;
        }
        // Foreign key constraint failure (product not found)
        if (error.code === 'P2003') {
          res.status(404).json({
            message: 'Product not found'
          });
          return;
        }
      }
      throw error; // Re-throw other errors to be caught by the outer try-catch
    }
  } catch (error) {
    console.error('Error adding item to wishlist:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

/**
 * @route DELETE /api/wishlist/:productId
 * @description Remove an item from the wishlist
 * @access Private (User only)
 */
router.delete('/:productId', isUser, async (req: Request, res: Response) => {
  try {
    // Get user ID from the JWT token (via middleware)
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    // Validate and parse product ID
    const productIdInt = parseInt(req.params.productId, 10);
    if (isNaN(productIdInt)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    try {
      // Delete the wishlist item using the compound unique key
      await prisma.wishlistItem.delete({
        where: {
          userId_productId: {
            userId,
            productId: productIdInt
          }
        }
      });

      // Return success - No Content
      res.status(204).send();
    } catch (error) {
      // Handle specific errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Record not found
        if (error.code === 'P2025') {
          // Return 204 anyway since the end state (item not in wishlist) is achieved
          res.status(204).send();
          return;
        }
      }
      throw error; // Re-throw other errors to be caught by the outer try-catch
    }
  } catch (error) {
    console.error('Error removing item from wishlist:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

export default router;
```

---
### File: `packages/customer-frontend/src/App.tsx`

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout'; // Import the layout
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrderHistoryPage from './pages/OrderHistoryPage'; // Import the new page
import RequestPasswordResetPage from './pages/RequestPasswordResetPage'; // Import the new page
import ResetPasswordPage from './pages/ResetPasswordPage'; // Import the new page
import CustomerOrderDetailPage from './pages/CustomerOrderDetailPage'; // Import the new page
import ProfilePage from './pages/ProfilePage'; // Import the profile page
import WishlistPage from './pages/WishlistPage'; // Import the wishlist page
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext'; // Import WishlistProvider
import { Toaster } from 'react-hot-toast';
// Import other pages as needed

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster position="bottom-center" />
            <AppRoutes />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Routes with layout */}
      <Route path="/" element={<Layout />}>
        {/* Index route for the homepage */}
        <Route index element={<HomePage />} />
        <Route path="cart" element={<CartPage />} />
        {/* Product detail page */}
        <Route path="product/:productId" element={<ProductDetailPage />} />
        {/* Wishlist page - requires authentication */}
        <Route path="wishlist" element={isAuthenticated ? <WishlistPage /> : <Navigate to="/login" replace />} />
        {/* Checkout route - requires authentication */}
        <Route path="checkout" element={isAuthenticated ? <CheckoutPage /> : <Navigate to="/login" replace />} />
        {/* Order Success page - needs parameter later */}
        <Route path="order/success/:orderId" element={isAuthenticated ? <OrderSuccessPage /> : <Navigate to="/login" replace />} />
        {/* Add the new route for order history */}
        <Route path="orders" element={isAuthenticated ? <OrderHistoryPage /> : <Navigate to="/login" replace />} />
        {/* Add the new route for order detail */}
        <Route path="order/:orderId" element={isAuthenticated ? <CustomerOrderDetailPage /> : <Navigate to="/login" replace />} />
        {/* Add the profile page route */}
        <Route path="profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />} />
        {/* Add other routes like product detail later */}

        {/* Optional: Catch-all within layout */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
```

---
### File: `packages/customer-frontend/src/index.css`

```css
/* 
 * Global custom styles for the Customer Storefront
 * Based on Bootstrap with custom overrides for consistency
 */

/* Import Inter font from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Define Color Palette Variables */
:root {
  /* Primary Colors */
  --primary: #14B8A6;
  --primary-rgb: 20, 184, 166;
  --primary-hover: #119A88; /* Slightly Darker Teal */
  --primary-active: #0E8171; /* Even Darker Teal */
  --primary-light: #73E5D7;
  --primary-bg-subtle: #E6FAF8;
  
  /* Secondary/Accent Colors (Enhanced) */
  --secondary-color: #64748B; /* Neutral 500 */
  --secondary-rgb: 100, 116, 139;
  --secondary-hover: #475569; /* Neutral 600 */
  --secondary-active: #334155; /* Neutral 700 */
  --light-bg: #F8FAFC; /* Neutral 50 */
  --subtle-border: #E2E8F0; /* Neutral 200 */
  --text-muted: #64748B; /* Neutral 500 */
  --text-dark: #1E293B; /* Neutral 800 */
  
  /* Neutral Colors */
  --neutral-50: #F8FAFC;
  --neutral-100: #F1F5F9;
  --neutral-200: #E2E8F0;
  --neutral-300: #CBD5E1;
  --neutral-400: #94A3B8;
  --neutral-500: #64748B;
  --neutral-600: #475569;
  --neutral-700: #334155;
  --neutral-800: #1E293B;
  --neutral-900: #0F172A;
  
  /* Accent Color */
  --accent: #8B5CF6;
  --accent-rgb: 139, 92, 246;
  --accent-dark: #7C3AED;
  --accent-light: #A78BFA;
  --accent-bg-subtle: #F3EEFF;
  
  /* Semantic Colors */
  --success: #10B981;
  --success-hover: #0EA06F;
  --success-active: #0B8A5C;
  --warning: #F59E0B;
  --warning-hover: #D97706;
  --warning-active: #B45309;
  --danger: #EF4444;
  --danger-hover: #DC2626;
  --danger-active: #B91C1C;
  --info: #3B82F6;
  --info-hover: #2563EB;
  --info-active: #1D4ED8;

  /* Bootstrap Variables */
  --bs-link-color-rgb: var(--primary-rgb);
  --bs-link-hover-color-rgb: var(--primary-rgb); /* Handled via filter below */

  /* Font Settings */
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Spacing */
  --spacer-1: 0.25rem;
  --spacer-2: 0.5rem;
  --spacer-3: 1rem;
  --spacer-4: 1.5rem;
  --spacer-5: 3rem;
  
  /* Button Styles */
  --button-border-radius: 0.375rem;
  --button-padding-y: 0.5rem;
  --button-padding-x: 1.25rem;
  --button-font-weight: 500;
  
  /* Component Specific */
  --card-border-radius: 0.5rem;
  --card-box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --input-border-radius: 0.375rem;
}

/* Global Base Styles */
body {
  font-family: var(--font-family-base);
  background-color: var(--light-bg);
  color: var(--neutral-800);
  line-height: 1.6;
}

/* Typography Overrides */
h1, h2, h3, h4, h5, h6, p, table, form, .card {
  color: var(--neutral-900);
  margin-bottom: 1.25rem;
  font-weight: var(--font-weight-semibold);
}

h1 { font-size: 2rem; }
h2 { font-size: 1.75rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }
h5 { font-size: 1.125rem; }
h6 { font-size: 1rem; }

.text-muted {
  color: var(--text-muted) !important;
}

.small {
  font-size: 0.875rem;
}

/* Link Styles */
a {
  color: var(--primary);
  text-decoration: none;
  transition: color 0.2s ease;
}
a:hover {
  filter: brightness(85%);
  text-decoration: none;
}

/* Interactive Element Focus Styles */
a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.4);
  border-radius: var(--input-border-radius);
}

/* Table Headers */
th {
  font-weight: 600;
}

/* ----- BOOTSTRAP COMPONENT OVERRIDES ----- */

/* Buttons */
.btn {
  font-weight: var(--button-font-weight);
  border-radius: var(--button-border-radius);
  padding: var(--button-padding-y) var(--button-padding-x);
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, transform 0.1s ease-in-out;
  --bs-btn-focus-shadow-rgb: none;
}

.btn:active {
  transform: scale(0.98);
}

.btn:focus-visible {
  border-radius: var(--button-border-radius);
}

.btn-primary {
  --bs-btn-bg: var(--primary);
  --bs-btn-border-color: var(--primary);
  --bs-btn-hover-bg: var(--primary-hover);
  --bs-btn-hover-border-color: var(--primary-hover);
  --bs-btn-active-bg: var(--primary-active);
  --bs-btn-active-border-color: var(--primary-active);
  --bs-btn-disabled-bg: var(--primary);
  --bs-btn-disabled-border-color: var(--primary);
  --bs-btn-color: white;
  --bs-btn-hover-color: white;
  --bs-btn-active-color: white;
}

.btn-secondary {
  --bs-btn-bg: var(--secondary-color);
  --bs-btn-border-color: var(--secondary-color);
  --bs-btn-hover-bg: var(--secondary-hover);
  --bs-btn-hover-border-color: var(--secondary-hover);
  --bs-btn-active-bg: var(--secondary-active);
  --bs-btn-active-border-color: var(--secondary-active);
  --bs-btn-color: white;
  --bs-btn-hover-color: white;
  --bs-btn-active-color: white;
}

.btn-outline-primary {
  --bs-btn-color: var(--primary);
  --bs-btn-border-color: var(--primary);
  --bs-btn-hover-bg: var(--primary);
  --bs-btn-hover-border-color: var(--primary);
  --bs-btn-hover-color: white;
  --bs-btn-active-bg: var(--primary-active);
  --bs-btn-active-border-color: var(--primary-active);
  --bs-btn-active-color: white;
  --bs-btn-disabled-color: var(--primary);
  --bs-btn-disabled-border-color: var(--primary);
}

.btn-outline-secondary {
  --bs-btn-color: var(--secondary-color);
  --bs-btn-border-color: var(--secondary-color);
  --bs-btn-hover-bg: var(--secondary-color);
  --bs-btn-hover-border-color: var(--secondary-color);
  --bs-btn-hover-color: white;
  --bs-btn-active-bg: var(--secondary-active);
  --bs-btn-active-border-color: var(--secondary-active);
  --bs-btn-active-color: white;
  --bs-btn-disabled-color: var(--secondary-color);
  --bs-btn-disabled-border-color: var(--secondary-color);
}

.btn-success {
  --bs-btn-bg: var(--success);
  --bs-btn-border-color: var(--success);
  --bs-btn-hover-bg: var(--success-hover);
  --bs-btn-hover-border-color: var(--success-hover);
  --bs-btn-active-bg: var(--success-active);
  --bs-btn-active-border-color: var(--success-active);
  --bs-btn-color: white;
  --bs-btn-hover-color: white;
  --bs-btn-active-color: white;
}

.btn-danger {
  --bs-btn-bg: var(--danger);
  --bs-btn-border-color: var(--danger);
  --bs-btn-hover-bg: var(--danger-hover);
  --bs-btn-hover-border-color: var(--danger-hover);
  --bs-btn-active-bg: var(--danger-active);
  --bs-btn-active-border-color: var(--danger-active);
  --bs-btn-color: white;
  --bs-btn-hover-color: white;
  --bs-btn-active-color: white;
}

.btn-warning {
  --bs-btn-bg: var(--warning);
  --bs-btn-border-color: var(--warning);
  --bs-btn-hover-bg: var(--warning-hover);
  --bs-btn-hover-border-color: var(--warning-hover);
  --bs-btn-active-bg: var(--warning-active);
  --bs-btn-active-border-color: var(--warning-active);
}

.btn-info {
  --bs-btn-bg: var(--info);
  --bs-btn-border-color: var(--info);
  --bs-btn-hover-bg: var(--info-hover);
  --bs-btn-hover-border-color: var(--info-hover);
  --bs-btn-active-bg: var(--info-active);
  --bs-btn-active-border-color: var(--info-active);
}

.btn-link {
  color: var(--primary);
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

/* Cards */
.card {
  border-radius: var(--card-border-radius);
  border-color: var(--neutral-200);
  box-shadow: var(--card-box-shadow);
  overflow: hidden;
}

.card-header {
  background-color: var(--neutral-50);
  border-bottom-color: var(--neutral-200);
  padding: 1rem 1.25rem;
  font-weight: var(--font-weight-medium);
}

.card-footer {
  background-color: var(--neutral-50);
  border-top-color: var(--neutral-200);
}

.card-body {
  padding: 1.5rem;
}

/* Product Cards - Special styling for the store */
.product-card {
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.product-img-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: var(--neutral-50);
}

.product-img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}

.product-price {
  font-weight: var(--font-weight-semibold);
  font-size: 1.25rem;
  color: var(--primary);
}

/* Form Controls */
.form-control, .form-select {
  border-radius: var(--input-border-radius);
  border-color: var(--neutral-300);
  padding: 0.5rem 0.75rem;
}

.form-control:focus, .form-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 0.25rem rgba(var(--primary-rgb), 0.25);
}

.form-label {
  font-weight: var(--font-weight-medium);
  margin-bottom: 0.5rem;
  color: var(--neutral-700);
}

.form-text {
  color: var(--neutral-600);
}

/* Consistent form group spacing */
.form-group, .mb-3 {
  margin-bottom: 1.5rem;
}

/* Alerts */
.alert {
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  border-width: 1px;
  font-weight: 500;
}

.alert-primary {
  background-color: var(--primary-bg-subtle);
  border-color: var(--primary-light);
  color: var(--primary-dark);
}

.alert-success {
  --bs-alert-bg: #ECFDF5;
  --bs-alert-border-color: #A7F3D0;
  --bs-alert-color: #065F46;
}

.alert-warning {
  --bs-alert-bg: #FFFBEB;
  --bs-alert-border-color: #FCD34D;
  --bs-alert-color: #92400E;
}

.alert-danger {
  --bs-alert-bg: #FEF2F2;
  --bs-alert-border-color: #FECACA;
  --bs-alert-color: #991B1B;
}

/* Backgrounds */
.bg-primary {
  background-color: var(--primary) !important;
}

.bg-secondary {
  background-color: var(--neutral-500) !important;
}

.bg-success {
  background-color: var(--success) !important;
}

.bg-danger {
  background-color: var(--danger) !important;
}

.bg-warning {
  background-color: var(--warning) !important;
}

.bg-info {
  background-color: var(--info) !important;
}

.bg-light {
  background-color: var(--neutral-50) !important;
}

.bg-dark {
  background-color: var(--neutral-900) !important;
}

/* Badges */
.badge {
  font-weight: var(--font-weight-medium);
  padding: 0.35em 0.65em;
  border-radius: 0.375rem;
}

.badge.bg-primary {
  background-color: var(--primary) !important;
}

.badge.bg-secondary {
  background-color: var(--neutral-500) !important;
}

.badge.bg-success {
  background-color: var(--success) !important;
}

.badge.bg-danger {
  background-color: var(--danger) !important;
}

.badge.bg-warning {
  background-color: var(--warning) !important;
}

.badge.bg-info {
  background-color: var(--info) !important;
}

/* Tables */
.table {
  --bs-table-hover-bg: rgba(var(--primary-rgb), 0.05);
}

.table thead th {
  background-color: var(--neutral-50);
  color: var(--neutral-700);
  font-weight: 600;
  border-bottom-width: 1px;
  padding: 0.75rem 1rem;
}

.table tfoot th, .table tfoot td {
  background-color: var(--neutral-100);
  font-weight: 600;
}

.tfoot-total {
  font-size: 1.1em;
  font-weight: 700;
  color: var(--primary-dark);
}

/* Navbars - Customer specific styling */
.navbar {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.navbar-brand {
  font-weight: var(--font-weight-bold);
  color: var(--primary);
  font-size: 1.5rem;
}

.navbar-nav .nav-link {
  font-weight: var(--font-weight-medium);
  transition: color 0.2s ease;
}

/* Main Content Area */
.main-content {
  padding-top: 4rem; /* Make space for fixed navbar */
}

/* Footer */
.footer {
  background-color: var(--neutral-800);
  color: white;
  padding: 3rem 0;
  margin-top: 3rem;
}

.footer a {
  color: var(--neutral-300);
}

.footer a:hover {
  color: white;
}

.footer-heading {
  color: white;
  font-weight: var(--font-weight-semibold);
  margin-bottom: 1.25rem;
}

/* Category items */
.category-item {
    cursor: pointer;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  background-color: var(--neutral-50);
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  border-radius: var(--card-border-radius);
  padding: 0.75rem;
}

.category-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.category-item.border-primary {
  box-shadow: 0 0 0 2px var(--primary);
}

.category-image {
  max-height: 40px;
    max-width: 100%;
  object-fit: contain;
}

.category-name {
  font-size: 0.85rem;
  font-weight: var(--font-weight-medium);
  margin-top: 0.5rem;
  margin-bottom: 0;
  text-align: center;
}

/* Star Rating Component */
.star-rating {
  color: var(--warning);
}

/* Custom responsive layout helpers */
@media (max-width: 768px) {
  .card-body {
    padding: 1.25rem;
  }
  
  h1 { font-size: 1.75rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
  
  .category-image {
    max-height: 30px;
  }
  
  .category-name {
    font-size: 0.75rem;
  }
  
  .category-item {
    padding: 0.5rem;
  }
}

/* Transitions & Animations */
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Banner and Hero Sections */
.hero-banner {
  background-color: var(--primary-bg-subtle);
  padding: 3rem 0;
  margin-bottom: 2rem;
}

.hero-title {
  font-weight: var(--font-weight-bold);
  margin-bottom: 1rem;
}

.hero-subtitle {
  color: var(--neutral-600);
  margin-bottom: 1.5rem;
}

/* Price formatting */
.price {
  color: var(--primary-dark);
  font-weight: var(--font-weight-semibold);
}

.original-price {
  text-decoration: line-through;
  color: var(--neutral-500);
  margin-right: 0.5rem;
}

.discount-badge {
  background-color: var(--danger);
  color: white;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-left: 0.5rem;
}

/* Transitions for Interactive Elements */
.btn, .nav-link, .card, .category-item {
  transition: all 0.2s ease-in-out;
}

/* Empty State Styling */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--neutral-300);
}

.empty-state-text {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

/* Horizontal scrolling categories for mobile */
.category-scroll-container {
  display: flex;
  overflow-x: auto; /* Enable horizontal scroll */
  white-space: nowrap; /* Prevent wrapping */
  padding-bottom: 8px; /* Space for scrollbar */
  -webkit-overflow-scrolling: touch; /* Smoother scroll on iOS */
  scrollbar-width: none; /* Hide scrollbar standard */
  margin-bottom: 1rem;
}

.category-scroll-container::-webkit-scrollbar {
  display: none; /* Hide scrollbar Webkit */
}

.category-item-wrapper {
  display: inline-block; /* Align items horizontally */
  margin-right: 8px; /* Space between items */
  width: 80px; /* Fixed width for each category item */
}

.category-item-wrapper.active .category-item {
  /* Style for selected category */
  box-shadow: 0 0 0 2px var(--primary);
  border-color: var(--primary) !important;
}

.category-item {
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  border-color: var(--neutral-200) !important;
}

/* Adjust existing category styles for mobile compatibility */
@media (max-width: 768px) {
  .category-image {
    max-height: 35px;
    object-fit: cover;
  }
  
  .category-name {
    font-size: 0.75rem;
    margin-top: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* Fix for dropdowns overflowing the screen on mobile */
.dropdown-menu {
  position: absolute;
  max-width: 90vw;
}

/* Mobile sort dropdown specific styling */
.mobile-sort-dropdown .dropdown-menu {
  right: 0 !important;
  left: auto !important;
  width: auto !important;
  min-width: 0 !important;
  transform: none !important;
  top: 100% !important;
  position: absolute !important;
  inset: auto 0 auto auto !important;
}

.mobile-sort-dropdown .form-select {
  padding-right: 1.75rem !important;
  text-overflow: ellipsis;
}

@media (max-width: 576px) {
  .dropdown-menu {
    width: 180px;
    min-width: unset;
  }
  
  .mobile-sort-dropdown select {
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .mobile-sort-dropdown .form-select option {
    white-space: normal;
    font-size: 0.85rem;
  }

  /* Force dropdown to stay in viewport */
  .mobile-sort-dropdown .dropdown-menu {
    max-width: 160px !important;
    margin-right: 0 !important;
    right: 5px !important;
  }
}

/* Mobile dropdown fixes */
.mobile-sort-dropdown {
  position: relative;
  width: 100%;
}

.mobile-sort-dropdown .dropdown-toggle,
.mobile-sort-dropdown .form-select {
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

@media (max-width: 576px) {
  .mobile-sort-dropdown {
    max-width: 160px;
  }
  
  .mobile-sort-dropdown .form-select {
    font-size: 0.85rem;
    padding-right: 24px !important;
    }
}
```

---
### File: `packages/customer-frontend/src/main.tsx`

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
// Import Bootstrap CSS FIRST
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.tsx'
import './index.css' // Your custom CSS (optional overrides)
import { AuthProvider } from './context/AuthContext'; // Import
import { CartProvider } from './context/CartContext'; // Import
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider> {/* Wrap App */}
      <CartProvider> {/* Wrap App */}
        <Toaster position="top-right" />
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
)
```

---
### File: `packages/customer-frontend/src/vite-env.d.ts`

```typescript
/// <reference types="vite/client" />
```

---
### File: `packages/customer-frontend/src/components/Layout.tsx`

```tsx
import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Offcanvas, Badge, Row, Col, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';
import { FaShoppingCart, FaUser, FaList, FaSignOutAlt, FaHome, FaRegHeart, FaStore, FaHeart } from 'react-icons/fa';

const Layout = () => {
  const { isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart();
  const { wishlistItems } = useWishlist();
  const itemCount = getItemCount();
  const wishlistCount = wishlistItems.length;
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const navigate = useNavigate();
  
  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  const handleLogout = () => {
    logout();
    setShowOffcanvas(false);
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="app-wrapper d-flex flex-column min-vh-100">
      <Navbar bg="white" expand={false} fixed="top" className="shadow-sm py-2 border-bottom">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bolder text-decoration-none">
            <FaStore className="me-2 text-primary" size={22} />
            <span style={{ color: 'var(--primary)' }}>Hybrid</span>Store
          </Navbar.Brand>
          
          <div className="d-flex align-items-center">
            {isAuthenticated && (
              <Link to="/wishlist" className="position-relative me-3 d-flex align-items-center text-decoration-none">
                <FaHeart size={20} className="text-danger" />
                {wishlistCount > 0 && (
                  <Badge pill bg="primary" className="position-absolute top-0 start-100 translate-middle badge-sm">
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
            )}
            <Link to="/cart" className="position-relative me-3 d-flex align-items-center text-decoration-none">
              <FaShoppingCart size={20} className="text-primary" />
              {itemCount > 0 && (
                <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle badge-sm">
                  {itemCount}
                </Badge>
              )}
            </Link>
            <Navbar.Toggle 
              aria-controls="offcanvasNavbar-expand-false" 
              onClick={handleShowOffcanvas}
              className="border-0"
            />
          </div>
          
          <Navbar.Offcanvas
            id="offcanvasNavbar-expand-false"
            aria-labelledby="offcanvasNavbarLabel-expand-false"
            placement="end"
            show={showOffcanvas}
            onHide={handleCloseOffcanvas}
          >
            <Offcanvas.Header closeButton className="border-bottom">
              <Offcanvas.Title id="offcanvasNavbarLabel-expand-false" className="fw-bold d-flex align-items-center">
                <FaStore className="me-2 text-primary" />
                Menu
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1">
                <Nav.Link as={Link} to="/" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center">
                  <FaHome className="me-2 text-primary" /> Home
                </Nav.Link>
                <Nav.Link as={Link} to="/cart" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center position-relative">
                  <FaShoppingCart className="me-2 text-primary" /> Cart 
                  {itemCount > 0 && <Badge pill bg="danger" className="ms-2">{itemCount}</Badge>}
                </Nav.Link>
                
                {isAuthenticated ? (
                  <>
                    <Nav.Link as={Link} to="/wishlist" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center position-relative">
                      <FaHeart className="me-2 text-danger" /> My Wishlist
                      {wishlistCount > 0 && <Badge pill bg="primary" className="ms-2">{wishlistCount}</Badge>}
                    </Nav.Link>
                    <Nav.Link as={Link} to="/profile" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center">
                      <FaUser className="me-2 text-primary" /> My Profile
                    </Nav.Link>
                    <Nav.Link as={Link} to="/orders" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center">
                      <FaList className="me-2 text-primary" /> My Orders
                    </Nav.Link>
                    <Nav.Link onClick={handleLogout} style={{ cursor: 'pointer' }} className="py-3 border-bottom d-flex align-items-center">
                      <FaSignOutAlt className="me-2 text-danger" /> Logout
                    </Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/login" onClick={handleCloseOffcanvas} className="py-3 border-bottom d-flex align-items-center">
                      <FaUser className="me-2 text-primary" /> Login / Register
                    </Nav.Link>
                  </>
                )}
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
      
      <main className="flex-grow-1 pt-5 mt-3">
        <Outlet />
      </main>
      
      <footer className="footer bg-dark text-white py-5 mt-5">
        <Container>
          <Row className="gy-4">
            <Col md={4} className="mb-4 mb-md-0">
              <div className="d-flex align-items-center mb-3">
                <FaStore className="me-2 text-primary" size={24} />
                <h5 className="fw-bold mb-0">
                  <span style={{ color: 'var(--primary)' }}>Hybrid</span>Store
                </h5>
              </div>
              <p className="text-light">Your one-stop destination for quality products with convenient pickup and delivery options.</p>
            </Col>
            <Col md={2} className="mb-4 mb-md-0 d-none d-md-block">
              <h6 className="fw-semibold mb-3">Shop</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/" className="text-decoration-none text-light">Products</Link></li>
                <li className="mb-2"><Link to="/cart" className="text-decoration-none text-light">Cart</Link></li>
              </ul>
            </Col>
            <Col md={2} className="mb-4 mb-md-0 d-none d-md-block">
              <h6 className="fw-semibold mb-3">Account</h6>
              <ul className="list-unstyled">
                <li className="mb-2"><Link to="/profile" className="text-decoration-none text-light">My Profile</Link></li>
                <li className="mb-2"><Link to="/orders" className="text-decoration-none text-light">Orders</Link></li>
              </ul>
            </Col>
            <Col md={4} className="d-none d-md-block">
              <h6 className="fw-semibold mb-3">Contact</h6>
              <p className="mb-1 text-light">Email: support@hybridstore.com</p>
              <p className="mb-1 text-light">Phone: (123) 456-7890</p>
              <p className="mb-1 text-light">Address: 123 Commerce St, Business City</p>
            </Col>
          </Row>
          <hr className="my-4 border-light" />
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="mb-2 mb-md-0 text-light small text-center text-md-start">© {new Date().getFullYear()} Hybrid Store. All rights reserved.</p>
            <div className="d-none d-md-flex gap-2">
              <Button variant="outline-light" size="sm">Terms of Service</Button>
              <Button variant="outline-light" size="sm">Privacy Policy</Button>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Layout;
```

---
### File: `packages/customer-frontend/src/components/ProductCard.tsx`

```tsx
import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Card className="h-100 shadow-sm mb-2">
      <div className="position-relative">
        {product.imageUrl ? (
          <Card.Img 
            variant="top" 
            src={`${API_BASE_URL}${product.imageUrl}`} 
            alt={product.name}
            style={{ height: '180px', objectFit: 'cover' }}
          />
        ) : (
          <Card.Img 
            variant="top" 
            src="/placeholder-image.svg"
            alt={product.name}
            style={{ height: '180px', objectFit: 'cover' }}
          />
        )}
        {product.stock > 0 ? (
          <Badge 
            bg={product.stock > 10 ? "success" : "warning"} 
            className="position-absolute top-0 end-0 m-2"
          >
            {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
          </Badge>
        ) : (
          <Badge 
            bg="danger" 
            className="position-absolute top-0 end-0 m-2"
          >
            Out of Stock
          </Badge>
        )}
      </div>
      <Link to={`/product/${product.id}`} className="text-decoration-none">
        <Card.Body className="d-flex flex-column p-3">
          <Card.Title className="text-dark mb-2">{product.name}</Card.Title>
          <Card.Subtitle className="mb-3 text-muted">€{product.price.toFixed(2)}</Card.Subtitle>
          <Card.Text className="text-muted small flex-grow-1">{product.description || ''}</Card.Text>
        </Card.Body>
      </Link>
      <Card.Footer className="bg-white border-0 pt-0 p-3">
        <Button 
          variant="primary" 
          className="w-100"
          onClick={() => handleAddToCart(product)}
          disabled={product.stock <= 0}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default ProductCard;
```

---
### File: `packages/customer-frontend/src/context/AuthContext.tsx`

```tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  userId: number | null; // Or string if your IDs are strings
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAuthLoading: boolean; // Add loading state type
}

// Create context with a default value (can be undefined or null initially)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Add loading state
  // TODO: Add userId state if needed after decoding token

  // Load token from storage on initial mount
  useEffect(() => {
    setIsAuthLoading(true); // Start loading
    try {
      const storedToken = localStorage.getItem('customer_token');
      if (storedToken) {
        setToken(storedToken);
        // TODO: Decode token and set user ID if needed
        // const decoded = jwtDecode(storedToken); // Example using jwt-decode
        // setUserId(decoded.userId);
      }
    } catch (error) {
       console.error("Error reading token from localStorage:", error);
    } finally {
       setIsAuthLoading(false); // Finish loading regardless of outcome
    }
  }, []); // Run once on mount

  const login = (newToken: string) => {
    try {
        localStorage.setItem('customer_token', newToken);
        setToken(newToken);
        // TODO: Decode token and set user ID if needed
    } catch (error) {
        console.error("Error saving token to localStorage:", error);
        // Handle potential storage errors (e.g., storage full)
    }
  };

  const logout = () => {
    try {
        localStorage.removeItem('customer_token');
        setToken(null);
        // TODO: Clear userId state if implemented
    } catch (error) {
        console.error("Error removing token from localStorage:", error);
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, userId: null, login, logout, isAuthenticated, isAuthLoading }}> {/* Add isAuthLoading to value */}
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---
### File: `packages/customer-frontend/src/context/CartContext.tsx`

```tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Define types for cart items and product
interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  addOrUpdateItemQuantity: (productId: number, quantity: number) => Promise<void>;
  updateCartItemQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getItemCount: () => number;
  totalPrice: number;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get token from localStorage
  const getToken = (): string | null => {
    return localStorage.getItem('customer_token');
  };
  
  const isAuthenticated = (): boolean => {
    return !!getToken();
  };

  // Fetch cart items from API
  const fetchCart = async (): Promise<void> => {
    const token = getToken();
    if (!token) {
      console.log('No token available for fetching cart');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching cart from server');
      
      // Fetch all cart items for this user
      const response = await axios.get(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Cart data received:', response.data);
      
      // Update local cart state with server data
      setCartItems(response.data.map((item: any) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        description: item.product.description,
        imageUrl: item.product.imageUrl,
        stock: item.product.stock,
        quantity: item.quantity
      })));
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart items.");
      
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add an item to cart (with quantity 1)
  const addToCart = async (product: Product): Promise<void> => {
    try {
      await addOrUpdateItemQuantity(product.id, 1);
    } catch (err) {
      console.error("Error adding product to cart:", err);
      let errorMsg = "Failed to add item to cart.";
      
      if (axios.isAxiosError(err) && err.response) {
        console.log('API Error details:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        
        errorMsg = err.response.data.message || errorMsg;
      }
      
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Add or update cart item quantity
  const addOrUpdateItemQuantity = async (productId: number, quantity: number): Promise<void> => {
    const token = getToken();
    
    console.log('Adding/updating cart item:', { productId, quantity, isLoggedIn: !!token });
    
    if (!token || !isAuthenticated()) {
      console.log('User not authenticated, token:', token);
      toast.error("Please log in to update your cart.");
      throw new Error("User not authenticated");
    }
    
    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending API request to add/update cart:', {
        url: `${API_BASE_URL}/cart/item`,
        data: { productId, quantity },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Use the POST /cart/item endpoint to add or update an item
      await axios.post(
        `${API_BASE_URL}/cart/item`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Re-fetch the entire cart to ensure state consistency
      await fetchCart();
      
      toast.success(`${quantity} item(s) added to cart.`);
    } catch (err) {
      console.error("Error adding/updating cart:", err);
      let errorMsg = "Failed to update cart item.";
      
      if (axios.isAxiosError(err) && err.response) {
        console.log('API Error details:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        
        errorMsg = err.response.data.message || errorMsg;
      }
      
      toast.error(errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: number): Promise<void> => {
    const token = getToken();
    
    if (!token || !isAuthenticated()) {
      toast.error("Please log in to update your cart.");
      throw new Error("User not authenticated");
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Removing item from cart:', productId);
      
      // Call the API to remove the item
      await axios.delete(`${API_BASE_URL}/cart/item/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Re-fetch cart or update local state
      await fetchCart();
      
      toast.success("Item removed from cart.");
    } catch (err) {
      console.error("Error removing item from cart:", err);
      let errorMsg = "Failed to remove item from cart.";
      
      if (axios.isAxiosError(err) && err.response) {
        errorMsg = err.response.data.message || errorMsg;
      }
      
      toast.error(errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async (): Promise<void> => {
    const token = getToken();
    
    if (!token || !isAuthenticated()) {
      toast.error("Please log in to clear your cart.");
      throw new Error("User not authenticated");
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Clearing cart');
      
      // Call the API to clear the cart
      await axios.delete(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
    setCartItems([]);
      
      toast.success("Cart cleared successfully.");
    } catch (err) {
      console.error("Error clearing cart:", err);
      let errorMsg = "Failed to clear cart.";
      
      if (axios.isAxiosError(err) && err.response) {
        errorMsg = err.response.data.message || errorMsg;
      }
      
      toast.error(errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getCartTotal = (): number => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = (): number => {
     return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Calculate the total price of items in the cart
  const totalPrice = getCartTotal();

  // Initialize cart from API when component mounts
  useEffect(() => {
    if (isAuthenticated()) {
      fetchCart();
    }
  }, []);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      addOrUpdateItemQuantity,
      updateCartItemQuantity: addOrUpdateItemQuantity,
      removeFromCart, 
      clearCart, 
      getCartTotal, 
      getItemCount,
      totalPrice,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
```

---
### File: `packages/customer-frontend/src/context/WishlistContext.tsx`

```tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

// Define types
interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  description?: string | null;
  averageRating?: number | null;
  reviewCount?: number;
}

interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product: Product;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isWishlisted: (productId: number) => boolean;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();

  // Fetch wishlist items when auth state changes
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchWishlist();
    } else {
      // Clear wishlist when logged out
      setWishlistItems([]);
    }
  }, [isAuthenticated, token]);

  // Fetch wishlist items from API
  const fetchWishlist = async (): Promise<void> => {
    if (!isAuthenticated || !token) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setWishlistItems(response.data);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Failed to load wishlist items.");
      
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productId: number): Promise<void> => {
    if (!isAuthenticated || !token) {
      toast.error("Please log in to add items to your wishlist.");
      throw new Error("User not authenticated");
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.post(
        `${API_BASE_URL}/wishlist`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchWishlist();
      toast.success("Item added to wishlist!");
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      let errorMsg = "Failed to add item to wishlist.";
      
      if (axios.isAxiosError(err) && err.response) {
        // If the item is already in the wishlist, don't show an error
        if (err.response.status === 409) {
          toast.success("Item is already in your wishlist!");
          return;
        }
        
        errorMsg = err.response.data.message || errorMsg;
      }
      
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId: number): Promise<void> => {
    if (!isAuthenticated || !token) {
      toast.error("Please log in to manage your wishlist.");
      throw new Error("User not authenticated");
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.delete(`${API_BASE_URL}/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state immediately for better UX
      setWishlistItems(prevItems => prevItems.filter(item => item.productId !== productId));
      toast.success("Item removed from wishlist.");
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      let errorMsg = "Failed to remove item from wishlist.";
      
      if (axios.isAxiosError(err) && err.response) {
        errorMsg = err.response.data.message || errorMsg;
      }
      
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if an item is already in the wishlist
  const isWishlisted = (productId: number): boolean => {
    return wishlistItems.some(item => item.productId === productId);
  };

  return (
    <WishlistContext.Provider 
      value={{ 
        wishlistItems, 
        isLoading, 
        error, 
        addToWishlist, 
        removeFromWishlist, 
        isWishlisted,
        fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook to use the WishlistContext
export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
```

---
### File: `packages/customer-frontend/src/pages/CartPage.tsx`

```tsx
import { Container, Row, Col, Table, Button, Alert, Card, Form, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const CartPage = () => {
  // Get all required functions from cart context in one place
  const { cartItems, removeFromCart, clearCart, getCartTotal, updateCartItemQuantity } = useCart();
  const navigate = useNavigate();
  
  const cartIsEmpty = cartItems.length === 0;
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  // Helper function to format currency
  const formatCurrency = (value: number): string => {
    return `€${value.toFixed(2)}`;
  };
  
  return (
    <Container className="py-4">
      <h2 className="mb-4">Your Shopping Cart</h2>
      
      {cartIsEmpty ? (
        <div className="empty-state">
          <FaShoppingCart className="empty-state-icon" />
          <p className="empty-state-text">Your cart is empty</p>
          <p className="mb-4 text-muted">Add products to your cart to get started with your shopping</p>
          <Link to="/" className="btn btn-primary px-4">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop/Tablet Cart Table - Hidden on small screens */}
          <div className="table-responsive mb-4 d-none d-lg-block">
            <Table hover responsive className="mb-0 shadow-sm">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="text-center">Price</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-center">Total</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {item.imageUrl && (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            className="me-3 d-none d-sm-block rounded shadow-sm"
                          />
                        )}
                        <div>
                          <div className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>{item.name}</div>
                          <small className="text-muted d-none d-md-inline">{item.id}</small>
                        </div>
                      </div>
                    </td>
                    <td className="text-center align-middle">{formatCurrency(item.price)}</td>
                    <td className="text-center align-middle" style={{ minWidth: '100px' }}>
                      <Form.Control
                        type="number"
                        size="sm"
                        min={1} // Minimum quantity
                        max={item.stock} // Set max based on available stock
                        value={item.quantity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const newQuantityStr = e.target.value;
                          // Allow empty string temporarily while typing, but treat as 0 for validation
                          const newQuantity = newQuantityStr === '' ? 0 : parseInt(newQuantityStr, 10);

                          // Update only if it's a valid integer (prevents partial input like '1.')
                          // Let the context handle the logic for quantity < 1 (removal)
                          if (!isNaN(newQuantity)) {
                            updateCartItemQuantity(item.id, newQuantity);
                          }
                          // If input becomes empty or invalid temporarily, onChange still fires,
                          // but the context/backend call might wait or handle it.
                        }}
                        style={{ width: '70px', margin: 'auto', textAlign: 'center' }} // Center text in input
                        aria-label={`Quantity for ${item.name}`}
                      />
                    </td>
                    <td className="text-center align-middle fw-bold">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                    <td className="text-center align-middle">
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        className="p-1 p-sm-2"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="text-end fw-bold py-3">Total:</td>
                  <td className="text-center tfoot-total py-3">{formatCurrency(getCartTotal())}</td>
                  <td></td>
                </tr>
              </tfoot>
            </Table>
          </div>
          
          {/* Mobile Cart Items View */}
          <div className="d-block d-lg-none mb-3">
            {cartItems.map((item) => (
              <Card key={item.id} className="mb-2 shadow-sm">
                <Card.Body className="p-2">
                  <Row className="g-2 align-items-center">
                    {/* Image Col */}
                    <Col xs={3} sm={2}>
                      <Image
                        src={item.imageUrl ? item.imageUrl : '/placeholder-image.svg'}
                        alt={item.name}
                        fluid
                        rounded
                        style={{ objectFit: 'cover', height: '60px', width: '60px' }}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.src = '/placeholder-image.svg';
                        }}
                      />
                    </Col>
                    {/* Details Col */}
                    <Col xs={6} sm={7}>
                      <div className="fw-bold small text-truncate">{item.name}</div>
                      <div className="text-muted small">{formatCurrency(item.price)}</div>
                      <div className="mt-1">
                        <Form.Control
                          type="number"
                          size="sm"
                          min={1}
                          max={item.stock}
                          value={item.quantity}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const newQuantityStr = e.target.value;
                            // Allow empty string temporarily while typing, but treat as 0 for validation
                            const newQuantity = newQuantityStr === '' ? 0 : parseInt(newQuantityStr, 10);
                            
                            // Update only if it's a valid integer
                            if (!isNaN(newQuantity)) {
                              updateCartItemQuantity(item.id, newQuantity);
                            }
                          }}
                          style={{ width: '60px', display: 'inline-block', padding: '0.2rem 0.5rem' }}
                          className="me-2"
                        />
                      </div>
                    </Col>
                    {/* Price/Remove Col */}
                    <Col xs={3} sm={3} className="text-end">
                      <div className="fw-bold small mb-2">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="py-1 px-2"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>

          {/* Summary and Buttons Section (Visible on all sizes) */}
          <Card className="mb-4 shadow-sm">
            <Card.Body className="text-end">
              <h4 className="mb-3">Total: {formatCurrency(getCartTotal())}</h4>
              <div className="d-grid gap-2 d-sm-flex justify-content-sm-end">
                <Button variant="outline-secondary" onClick={() => clearCart()}>Clear Cart</Button>
                <Link to="/" className="btn btn-secondary">Continue Shopping</Link>
                <Button variant="success" onClick={handleCheckout}>Proceed to Checkout</Button>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default CartPage;
```

---
### File: `packages/customer-frontend/src/pages/CheckoutPage.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { Container, Form, Row, Col, Button, Card, Table, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Make sure the API URL is defined
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
}

const CheckoutPage: React.FC = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ShippingInfo>({
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (cartItems.length === 0) {
      navigate('/cart');
    }

    // Get user location if supported
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set a user-friendly error message based on the error code
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError("Location access denied. Delivery location will not be used.");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError("Location information unavailable. Delivery location will not be used.");
              break;
            case error.TIMEOUT:
              setLocationError("Location request timed out. Delivery location will not be used.");
              break;
            default:
              setLocationError("An unknown error occurred. Delivery location will not be used.");
          }
        },
        // Options for geolocation request
        {
          enableHighAccuracy: false, // Don't need high accuracy for delivery
          timeout: 5000, // 5 seconds timeout
          maximumAge: 0 // Don't use cached position
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser. Delivery location will not be used.");
    }
  }, [cartItems, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('You must be logged in to place an order');
      navigate('/login');
      return;
    }

    // Validate only required fields
    setValidationError(null); // Clear previous validation errors
    setError(null); // Clear previous errors
    
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setValidationError('Please fill in all required fields: Name and Phone.');
      return; // Stop submission
    }

    try {
      setLoading(true);

      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingDetails: {
          ...formData
        },
        location: location || undefined,
        totalAmount: totalPrice
      };

      // Use the API_URL constant defined at the top of the file
      const response = await axios.post(
        `${API_URL}/api/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // --- BEGIN DEBUG LOGGING ---
      console.log("Checkout API Response Status:", response.status);
      console.log("Checkout API Response Headers:", response.headers);
      console.log("Checkout API Response Data:", response.data);
      console.log("Checking specifically for response.data.orderId:", response.data?.orderId);
      // --- END DEBUG LOGGING ---

      // Check if orderId exists in the response data
      if (response.data?.orderId) {
        console.log("SUCCESS PATH: Order ID found in response. Navigating...");
        clearCart();
        toast.success('Order placed successfully!');
        navigate(`/order/success/${response.data.orderId}`);
      } else {
        console.error("ERROR PATH: Order ID *missing* in successful response!", response.data);
        toast.error('Failed to create order (Invalid confirmation from server)');
        setError("Order placed, but couldn't get confirmation ID.");
      }
    } catch (error) {
      console.error("ERROR PATH: API call caught an error object:", error);
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.message || 'Unknown error';
        console.error("ERROR DETAILS:", {
          status: error.response.status,
          data: error.response.data
        });
        toast.error(`Order failed: ${errorMessage}`);
        setError(errorMessage);
      } else {
        toast.error('Failed to place order. Please check your connection and try again.');
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container className="py-3">
        <Alert variant="warning">
          Your cart is empty. Add some products before checkout.
        </Alert>
        <Button variant="primary" onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      <h2 className="mb-4">Checkout</h2>
      
      <Row>
        <Col lg={7} className="mb-4">
          <Card className="mb-4 h-100">
            <Card.Header>
              <h5 className="mb-0">Shipping Information</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {validationError && (
                  <Alert variant="danger" className="mb-3">
                    {validationError}
                  </Alert>
                )}
                
                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}
                
                <Row>
                  <Col xs={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} sm={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} sm={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>ZIP Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} sm={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12} sm={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {locationError && (
                  <Alert variant="warning" className="mb-3">
                    {locationError}
                  </Alert>
                )}

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mt-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table responsive className="table-sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td className="text-truncate" style={{ maxWidth: '140px' }}>{item.name}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">€{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan={2}>Total:</th>
                      <th className="text-end">€{totalPrice.toFixed(2)}</th>
                    </tr>
                  </tfoot>
                </Table>
              </div>

              {location && (
                <Alert variant="success" className="mb-0 mt-3">
                  <small>
                    <strong>Delivery Location Detected</strong><br />
                    Your order will be delivered based on your current location.
                  </small>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;
```

---
### File: `packages/customer-frontend/src/pages/CustomerOrderDetailPage.tsx`

```tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Interfaces based on expected API response for GET /api/orders/:id
interface OrderItem {
  id: number;
  quantity: number;
  price: number; // Price per item at time of order
  productId: number;
  product: { // Assuming backend includes product name via relation
    name: string;
  };
}

interface ShippingDetails { 
  fullName: string;
  address: string; // Assuming address is a single string from textarea
  phone: string;
  // Add other fields like city, zip, country if they are stored separately
}

interface CustomerOrder {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string; // ISO String
  shippingDetails: ShippingDetails | null; 
  items: OrderItem[];
  // Other fields like userId, latitude, longitude might be present but not displayed
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Helper functions (consider moving to utils)
const formatDateTime = (isoString: string) => {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleString();
  } catch (e) {
    return 'Invalid Date';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
};

const getStatusBadgeVariant = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'pending verification': return 'warning';
    case 'verified': return 'info';
    case 'processing': return 'primary';
    case 'shipped': return 'secondary';
    case 'delivered': return 'success';
    case 'cancelled': case 'failed verification': return 'danger';
    default: return 'light';
  }
};

const CustomerOrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { token, isAuthenticated, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (isAuthLoading) {
        console.log("Order Detail: Auth context still loading, waiting...");
        return; 
      }

      if (!isAuthenticated || !token) {
        setError("Authentication required to view order details.");
        setIsLoading(false);
        return;
      }

      if (!orderId) {
        setError("Order ID is missing from the URL.");
        setIsLoading(false);
        return;
      }

      console.log(`Order Detail: Auth loaded, fetching order ${orderId}...`);
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<CustomerOrder>(`${API_BASE_URL}/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        if (axios.isAxiosError(err)) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError("You are not authorized to view this order.");
            } else if (err.response?.status === 404) {
                setError("Order not found.");
            } else {
                setError(err.response?.data?.message || 'Failed to fetch order details.');
            }
        } else {
            setError('An unexpected error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();

  }, [orderId, token, isAuthenticated, isAuthLoading, navigate]);

  if (isAuthLoading || isLoading) {
      return (
        <Container className="py-4 text-center">
             <Spinner animation="border" role="status">
                 <span className="visually-hidden">Loading...</span>
             </Spinner>
         </Container>
      );
  }

  return (
    <Container className="py-3">
      <h2 className="mb-4">Order Details</h2>

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      {!error && order && (
        <Card className="shadow-sm">
          <Card.Header>
            <Row className="align-items-center">
              <Col xs={12} sm={6} className="mb-2 mb-sm-0">
                <strong>Order #</strong> {order.id}
              </Col>
              <Col xs={12} sm={6} className="text-sm-end">
                <Badge bg={getStatusBadgeVariant(order.status)}>{order.status || 'Unknown'}</Badge>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <Row className="g-4 mb-4">
              <Col xs={12} md={6} className="mb-3 mb-md-0">
                <h5 className="border-bottom pb-2">Order Summary</h5>
                <p className="mb-2"><strong>Date Placed:</strong> {formatDateTime(order.createdAt)}</p>
                <p><strong>Total Amount:</strong> {formatCurrency(order.totalAmount)}</p>
              </Col>
              <Col xs={12} md={6}>
                <h5 className="border-bottom pb-2">Shipping Details</h5>
                {order.shippingDetails ? (
                    <>
                        <p className="mb-2"><strong>Name:</strong> {order.shippingDetails.fullName}</p>
                        <p className="mb-2"><strong>Phone:</strong> {order.shippingDetails.phone}</p>
                        <p className="mb-0"><strong>Address:</strong> {order.shippingDetails.address || 'N/A'}</p>
                        {/* Add City, Zip, Country if available */}
                    </>
                ) : (
                    <p className="mb-0">Not Available</p>
                )}
              </Col>
            </Row>
            
            <h5 className="border-bottom pb-2 mb-3">Items Ordered</h5>
            {order.items && order.items.length > 0 ? (
              <div className="table-responsive">
                <Table striped bordered hover responsive className="mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Qty</th>
                      <th className="text-center">Price</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="text-break">{item.product?.name || 'Product not found'}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-center">{formatCurrency(item.price)}</td>
                        <td className="text-end">{formatCurrency(item.quantity * item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <p>No items found for this order.</p>
            )}
          </Card.Body>
        </Card>
      )}

      {!error && !order && !isLoading && (
          <Alert variant="warning">Order data could not be loaded.</Alert>
      )}
    </Container>
  );
};

export default CustomerOrderDetailPage;
```

---
### File: `packages/customer-frontend/src/pages/HomePage.tsx`

```tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Form, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';
import { FaStar, FaRegStar, FaStarHalfAlt, FaHeart, FaRegHeart } from 'react-icons/fa';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  stock: number;
  averageRating?: number | null;
  reviewCount?: number;
}

interface Category {
  id: number;
  name: string;
  imageUrl?: string | null;
}

interface PaginatedProductsResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { addToCart } = useCart(); // Get addToCart function from context
  const { wishlistItems, addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  
  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(''); // '' means All
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  
  // Sort state
  const [sortBy, setSortBy] = useState<string>('createdAt'); // Default sort
  const [sortOrder, setSortOrder] = useState<string>('desc'); // Default order
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchProducts = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      // Construct query parameters
      const params = new URLSearchParams();
      if (searchTerm.trim() !== '') {
        params.append('search', searchTerm.trim());
      }
      if (selectedCategoryId) {
        params.append('categoryId', selectedCategoryId);
      }
      if (sortBy) {
        params.append('sortBy', sortBy);
      }
      if (sortOrder) {
        params.append('sortOrder', sortOrder);
      }
      
      // Add pagination parameters
      params.append('page', page.toString());
      params.append('limit', '12'); // Default limit
      
      const queryString = params.toString();
      const apiUrl = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;

      console.log(`Fetching products from ${apiUrl}`);
      const response = await axios.get<PaginatedProductsResponse>(apiUrl);
      
      // Update state with paginated response data
      setProducts(response.data.products);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setTotalProducts(response.data.totalProducts);
      
      console.log(`Loaded page ${response.data.currentPage} of ${response.data.totalPages}`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = err.response.data.message || 'Failed to fetch products';
        setError(errorMessage);
        console.error('Error fetching products:', err.response.data);
      } else {
        setError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      fetchProducts(page);
      // Scroll to top of product section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Fetch products when search term, category filter, or sort changes - reset to page 1
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchProducts(1);
  }, [searchTerm, selectedCategoryId, sortBy, sortOrder]); // Re-fetch when filters or sort changes

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Optionally set an error state for categories
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); // Prevent navigation to product detail
    e.stopPropagation(); // Prevent event bubbling
    
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
      toast.success(`${product.name} removed from wishlist`);
    } else {
      addToWishlist(product.id);
      toast.success(`${product.name} added to wishlist`);
    }
  };

  // Star Rating Component
  const StarRating = ({ rating }: { rating: number | null | undefined }) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-warning" size={12} />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-warning" size={12} />);
    }
    
    // Add empty stars to reach 5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-warning" size={12} />);
    }
    
    return <div className="d-inline-flex align-items-center">{stars}</div>;
  };

  // Pagination UI component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="d-flex justify-content-center my-4">
        <Pagination>
          <Pagination.First 
            onClick={() => handlePageChange(1)} 
            disabled={currentPage === 1}
          />
          <Pagination.Prev 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          />
          
          {/* Show limited number of page buttons */}
          {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
            // For simplicity, show pages around current page
            let pageNum;
            if (totalPages <= 5) {
              // If 5 or fewer pages, show all
              pageNum = idx + 1;
            } else if (currentPage <= 3) {
              // If near start, show first 5 pages
              pageNum = idx + 1;
            } else if (currentPage >= totalPages - 2) {
              // If near end, show last 5 pages
              pageNum = totalPages - 4 + idx;
            } else {
              // Show current page and 2 before/after
              pageNum = currentPage - 2 + idx;
            }
            
            return (
              <Pagination.Item
                key={pageNum}
                active={pageNum === currentPage}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Pagination.Item>
            );
          })}
          
          <Pagination.Next 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
          />
          <Pagination.Last 
            onClick={() => handlePageChange(totalPages)} 
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    );
  };

  return (
    <Container className="py-3">
      <h2 className="mb-3 d-none d-sm-block">Our Products</h2>
      
      {/* Category Filter */}
      <div className="mb-4">
        <h5 className="mb-3 d-none d-sm-block">Categories</h5>
        {isLoadingCategories ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" />
            <p className="mt-2">Loading categories...</p>
          </div>
        ) : (
          <div className="category-scroll-container mb-3">
            {/* All Categories Option */}
            <div className={`category-item-wrapper ${selectedCategoryId === '' ? 'active' : ''}`}>
              <div 
                className="category-item p-1 rounded border"
                onClick={() => setSelectedCategoryId('')}
              >
                <img 
                  src="/placeholder-image.svg" 
                  alt="All Categories" 
                  className="category-image img-fluid rounded mb-1" 
                  onError={(e) => {e.currentTarget.src = '/placeholder-image.svg'}}
                />
                <p className="text-center category-name text-truncate w-100">All Categories</p>
              </div>
            </div>
            
            {/* Individual Categories */}
            {categories.map((category) => (
              <div key={category.id} className={`category-item-wrapper ${selectedCategoryId === category.id.toString() ? 'active' : ''}`}>
                <div 
                  className="category-item p-1 rounded border"
                  onClick={() => setSelectedCategoryId(category.id.toString())}
                >
                  <img 
                    src={category.imageUrl 
                      ? `${API_BASE_URL}${category.imageUrl}` 
                      : '/placeholder-image.svg'}
                    alt={category.name} 
                    className="category-image img-fluid rounded mb-1"
                    onError={(e) => {e.currentTarget.src = '/placeholder-image.svg'}}
                  />
                  <p className="text-center category-name text-truncate w-100">{category.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Combined Search and Sort */}
      <Row className="mb-3 g-2 align-items-center">
        <Col xs={7} sm={8} md={6} lg={4}>
          <Form.Group controlId="productSearch">
            <Form.Label visuallyHidden>Search Products</Form.Label>
            <Form.Control
              type="search"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col xs={5} sm={4} md={3} lg={3} className="position-relative">
          <Form.Group controlId="productSort" className="mobile-sort-dropdown">
            <Form.Label visuallyHidden>Sort By</Form.Label>
            <Form.Select
              size="sm"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              aria-label="Sort products by"
              className="pe-5 w-100"
              style={{ maxWidth: '100%' }}
            >
              <option value="createdAt-desc">Newest</option>
              <option value="price-asc">Price: Low-High</option>
              <option value="price-desc">Price: High-Low</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      
      {/* Product Listing */}
      {isLoading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading products...</span>
          </Spinner>
        </div>
      )}
      
      {error && (
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      )}
      
      {!isLoading && !error && (
        <>
          {totalProducts > 0 && (
            <p className="text-muted mb-3">
              {totalProducts === 1 
                ? 'Found 1 product'
                : `Found ${totalProducts} products`}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          )}
          
          <Row className="g-2 my-3">
            {products.length === 0 ? (
              <Col>
                <p>No products available at the moment.</p>
              </Col>
            ) : (
              products.map((product) => (
                <Col key={product.id} xs={6} md={4} lg={3} className="d-flex">
                  <Card className="w-100 shadow-sm">
                    <Link to={`/product/${product.id}`} className="text-decoration-none text-reset">
                      <div className="position-relative">
                        {product.imageUrl ? (
                          <Card.Img 
                            variant="top" 
                            src={`${API_BASE_URL}${product.imageUrl}`} 
                            alt={product.name}
                            style={{ height: '130px', objectFit: 'cover' }}
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              // Prevent infinite loop if placeholder itself fails
                              if (e.currentTarget.src !== '/placeholder-image.svg') {
                                e.currentTarget.onerror = null; // Remove handler after first error
                                e.currentTarget.src = '/placeholder-image.svg';
                              }
                            }}
                          />
                        ) : (
                          <Card.Img 
                            variant="top" 
                            src="/placeholder-image.svg"
                            alt={product.name}
                            style={{ height: '130px', objectFit: 'cover' }}
                          />
                        )}
                        
                        {/* Wishlist button */}
                        <Button
                          variant="light"
                          size="sm"
                          className="position-absolute top-0 end-0 m-2 rounded-circle p-1"
                          style={{ width: '30px', height: '30px' }}
                          onClick={(e) => handleToggleWishlist(e, product)}
                          aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          {isWishlisted(product.id) ? (
                            <FaHeart className="text-danger" />
                          ) : (
                            <FaRegHeart />
                          )}
                        </Button>
                      </div>
                      <Card.Body className="p-2 p-md-3">
                        <Card.Title className="h6 text-dark mb-1 text-truncate">{product.name}</Card.Title>
                        <Card.Subtitle className="mb-1 text-muted small">€{product.price.toFixed(2)}</Card.Subtitle>
                        
                        {/* Display Rating */}
                        {product.averageRating !== undefined && product.averageRating !== null && (
                          <div className="d-flex align-items-center mb-1">
                            <StarRating rating={product.averageRating} />
                            <small className="ms-1 text-muted">
                              ({product.reviewCount ?? 0})
                            </small>
                          </div>
                        )}
                        
                        <Card.Text className="text-muted small d-none d-sm-block text-truncate mb-0">
                          {product.description || ''}
                        </Card.Text>
                      </Card.Body>
                    </Link>
                  </Card>
                </Col>
              ))
            )}
          </Row>
          
          {/* Pagination Controls */}
          <PaginationControls />
        </>
      )}
    </Container>
  );
};

export default HomePage;
```

---
### File: `packages/customer-frontend/src/pages/LoginPage.tsx`

```tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // If user is already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous error message and set loading state
    setValidationError(null);
    setIsLoading(true);
    
    // Basic frontend validation
    if (!email.trim() || !password.trim()) {
      setValidationError('Email and password are required');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Attempting login with:', { email, passwordLength: password.length });
      
      // Make API call to login endpoint
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      // Check if token exists in response
      if (response.data && response.data.token) {
        // Use the context login function to store token
        login(response.data.token);
        console.log('Login successful!');
        
        // Show success toast
        toast.success('Login successful!');
        
        // Navigate to home page
        navigate('/', { replace: true });
      } else {
        // Handle unexpected response format
        toast.error('Invalid server response - token missing');
        console.error('Server response missing token', response.data);
      }
    } catch (error) {
      // Handle error
      if (axios.isAxiosError(error) && error.response) {
        // Server responded with an error
        console.error('Login API error:', error.response.status, error.response.data);
        toast.error(error.response.data.message || 'Authentication failed');
      } else {
        // Network or other error
        console.error('Login network error:', error);
        toast.error('Network or server error. Please try again later.');
      }
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="py-3">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4">Customer Login</h3>
              
              {validationError && (
                <Alert variant="danger" className="mb-3">
                  {validationError}
                </Alert>
              )}
              
              <Form onSubmit={handleLogin}>
                {/* Email input */}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    size="lg"
                  />
                </Form.Group>
                
                {/* Password input */}
                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    size="lg"
                  />
                </Form.Group>
                
                {/* Forgot Password Link */}
                <div className="text-end mb-3">
                  <Link to="/request-password-reset">Forgot Password?</Link>
                </div>
                
                {/* Submit button */}
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                  className="w-100 py-2"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </Form>
              
              <p className="mt-4 text-center">
                Don't have an account? <Link to="/register">Register here</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
```

---
### File: `packages/customer-frontend/src/pages/OrderHistoryPage.tsx`

```tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Alert, Spinner, Badge, Card, Row, Col, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaList, FaShoppingBag, FaRegClock } from 'react-icons/fa';

interface UserOrder {
  id: number; 
  status: string;
  totalAmount: number;
  createdAt: string; // ISO String
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Simple helper functions (can be moved to a utils file later)
const formatDateTime = (isoString: string) => {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleString();
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'Invalid Date';
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
};

const getStatusBadgeVariant = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'pending verification':
      return 'warning';
    case 'verified':
      return 'info';
    case 'processing':
      return 'primary';
    case 'shipped':
      return 'secondary';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'danger';
    case 'failed verification':
      return 'danger';
    default:
      return 'light';
  }
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For order list loading
  const [error, setError] = useState<string | null>(null);
  // Get auth state, including loading status
  const { token, isAuthenticated, isAuthLoading } = useAuth(); 
  const navigate = useNavigate(); // If needed for redirect

  useEffect(() => {
    const fetchOrders = async () => {
      // Wait for auth context to initialize
      if (isAuthLoading) {
        console.log("Order History: Auth context still loading, waiting...");
        return; 
      }

      // Check authentication status *after* auth loading is done
      if (!isAuthenticated || !token) {
        setError("You must be logged in to view your orders.");
        setIsLoading(false); // Stop *order list* loading
        return;
      }

      // Proceed with fetching orders
      console.log("Order History: Auth loaded, fetching orders...");
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get<UserOrder[]>(`${API_BASE_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401 || err.response?.status === 403) {
             setError("Authentication failed. Please log in again.");
             // Optionally trigger logout here if you have the function
          } else {
            setError(err.response?.data?.message || 'Failed to fetch orders. Please try again.');
          }
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setIsLoading(false); // Finish loading order list
      }
    };

    fetchOrders();
  // Add isAuthLoading to dependency array
  }, [token, isAuthenticated, isAuthLoading, navigate]);

  // Show spinner while auth is loading OR order list is loading
  if (isAuthLoading || isLoading) {
      return (
        <Container className="py-3 text-center">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </Container>
     );
  }

  return (
    <Container className="py-3">
      <h2 className="mb-4">My Orders</h2>

      {error && ( // Show error if occurred after loading
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      )}

      {!error && (
        <>
          {orders.length === 0 ? (
            <div className="empty-state">
              <FaList className="empty-state-icon" />
              <p className="empty-state-text">No Orders Yet</p>
              <p className="mb-4 text-muted">You haven't placed any orders yet. Start shopping to see your order history here.</p>
              <Link to="/" className="btn btn-primary px-4">
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              {orders.map((order) => (
                <Card key={order.id} className="mb-3 shadow-sm">
                  <Card.Header>
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                      <div className="mb-1 mb-md-0">
                        <FaShoppingBag className="me-2 text-primary" />
                        <strong>Order ID:</strong>{' '}
                        <Link to={`/order/${order.id}`}>#{order.id}</Link>
                      </div>
                      <div className="mb-1 mb-md-0">
                        <FaRegClock className="me-2 text-muted" />
                        <strong>Placed:</strong> {formatDateTime(order.createdAt)}
                      </div>
                      <div>
                        <Badge bg={getStatusBadgeVariant(order.status)}
                               className="px-3 py-2"
                        >
                          {order.status || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col>
                        <Card.Text as="h6" className="mb-0">
                          Total: {formatCurrency(order.totalAmount)}
                        </Card.Text>
                      </Col>
                      <Col className="text-end">
                        <Link to={`/order/${order.id}`} className="btn btn-outline-primary btn-sm px-3">
                          View Details
                        </Link>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default OrderHistoryPage;
```

---
### File: `packages/customer-frontend/src/pages/OrderSuccessPage.tsx`

```tsx
import { useEffect, useState } from 'react';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  productName: string;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingDetails: {
    fullName: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    phone: string;
  };
}

const OrderSuccessPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationNumber, setVerificationNumber] = useState<string | null>(null);
  const [numberLoading, setNumberLoading] = useState(true);
  const [numberError, setNumberError] = useState<string | null>(null);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const fetchOrderDetails = async () => {
    if (!orderId || !token) {
      setError('Order ID or authentication token is missing');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationNumber = async () => {
    if (!orderId) {
      setNumberError('Order ID is missing');
      setNumberLoading(false);
      return;
    }
    
    if (!token) {
      setNumberError('Authentication error. Cannot fetch details.');
      setNumberLoading(false);
      return;
    }
    
    setNumberLoading(true);
    setNumberError(null);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/assign-number/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.verificationPhoneNumber) {
        setVerificationNumber(response.data.verificationPhoneNumber);
      } else {
        setNumberError('Could not retrieve verification number.');
      }
    } catch (err) {
      console.error('Error fetching verification number:', err);
      let errMsg = 'Failed to get verification number.';
      
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const responseMessage = err.response?.data?.message;
        
        if (status === 401) {
          errMsg = 'Authentication error: ' + (responseMessage || 'Unauthorized');
        } else if (status === 403) {
          errMsg = 'Access denied: ' + (responseMessage || 'Forbidden');
        } else if (status === 404) {
          errMsg = 'Order not found or no number available';
        } else if (status === 409) {
          errMsg = 'Conflict: ' + (responseMessage || 'Number could not be assigned');
        } else if (status === 503) {
          errMsg = 'Verification service unavailable. Please try again later.';
        } else {
          errMsg = responseMessage || 'Unknown error occurred';
        }
      }
      
      setNumberError(errMsg);
    } finally {
      setNumberLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, token, API_BASE_URL]);

  useEffect(() => {
    if (orderId && token) {
      fetchVerificationNumber();
    }
  }, [orderId, token, API_BASE_URL]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading your order details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-3">
        <Alert variant="danger">{error}</Alert>
        <Link to="/" className="btn btn-primary mt-3">
          Return to Home
        </Link>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-3">
        <Alert variant="warning">Order not found</Alert>
        <Link to="/" className="btn btn-primary mt-3">
          Return to Home
        </Link>
      </Container>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h2 className="text-success">Order Placed Successfully!</h2>
        <p className="lead">Thank you for your purchase.</p>
        <p>Your Order ID is: <strong>{orderId}</strong></p>
      </div>

      {numberLoading && (
        <div className="text-center mb-4">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Retrieving verification information...</span>
        </div>
      )}

      {numberError && (
        <Alert variant="danger" className="mb-4">
          {numberError}
        </Alert>
      )}

      {!numberLoading && !numberError && verificationNumber && (
        <Card bg="warning" text="dark" className="text-center my-4">
          <Card.Body>
            <Card.Title>ACTION REQUIRED: Verify Your Order</Card.Title>
            <Card.Text>
              To complete your order, please call the following number immediately for verification:
            </Card.Text>
            <h3 className="display-6 my-3">
              <a href={`tel:${verificationNumber}`}>{verificationNumber}</a>
            </h3>
            <Card.Text>
              <small>Failure to call may result in order cancellation.</small>
            </Card.Text>
          </Card.Body>
        </Card>
      )}

      {!numberLoading && !numberError && !verificationNumber && (
        <Alert variant="warning" className="mb-4">
          Could not retrieve the verification phone number. Please contact support with your Order ID: {orderId}.
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header as="h5">Order Summary</Card.Header>
        <Card.Body>
          <div className="mb-3">
            <strong>Order ID:</strong> {order.id}
          </div>
          <div className="mb-3">
            <strong>Date:</strong> {formattedDate}
          </div>
          <div className="mb-3">
            <strong>Status:</strong> <span className="badge bg-success">{order.status}</span>
          </div>
          <div className="mb-3">
            <strong>Total Amount:</strong> €{order.totalAmount.toFixed(2)}
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Items Ordered</Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>€{item.price.toFixed(2)}</td>
                    <td>€{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Shipping Details</Card.Header>
        <Card.Body>
          <div className="mb-2"><strong>Name:</strong> {order.shippingDetails.fullName}</div>
          <div className="mb-2"><strong>Address:</strong> {order.shippingDetails.address}</div>
          <div className="mb-2"><strong>City:</strong> {order.shippingDetails.city}</div>
          <div className="mb-2"><strong>Zip Code:</strong> {order.shippingDetails.zipCode}</div>
          <div className="mb-2"><strong>Country:</strong> {order.shippingDetails.country}</div>
          <div className="mb-2"><strong>Phone:</strong> {order.shippingDetails.phone}</div>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-center gap-3 mt-4">
        <Link to="/" className="btn btn-primary">
          Continue Shopping
        </Link>
        <Link to="/account/orders" className="btn btn-outline-secondary">
          View All Orders
        </Link>
      </div>
    </Container>
  );
};

export default OrderSuccessPage;
```

---
### File: `packages/customer-frontend/src/pages/ProductDetailPage.tsx`

```tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Spinner, Alert, Badge, Card, Form, ListGroup } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import { FaStar, FaRegStar, FaStarHalfAlt, FaHeart, FaRegHeart } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';

// Define interface for product data matching backend response
interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  stock: number;
  createdAt: string;
  averageRating?: number | null;
  reviewCount?: number;
}

// Define interface for review data
interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
  };
}

// Define interface for paginated products response
interface PaginatedProductsResponse {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const ProductDetailPage = () => {
  // State for product
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  
  // State for reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  
  // State for new review
  const [newRating, setNewRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitReviewError, setSubmitReviewError] = useState<string | null>(null);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  
  // Add wishlist state
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  
  // State for other products
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [isLoadingOther, setIsLoadingOther] = useState(false);
  
  // Hooks
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { isAuthenticated, token } = useAuth();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  
  // Check if product is in cart
  useEffect(() => {
    if (product && cartItems) {
      const itemInCart = cartItems.some(item => item.id === product.id);
      setIsInCart(itemInCart);
    }
  }, [product, cartItems]);
  
  // Fetch product data
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) {
        setError('Product ID is missing');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
        setProduct(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          // Handle 404 error specifically
          if (err.response?.status === 404) {
            setError('Product not found. It may have been removed or is no longer available.');
          } else {
            setError(err.response?.data?.message || 'Failed to load product details');
          }
          console.error('Error fetching product details:', err.response?.data);
        } else {
          setError('Network error. Please check your connection and try again.');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [productId]);
  
  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;
      
      setIsLoadingReviews(true);
      setReviewError(null);
      
      try {
        // Use the alternate route for fetching product reviews
        const response = await axios.get(`${API_BASE_URL}/reviews/product/${productId}`);
        setReviews(response.data);
        
        // Check if the user has already reviewed this product
        if (isAuthenticated && token) {
          try {
            const userReviews = await axios.get(`${API_BASE_URL}/reviews/user`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            // Check if user has already reviewed this product
            const hasReviewed = userReviews.data.some(
              (review: any) => review.productId === parseInt(productId)
            );
            setHasUserReviewed(hasReviewed);
          } catch (error) {
            console.error('Error checking user reviews:', error);
          }
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setReviewError(err.response?.data?.message || 'Failed to load reviews');
          console.error('Error fetching reviews:', err.response?.data);
        } else {
          setReviewError('Network error. Please check your connection and try again.');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoadingReviews(false);
      }
    };
    
    fetchReviews();
  }, [productId, isAuthenticated, token]);
  
  // Fetch other similar products
  useEffect(() => {
    const fetchOtherProducts = async () => {
      if (!product) return; // Don't fetch if main product isn't loaded

      setIsLoadingOther(true);
      try {
        const response = await axios.get<PaginatedProductsResponse>(`${API_BASE_URL}/products`);
        // The data now contains a products array instead of being the array directly
        const products = response.data.products;
        // Filter out current product and take first 4
        const filteredProducts = products
          .filter(p => p.id !== product.id)
          .slice(0, 4);
        setOtherProducts(filteredProducts);
      } catch (err) {
        console.error("Failed to fetch other products", err);
        // We don't set error state here as it's not critical
      } finally {
        setIsLoadingOther(false);
      }
    };

    if (product) { // Fetch only when main product is loaded
      fetchOtherProducts();
    }
  }, [product]); // Dependency on main product state
  
  // Handle adding product to cart
  const handleAddToCartClick = async () => {
    if (!product || product.stock <= 0) {
      return;
    }
    
    setIsAddingToCart(true);
    
    try {
      await addToCart(product);
      // Success toast is handled by context
    } catch (error) {
      // Error is handled by context
      console.error("Add to cart failed (handled by context):", error);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  // Handle adding product to wishlist
  const handleWishlistClick = async () => {
    if (!product) {
      return;
    }
    
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your wishlist");
      navigate('/login');
      return;
    }
    
    setIsAddingToWishlist(true);
    
    try {
      const productIsWishlisted = isWishlisted(product.id);
      
      if (productIsWishlisted) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error("Wishlist operation failed:", error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };
  
  // Handle submitting a review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !token) {
      toast.error('You must be logged in to submit a review');
      return;
    }
    
    if (!productId) {
      toast.error('Product ID is missing');
      return;
    }
    
    if (newRating <= 0) {
      setSubmitReviewError('Please select a rating');
      return;
    }
    
    setIsSubmittingReview(true);
    setSubmitReviewError(null);
    
    try {
      await axios.post(
        `${API_BASE_URL}/reviews`,
        {
          productId: parseInt(productId),
          rating: newRating,
          comment: newComment.trim() || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Clear form
      setNewRating(0);
      setNewComment('');
      
      // Show success message
      toast.success('Review submitted successfully');
      
      // Set that user has reviewed
      setHasUserReviewed(true);
      
      // Refetch product and reviews
      const [productResponse, reviewsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/products/${productId}`),
        axios.get(`${API_BASE_URL}/reviews/product/${productId}`)
      ]);
      
      setProduct(productResponse.data);
      setReviews(reviewsResponse.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Handle 409 "already reviewed" error specifically
        if (err.response?.status === 409) {
          setSubmitReviewError('You have already reviewed this product');
          setHasUserReviewed(true);
        } else {
          setSubmitReviewError(err.response?.data?.message || 'Failed to submit review');
        }
        console.error('Error submitting review:', err.response?.data);
      } else {
        setSubmitReviewError('Network error. Please check your connection and try again.');
        console.error('Network error:', err);
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };
  
  // Handle back button click
  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Check if product is new (less than 14 days old)
  const isNewProduct = () => {
    if (!product) return false;
    const createdDate = new Date(product.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  };
  
  // Render star rating component
  const StarRating = ({ rating }: { rating: number | null | undefined }) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-warning" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-warning" />);
    }
    
    // Add empty stars to reach 5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-warning" />);
    }
    
    return <div className="d-inline-flex">{stars}</div>;
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading product details...</span>
        </Spinner>
      </Container>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Container className="py-3">
        <Alert variant="danger">
          {error}
        </Alert>
        <Button variant="secondary" onClick={handleBackClick}>
          Back to Products
        </Button>
      </Container>
    );
  }
  
  // Render product not found
  if (!product) {
    return (
      <Container className="py-3">
        <Alert variant="warning">
          Product not found or has been removed.
        </Alert>
        <Button variant="secondary" onClick={handleBackClick}>
          Back to Products
        </Button>
      </Container>
    );
  }
  
  // Render product details
  return (
    <Container className="py-3">
      <Row className="mb-2">
        <Col>
          <Button variant="secondary" onClick={handleBackClick} className="mb-2">
            &larr; Back to Products
          </Button>
        </Col>
      </Row>
      
      <Row className="g-3">
        {/* Product Image Column */}
        <Col xs={12} md={6} className="mb-3 mb-md-0">
          <div className="position-relative">
            {product.imageUrl ? (
              <Card.Img 
                variant="top" 
                src={`${API_BASE_URL}${product.imageUrl}`} 
                alt={product.name}
                style={{ height: '300px', objectFit: 'cover' }}
                className="rounded"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  // Prevent infinite loop if placeholder itself fails
                  if (e.currentTarget.src !== '/placeholder-image.svg') {
                    e.currentTarget.onerror = null; // Remove handler after first error
                    e.currentTarget.src = '/placeholder-image.svg';
                  }
                }}
              />
            ) : (
              <Card.Img 
                variant="top" 
                src="/placeholder-image.svg"
                alt={product.name}
                style={{ height: '300px', objectFit: 'cover' }}
                className="rounded"
              />
            )}
            {isNewProduct() && (
              <Badge 
                bg="info" 
                className="position-absolute top-0 start-0 m-2"
              >
                New!
              </Badge>
            )}
          </div>
        </Col>
        
        {/* Product Details Column */}
        <Col xs={12} md={6}>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h1 className="mb-0 fs-2">{product.name}</h1>
            <Button 
              variant="outline-danger" 
              size="sm" 
              className="rounded-circle p-2" 
              onClick={handleWishlistClick}
              disabled={isAddingToWishlist}
            >
              {isAddingToWishlist ? (
                <Spinner animation="border" size="sm" />
              ) : isWishlisted(product.id) ? (
                <FaHeart size={20} />
              ) : (
                <FaRegHeart size={20} />
              )}
            </Button>
          </div>
          
          <h2 className="text-primary mb-2 fs-3">€{product.price.toFixed(2)}</h2>
          
          {/* Display Rating */}
          {product.averageRating !== undefined && product.averageRating !== null && (
            <div className="mb-2 d-flex align-items-center">
              <StarRating rating={product.averageRating} />
              <span className="ms-2 text-muted">
                ({product.reviewCount ?? 0} {product.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
          
          <div className="mb-2">
            {product.stock > 0 ? (
              <Badge 
                bg={product.stock > 10 ? "success" : "warning"} 
                className="p-2"
              >
                {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
              </Badge>
            ) : (
              <Badge 
                bg="danger"
                className="p-2"
              >
                Out of Stock
              </Badge>
            )}
          </div>
          
          <div className="mb-2">
            <p className="text-muted small">Added on {formatDate(product.createdAt)}</p>
          </div>
          
          <div className="mb-3">
            <h5>Description</h5>
            <p className="text-break mb-2">{product.description || 'No description available.'}</p>
          </div>
          
          {/* Add to Cart Button */}
          <Row className="align-items-center mb-3 g-2">
            <Col>
              <Button
                variant={isInCart ? "success" : "primary"}
                className="w-100"
                onClick={handleAddToCartClick}
                disabled={!product || product.stock <= 0 || isInCart || isAddingToCart}
              >
                {isAddingToCart ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                    Adding...
                  </>
                ) : isInCart ? (
                  '✓ In Cart'
                ) : product?.stock <= 0 ? (
                  'Out of Stock'
                ) : (
                  'Add to Cart'
                )}
              </Button>
            </Col>
          </Row>
          
          {/* Reviews Section */}
          <Row className="mt-4">
            <Col xs={12}>
              <Card>
                <Card.Header className="bg-light">
                  <h3 className="fs-4 mb-0">Reviews</h3>
                </Card.Header>
                <Card.Body>
                  {/* Write Review Form */}
                  {isAuthenticated && !hasUserReviewed && (
                    <div className="mb-4">
                      <h4 className="fs-5 mb-3">Write a Review</h4>
                      <Form onSubmit={handleSubmitReview}>
                        <Form.Group className="mb-3">
                          <Form.Label>Rating</Form.Label>
                          <Form.Select 
                            value={newRating} 
                            onChange={(e) => setNewRating(parseInt(e.target.value))}
                            required
                          >
                            <option value="0">Select a rating</option>
                            <option value="1">1 - Poor</option>
                            <option value="2">2 - Fair</option>
                            <option value="3">3 - Good</option>
                            <option value="4">4 - Very Good</option>
                            <option value="5">5 - Excellent</option>
                          </Form.Select>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Comment (optional)</Form.Label>
                          <Form.Control 
                            as="textarea" 
                            rows={3} 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts about this product..."
                          />
                        </Form.Group>
                        
                        {submitReviewError && (
                          <Alert variant="danger" className="mb-3">
                            {submitReviewError}
                          </Alert>
                        )}
                        
                        <Button 
                          type="submit" 
                          variant="outline-primary"
                          disabled={isSubmittingReview}
                        >
                          {isSubmittingReview ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-1"
                              />
                              Submitting...
                            </>
                          ) : (
                            'Submit Review'
                          )}
                        </Button>
                      </Form>
                    </div>
                  )}
                  
                  {/* Display Reviews */}
                  <div>
                    <h4 className="fs-5 mb-3">Customer Reviews</h4>
                    
                    {isLoadingReviews && (
                      <div className="text-center py-3">
                        <Spinner animation="border" size="sm" role="status">
                          <span className="visually-hidden">Loading reviews...</span>
                        </Spinner>
                        <p className="mb-0 mt-2">Loading reviews...</p>
                      </div>
                    )}
                    
                    {reviewError && !isLoadingReviews && (
                      <Alert variant="danger">
                        {reviewError}
                      </Alert>
                    )}
                    
                    {!isLoadingReviews && !reviewError && reviews.length === 0 && (
                      <p className="text-muted">
                        No reviews yet. Be the first to review this product!
                      </p>
                    )}
                    
                    {!isLoadingReviews && !reviewError && reviews.length > 0 && (
                      <ListGroup variant="flush">
                        {reviews.map((review) => (
                          <ListGroup.Item key={review.id} className="py-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <div className="d-flex align-items-center">
                                <StarRating rating={review.rating} />
                                <span className="ms-2 fw-bold">{review.user.email}</span>
                              </div>
                              <small className="text-muted">
                                {formatDate(review.createdAt)}
                              </small>
                            </div>
                            {review.comment && (
                              <p className="mb-0 mt-2">{review.comment}</p>
                            )}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* You Might Also Like Section */}
      <Row className="mt-5">
        <Col xs={12}>
          <h3 className="mb-3">You Might Also Like</h3>
          {isLoadingOther ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" role="status">
                <span className="visually-hidden">Loading recommended products...</span>
              </Spinner>
            </div>
          ) : otherProducts.length > 0 ? (
            <Row xs={2} md={4} className="g-3">
              {otherProducts.map(p => (
                <Col key={p.id}>
                  <ProductCard product={p} />
                </Col>
              ))}
            </Row>
          ) : (
            <p className="text-muted">No similar products found.</p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailPage;
```

---
### File: `packages/customer-frontend/src/pages/ProfilePage.tsx`

```tsx
import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { Container, Card, Alert, Spinner, Form, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface UserProfile {
  id: number;
  email: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  
  const { token, isAuthenticated, isAuthLoading } = useAuth();

  useEffect(() => {
    // Don't fetch if auth is still loading or user is not authenticated
    if (isAuthLoading || !isAuthenticated || !token) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setProfile(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
            setError('Your session has expired. Please login again.');
          } else {
            setError(err.response.data.message || 'Failed to fetch profile information.');
          }
          console.error('Error fetching profile:', err.response.data);
        } else {
          setError('Network error. Please check your connection.');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token, isAuthenticated, isAuthLoading]);

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    
    // Reset status states
    setIsUpdatingPassword(true);
    setUpdateError(null);
    setUpdateSuccess(null);
    
    // Frontend validation
    if (newPassword !== confirmPassword) {
      setUpdateError("New passwords don't match.");
      setIsUpdatingPassword(false);
      return;
    }
    
    if (newPassword.length < 6) {
      setUpdateError("New password must be at least 6 characters long.");
      setIsUpdatingPassword(false);
      return;
    }
    
    // Check token
    if (!token) {
      setUpdateError("You're not logged in. Please login and try again.");
      setIsUpdatingPassword(false);
      return;
    }
    
    try {
      await axios.post(
        `${API_BASE_URL}/auth/change-password`, 
        { currentPassword, newPassword, confirmPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Success case
      setUpdateSuccess("Password updated successfully!");
      toast.success("Password updated!");
      
      // Clear form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setUpdateError("Current password is incorrect.");
        } else if (err.response.status === 400) {
          // Validation error
          const errorMsg = err.response.data.message || 
                         (err.response.data.errors ? Object.values(err.response.data.errors).join('. ') : 
                         'Invalid form data. Please check your inputs.');
          setUpdateError(errorMsg);
        } else {
          setUpdateError(err.response.data.message || 'Failed to update password.');
        }
        console.error('Error updating password:', err.response.data);
        toast.error("Failed to update password");
      } else {
        setUpdateError('Network error. Please check your connection.');
        console.error('Network error:', err);
        toast.error("Network error");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <Container className="py-3">
      <h2 className="mb-4">My Profile</h2>
      
      {isLoading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading profile...</span>
          </Spinner>
        </div>
      )}
      
      {error && (
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      )}
      
      {!isAuthenticated && !isAuthLoading && !error && (
        <Alert variant="info">
          Please login to view your profile.
        </Alert>
      )}
      
      {profile && (
        <>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Account Information</Card.Title>
              <Card.Text>
                <strong>Email:</strong> {profile.email}
              </Card.Text>
              <Card.Text>
                <strong>User ID:</strong> {profile.id}
              </Card.Text>
            </Card.Body>
          </Card>
          
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Change Password</Card.Title>
              
              {(updateSuccess || updateError) && (
                <Alert variant={updateError ? 'danger' : 'success'} className="mb-3">
                  {updateError || updateSuccess}
                </Alert>
              )}
              
              <Form onSubmit={handleChangePassword}>
                <Form.Group className="mb-3" controlId="currentPassword">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="newPassword">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <Form.Text className="text-muted">
                    Password must be at least 6 characters long.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Updating...
                    </>
                  ) : 'Update Password'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default ProfilePage;
```

---
### File: `packages/customer-frontend/src/pages/RegisterPage.tsx`

```tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null); // Clear previous validation errors

    // --- Frontend Validation ---
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return; // Stop submission
    }
    if (password.length < 6) { // Example minimum length
      setValidationError("Password must be at least 6 characters long.");
      return; // Stop submission
    }
    // Add email format validation if desired (optional)

    setIsLoading(true); // Start loading indicator

    try {
      // --- Step 1: Attempt Registration ---
      console.log("Attempting registration for:", email);
      await axios.post(`${API_BASE_URL}/auth/register`, {
        email: email,
        password: password,
      });
      console.log("Registration API call successful for:", email);
      
      // Show success toast
      toast.success('Registration successful!');

      // --- Step 2: Attempt Auto-Login ---
      console.log("Attempting auto-login for:", email);
      try {
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: email,
          password: password, // Use the same password just provided
        });

        console.log("Auto-login API call successful for:", email);
        if (loginResponse.data && loginResponse.data.token) {
          login(loginResponse.data.token); // Update AuthContext state & localStorage
          navigate('/', { replace: true }); // Redirect to home on success
          // No need to set loading false here, navigation happens
          return; // Exit function successfully
        } else {
          // Login response was OK but missing token (unexpected)
          console.error("Auto-login failed: Token missing in response.");
          toast.error("Registration successful, but auto-login failed. Please log in manually.");
          navigate('/login'); // Navigate to login page
        }

      } catch (loginError: any) {
        // Handle errors specifically from the auto-login attempt
        console.error("Auto-login Error:", loginError);
        let loginErrMsg = "Auto-login failed after registration.";
        if (axios.isAxiosError(loginError) && loginError.response) {
           loginErrMsg = `Auto-login failed: ${loginError.response.data.message || 'Please log in manually.'}`;
        }
        // Show error, user needs to login manually now
        toast.error(`Registration successful, but ${loginErrMsg}`);
        navigate('/login'); // Navigate to login page
      }

    } catch (registerError: any) {
      // --- Handle errors from the registration attempt ---
      console.error("Registration Error:", registerError);
      if (axios.isAxiosError(registerError) && registerError.response) {
        if (registerError.response.status === 409) { // Conflict
          toast.error(registerError.response.data.message || 'This email address is already registered.');
        } else { // Other backend error during registration
          toast.error(registerError.response.data.message || 'Registration failed. Please try again.');
        }
      } else { // Network or other unexpected error during registration
        toast.error('Registration failed due to a network or server issue.');
      }
    } finally {
      // This will run even if navigation happens, but it's okay
      setIsLoading(false); // Stop loading indicator in case of errors
    }
  };

  return (
    <Container fluid className="py-3">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={4}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4">Create an Account</h3>
              
              <Form onSubmit={handleRegister}>
                {/* Email input */}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    size="lg"
                  />
                </Form.Group>
                
                {/* Password input */}
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    size="lg"
                  />
                  <Form.Text className="text-muted">
                    Must be at least 6 characters long
                  </Form.Text>
                </Form.Group>
                
                {/* Confirm Password input */}
                <Form.Group className="mb-4" controlId="formBasicConfirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    size="lg"
                  />
                </Form.Group>
                
                {/* Error message */}
                {validationError && (
                  <Alert variant="danger" className="mb-3">
                    {validationError}
                  </Alert>
                )}
                
                {/* Submit button */}
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                  className="w-100 py-2"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Creating Account...
                    </>
                  ) : (
                    'Register'
                  )}
                </Button>
              </Form>
              
              <p className="mt-4 text-center">
                Already have an account? <Link to="/login">Login here</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
```

---
### File: `packages/customer-frontend/src/pages/RequestPasswordResetPage.tsx`

```tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'; // Make sure this matches your backend

const RequestPasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    // Basic frontend email validation (optional, backend validates too)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/request-password-reset`, { email });
      // API always returns 200 with a message on success (even if email not found)
      setMessage(response.data.message);
      setIsError(false); // It's a success message from the backend
      setEmail(''); // Clear email field on success
    } catch (err) {
      console.error('Password reset request error:', err);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (axios.isAxiosError(err) && err.response) {
        // Use backend error message if available, otherwise generic
        errorMessage = err.response.data.message || errorMessage;
      }
      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row>
        <Col md={8} lg={6} xl={5}>
          <Card className="shadow-sm p-4">
            <Card.Body>
              <h2 className="text-center mb-4">Reset Password</h2>
              <p className="text-center text-muted mb-4">
                Enter your email address and we'll send you instructions to reset your password (if an account exists).
              </p>

              {message && (
                <Alert variant={isError ? 'danger' : 'success'} className="mb-3">
                  {message}
                </Alert>
              )}

              <Form onSubmit={handleRequestReset}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                  {isLoading ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : (
                    'Request Reset Link'
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <Link to="/login">Back to Login</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RequestPasswordResetPage;
```

---
### File: `packages/customer-frontend/src/pages/ResetPasswordPage.tsx`

```tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // To disable form on success

  useEffect(() => {
    if (!token) {
      setMessage('Invalid or missing password reset token.');
      setIsError(true);
    }
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    if (!token) {
        setMessage('Password reset token is missing.');
        setIsError(true);
        setIsLoading(false);
        return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        password,
        confirmPassword,
      });

      setMessage(response.data.message || 'Password reset successfully! You can now log in.');
      setIsError(false);
      setIsSuccess(true); // Disable form on success
      // Optionally navigate to login after a delay
      // setTimeout(() => navigate('/login'), 3000);

    } catch (err) {
      console.error('Password reset error:', err);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (axios.isAxiosError(err) && err.response) {
        // Use backend error message if available (e.g., token invalid/expired)
        errorMessage = err.response.data.message || errorMessage;
        // Handle specific validation errors from backend if needed
        if (err.response.data.errors) {
            const errors = err.response.data.errors;
            if (errors.password) errorMessage = errors.password.join(', ');
            else if (errors.confirmPassword) errorMessage = errors.confirmPassword.join(', ');
            else if (errors.token) errorMessage = errors.token.join(', ');
        }
      }
      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid>
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col sm={10} md={8} lg={6} xl={4}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4">Reset Your Password</h3>

              {message && (
                <Alert variant={isError ? 'danger' : 'success'} className="mb-3">
                  {message}
                </Alert>
              )}

              {!isSuccess && !token && (
                 <Alert variant='danger' className="mb-3">
                    Invalid or missing password reset token link.
                 </Alert>
              )}

              {token && (
                <Form onSubmit={handleResetPassword}>
                  <Form.Group className="mb-3" controlId="formNewPassword">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isLoading || isSuccess}
                    />
                    <Form.Text className="text-muted">
                      Must be at least 6 characters long.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formConfirmPassword">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isLoading || isSuccess}
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100" 
                    disabled={isLoading || isSuccess || !token}
                   >
                    {isLoading ? (
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </Form>
              )}

              <div className="text-center mt-3">
                <Link to="/login">Back to Login</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPasswordPage;
```

---
### File: `packages/customer-frontend/src/pages/WishlistPage.tsx`

```tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FaHeart, FaTrash, FaChevronLeft, FaRegHeart, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';

// Define Product interface if not imported
interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  stock: number;
  description?: string;
  averageRating?: number;
  reviewCount?: number;
}

const WishlistPage: React.FC = () => {
  const { wishlistItems, isLoading, error, fetchWishlist, removeFromWishlist } = useWishlist();

  // Reload wishlist when the component mounts
  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only on mount

  const handleRemoveFromWishlist = async (e: React.MouseEvent, productId: number, productName: string) => {
    e.preventDefault(); // Prevent navigation to product detail
    e.stopPropagation(); // Prevent event bubbling
    
    try {
      await removeFromWishlist(productId);
      toast.success(`${productName} removed from wishlist`);
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
    }
  };

  // Star rating component (identical to HomePage)
  const StarRating = ({ rating }: { rating: number }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-warning" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-warning" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-warning" />);
      }
    }
    
    return <div className="d-inline-flex align-items-center">{stars}</div>;
  };

  return (
    <Container className="py-5">
      <div className="d-flex align-items-center mb-4">
        <Link to="/" className="text-decoration-none me-3">
          <Button variant="outline-secondary" size="sm">
            <FaChevronLeft className="me-1" /> Back to Shopping
          </Button>
        </Link>
        <h1>My Wishlist</h1>
      </div>

      {isLoading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading your wishlist...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center my-5">
          <Alert variant="info">
            Your wishlist is empty. Browse our products and add items to your wishlist!
          </Alert>
          <Link to="/">
            <Button variant="primary" className="mt-3">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <>
          <p className="text-muted mb-4">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist</p>
          
          <Row className="g-2 my-3">
            {wishlistItems.map((item) => (
              <Col key={item.id} xs={6} md={4} lg={3} className="d-flex">
                <Card className="w-100 shadow-sm">
                  <Link to={`/product/${item.product.id}`} className="text-decoration-none text-reset">
                    <div className="position-relative">
                      {item.product.imageUrl ? (
                        <Card.Img 
                          variant="top" 
                          src={item.product.imageUrl} 
                          alt={item.product.name}
                          style={{ height: '130px', objectFit: 'cover' }}
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            // Prevent infinite loop if placeholder itself fails
                            if (e.currentTarget.src !== '/placeholder-image.svg') {
                              e.currentTarget.onerror = null; // Remove handler after first error
                              e.currentTarget.src = '/placeholder-image.svg';
                            }
                          }}
                        />
                      ) : (
                        <Card.Img 
                          variant="top" 
                          src="/placeholder-image.svg"
                          alt={item.product.name}
                          style={{ height: '130px', objectFit: 'cover' }}
                        />
                      )}
                      
                      {/* Remove from wishlist button */}
                      <Button
                        variant="light"
                        size="sm"
                        className="position-absolute top-0 end-0 m-2 rounded-circle p-1"
                        style={{ width: '30px', height: '30px' }}
                        onClick={(e) => handleRemoveFromWishlist(e, item.product.id, item.product.name)}
                        aria-label="Remove from wishlist"
                      >
                        <FaTrash className="text-danger" style={{ fontSize: '14px' }} />
                      </Button>
                    </div>
                    <Card.Body className="p-2 p-md-3">
                      <Card.Title className="h6 text-dark mb-1 text-truncate">{item.product.name}</Card.Title>
                      <Card.Subtitle className="mb-1 text-muted small">{formatCurrency(item.product.price)}</Card.Subtitle>
                      
                      {/* Display Rating if available */}
                      {item.product.averageRating !== undefined && item.product.averageRating !== null && (
                        <div className="d-flex align-items-center mb-1">
                          <StarRating rating={item.product.averageRating} />
                          <small className="ms-1 text-muted">
                            ({item.product.reviewCount ?? 0})
                          </small>
                        </div>
                      )}
                      
                      <Card.Text className="text-muted small d-none d-sm-block text-truncate mb-0">
                        {item.product.description || ''}
                      </Card.Text>
                    </Card.Body>
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default WishlistPage;
```

---
### File: `packages/customer-frontend/src/utils/formatters.ts`

```typescript
/**
 * Format a number as a currency string with the specified currency symbol
 * @param value The numeric value to format
 * @param currencyCode The currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currencyCode = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format a date as a string with the specified format
 * @param date The date to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string, 
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};
```

---
### File: `packages/admin-frontend/src/App.tsx`

```tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PhoneManagementPage from './pages/PhoneManagementPage';
import OrderManagementPage from './pages/OrderManagementPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProductManagementPage from './pages/ProductManagementPage';
import ZoneManagementPage from './pages/ZoneManagementPage';
import CategoryManagementPage from './pages/CategoryManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import AdminRequestPasswordResetPage from './pages/AdminRequestPasswordResetPage';
import AdminResetPasswordPage from './pages/AdminResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout'; // Import the basic layout
import { Toaster } from 'react-hot-toast';

// Helper function (can be defined here or imported)
const isAuthenticated = (): boolean => !!localStorage.getItem('admin_token');

function App() {
  return (
    <BrowserRouter>
      {/* Add Toaster here in case it's not properly initialized in main.tsx */}
      <Toaster position="top-right" />
      <Routes>
        {/* Public Login Route */}
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/admin/dashboard" replace /> : <LoginPage />}
        />

        {/* Public Password Reset Routes */}
        <Route path="/request-password-reset" element={<AdminRequestPasswordResetPage />} />
        <Route path="/reset-password/:token" element={<AdminResetPasswordPage />} />

        {/* Protected Admin Section Wrapper */}
        <Route element={<ProtectedRoute />}> {/* Checks Auth */}
          <Route path="/admin" element={<AdminLayout />}> {/* Applies Layout */}
            {/* Index route for /admin */}
            <Route index element={<Navigate to="dashboard" replace />} />
            {/* Nested Admin Pages */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="phones" element={<PhoneManagementPage />} />
            <Route path="orders" element={<OrderManagementPage />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
            <Route path="products" element={<ProductManagementPage />} />
            <Route path="categories" element={<CategoryManagementPage />} />
            <Route path="zones" element={<ZoneManagementPage />} />
            <Route path="users" element={<UserManagementPage />} />
          </Route>
        </Route>

        {/* Catch-all / Fallback Route - Only redirect to login if not already on login-related pages */}
        <Route
          path="*"
          element={isAuthenticated() ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---
### File: `packages/admin-frontend/src/index.css`

```css
/* 
 * Global custom styles for the Admin Panel
 * Based on Bootstrap with custom overrides for consistency
 */

/* Import Inter font from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Define Color Palette Variables */
:root {
  /* Primary Colors */
  --primary: #14B8A6;
  --primary-rgb: 20, 184, 166;
  --primary-dark: #0E9284;
  --primary-light: #73E5D7;
  --primary-bg-subtle: #E6FAF8;
  
  /* Secondary/Accent Colors (Enhanced) */
  --secondary-color: #64748B; /* Neutral 500 */
  --secondary-color-rgb: 100, 116, 139;
  --light-bg: #F8FAFC; /* Neutral 50 */
  --subtle-border: #E2E8F0; /* Neutral 200 */
  --text-muted: #64748B; /* Neutral 500 */
  --text-dark: #1E293B; /* Neutral 800 */
  
  /* Neutral Colors */
  --neutral-50: #F8FAFC;
  --neutral-100: #F1F5F9;
  --neutral-200: #E2E8F0;
  --neutral-300: #CBD5E1;
  --neutral-400: #94A3B8;
  --neutral-500: #64748B;
  --neutral-600: #475569;
  --neutral-700: #334155;
  --neutral-800: #1E293B;
  --neutral-900: #0F172A;
  
  /* Accent Color */
  --accent: #8B5CF6;
  --accent-rgb: 139, 92, 246;
  --accent-dark: #7C3AED;
  --accent-light: #A78BFA;
  --accent-bg-subtle: #F3EEFF;
  
  /* Semantic Colors */
  --success: #10B981;
  --warning: #F59E0B;
  --danger: #EF4444;
  --info: #3B82F6;

  /* Font Settings */
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Spacing */
  --spacer-1: 0.25rem;
  --spacer-2: 0.5rem;
  --spacer-3: 1rem;
  --spacer-4: 1.5rem;
  --spacer-5: 3rem;
  
  /* Component Specific */
  --card-border-radius: 0.5rem;
  --card-box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --button-border-radius: 0.375rem;
  --input-border-radius: 0.375rem;
}

/* Global Base Styles */
body {
  font-family: var(--font-family-base);
  background-color: var(--light-bg);
  color: var(--neutral-800);
  line-height: 1.6;
}

/* Typography Overrides */
h1, h2, h3, h4, h5, h6, p, table, form, .card {
  color: var(--neutral-900);
  margin-bottom: 1.25rem;
  font-weight: var(--font-weight-semibold);
}

h1 { font-size: 2rem; }
h2 { font-size: 1.75rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }
h5 { font-size: 1.125rem; }
h6 { font-size: 1rem; }

.text-muted {
  color: var(--text-muted) !important;
}

.small {
  font-size: 0.875rem;
}

/* Link Styles */
a {
  color: var(--primary);
  text-decoration: none;
  transition: color 0.2s ease;
}
a:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

/* Interactive Element Focus Styles */
a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.3);
  border-radius: var(--input-border-radius);
}

/* Table Headers */
th {
  font-weight: 600;
}

/* ----- BOOTSTRAP COMPONENT OVERRIDES ----- */

/* Buttons */
.btn {
  font-weight: var(--font-weight-medium);
  border-radius: var(--button-border-radius);
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
}

.btn-primary {
  --bs-btn-bg: var(--primary);
  --bs-btn-border-color: var(--primary);
  --bs-btn-hover-bg: #0F9D8A;
  --bs-btn-hover-border-color: #0E9284;
  --bs-btn-active-bg: #0E9284;
  --bs-btn-active-border-color: #0C8174;
  --bs-btn-disabled-bg: var(--primary);
  --bs-btn-disabled-border-color: var(--primary);
}

.btn-secondary {
  --bs-btn-bg: var(--secondary-color);
  --bs-btn-border-color: var(--secondary-color);
  --bs-btn-hover-bg: var(--neutral-600);
  --bs-btn-hover-border-color: var(--neutral-600);
  --bs-btn-active-bg: var(--neutral-700);
  --bs-btn-active-border-color: var(--neutral-700);
}

.btn-outline-secondary {
  --bs-btn-color: var(--secondary-color);
  --bs-btn-border-color: var(--secondary-color);
  --bs-btn-hover-bg: var(--secondary-color);
  --bs-btn-hover-border-color: var(--secondary-color);
  --bs-btn-active-bg: var(--secondary-color);
  --bs-btn-active-border-color: var(--secondary-color);
}

.btn-success {
  --bs-btn-bg: var(--success);
  --bs-btn-border-color: var(--success);
}

.btn-danger {
  --bs-btn-bg: var(--danger);
  --bs-btn-border-color: var(--danger);
}

.btn-warning {
  --bs-btn-bg: var(--warning);
  --bs-btn-border-color: var(--warning);
}

.btn-info {
  --bs-btn-bg: var(--info);
  --bs-btn-border-color: var(--info);
}

.btn-outline-primary {
  --bs-btn-color: var(--primary);
  --bs-btn-border-color: var(--primary);
  --bs-btn-hover-bg: var(--primary);
  --bs-btn-hover-border-color: var(--primary);
  --bs-btn-active-bg: var(--primary);
  --bs-btn-active-border-color: var(--primary);
}

.btn-link {
  color: var(--primary);
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

/* Cards */
.card {
  border-radius: var(--card-border-radius);
  border-color: var(--neutral-200);
  box-shadow: var(--card-box-shadow);
  overflow: hidden;
}

/* Dashboard Stat Cards */
.dashboard-stat-card {
  transition: all 0.2s ease-in-out;
}

.dashboard-stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.card-header {
  background-color: var(--neutral-50);
  border-bottom-color: var(--neutral-200);
  padding: 1rem 1.25rem;
  font-weight: var(--font-weight-medium);
}

.card-footer {
  background-color: var(--neutral-50);
  border-top-color: var(--neutral-200);
}

.card-body {
  padding: 1.5rem;
}

/* Form Controls */
.form-control, .form-select {
  border-radius: var(--input-border-radius);
  border-color: var(--neutral-300);
  padding: 0.5rem 0.75rem;
}

.form-control:focus, .form-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 0.25rem rgba(var(--primary-rgb), 0.25);
}

.form-label {
  font-weight: var(--font-weight-medium);
  margin-bottom: 0.5rem;
  color: var(--neutral-700);
}

.form-text {
  color: var(--neutral-600);
}

/* Consistent form group spacing */
.form-group, .mb-3 {
  margin-bottom: 1.5rem;
}

/* Alerts */
.alert {
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  border-width: 1px;
  font-weight: 500;
}

.alert-primary {
  background-color: var(--primary-bg-subtle);
  border-color: var(--primary-light);
  color: var(--primary-dark);
}

.alert-success {
  --bs-alert-bg: #ECFDF5;
  --bs-alert-border-color: #A7F3D0;
  --bs-alert-color: #065F46;
}

.alert-warning {
  --bs-alert-bg: #FFFBEB;
  --bs-alert-border-color: #FCD34D;
  --bs-alert-color: #92400E;
}

.alert-danger {
  --bs-alert-bg: #FEF2F2;
  --bs-alert-border-color: #FECACA;
  --bs-alert-color: #991B1B;
}

/* Backgrounds */
.bg-primary {
  background-color: var(--primary) !important;
}

.bg-secondary {
  background-color: var(--neutral-500) !important;
}

.bg-success {
  background-color: var(--success) !important;
}

.bg-danger {
  background-color: var(--danger) !important;
}

.bg-warning {
  background-color: var(--warning) !important;
}

.bg-info {
  background-color: var(--info) !important;
}

.bg-light {
  background-color: var(--neutral-50) !important;
}

.bg-dark {
  background-color: var(--neutral-900) !important;
}

/* Badges */
.badge {
  font-weight: var(--font-weight-medium);
  padding: 0.35em 0.65em;
  border-radius: 0.375rem;
}

.badge.bg-primary {
  background-color: var(--primary) !important;
}

.badge.bg-secondary {
  background-color: var(--neutral-500) !important;
}

.badge.bg-success {
  background-color: var(--success) !important;
}

.badge.bg-danger {
  background-color: var(--danger) !important;
}

.badge.bg-warning {
  background-color: var(--warning) !important;
}

.badge.bg-info {
  background-color: var(--info) !important;
}

/* Tables */
.table {
  --bs-table-hover-bg: rgba(var(--primary-rgb), 0.05);
}

.table thead th {
  background-color: var(--neutral-50);
  color: var(--neutral-700);
  font-weight: 600;
  border-bottom-width: 1px;
  padding: 0.75rem 1rem;
}

.table tfoot th, .table tfoot td {
  background-color: var(--neutral-100);
  font-weight: 600;
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--neutral-300);
}

.empty-state-text {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

/* Navbar Brand Styling */
.navbar-brand {
  font-weight: var(--font-weight-bold);
  font-size: 1.3rem;
}

/* Transitions for Interactive Elements */
.btn, .nav-link, .dashboard-stat-card, .sidebar .nav-link {
  transition: all 0.2s ease-in-out;
}

/* Navbars */
.navbar {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.navbar-nav .nav-link {
  font-weight: var(--font-weight-medium);
  transition: color 0.2s ease;
}

/* Utility Classes for Spacing */
.section-padding {
  padding: 2.5rem 0;
}

.card-gap {
  margin-bottom: 1.5rem;
}

/* Admin-specific styles */
.admin-layout {
  background-color: var(--neutral-100);
}

.sidebar {
  background-color: var(--neutral-800);
}

.sidebar .nav-link {
  color: var(--neutral-300);
}

.sidebar .nav-link:hover,
.sidebar .nav-link.active {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

/* Modals */
.modal-content {
  border-radius: 0.5rem;
  border: none;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.modal-header {
  border-bottom-color: var(--neutral-200);
  padding: 1.25rem 1.5rem;
}

.modal-footer {
  border-top-color: var(--neutral-200);
  padding: 1.25rem 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

/* Custom responsive layout helpers */
@media (max-width: 768px) {
  .card-body {
    padding: 1.25rem;
  }
  
  h1 { font-size: 1.75rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
}

/* Transitions & Animations */
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---
### File: `packages/admin-frontend/src/main.tsx`

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Import Bootstrap CSS FIRST
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css'; // Required for Leaflet map components
import 'leaflet-draw/dist/leaflet.draw.css'; // Import leaflet-draw CSS
import './index.css'
import App from './App.tsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster position="top-right" />
  </StrictMode>,
)
```

---
### File: `packages/admin-frontend/src/types.d.ts`

```typescript
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.gif';
```

---
### File: `packages/admin-frontend/src/vite-env.d.ts`

```typescript
/// <reference types="vite/client" />
```

---
### File: `packages/admin-frontend/src/components/AdminLayout.tsx`

```tsx
import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FiHome, FiSmartphone, FiShoppingCart, FiBox, FiTag, FiMap, FiUsers, FiLogOut } from 'react-icons/fi';
import { FaStore } from 'react-icons/fa';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the token
    localStorage.removeItem('admin_token');
    // Redirect to login page
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-layout d-flex flex-column min-vh-100">
      <Navbar bg="primary" variant="dark" expand="lg" collapseOnSelect className="mb-4 shadow-sm py-2">
        <Container>
          <Navbar.Brand as={Link} to="dashboard" className="fw-bolder text-decoration-none">
            <FaStore className="me-2" size={22} />
            <span style={{ fontWeight: 'bold' }}>Hybrid</span>Store Admin
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="dashboard" className="px-3 py-2 d-flex align-items-center gap-2">
                <FiHome size={16} /> Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="phones" className="px-3 py-2 d-flex align-items-center gap-2">
                <FiSmartphone size={16} /> Phones
              </Nav.Link>
              <Nav.Link as={Link} to="orders" className="px-3 py-2 d-flex align-items-center gap-2">
                <FiShoppingCart size={16} /> Orders
              </Nav.Link>
              <Nav.Link as={Link} to="products" className="px-3 py-2 d-flex align-items-center gap-2">
                <FiBox size={16} /> Products
              </Nav.Link>
              <Nav.Link as={Link} to="categories" className="px-3 py-2 d-flex align-items-center gap-2">
                <FiTag size={16} /> Categories
              </Nav.Link>
              <Nav.Link as={Link} to="zones" className="px-3 py-2 d-flex align-items-center gap-2">
                <FiMap size={16} /> Zones
              </Nav.Link>
              <Nav.Link as={Link} to="users" className="px-3 py-2 d-flex align-items-center gap-2">
                <FiUsers size={16} /> Users
              </Nav.Link>
            </Nav>
            <Button 
              variant="outline-light" 
              size="sm" 
              onClick={handleLogout} 
              className="px-3 d-flex align-items-center gap-2"
            >
              <FiLogOut size={16} /> Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <Container className="py-4 flex-grow-1">
        <Outlet />
      </Container>

      <footer className="py-3 bg-light border-top mt-auto">
        <Container className="text-center">
          <div className="d-flex align-items-center justify-content-center mb-2">
            <FaStore className="me-2 text-primary" size={18} />
            <span className="text-muted small fw-bold">
              <span style={{ color: 'var(--primary)' }}>Hybrid</span>Store Admin
            </span>
          </div>
          <p className="text-muted mb-0 small">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  );
};

export default AdminLayout;
```

---
### File: `packages/admin-frontend/src/components/ProtectedRoute.tsx`

```tsx
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const isAuthenticated = !!localStorage.getItem('admin_token');
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
```

---
### File: `packages/admin-frontend/src/pages/AdminRequestPasswordResetPage.tsx`

```tsx
import { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const AdminRequestPasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(false);

    // Basic frontend email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      setError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/request-password-reset`, { email });
      // API always returns 200 with a message on success (even if email not found)
      setMessage(response.data.message);
      setError(false);
      setEmail(''); // Clear email field on success
    } catch (err) {
      console.error('Password reset request error:', err);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (axios.isAxiosError(err) && err.response) {
        // Use backend error message if available
        errorMessage = err.response.data.message || errorMessage;
      }
      setMessage(errorMessage);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid>
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={6} lg={4}>
          <Card className="shadow mb-4">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4">Reset Admin Password</h3>
              <p className="text-center text-muted mb-4">
                Enter your admin email address and we'll send you instructions to reset your password.
              </p>

              {message && (
                <Alert variant={error ? 'danger' : 'success'} className="mb-3">
                  {message}
                </Alert>
              )}

              <Form onSubmit={handleRequestReset}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Sending...
                    </>
                  ) : (
                    'Request Reset Link'
                  )}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <Link to="/login">Back to Login</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminRequestPasswordResetPage;
```

---
### File: `packages/admin-frontend/src/pages/AdminResetPasswordPage.tsx`

```tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const AdminResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // To disable form on success

  useEffect(() => {
    if (!token) {
      setMessage('Invalid or missing password reset token.');
      setIsError(true);
    }
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    if (!token) {
        setMessage('Password reset token is missing.');
        setIsError(true);
        setIsLoading(false);
        return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        password,
        confirmPassword,
      });

      const successMessage = response.data.message || 'Password reset successfully! You can now log in.';
      setMessage(successMessage);
      setIsError(false);
      setIsSuccess(true); // Disable form on success
      toast.success(successMessage);
      
      // Clear form fields
      setPassword('');
      setConfirmPassword('');
      
      // Optionally navigate to login after a delay
      setTimeout(() => navigate('/login'), 3000);

    } catch (err) {
      console.error('Password reset error:', err);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (axios.isAxiosError(err) && err.response) {
        // Use backend error message if available (e.g., token invalid/expired)
        errorMessage = err.response.data.message || errorMessage;
        
        // Handle specific validation errors from backend if needed
        if (err.response.data.errors) {
            const errors = err.response.data.errors;
            if (errors.password) errorMessage = errors.password.join(', ');
            else if (errors.confirmPassword) errorMessage = errors.confirmPassword.join(', ');
            else if (errors.token) errorMessage = errors.token.join(', ');
        }
      }
      
      setMessage(errorMessage);
      setIsError(true);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid>
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={6} lg={4}>
          <Card className="shadow mb-4">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4">Reset Admin Password</h3>

              {message && (
                <Alert variant={isError ? 'danger' : 'success'} className="mb-3">
                  {message}
                </Alert>
              )}

              {!isSuccess && !token && (
                <Alert variant='danger' className="mb-3">
                  Invalid or missing password reset token link.
                </Alert>
              )}

              {token && !isSuccess && (
                <Form onSubmit={handleResetPassword}>
                  <Form.Group className="mb-3" controlId="formNewPassword">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                    <Form.Text className="text-muted">
                      Must be at least 6 characters long.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formConfirmPassword">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 py-2" 
                    disabled={isLoading || !token}
                  >
                    {isLoading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </Form>
              )}

              {isSuccess && (
                <div className="text-center">
                  <p>Your password has been reset successfully.</p>
                  <p>You will be redirected to the login page shortly...</p>
                </div>
              )}

              <div className="text-center mt-3">
                <Link to="/login">Back to Login</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminResetPasswordPage;
```

---
### File: `packages/admin-frontend/src/pages/CategoryManagementPage.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Form, Button, Alert, Spinner, Modal, Row, Col, Toast, ToastContainer } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';

interface Category {
  id: number;
  name: string;
  description: string | null;
  imageUrl?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  
  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');
  const [toastMessage, setToastMessage] = useState('');

  const showNotification = (message: string, variant: 'success' | 'danger' = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/categories`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCategories(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(err.response.data.message || 'Failed to fetch categories.');
        }
        console.error('Error fetching categories:', err.response.data);
      } else {
        setError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowAddModal = () => {
    setFormData({ name: '', description: '' });
    setFormImageUrl('');
    setFormErrors({});
    setIsEditMode(false);
    setEditCategoryId(null);
    setShowAddEditModal(true);
  };

  const handleShowEditModal = (category: Category) => {
    setFormData({ 
      name: category.name, 
      description: category.description || '' 
    });
    setFormImageUrl(category.imageUrl || '');
    setFormErrors({});
    setIsEditMode(true);
    setEditCategoryId(category.id);
    setShowAddEditModal(true);
  };

  const handleShowDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleCloseModals = () => {
    setShowAddEditModal(false);
    setShowDeleteModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      showNotification('Authentication required. Please log in again.', 'danger');
      setIsSaving(false);
      return;
    }
    
    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      imageUrl: formImageUrl.trim() || null
    };
    
    try {
      if (isEditMode && editCategoryId) {
        await axios.put(
          `${API_BASE_URL}/api/admin/categories/${editCategoryId}`,
          categoryData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        showNotification('Category updated successfully!');
      } else {
        await axios.post(
          `${API_BASE_URL}/api/admin/categories`,
          categoryData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        showNotification('Category created successfully!');
      }
      
      handleCloseModals();
      fetchCategories();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400) {
          setFormErrors(err.response.data.errors || {});
        } else if (err.response.status === 409) {
          setFormErrors({ name: 'A category with this name already exists.' });
        } else {
          showNotification(err.response.data.message || 'Failed to save category.', 'danger');
        }
        console.error('Error saving category:', err.response.data);
      } else {
        showNotification('Network error. Please check your connection.', 'danger');
        console.error('Network error:', err);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    if (!window.confirm(`Are you sure you want to delete category "${categoryToDelete.name}"? Products in this category might need reassignment. This cannot be undone.`)) {
      return; // Stop if user cancels
    }
    
    setIsDeleting(true);
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      showNotification('Authentication required. Please log in again.', 'danger');
      setIsDeleting(false);
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/categories/${categoryToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      showNotification('Category deleted successfully!');
      handleCloseModals();
      fetchCategories();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 409) {
          showNotification('Cannot delete category with associated products.', 'danger');
        } else {
          showNotification(err.response.data.message || 'Failed to delete category.', 'danger');
        }
        console.error('Error deleting category:', err.response.data);
      } else {
        showNotification('Network error. Please check your connection.', 'danger');
        console.error('Network error:', err);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container fluid className="py-3">
      <Row className="mb-3 align-items-center">
        <Col>
          <h1 className="h3">Category Management</h1>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleShowAddModal}>
            <FaPlus className="me-1" /> Add Category
          </Button>
        </Col>
      </Row>

      {/* Toast notification */}
      <ToastContainer className="p-3" position="top-end">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide 
          bg={toastVariant}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'danger' ? 'text-white' : ''}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {error && <Alert variant="danger">{error}</Alert>}

      {isLoading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading categories...</span>
          </Spinner>
        </div>
      ) : categories.length === 0 ? (
        <Alert variant="info">No categories found. Add a new category to get started.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Description</th>
              <th>Image URL</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>{category.description || '-'}</td>
                <td>{category.imageUrl ? (
                  <a href={category.imageUrl} target="_blank" rel="noopener noreferrer" className="text-truncate d-inline-block" style={{ maxWidth: '150px' }}>
                    {category.imageUrl}
                  </a>
                ) : '-'}</td>
                <td>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-2" 
                    onClick={() => handleShowEditModal(category)}
                  >
                    <FaEdit /> Edit
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => handleShowDeleteModal(category)}
                  >
                    <FaTrashAlt /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Add/Edit Category Modal */}
      <Modal show={showAddEditModal} onHide={handleCloseModals}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Edit Category' : 'Add New Category'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveCategory}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                isInvalid={!!formErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                isInvalid={!!formErrors.description}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                placeholder="https://example.com/image.png"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                isInvalid={!!formErrors.imageUrl}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.imageUrl}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Optional. Enter a valid URL for the category image.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModals}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-1"
                  />
                  Saving...
                </>
              ) : (
                'Save Category'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseModals}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex align-items-center mb-3">
            <FaExclamationTriangle className="text-warning me-2" size={20} />
            <span>Are you sure you want to delete this category?</span>
          </div>
          {categoryToDelete && (
            <Alert variant="secondary">
              <strong>{categoryToDelete.name}</strong>
              {categoryToDelete.description && (
                <p className="mb-0 mt-1">{categoryToDelete.description}</p>
              )}
            </Alert>
          )}
          <p className="mb-0 text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModals}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteCategory} 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-1"
                />
                Deleting...
              </>
            ) : (
              'Delete Category'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CategoryManagementPage;
```

---
### File: `packages/admin-frontend/src/pages/DashboardPage.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Alert, Spinner, Button, Table, Badge, Form } from 'react-bootstrap';
import { FaUsers, FaShoppingCart, FaBox, FaDollarSign, FaCalendarAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format, parseISO, subDays, subMonths } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface AdminStats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  verifiedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  availablePhones: number;
  totalZones: number;
  totalRevenue: number;
  ordersLast7Days: number;
  recentOrders: {
    id: number;
    customerName: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const DashboardPage = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Sales chart state
  const [salesChartData, setSalesChartData] = useState<any>(null);
  const [salesChartError, setSalesChartError] = useState<string | null>(null);
  const [isSalesChartLoading, setIsSalesChartLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<string>('30d');
  
  // Users chart state
  const [usersChartData, setUsersChartData] = useState<any>(null);
  const [usersChartError, setUsersChartError] = useState<string | null>(null);
  const [isUsersChartLoading, setIsUsersChartLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const admin_token = localStorage.getItem('admin_token');
        
        if (!admin_token) {
          setError('Authentication token not found. Please log in again.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        // Ensure the token is properly formatted
        const formattedToken = admin_token.startsWith('Bearer ') 
          ? admin_token 
          : `Bearer ${admin_token}`;
        
        const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
          headers: {
            Authorization: formattedToken
          }
        });
        
        setStats(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            // Handle unauthorized error
            localStorage.removeItem('admin_token');
            setError('Your session has expired. Please log in again.');
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          } else if (err.response) {
            setError(err.response.data.message || 'Failed to fetch dashboard data');
            console.error('Error fetching dashboard data:', err.response.data);
          } else {
            setError('Network error. Please check your connection.');
            console.error('Network error:', err);
          }
        } else {
          setError('An unexpected error occurred.');
          console.error('Error fetching dashboard data:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Fetch sales data for chart
  useEffect(() => {
    const fetchSalesChartData = async () => {
      setIsSalesChartLoading(true);
      setSalesChartError(null);
      
      try {
        const admin_token = localStorage.getItem('admin_token');
        
        if (!admin_token) {
          setSalesChartError('Authentication token not found.');
          return;
        }

        // Calculate date range based on selected period
        let startDate;
        const endDate = new Date();
        
        switch (timePeriod) {
          case '7d':
            startDate = subDays(endDate, 7);
            break;
          case '30d':
            startDate = subDays(endDate, 30);
            break;
          case '90d':
            startDate = subDays(endDate, 90);
            break;
          case '6m':
            startDate = subMonths(endDate, 6);
            break;
          default:
            startDate = subDays(endDate, 30);
        }
        
        // Format dates for API
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');

        // Ensure the token is properly formatted
        const formattedToken = admin_token.startsWith('Bearer ') 
          ? admin_token 
          : `Bearer ${admin_token}`;
        
        // Fetch sales data from the reports API
        const response = await axios.get(
          `${API_BASE_URL}/admin/reports/sales-over-time?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, 
          {
            headers: {
              Authorization: formattedToken
            }
          }
        );
        
        // Transform the data for chartjs
        if (response.data && Array.isArray(response.data)) {
          const labels = response.data.map(item => format(parseISO(item.date), 'MMM dd'));
          const salesValues = response.data.map(item => item.totalSales || 0);
          
          setSalesChartData({
            labels,
            datasets: [
              {
                label: 'Total Sales (€)',
                data: salesValues,
                borderColor: 'rgba(25, 135, 84, 1)', // success green
                backgroundColor: 'rgba(25, 135, 84, 0.2)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
              }
            ]
          });
        } else {
          setSalesChartError('Invalid data format received from server.');
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setSalesChartError('Your session has expired.');
          } else if (err.response) {
            setSalesChartError(err.response.data.message || 'Failed to fetch sales data');
            console.error('Error fetching sales data:', err.response.data);
          } else {
            setSalesChartError('Network error. Please check your connection.');
            console.error('Network error:', err);
          }
        } else {
          setSalesChartError('An unexpected error occurred.');
          console.error('Error fetching sales data:', err);
        }
      } finally {
        setIsSalesChartLoading(false);
      }
    };

    fetchSalesChartData();
  }, [timePeriod]);

  // Fetch users data for chart
  useEffect(() => {
    const fetchUsersChartData = async () => {
      setIsUsersChartLoading(true);
      setUsersChartError(null);
      
      try {
        const admin_token = localStorage.getItem('admin_token');
        
        if (!admin_token) {
          setUsersChartError('Authentication token not found.');
          return;
        }

        // Calculate date range based on selected period
        let startDate;
        const endDate = new Date();
        
        switch (timePeriod) {
          case '7d':
            startDate = subDays(endDate, 7);
            break;
          case '30d':
            startDate = subDays(endDate, 30);
            break;
          case '90d':
            startDate = subDays(endDate, 90);
            break;
          case '6m':
            startDate = subMonths(endDate, 6);
            break;
          default:
            startDate = subDays(endDate, 30);
        }
        
        // Format dates for API
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');

        // Ensure the token is properly formatted
        const formattedToken = admin_token.startsWith('Bearer ') 
          ? admin_token 
          : `Bearer ${admin_token}`;
        
        // Fetch users data from the reports API
        const response = await axios.get(
          `${API_BASE_URL}/admin/reports/users-over-time?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, 
          {
            headers: {
              Authorization: formattedToken
            }
          }
        );
        
        // Transform the data for chartjs
        if (response.data && Array.isArray(response.data)) {
          const labels = response.data.map(item => format(parseISO(item.date), 'MMM dd'));
          const userValues = response.data.map(item => item.newUsers || 0);
          
          setUsersChartData({
            labels,
            datasets: [
              {
                label: 'New Users',
                data: userValues,
                borderColor: 'rgba(13, 110, 253, 1)', // primary blue
                backgroundColor: 'rgba(13, 110, 253, 0.2)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
              }
            ]
          });
        } else {
          setUsersChartError('Invalid data format received from server.');
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setUsersChartError('Your session has expired.');
          } else if (err.response) {
            setUsersChartError(err.response.data.message || 'Failed to fetch user data');
            console.error('Error fetching user data:', err.response.data);
          } else {
            setUsersChartError('Network error. Please check your connection.');
            console.error('Network error:', err);
          }
        } else {
          setUsersChartError('An unexpected error occurred.');
          console.error('Error fetching user data:', err);
        }
      } finally {
        setIsUsersChartLoading(false);
      }
    };

    fetchUsersChartData();
  }, [timePeriod]);

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Function to get badge variant based on status
  const getStatusBadgeVariant = (status: string): string => {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Shipped':
        return 'info';
      case 'Processing':
        return 'warning';
      case 'Verified':
        return 'primary';
      case 'Pending Call':
        return 'secondary';
      case 'Cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Prepare chart data for order status breakdown
  const chartData = {
    labels: ['Pending', 'Verified', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [
      {
        label: 'Orders by Status',
        data: stats ? [
          stats.pendingOrders,
          stats.verifiedOrders,
          stats.processingOrders,
          stats.shippedOrders,
          stats.deliveredOrders,
          stats.cancelledOrders
        ] : [],
        backgroundColor: [
          'rgba(108, 117, 125, 0.6)', // secondary
          'rgba(13, 110, 253, 0.6)',  // primary
          'rgba(255, 193, 7, 0.6)',   // warning
          'rgba(13, 202, 240, 0.6)',  // info
          'rgba(25, 135, 84, 0.6)',   // success
          'rgba(220, 53, 69, 0.6)'    // danger
        ],
        borderColor: [
          'rgba(108, 117, 125, 1)',
          'rgba(13, 110, 253, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(13, 202, 240, 1)',
          'rgba(25, 135, 84, 1)',
          'rgba(220, 53, 69, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Order Status Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0 // Only show whole numbers
        }
      }
    }
  };

  // Sales chart options
  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sales Over Time',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-EU', {
                style: 'currency',
                currency: 'EUR'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            return '€' + value;
          }
        }
      }
    }
  };

  // Users chart options
  const usersChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'User Registrations',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0 // Only show whole numbers
        }
      }
    }
  };

  if (isLoading) {
    return (
      <Container className="py-4">
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading dashboard...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="my-4">
          {error}
        </Alert>
        <Button variant="primary" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dashboard</h2>
        <Button variant="outline-primary" onClick={() => window.location.reload()}>Refresh Data</Button>
      </div>
      
      {/* Revenue and Orders Stats - First Row */}
      <Row className="mb-4 g-3">
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm dashboard-stat-card">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Revenue</h6>
                  <h3 className="mb-0">{stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : '€0.00'}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FaDollarSign className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3}>
          <Link to="/admin/orders" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Orders</h6>
                    <h3 className="mb-0">{stats?.totalOrders ?? '-'}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FaShoppingCart className="text-primary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        
        <Col md={6} lg={3}>
          <Link to="/admin/orders" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Last 7 Days</h6>
                    <h3 className="mb-0">{stats?.ordersLast7Days ?? '-'}</h3>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <FaCalendarAlt className="text-info" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        
        <Col md={6} lg={3}>
          <Link to="/admin/products" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Products</h6>
                    <h3 className="mb-0">{stats?.totalProducts ?? '-'}</h3>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded">
                    <FaBox className="text-warning" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>
      
      {/* Order Status Stats - Second Row */}
      <Row className="mb-4 g-3">
        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Pending+Call" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">Pending</h6>
                <h3 className="mb-0">{stats?.pendingOrders ?? '-'}</h3>
                <Badge bg="secondary" className="mt-2">Pending Call</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        
        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Verified" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">Verified</h6>
                <h3 className="mb-0">{stats?.verifiedOrders ?? '-'}</h3>
                <Badge bg="primary" className="mt-2">Verified</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        
        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Processing" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">Processing</h6>
                <h3 className="mb-0">{stats?.processingOrders ?? '-'}</h3>
                <Badge bg="warning" className="mt-2">Processing</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Shipped" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">Shipped</h6>
                <h3 className="mb-0">{stats?.shippedOrders ?? '-'}</h3>
                <Badge bg="info" className="mt-2">Shipped</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Delivered" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">Delivered</h6>
                <h3 className="mb-0">{stats?.deliveredOrders ?? '-'}</h3>
                <Badge bg="success" className="mt-2">Delivered</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        <Col md={6} lg={2}>
          <Link to="/admin/orders?status=Cancelled" className="text-decoration-none text-reset">
            <Card className="h-100 shadow-sm dashboard-stat-card">
              <Card.Body className="p-3">
                <h6 className="text-muted mb-0">Cancelled</h6>
                <h3 className="mb-0">{stats?.cancelledOrders ?? '-'}</h3>
                <Badge bg="danger" className="mt-2">Cancelled</Badge>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>
      
      {/* Order Status Chart */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-transparent py-3">
              <h5 className="mb-0">Order Status Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                {stats && <Bar data={chartData} options={chartOptions} />}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sales Over Time Chart */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-transparent py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Sales Over Time</h5>
                <Form.Select 
                  className="w-auto" 
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  aria-label="Select time period"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="6m">Last 6 Months</option>
                </Form.Select>
              </div>
            </Card.Header>
            <Card.Body>
              {isSalesChartLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading chart data...</span>
                  </Spinner>
                </div>
              ) : salesChartError ? (
                <Alert variant="danger">{salesChartError}</Alert>
              ) : salesChartData ? (
                <div style={{ height: '300px' }}>
                  <Line data={salesChartData} options={salesChartOptions} />
                </div>
              ) : (
                <div className="text-center py-3">No sales data available.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Registrations Chart */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-transparent py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">User Registrations</h5>
              </div>
            </Card.Header>
            <Card.Body>
              {isUsersChartLoading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading chart data...</span>
                  </Spinner>
                </div>
              ) : usersChartError ? (
                <Alert variant="danger">{usersChartError}</Alert>
              ) : usersChartData ? (
                <div style={{ height: '300px' }}>
                  <Line data={usersChartData} options={usersChartOptions} />
                </div>
              ) : (
                <div className="text-center py-3">No user data available.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-transparent py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Orders</h5>
                <Link to="/admin/orders">
                  <Button variant="outline-secondary" size="sm">View All</Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              {stats && stats.recentOrders && stats.recentOrders.length > 0 ? (
                <Table hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.customerName}</td>
                        <td>{formatCurrency(order.totalAmount)}</td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <Link to={`/admin/orders/${order.id}`}>
                            <Button variant="outline-primary" size="sm">View</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-3">No recent orders found.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
```

---
### File: `packages/admin-frontend/src/pages/LoginPage.tsx`

```tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check for existing token on mount and clear if redirected for re-auth
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      console.log('Found existing token on login page, will be cleared');
      localStorage.removeItem('admin_token');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous error message and set loading state
    setErrorMessage(null);
    setIsLoading(true);
    
    // Basic frontend validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email and password are required');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Attempting login with:', { email, passwordLength: password.length });
      console.log('Using API endpoint:', `${API_BASE_URL}/auth/login`);

      // Make API call to login endpoint
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      console.log('Login response received:', response.status);
      
      // Check if token exists in response
      if (response.data && response.data.token) {
        // Store token in localStorage
        console.log('Token received. First 10 chars:', response.data.token.substring(0, 10) + '...');
        localStorage.setItem('admin_token', response.data.token);
        console.log('Login successful!');
        
        // Add a small delay to ensure token is stored before navigation
        setTimeout(() => {
          // Navigate to admin dashboard
          navigate('/admin/dashboard', { replace: true });
        }, 100);
      } else {
        // Handle unexpected response format
        console.error('Server response format:', response.data);
        setErrorMessage('Invalid server response - token missing');
        console.error('Server response missing token', response.data);
      }
    } catch (error) {
      // Handle error
      if (axios.isAxiosError(error) && error.response) {
        // Server responded with an error
        console.error('Login API error:', error.response.status, error.response.data);
        setErrorMessage(error.response.data.message || 'Authentication failed');
      } else {
        // Network or other error
        console.error('Login network error:', error);
        setErrorMessage('Network or server error. Please try again later.');
      }
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <Container fluid>
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={6} lg={4}>
          <Card className="shadow mb-4">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4">Admin Login</h3>
              
              <Form onSubmit={handleLogin}>
                {/* Email input */}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                
                {/* Password input */}
                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                
                {/* Forgot Password Link */}
                <div className="text-end mb-3">
                  <Link to="/request-password-reset">Forgot Password?</Link>
                </div>
                
                {/* Error message */}
                {errorMessage && (
                  <Alert variant="danger" className="mb-4">
                    {errorMessage}
                  </Alert>
                )}
                
                {/* Submit button */}
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                  className="w-100 py-2 mt-2"
                >
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage;
```

---
### File: `packages/admin-frontend/src/pages/OrderDetailPage.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L, { Icon, LatLngExpression } from 'leaflet';

// Fix potentially broken default Leaflet icons
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Define interfaces based on backend response structure
interface OrderProduct {
  name: string;
  price: number;
}

interface OrderItemDetail {
  id: number;
  quantity: number;
  price: number;
  productId: number;
  productName: string;
  product: OrderProduct;
}

interface OrderUser {
  email: string;
}

interface ShippingDetails {
  fullName: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface OrderDetail {
  id: number;
  status: string;
  totalAmount: number;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  shippingDetails: ShippingDetails;
  user: OrderUser;
  items: OrderItemDetail[];
}

interface ServiceZone {
  id: number;
  name: string;
  geoJsonPolygon: string; // The raw GeoJSON string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for service zones
  const [zones, setZones] = useState<ServiceZone[]>([]);
  const [isLoadingZones, setIsLoadingZones] = useState(true);
  const [zoneError, setZoneError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      // Validate orderId
      if (!orderId) {
        setError("Order ID is missing");
        setIsLoading(false);
        return;
      }

      // Get token from localStorage
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_BASE_URL}/admin/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Order details received:', response.data);
        setOrder(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
            setError('Your session has expired. Please log in again.');
          } else if (err.response.status === 404) {
            setError(`Order with ID ${orderId} not found.`);
          } else {
            setError(err.response.data.message || 'Failed to fetch order details.');
          }
          console.error('Error fetching order details:', err.response.data);
        } else {
          setError('Network error. Please check your connection.');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);
  
  // Fetch service zones
  useEffect(() => {
    const fetchServiceZones = async () => {
      setIsLoadingZones(true);
      setZoneError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        setZoneError('Authentication required. Please log in again.');
        setIsLoadingZones(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/admin/serviceareas`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setZones(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          setZoneError('Failed to load service zones');
          console.error('Error fetching zones:', err.response.data);
        } else {
          setZoneError('Network error loading zones');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoadingZones(false);
      }
    };

    // Only fetch zones if we have an order with location data
    if (!isLoading && order && order.latitude !== null && order.longitude !== null) {
      fetchServiceZones();
    }
  }, [isLoading, order]);

  const formatDateTime = (isoString: string): string => {
    return new Date(isoString).toLocaleString();
  };

  const formatCurrency = (amount: number): string => {
    return `€${amount.toFixed(2)}`;
  };

  return (
    <Container className="mt-3">
      <h2>Order Details</h2>
      
      {isLoading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading order details...</span>
          </Spinner>
        </div>
      )}
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {!isLoading && !error && order && (
        <Row>
          <Col md={6}>
            {/* Order Information */}
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Order #{order.id}</Card.Title>
                <div className="mb-3">
                  <Badge bg={
                    order.status === 'Shipped' ? 'success' :
                    order.status === 'Processing' ? 'info' :
                    order.status === 'Pending Call' ? 'warning' :
                    order.status === 'Verified' ? 'primary' :
                    order.status === 'Delivered' ? 'success' :
                    order.status === 'Cancelled' ? 'danger' :
                    'secondary'
                  }>
                    {order.status}
                  </Badge>
                </div>
                <p><strong>Date Placed:</strong> {formatDateTime(order.createdAt)}</p>
                <p><strong>Total Amount:</strong> {formatCurrency(order.totalAmount)}</p>
                <p><strong>Location:</strong> {order.latitude && order.longitude ? 
                  `Lat: ${order.latitude}, Lon: ${order.longitude}` : 
                  'No location data available'}
                </p>
              </Card.Body>
            </Card>
            
            {/* Customer Information */}
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Customer</Card.Title>
                <p><strong>Name:</strong> {order.shippingDetails?.fullName || 'No name provided'}</p>
                <p><strong>Phone:</strong> {order.shippingDetails?.phone || 'No phone provided'}</p>
                <p><strong>Email:</strong> {order.user?.email || 'No email available'}</p>
                <p><strong>Address:</strong> {
                  order.shippingDetails?.address ? 
                  `${order.shippingDetails.address}, ${order.shippingDetails.city || ''}, ${order.shippingDetails.zipCode || ''}, ${order.shippingDetails.country || ''}` : 
                  'No address provided'
                }</p>
              </Card.Body>
            </Card>
            
            {/* Location Map */}
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Delivery Location</Card.Title>
                {order.latitude !== null && order.longitude !== null ? (
                  <div style={{ height: '300px', width: '100%' }}>
                    <MapContainer 
                      center={[order.latitude, order.longitude]} 
                      zoom={13} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[order.latitude, order.longitude]}>
                        <Popup>
                          Customer Location<br />
                          (Approximate)
                        </Popup>
                      </Marker>
                      
                      {/* Display service zones if available */}
                      {!isLoadingZones && !zoneError && zones.length > 0 && zones.map(zone => {
                        try {
                          const geoJsonData = JSON.parse(zone.geoJsonPolygon);
                          return (
                            <GeoJSON 
                              key={zone.id}
                              data={geoJsonData}
                              pathOptions={{ color: 'red', weight: 2, fillOpacity: 0.1 }}
                            />
                          );
                        } catch (err) {
                          console.error(`Error parsing GeoJSON for zone ${zone.id}:`, err);
                          return null;
                        }
                      })}
                    </MapContainer>
                    
                    {isLoadingZones && (
                      <div className="text-center mt-2">
                        <small>Loading service zones...</small>
                      </div>
                    )}
                    
                    {zoneError && (
                      <div className="text-center mt-2">
                        <small className="text-danger">{zoneError}</small>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert variant="info">
                    No location data available for this order.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            {/* Items Ordered */}
            <Card>
              <Card.Body>
                <Card.Title>Items</Card.Title>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id}>
                        <td>{item.productName || item.product?.name || 'Unknown Product'}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{formatCurrency(item.quantity * item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-end"><strong>Total:</strong></td>
                      <td><strong>{formatCurrency(order.totalAmount)}</strong></td>
                    </tr>
                  </tfoot>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default OrderDetailPage;
```

---
### File: `packages/admin-frontend/src/pages/OrderManagementPage.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Alert, Spinner, Badge, Form, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShoppingBag, FaFilter, FaInfoCircle, FaCalendarAlt, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface ShippingDetails {
  fullName: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface AdminOrder {
  id: number;
  status: string;
  totalAmount: number;
  shippingDetails: ShippingDetails;
  items: OrderItem[];
  createdAt: string; // ISO 8601 date string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Define allowed order statuses (must match backend)
const allowedOrderStatuses = ["Pending Call", "Verified", "Processing", "Shipped", "Delivered", "Cancelled"];

const OrderManagementPage = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderIds, setUpdatingOrderIds] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      const queryString = params.toString();
      const apiUrl = `${API_BASE_URL}/admin/orders${queryString ? `?${queryString}` : ''}`;

      console.log(`Fetching orders from ${apiUrl}`);
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Received orders data:', response.data);
      response.data.forEach((order: AdminOrder) => {
        console.log(`Order ${order.id} shipping details:`, order.shippingDetails);
      });
      
      setOrders(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(err.response.data.message || 'Failed to fetch orders.');
        }
        console.error('Error fetching orders:', err.response.data);
      } else {
        setError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    setUpdatingOrderIds(prev => [...prev, orderId]);
    setError(null);

    try {
      console.log(`Attempting to update order ${orderId} status to ${newStatus}`);
      console.log(`API URL: ${API_BASE_URL}/admin/orders/${orderId}/status`);
      
      await axios.post(
        `${API_BASE_URL}/admin/orders/${orderId}/status`, 
        { status: newStatus }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      await fetchOrders();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(err.response.data.message || `Failed to update order ${orderId} status.`);
        }
        console.error('Error updating order status:', err.response.data);
      } else {
        setError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setUpdatingOrderIds(prev => prev.filter(id => id !== orderId));
    }
  };

  const formatDateTime = (isoString: string): string => {
    return new Date(isoString).toLocaleString();
  };

  const formatCurrency = (amount: number): string => {
    return `€${amount.toFixed(2)}`;
  };

  const getStatusBadgeVariant = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'pending call': return 'warning';
      case 'verified': return 'primary';
      case 'processing': return 'info';
      case 'shipped': return 'secondary';
      case 'delivered': return 'success';
      case 'cancelled': case 'failed verification': return 'danger';
      default: return 'light';
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Management</h2>
      </div>
      
      <Row className="mb-4 align-items-center">
        <Col md={4} lg={3}>
          <Form.Group controlId="statusFilter">
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter orders by status"
              className="shadow-sm border"
            >
              <option value="">All Statuses</option>
              {allowedOrderStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col>
          {statusFilter && (
            <Badge bg="primary" className="py-2 px-3">
              <FaFilter className="me-1" /> Filtering: {statusFilter}
            </Badge>
          )}
        </Col>
      </Row>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="mt-2 text-muted">Loading orders...</p>
        </div>
      ) : (
        <>
          {orders.length === 0 ? (
            <div className="empty-state">
              <FaShoppingBag className="empty-state-icon" />
              <p className="empty-state-text">No Orders Found</p>
              <p className="mb-4 text-muted">
                {statusFilter 
                  ? `No orders match the "${statusFilter}" status filter.` 
                  : "You don't have any customer orders yet."}
              </p>
              {statusFilter && (
                <Button 
                  variant="primary" 
                  onClick={() => setStatusFilter('')}
                  className="px-4 d-flex align-items-center gap-2 mx-auto"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover responsive className="align-middle shadow-sm">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th className="text-end">Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ width: '180px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link to={`/admin/orders/${order.id}`} className="fw-bold text-decoration-none d-flex align-items-center">
                          <FaInfoCircle className="text-primary me-1" /> {order.id}
                        </Link>
                      </td>
                      <td>
                        <div className="fw-medium">{order.shippingDetails?.fullName || '(No Name)'}</div>
                        {order.shippingDetails?.phone && (
                          <div className="text-muted small d-flex align-items-center">
                            <FaPhone className="me-1" size={12} /> {order.shippingDetails.phone}
                          </div>
                        )}
                        {order.shippingDetails?.address && (
                          <div className="text-muted small d-flex align-items-center">
                            <FaMapMarkerAlt className="me-1" size={12} /> 
                            {`${order.shippingDetails.address}, ${order.shippingDetails.city || ''}`}
                          </div>
                        )}
                      </td>
                      <td>
                        {order.items.map(item => (
                          <div key={item.id} className="small">
                            <span className="fw-medium">{item.quantity}x</span> {item.productName}
                          </div>
                        ))}
                      </td>
                      <td className="text-end fw-medium">{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(order.status)} className="px-2 py-1">
                          {order.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="small d-flex align-items-center">
                          <FaCalendarAlt className="me-1" size={12} /> 
                          {formatDateTime(order.createdAt)}
                        </div>
                      </td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingOrderIds.includes(order.id)}
                          aria-label={`Change status for order ${order.id}`}
                          className="shadow-sm border"
                        >
                          {allowedOrderStatuses.map(statusOption => (
                            <option key={statusOption} value={statusOption}>
                              {statusOption}
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default OrderManagementPage;
```

---
### File: `packages/admin-frontend/src/pages/PhoneManagementPage.tsx`

```tsx
import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { Container, Table, Button, Alert, Spinner, Badge, Form, Modal, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface PhoneNumber {
  id: number;
  numberString: string;
  status: 'Available' | 'Busy' | 'Offline';
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const PhoneManagementPage = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add Phone Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Function to handle authentication errors
  const handleAuthError = () => {
    // Clear the invalid token
    localStorage.removeItem('admin_token');
    // Set error message
    setError('Your session has expired or is invalid. Please log in again.');
    // Add a button to redirect to login
    setTimeout(() => {
      navigate('/login');
    }, 3000); // Redirect after 3 seconds
  };

  // Modal handlers
  const handleShowAddModal = () => {
    setNewPhoneNumber('');
    setAddError(null);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleAddPhoneNumber = async (event: FormEvent) => {
    event.preventDefault();
    
    // Basic validation
    if (!newPhoneNumber.trim()) {
      setAddError('Phone number is required');
      return;
    }
    
    setIsAdding(true);
    setAddError(null);
    
    // Get token
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setAddError('Authentication token not found. Please log in again.');
      setIsAdding(false);
      handleAuthError();
      return;
    }

    // Ensure the token is properly formatted
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    try {
      // Call API to add phone number
      await axios.post(
        `${API_BASE_URL}/admin/phonenumbers`, 
        { numberString: newPhoneNumber },
        {
          headers: {
            Authorization: formattedToken
          }
        }
      );
      
      // Success handling
      toast.success('Phone number added successfully');
      fetchPhoneNumbers(); // Refresh list
      handleCloseAddModal(); // Close modal
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          // Handle unauthorized error
          console.error('Authentication error:', err.response.data);
          handleAuthError();
          setAddError('Authentication failed. Please log in again.');
        } else if (err.response?.status === 409) {
          // Conflict - phone number already exists
          setAddError('This phone number already exists');
          toast.error('Phone number already exists');
        } else if (err.response?.status === 400) {
          // Validation error
          setAddError(err.response.data.message || 'Invalid phone number format');
          toast.error('Invalid phone number format');
        } else if (err.response) {
          // Other API errors
          setAddError(err.response.data.message || 'Failed to add phone number');
          toast.error('Failed to add phone number');
          console.error('Error adding phone number:', err.response.data);
        } else {
          // Network errors
          setAddError('Network error. Please check your connection and try again.');
          toast.error('Network error');
          console.error('Network error:', err);
        }
      } else {
        // Other unexpected errors
        setAddError('An unexpected error occurred. Please try again later.');
        toast.error('Unexpected error occurred');
        console.error('Error adding phone number:', err);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const fetchPhoneNumbers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('admin_token');
      
      // Debug: Log the token to check its format
      console.log('Token used for API call:', token ? `${token.substring(0, 15)}...` : 'No token');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        handleAuthError();
        return;
      }

      // Ensure the token is properly formatted - it may or may not include 'Bearer ' prefix
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      console.log('Making API request to:', `${API_BASE_URL}/admin/phonenumbers`);
      console.log('With Authorization header:', formattedToken.substring(0, 20) + '...');
      
      const response = await axios.get(`${API_BASE_URL}/admin/phonenumbers`, {
        headers: {
          Authorization: formattedToken
        }
      });

      console.log('API response:', response.data);
      setPhoneNumbers(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          // Handle unauthorized error specifically
          console.error('Authentication error:', err.response.data);
          
          // Debug: For 401 errors, we want to see the full details
          console.error('Request details:', {
            url: err.config?.url,
            method: err.config?.method,
            headers: err.config?.headers,
            data: err.config?.data
          });
          
          handleAuthError();
        } else if (err.response) {
          // Other API errors
          setError(err.response.data.message || 'Failed to fetch phone numbers');
          console.error('Error fetching phone numbers:', err.response.data);
        } else {
          // Network errors
          setError('Network error. Please check your connection and try again.');
          console.error('Network error:', err);
        }
      } else {
        // Other unexpected errors
        setError('An unexpected error occurred. Please try again later.');
        console.error('Error fetching phone numbers:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhoneNumbers();
  }, []);

  const handleStatusToggle = async (id: number, currentStatus: PhoneNumber['status']) => {
    // Determine next status in the cycle: Available -> Busy -> Offline -> Available
    let nextStatus: PhoneNumber['status'];
    if (currentStatus === 'Available') {
      nextStatus = 'Busy';
    } else if (currentStatus === 'Busy') {
      nextStatus = 'Offline';
    } else {
      nextStatus = 'Available';
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      handleAuthError();
      return;
    }

    // Ensure the token is properly formatted
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    setError(null);

    try {
      await axios.post(`${API_BASE_URL}/admin/phonenumbers/${id}/status`, 
        { status: nextStatus },
        {
          headers: {
            Authorization: formattedToken
          }
        }
      );

      // Refresh the phone numbers list
      fetchPhoneNumbers();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          // Handle unauthorized error specifically
          console.error('Authentication error:', err.response.data);
          handleAuthError();
        } else if (err.response) {
          // Other API errors
          setError(err.response.data.message || 'Failed to update phone status');
          console.error('Error updating phone status:', err.response.data);
        } else {
          // Network errors
          setError('Network error. Please check your connection and try again.');
          console.error('Network error:', err);
        }
      } else {
        // Other unexpected errors
        setError('An unexpected error occurred. Please try again later.');
        console.error('Error updating phone status:', err);
      }
    }
  };

  // Helper function to determine next status text
  const getNextStatusText = (currentStatus: PhoneNumber['status']): string => {
    if (currentStatus === 'Available') return 'Busy';
    if (currentStatus === 'Busy') return 'Offline';
    return 'Available';
  };

  // Helper function to get badge color based on status
  const getStatusBadgeVariant = (status: PhoneNumber['status']): string => {
    switch (status) {
      case 'Available': return 'success';
      case 'Busy': return 'warning';
      case 'Offline': return 'secondary';
      default: return 'light';
    }
  };

  // Function to manually refresh token and redirect to login
  const handleManualRefresh = () => {
    localStorage.removeItem('admin_token');
    navigate('/login', { replace: true });
  };

  return (
    <Container className="mt-3">
      <h2 className="mb-4">Phone Number Management</h2>
      
      {isLoading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
      
      {error && (
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-danger" 
              onClick={handleManualRefresh}
            >
              Go to Login
            </Button>
          </div>
        </Alert>
      )}
      
      {!isLoading && !error && (
        <>
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div>
              <Button variant="outline-secondary" size="sm" onClick={fetchPhoneNumbers} className="me-2">
                Refresh Data
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleShowAddModal}
              >
                Add New Phone Number
              </Button>
            </div>
            <Button variant="outline-primary" size="sm" onClick={handleManualRefresh}>
              Re-authenticate
            </Button>
          </div>
          
          <Table striped bordered hover responsive size="sm">
            <thead>
              <tr>
                <th>Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {phoneNumbers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center">No phone numbers found.</td>
                </tr>
              ) : (
                phoneNumbers.map((phone) => (
                  <tr key={phone.id}>
                    <td>{phone.numberString}</td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(phone.status)}>
                        {phone.status}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={() => handleStatusToggle(phone.id, phone.status)}
                      >
                        Set to {getNextStatusText(phone.status)}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </>
      )}
      
      {/* Add Phone Number Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Phone Number</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddPhoneNumber}>
          <Modal.Body>
            {addError && (
              <Alert variant="danger">
                {addError}
              </Alert>
            )}
            <Form.Group controlId="newPhoneNumber">
              <Form.Label>Phone Number</Form.Label>
              <InputGroup>
                <Form.Control
                  type="tel"
                  placeholder="e.g., 555-123-4567"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  required
                />
              </InputGroup>
              <Form.Text className="text-muted">
                Enter the phone number in a consistent format (e.g., +1 555-123-4567)
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isAdding}>
              {isAdding ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-1"
                  />
                  Adding...
                </>
              ) : (
                'Add Number'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default PhoneManagementPage;
```

---
### File: `packages/admin-frontend/src/pages/ProductDetailPage.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Button, Spinner, Alert, Card } from 'react-bootstrap';
import { formatCurrency } from '../utils/formatters';

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  stock?: number;
  imageUrl?: string;
  category?: {
    id: number;
    name: string;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProduct(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 404) {
            setError(`Product #${id} not found.`);
          } else {
            setError(err.response.data.message || 'Failed to fetch product details.');
          }
          console.error('Error fetching product:', err.response.data);
        } else {
          setError('Network error. Please check your connection.');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading product details...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={handleGoBack} className="mt-3">
          Back to Products
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="my-5">
        <Alert variant="warning">Product not found.</Alert>
        <Button variant="secondary" onClick={handleGoBack} className="mt-3">
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row>
        <Col xs={12} md={5} className="mb-4">
          <Card>
            <Card.Img 
              src={product.imageUrl 
                ? (product.imageUrl.startsWith('/') ? `${API_BASE_URL}${product.imageUrl}` : product.imageUrl)
                : '/placeholder-product.jpg'} 
              alt={product.name}
              style={{ height: '300px', objectFit: 'cover' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={7}>
          <h1>{product.name}</h1>
          {product.category && (
            <p className="text-muted">Category: {product.category.name}</p>
          )}
          <h2 className="text-primary mb-3">{formatCurrency(product.price)}</h2>
          
          <div className="mb-4">
            <h3 className="h5">Description</h3>
            <p>{product.description || 'No description available.'}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="h5">Inventory</h3>
            <p>Stock: {product.stock !== undefined ? product.stock : 'Not tracked'}</p>
          </div>
          
          <Button variant="secondary" onClick={handleGoBack}>
            Back to Products
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailPage;
```

---
### File: `packages/admin-frontend/src/pages/ProductManagementPage.tsx`

```tsx
import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { Container, Table, Button, Alert, Spinner, Modal, Form, InputGroup, Image, Badge } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { FaImage, FaPlus, FaBox } from 'react-icons/fa';
import { BsImage } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  stock?: number;
  imageUrl?: string;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ProductManagementPage: React.FC = () => {
  // Products list state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Categories list state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Add state for inline stock adjustment
  const [adjustingProductId, setAdjustingProductId] = useState<number | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<string>('');

  // Add state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Add state for stock adjustment modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState('');

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsCategoriesLoading(true);
    setCategoriesError(null);
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setCategoriesError('Authentication required. Please log in again.');
      setIsCategoriesLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/categories`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCategories(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setCategoriesError(err.response.data.message || 'Failed to fetch categories.');
        console.error('Error fetching categories:', err.response.data);
      } else {
        setCategoriesError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      // Use admin endpoint to get products with category information
      const response = await axios.get(`${API_BASE_URL}/api/admin/products`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProducts(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(err.response.data.message || 'Failed to fetch products.');
        }
        console.error('Error fetching products:', err.response.data);
      } else {
        setError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!window.confirm(`Are you sure you want to delete product #${productId}? This action cannot be undone.`)) {
      return; // Stop execution if user cancels
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('Authentication required. Please log in again.');
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh product list
      fetchProducts();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else if (err.response.status === 409) {
          setError('Cannot delete product because it is referenced in orders.');
        } else {
          setError(err.response.data.message || `Failed to delete product #${productId}.`);
        }
        console.error('Error deleting product:', err.response.data);
      } else {
        setError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    }
  };

  const handleShowAddModal = () => {
    // Reset form state
    setEditingProduct(null);
    setFormName('');
    setFormPrice('');
    setFormDescription('');
    setFormStock('');
    setFormImageUrl('');
    setFormCategoryId('');
    setModalError(null);
    setSelectedFile(null);
    setUploadError(null);
    setShowModal(true);
  };

  const handleShowEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price.toString());
    setFormDescription(product.description || '');
    setFormStock(product.stock?.toString() || '');
    setFormImageUrl(product.imageUrl || '');
    setFormCategoryId(product.categoryId?.toString() || '');
    setModalError(null);
    setSelectedFile(null);
    setUploadError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalError(null);
    setUploadError(null);
  };

  const handleSaveProduct = async (event: FormEvent) => {
    event.preventDefault();
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setModalError('Authentication required. Please log in again.');
      return;
    }

    // Validate form data
    if (!formName.trim()) {
      setModalError('Product name is required.');
      return;
    }

    const priceValue = parseFloat(formPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      setModalError('Price must be a positive number.');
      return;
    }

    setIsModalLoading(true);
    setModalError(null);
    setUploadError(null);

    // Handle image upload if a file is selected
    if (selectedFile) {
      setIsUploading(true);
      
      try {
        // Create form data for file upload
        const formData = new FormData();
        formData.append('productImage', selectedFile);
        
        // Upload the image
        const uploadResponse = await axios.post(
          `${API_BASE_URL}/api/admin/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        // Get the imageUrl from the response and update formImageUrl
        const uploadedImageUrl = uploadResponse.data.imageUrl;
        setFormImageUrl(uploadedImageUrl);
        
        // Clear the selected file state
        setSelectedFile(null);
      } catch (err) {
        // Handle upload errors
        setIsUploading(false);
        setIsModalLoading(false);
        
        let errorMessage = 'Image upload failed';
        if (axios.isAxiosError(err) && err.response) {
          errorMessage = err.response.data.message || errorMessage;
        }
        
        setUploadError(errorMessage);
        toast.error('Image upload failed');
        return; // Don't proceed with saving the product
      } finally {
        setIsUploading(false);
      }
    }

    // Prepare form data for product
    const productData = {
      name: formName.trim(),
      price: priceValue,
      description: formDescription.trim() || undefined,
      stock: formStock ? parseInt(formStock, 10) : undefined,
      imageUrl: formImageUrl.trim() || undefined,
      categoryId: formCategoryId ? parseInt(formCategoryId, 10) : null
    };

    try {
      if (editingProduct) {
        // Update existing product
        await axios.put(
          `${API_BASE_URL}/admin/products/${editingProduct.id}`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Create new product
        await axios.post(
          `${API_BASE_URL}/admin/products`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Close modal and refresh product list
      handleCloseModal();
      fetchProducts();
      toast.success(`Product ${editingProduct ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setModalError('Your session has expired. Please log in again.');
        } else {
          setModalError(err.response.data.message || 'Failed to save product.');
        }
        console.error('Error saving product:', err.response.data);
      } else {
        setModalError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsModalLoading(false);
    }
  };

  // Function to handle stock adjustment submission
  const handleAdjustStock = async (productId: number, adjustmentStr: string) => {
    const adjustmentInt = parseInt(adjustmentStr, 10);

    if (isNaN(adjustmentInt)) {
        toast.error("Adjustment value must be a valid integer.");
        return;
    }

    if (adjustmentInt === 0) {
        toast.success("No adjustment needed (value is 0).");
        setAdjustingProductId(null); // Close the input if adjustment is 0
        setAdjustmentValue('');
        return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      toast.error('Authentication required. Please log in again.');
      return;
    }

    // Optimistic UI update can be added here later if desired

    try {
      console.log(`Adjusting stock for product ${productId} by ${adjustmentInt}`);
      const response = await axios.post(
        `${API_BASE_URL}/admin/products/${productId}/adjust-stock`,
        { adjustment: adjustmentInt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success(`Stock for '${response.data.name}' updated to ${response.data.stock}.`);
      
      // Refresh product list to show updated stock
      await fetchProducts(); 
      
      // Reset adjustment state
      setAdjustingProductId(null);
      setAdjustmentValue('');

    } catch (err) {
      console.error('Error adjusting stock:', err);
      let errorMessage = 'Failed to adjust stock.';
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = 'Your session has expired or you are unauthorized.';
        } else {
          errorMessage = err.response.data.message || errorMessage;
        }
      }
      toast.error(errorMessage);
      // Optionally reset state even on error, or keep input open for correction
      // setAdjustingProductId(null);
      // setAdjustmentValue(''); 
    }
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const handleShowDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      await handleDelete(productToDelete.id);
      handleCloseDeleteModal();
    }
  };
  
  const handleShowStockModal = (product: Product) => {
    setStockProduct(product);
    setStockAdjustment('');
    setShowStockModal(true);
  };
  
  const handleCloseStockModal = () => {
    setShowStockModal(false);
    setStockProduct(null);
    setStockAdjustment('');
  };
  
  const handleStockAdjustmentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (stockProduct && stockAdjustment) {
      await handleAdjustStock(stockProduct.id, stockAdjustment);
      handleCloseStockModal();
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Product Management</h2>
        <Button variant="primary" onClick={handleShowAddModal} className="d-flex align-items-center gap-2">
          <FaPlus size={14} /> Add New Product
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="mt-2 text-muted">Loading products...</p>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="empty-state">
              <FaBox className="empty-state-icon" />
              <p className="empty-state-text">No Products Found</p>
              <p className="mb-4 text-muted">You haven't added any products yet.</p>
              <Button 
                variant="primary" 
                onClick={handleShowAddModal} 
                className="px-4 d-flex align-items-center gap-2 mx-auto"
              >
                <FaPlus size={14} /> Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover responsive className="align-middle shadow-sm">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>ID</th>
                    <th style={{ width: '80px' }}>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th className="text-end">Price</th>
                    <th className="text-center">Stock</th>
                    <th style={{ width: '180px' }} className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td className="text-center">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl.startsWith('/') 
                              ? `${API_BASE_URL}${product.imageUrl}` 
                              : product.imageUrl} 
                            alt={product.name} 
                            className="product-thumbnail rounded shadow-sm" 
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="product-thumbnail d-flex align-items-center justify-content-center bg-light rounded shadow-sm" style={{ width: '50px', height: '50px' }}>
                            <FaImage className="text-secondary" />
                          </div>
                        )}
                      </td>
                      <td>{truncateText(product.name, 30)}</td>
                      <td>
                        {product.category?.name ? (
                          <Badge bg="info" className="fw-normal px-2 py-1">{product.category.name}</Badge>
                        ) : (
                          <span className="text-muted small">Uncategorized</span>
                        )}
                      </td>
                      <td className="text-end fw-medium">{formatCurrency(product.price)}</td>
                      <td className="text-center">
                        <Badge 
                          bg={product.stock === undefined || product.stock === null ? 'secondary' : 
                              product.stock <= 0 ? 'danger' : 
                              product.stock < 10 ? 'warning' : 'success'}
                          className="px-2 py-1"
                        >
                          {product.stock === undefined || product.stock === null ? 'N/A' : product.stock}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1 justify-content-end">
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            onClick={() => handleShowStockModal(product)}
                          >
                            Stock
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => handleShowEditModal(product)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleShowDeleteModal(product)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </>
      )}

      {/* Product Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveProduct}>
          <Modal.Body>
            {modalError && (
              <Alert variant="danger" className="mb-3">
                {modalError}
              </Alert>
            )}
            {uploadError && (
              <Alert variant="danger" className="mb-3">
                Upload error: {uploadError}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Product Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  required
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Product Description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stock (Optional)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Stock Quantity"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="productImageFile">
              <Form.Label>Product Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setSelectedFile(e.target.files ? e.target.files[0] : null)
                }
              />
              <Form.Text className="text-muted">
                Max file size: 5MB. Supported formats: PNG, JPEG, WebP, GIF.
              </Form.Text>
            </Form.Group>
            {formImageUrl && (
              <div className="mb-3">
                <p className="mb-1">Current Image:</p>
                <Image 
                  src={formImageUrl.startsWith('/') ? `${API_BASE_URL}${formImageUrl}` : formImageUrl} 
                  alt="Product" 
                  style={{ maxHeight: '100px', maxWidth: '100%' }}
                />
              </div>
            )}
            <Form.Group controlId="formImageUrl" className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  type="text"
                  value={formImageUrl || ''}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="Image URL (optional)"
                  disabled={isUploading}
                />
                {formImageUrl && (
                  <div className="ms-2">
                    <Image 
                      src={formImageUrl.startsWith('/') ? `${API_BASE_URL}${formImageUrl}` : formImageUrl} 
                      alt="Preview" 
                      thumbnail 
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category (Optional)</Form.Label>
              <Form.Select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
              >
                <option value="">None</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isModalLoading || isUploading}
            >
              {isModalLoading || isUploading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {isUploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                'Save Product'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productToDelete && (
            <p>Are you sure you want to delete <strong>{productToDelete.name}</strong>?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Stock Adjustment Modal */}
      <Modal show={showStockModal} onHide={handleCloseStockModal}>
        <Modal.Header closeButton>
          <Modal.Title>Adjust Stock</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleStockAdjustmentSubmit}>
          <Modal.Body>
            {stockProduct && (
              <>
                <p>
                  Adjust stock for <strong>{stockProduct.name}</strong>
                  <br />
                  <span className="text-muted">Current stock: {stockProduct.stock || 0}</span>
                </p>
                <Form.Group className="mb-3">
                  <Form.Label>Stock adjustment (+ to add, - to remove)</Form.Label>
                  <Form.Control
                    type="number"
                    value={stockAdjustment}
                    onChange={(e) => setStockAdjustment(e.target.value)}
                    placeholder="Enter adjustment value"
                    required
                  />
                  <Form.Text className="text-muted">
                    Example: Enter "5" to add 5 units or "-3" to remove 3 units
                  </Form.Text>
                </Form.Group>
                {stockAdjustment && !isNaN(Number(stockAdjustment)) && (
                  <Alert variant="info">
                    New stock will be: {(stockProduct.stock || 0) + Number(stockAdjustment)}
                  </Alert>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseStockModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ProductManagementPage;
```

---
### File: `packages/admin-frontend/src/pages/UserManagementPage.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Spinner, Alert } from 'react-bootstrap';
import { format } from 'date-fns';

// User interface with order count
interface AdminUser {
  id: number;
  email: string;
  createdAt: string;
  _count: {
    orders: number;
  };
  totalSpent: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          setError('Authentication required. Please log in again.');
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUsers(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401) {
            setError('Your session has expired. Please log in again.');
          } else {
            setError(err.response.data.message || 'Failed to fetch users.');
          }
          console.error('Error fetching users:', err.response.data);
        } else {
          setError('Network error. Please check your connection.');
          console.error('Network error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Helper function to format dates
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Container className="py-4">
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading users...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">User Management</h2>

      {error && (
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      )}

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">All Users</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Registration Date</th>
                    <th className="text-center">Order Count</th>
                    <th className="text-end">Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.email}</td>
                        <td>{formatDateTime(user.createdAt)}</td>
                        <td className="text-center">{user._count?.orders ?? 0}</td>
                        <td className="text-end">{formatCurrency(user.totalSpent ?? 0)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserManagementPage;
```

---
### File: `packages/admin-frontend/src/pages/ZoneManagementPage.tsx`

```tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Table, Form, Button, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import { MapContainer, TileLayer, GeoJSON, FeatureGroup, useMap } from 'react-leaflet';
import L, { LatLngExpression, Layer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';

interface ServiceZone {
  id: number;
  name: string;
  geoJsonPolygon: string; // The raw GeoJSON string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Custom EditControl component to replace react-leaflet-draw
interface EditControlProps {
  position: L.ControlPosition;
  onCreated: (e: any) => void;
  onEdited: (e: any) => void;
  onDeleted: (e: any) => void;
  featureGroupRef?: React.RefObject<L.FeatureGroup>;
  draw?: {
    polyline?: false | L.DrawOptions.PolylineOptions;
    polygon?: false | L.DrawOptions.PolygonOptions;
    rectangle?: false | L.DrawOptions.RectangleOptions;
    circle?: false | L.DrawOptions.CircleOptions;
    marker?: false | L.DrawOptions.MarkerOptions;
    circlemarker?: false | L.DrawOptions.CircleMarkerOptions;
  };
  edit?: {
    featureGroup?: L.FeatureGroup;
    edit?: boolean | any;
    remove?: boolean;
  };
}

const EditControl: React.FC<EditControlProps> = (props) => {
  const { position, onCreated, onEdited, onDeleted, draw, edit, featureGroupRef } = props;
  const map = useMap();
  
  useEffect(() => {
    const featureGroup = edit?.featureGroup || (featureGroupRef?.current as L.FeatureGroup | undefined);
    if (!featureGroup) return;
    
    // Initialize the draw control
    const drawControl = new L.Control.Draw({
      position,
      draw: draw as any, // Use any to bypass type checking for now
      edit: featureGroup ? {
        featureGroup,
        edit: edit?.edit || false,
        remove: edit?.remove || false
      } as any : undefined
    });
    
    // Add the draw control to the map
    map.addControl(drawControl);
    
    // Set up event handlers
    map.on(L.Draw.Event.CREATED, onCreated);
    map.on(L.Draw.Event.EDITED, onEdited);
    map.on(L.Draw.Event.DELETED, onDeleted);
    
    // Cleanup
    return () => {
      map.off(L.Draw.Event.CREATED, onCreated);
      map.off(L.Draw.Event.EDITED, onEdited);
      map.off(L.Draw.Event.DELETED, onDeleted);
      map.removeControl(drawControl);
    };
  }, [map, position, draw, edit, onCreated, onEdited, onDeleted, featureGroupRef]);
  
  return null;
};

const ZoneManagementPage = () => {
  // State for zone list
  const [zones, setZones] = useState<ServiceZone[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  
  // State for adding new zone
  const [newZoneName, setNewZoneName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  
  // State for drawn/edited polygon
  const [editableLayerGeoJson, setEditableLayerGeoJson] = useState<any>(null);
  
  // Ref for editable layer group
  const editableFG = useRef<L.FeatureGroup | null>(null);

  // Map center coordinates (Addis Ababa)
  const mapCenter: LatLngExpression = [9.02, 38.75];
  const mapZoom = 11;

  useEffect(() => {
    fetchZones();
    
    // Fix Leaflet icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  const fetchZones = async () => {
    setIsLoadingList(true);
    setListError(null);

    const token = localStorage.getItem('admin_token');
    if (!token) {
      setListError('Authentication required. Please log in again.');
      setIsLoadingList(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/admin/serviceareas`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setZones(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setListError('Your session has expired. Please log in again.');
        } else {
          setListError(err.response.data.message || 'Failed to fetch service zones.');
        }
        console.error('Error fetching zones:', err.response.data);
      } else {
        setListError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsLoadingList(false);
    }
  };

  // Event handler for when a shape is created
  const _onCreated = (e: any) => {
    const layer = e.layer;
    // Clear any existing layers
    editableFG.current?.clearLayers();
    
    // Add the new layer
    editableFG.current?.addLayer(layer);
    
    // Set the GeoJSON representation in state
    const geoJson = layer.toGeoJSON();
    setEditableLayerGeoJson(geoJson);
  };

  // Event handler for when a shape is edited
  const _onEdited = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: any) => {
      // Update the GeoJSON representation in state
      const geoJson = layer.toGeoJSON();
      setEditableLayerGeoJson(geoJson);
    });
  };

  // Event handler for when a shape is deleted
  const _onDeleted = () => {
    setEditableLayerGeoJson(null);
  };

  const handleAddZone = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Basic validation
    if (!newZoneName.trim()) {
      setCreateError('Zone name is required.');
      return;
    }
    
    if (!editableLayerGeoJson) {
      setCreateError('Please draw a zone area on the map.');
      return;
    }
    
    setIsCreating(true);
    setCreateError(null);
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setCreateError('Authentication required. Please log in again.');
      setIsCreating(false);
      return;
    }
    
    try {
      await axios.post(
        `${API_BASE_URL}/admin/serviceareas`, 
        { 
          name: newZoneName, 
          geoJsonPolygon: JSON.stringify(editableLayerGeoJson)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Success - clear form and refresh the list
      setNewZoneName('');
      setEditableLayerGeoJson(null);
      editableFG.current?.clearLayers();
      fetchZones();
      
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400) {
          setCreateError('Validation failed: ' + (err.response.data.message || 'Please check your input.'));
        } else if (err.response.status === 409) {
          setCreateError('A zone with this name already exists.');
        } else {
          setCreateError(err.response.data.message || 'Failed to create service zone.');
        }
        console.error('Error creating zone:', err.response.data);
      } else {
        setCreateError('Network error. Please check your connection.');
        console.error('Network error:', err);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Container className="mt-3">
      <Row>
        <Col lg={5}>
          <Card className="mb-4">
            <Card.Body>
              <h3>Add New Service Zone</h3>
              
              <Form onSubmit={handleAddZone}>
                <Form.Group controlId="newZoneName">
                  <Form.Label>Zone Name</Form.Label>
                  <Form.Control 
                    type="text"
                    required
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)} 
                  />
                </Form.Group>

                <div className="mt-3">
                  <p className="mb-1">Zone Area</p>
                  <Alert variant="info">
                    Use the drawing tools on the map to create a polygon zone.
                  </Alert>
                </div>
                
                {createError && (
                  <Alert variant="danger" className="mt-3">
                    {createError}
                  </Alert>
                )}
                
                <Button 
                  variant="success" 
                  type="submit" 
                  disabled={isCreating} 
                  className="mt-3"
                >
                  {isCreating ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Creating...</span>
                    </>
                  ) : 'Add Zone'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
          
          <h3>Existing Service Zones</h3>
          
          {isLoadingList && (
            <div className="text-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading zones...</span>
              </Spinner>
            </div>
          )}
          
          {listError && <Alert variant="danger">{listError}</Alert>}
          
          {!isLoadingList && !listError && (
            <Table striped bordered hover responsive size="sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {zones.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center">No zones found</td>
                  </tr>
                ) : (
                  zones.map((zone) => (
                    <tr key={zone.id}>
                      <td>{zone.id}</td>
                      <td>{zone.name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Col>
        
        <Col lg={7}>
          <Card>
            <Card.Body>
              <h3>Service Zone Map</h3>
              <div style={{ height: '600px', width: '100%' }}>
                {!isLoadingList ? (
                  <MapContainer 
                    center={mapCenter} 
                    zoom={mapZoom} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Editable Feature Group for the leaflet-draw */}
                    <FeatureGroup ref={editableFG}>
                      <EditControl
                        position="topright"
                        onCreated={_onCreated}
                        onEdited={_onEdited}
                        onDeleted={_onDeleted}
                        featureGroupRef={editableFG as React.RefObject<L.FeatureGroup>}
                        draw={{
                          rectangle: false,
                          circle: false,
                          circlemarker: false,
                          marker: false,
                          polyline: false,
                          polygon: {
                            allowIntersection: false,
                            drawError: {
                              color: '#e1e100',
                              message: '<strong>Error:</strong> Shape edges cannot cross!',
                            },
                            shapeOptions: {
                              color: '#14B8A6'
                            }
                          },
                        }}
                        edit={{
                          edit: {
                            selectedPathOptions: {
                              maintainColor: true,
                              opacity: 0.7,
                            }
                          },
                          remove: true
                        }}
                      />
                    </FeatureGroup>
                    
                    {/* Render existing zones */}
                    {zones.map((zone) => {
                      try {
                        const geoJsonData = JSON.parse(zone.geoJsonPolygon);
                        // Basic validation
                        if (geoJsonData && (geoJsonData.type === 'Polygon' || geoJsonData.type === 'MultiPolygon')) {
                          const onEachFeature = (feature: any, layer: any) => {
                            layer.bindPopup(zone.name);
                          };

                          return (
                            <GeoJSON
                              key={zone.id}
                              data={geoJsonData}
                              pathOptions={{ color: 'blue', fillColor: 'lightblue', weight: 2, opacity: 0.8, fillOpacity: 0.3 }}
                              onEachFeature={onEachFeature}
                            />
                          );
                        }
                      } catch (e) {
                        console.error(`Failed to parse GeoJSON for zone ${zone.id} (${zone.name}):`, e);
                      }
                      return null; // Don't render if parse fails
                    })}
                  </MapContainer>
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <Spinner animation="border" />
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ZoneManagementPage;
```

---
### File: `packages/admin-frontend/src/utils/formatters.ts`

```typescript
/**
 * Formats a number as currency (EUR)
 * @param value The number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formats a date to a readable string
 * @param dateString The date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
```

---
--- End of Context ---
