# Checklist: Cloudinary Integration & Docker Compose Containerization

❗ **AI Coder Instructions:** Follow each task sequentially. After completing each step, internally verify against the specified criteria before proceeding. If a file path does not exist, create it. If modifying JSON, ensure valid syntax.

## Phase 1: Backend Cloudinary Integration (`packages/backend`)

### 1.1. Manage Dependencies
    - [X] **Sub-Task:** Install Cloudinary SDK.
        - File: `packages/backend/package.json`
        - Action: Add `"cloudinary": "^2.x.x"` (use latest v2 version) to `dependencies`.
        - **Verification:** Confirm `cloudinary` line exists in the `dependencies` object with a valid version specifier.
    - [X] **Sub-Task:** Remove Sharp (if solely used for Cloudinary prep). *(Optional - keep if Sharp is needed elsewhere)*
        - File: `packages/backend/package.json`
        - Action: If Sharp (`sharp`, `@types/sharp`) was only used for WebP conversion before upload and Cloudinary can handle input formats directly, remove `sharp` from `dependencies` and `@types/sharp` from `devDependencies`. If Sharp is used for other reasons, leave it.
        - **Verification:** Confirm `sharp`/`@types/sharp` are present or absent according to the decision made.
    - [X] **Sub-Task:** Install dependencies.
        - Context: Workspace root
        - Action: Execute `npm install` command simulation.
        - **Verification:** Assume `node_modules` is updated.

### 1.2. Environment Configuration
    - [X] **Sub-Task:** Update `.env.example` for Cloudinary.
        - File: `packages/backend/.env.example`
        - Action: Add the following lines for Cloudinary configuration:
          ```env
          # Cloudinary Configuration
          CLOUDINARY_CLOUD_NAME="YOUR_CLOUD_NAME"
          CLOUDINARY_API_KEY="YOUR_API_KEY"
          CLOUDINARY_API_SECRET="YOUR_API_SECRET"
          ```
        - Action: Remove any AWS S3 related environment variables previously added (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`).
        - **Verification:** Confirm the Cloudinary variables exist and S3 variables are removed in `.env.example`.
    - [X] **Sub-Task:** Ensure other backend env vars (`DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN` etc.) remain in `.env.example`.

### 1.3. Configure Cloudinary SDK
    - [X] **Sub-Task:** Create Cloudinary configuration utility.
        - File: `packages/backend/src/utils/cloudinaryConfig.ts` (Create this file)
        - Action: Add the following code to initialize Cloudinary config:
          ```typescript
          import { v2 as cloudinary } from 'cloudinary';
          import dotenv from 'dotenv';

          dotenv.config();

          const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
          const api_key = process.env.CLOUDINARY_API_KEY;
          const api_secret = process.env.CLOUDINARY_API_SECRET;

          if (!cloud_name || !api_key || !api_secret) {
              console.warn("Cloudinary config missing in environment variables. Uploads will likely fail.");
          }

          cloudinary.config({
              cloud_name: cloud_name,
              api_key: api_key,
              api_secret: api_secret,
              secure: true // Use https URLs
          });

          export default cloudinary;
          ```
        - **Verification:** Confirm the file is created, imports are correct, `dotenv` is called, config reads from `process.env`, and `cloudinary.config` is called.

### 1.4. Refactor Upload Route (`uploadRoutes.ts`)
    - [X] **Sub-Task:** Update Imports.
        - File: `packages/backend/src/routes/uploadRoutes.ts`
        - Action: Remove `import { PutObjectCommand } from "@aws-sdk/client-s3";` and `import s3Client from '../utils/s3Client';`.
        - Action: Add `import cloudinary from '../utils/cloudinaryConfig';`.
        - Action: Remove `import sharp from 'sharp';` (if removed dependency in 1.1). Remove `import path from 'path';` and `import fs from 'fs';`. Keep `import crypto from 'crypto';`. Keep `multer`.
        - **Verification:** Check import statements are correct.
    - [X] **Sub-Task:** Change Multer storage to `memoryStorage`.
        - File: `packages/backend/src/routes/uploadRoutes.ts`
        - Action: Replace `multer.diskStorage({...});` with `multer.memoryStorage()`. Update the `upload` constant initialization: `const upload = multer({ storage: multer.memoryStorage(), limits: {...}, fileFilter: ... });`
        - **Verification:** Confirm `storage` uses `memoryStorage`.
    - [X] **Sub-Task:** Rewrite upload processing logic.
        - File: `packages/backend/src/routes/uploadRoutes.ts`
        - Action: Inside the `upload.array('productImages', 5)(...)` callback:
            1.  Iterate through `req.files as Express.Multer.File[]`.
            2.  Inside the loop (`async (file) => { ... }`), replace S3 logic with Cloudinary upload logic:
                ```typescript
                // Example Cloudinary Upload Stream Logic inside the loop
                try {
                    const uniqueFileName = crypto.randomBytes(16).toString('hex');
                    const uploadResult = await new Promise<cloudinary.UploadApiResponse | undefined>((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            {
                                public_id: uniqueFileName, // Use unique name
                                folder: "hybrid-ecommy-uploads", // Optional: specify a folder in Cloudinary
                                resource_type: "auto", // Let Cloudinary detect file type
                                // Add any transformation options if needed (e.g., width, quality)
                                // transformation: [{ width: 800, quality: 'auto' }]
                            },
                            (error, result) => {
                                if (error) {
                                    console.error(`Cloudinary upload error for file ${file.originalname}:`, error);
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        );
                        // Pipe the buffer from multer memoryStorage to the upload stream
                        uploadStream.end(file.buffer);
                    });

                    if (uploadResult && uploadResult.secure_url) {
                        processedImageUrls.push(uploadResult.secure_url); // Store the secure Cloudinary URL
                    } else {
                         console.warn(`Cloudinary upload failed or did not return a secure_url for file ${file.originalname}.`);
                         // Optionally throw error or handle gracefully
                    }

                } catch (uploadError) {
                    console.error(`Error processing/uploading image ${file.originalname}:`, uploadError);
                    // Depending on requirements, either continue to next file or re-throw to fail the whole request
                    // For now, log and continue:
                    // throw new Error(`Failed to upload image: ${file.originalname}`);
                }
                ```
            3.  Ensure the `processedImageUrls` array collects the `secure_url` values.
            4.  Modify the final success response to mention Cloudinary and return the array of Cloudinary URLs: `res.status(201).json({ message: 'Files uploaded successfully to Cloudinary', imageUrls: processedImageUrls });`
        - **Verification:** Confirm the loop uses `cloudinary.uploader.upload_stream`, pipes `file.buffer`, handles the callback/Promise, pushes `uploadResult.secure_url`, and updates the final response.

### 1.5. Remove Backend Static Serving
    - [X] **Sub-Task:** Remove `express.static` for uploads.
        - File: `packages/backend/src/index.ts`
        - Action: Delete or comment out: `app.use(express.static(path.join(__dirname, '..', 'public')));`. If `/public` directory contains *only* uploads, it can be deleted entirely later.
        - **Verification:** Confirm the `express.static` line for `/public` is removed or correctly modified if other static files exist.

### 1.6. Database URL Usage
    - [X] **Sub-Task:** Verify `DATABASE_URL` usage.
        - Context: Backend codebase review.
        - Action: Ensure no code directly instantiates `PrismaClient` with a hardcoded connection string. Verify it implicitly relies on `process.env.DATABASE_URL`. *(Existing code seems fine).*
        - **Verification:** Confirm absence of hardcoded database URLs.

## Phase 2: Frontend Preparation (`packages/customer-frontend`, `packages/admin-frontend`)

### 2.1. Image URL Handling (`getImageUrl.ts`)
    - [X] **Sub-Task:** Confirm `getImageUrl.ts` handles absolute URLs.
        - Files: `packages/customer-frontend/src/utils/imageUrl.ts`, `packages/admin-frontend/src/utils/imageUrl.ts`
        - Action: Review the function. It should contain `if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) { return relativePath; }`.
        - **Verification:** Confirm the absolute URL check exists and returns the URL directly if true.

### 2.2. Frontend Dockerfiles
    - [X] **Sub-Task:** Create Customer Frontend Dockerfile.
        - File: `packages/customer-frontend/Dockerfile` (Create this file)
        - Action: Add the following multi-stage Dockerfile content:
          ```dockerfile
          # Stage 1: Build the React application
          FROM node:18-alpine AS builder
          WORKDIR /app

          # Copy root package files (for workspace dependencies)
          COPY package.json package-lock.json* ./
          # Copy frontend specific package files
          COPY packages/customer-frontend/package.json ./packages/customer-frontend/
          # Install ALL dependencies (needed for tsc/vite build)
          RUN npm install --workspace=customer-frontend --include=dev

          # Copy frontend source code
          COPY packages/customer-frontend/ ./packages/customer-frontend/

          # Set build-time environment variables (passed via --build-arg)
          ARG VITE_API_BASE_URL
          ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

          # Build the application
          RUN npm run build --workspace=customer-frontend

          # Stage 2: Serve the static files with Nginx
          FROM nginx:1.25-alpine
          WORKDIR /usr/share/nginx/html

          # Remove default Nginx static assets
          RUN rm -rf ./*

          # Copy static assets from builder stage
          COPY --from=builder /app/packages/customer-frontend/dist .

          # Copy custom Nginx config for SPA routing
          COPY packages/customer-frontend/nginx.conf /etc/nginx/conf.d/default.conf

          EXPOSE 80
          CMD ["nginx", "-g", "daemon off;"]
          ```
        - **Verification:** Confirm the Dockerfile has two stages, uses Node 18, installs deps correctly, copies source, accepts `VITE_API_BASE_URL` build arg, runs the build script, uses Nginx, copies `dist` and `nginx.conf`.
    - [X] **Sub-Task:** Create Nginx config for Customer Frontend SPA.
        - File: `packages/customer-frontend/nginx.conf` (Create this file)
        - Action: Add the following Nginx configuration:
          ```nginx
          server {
              listen 80;
              server_name localhost;
              root /usr/share/nginx/html;
              index index.html;

              location / {
                  try_files $uri $uri/ /index.html;
              }

              # Optional: Cache control for static assets
              location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|otf)$ {
                  expires 1y;
                  add_header Cache-Control "public";
              }
          }
          ```
        - **Verification:** Confirm the file contains `listen 80`, `root`, `index`, and the `try_files` directive for SPA routing.
    - [X] **Sub-Task:** Create Admin Frontend Dockerfile.
        - File: `packages/admin-frontend/Dockerfile` (Create this file)
        - Action: Add a Dockerfile *identical* to the Customer Frontend one, but adjust workspace names and paths:
          ```dockerfile
          # Stage 1: Build the React application
          FROM node:18-alpine AS builder
          WORKDIR /app

          # Copy root package files
          COPY package.json package-lock.json* ./
          # Copy frontend specific package files
          COPY packages/admin-frontend/package.json ./packages/admin-frontend/
          # Install ALL dependencies
          RUN npm install --workspace=admin-frontend --include=dev

          # Copy frontend source code
          COPY packages/admin-frontend/ ./packages/admin-frontend/

          # Set build-time environment variables
          ARG VITE_API_BASE_URL
          ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

          # Build the application
          RUN npm run build --workspace=admin-frontend

          # Stage 2: Serve the static files with Nginx
          FROM nginx:1.25-alpine
          WORKDIR /usr/share/nginx/html
          RUN rm -rf ./*
          COPY --from=builder /app/packages/admin-frontend/dist .
          COPY packages/admin-frontend/nginx.conf /etc/nginx/conf.d/default.conf # Use its own Nginx config

          EXPOSE 80
          CMD ["nginx", "-g", "daemon off;"]
          ```
        - **Verification:** Confirm the Dockerfile targets `admin-frontend`, copies `packages/admin-frontend/`, uses `npm install --workspace=admin-frontend`, builds the correct workspace, and copies its own `nginx.conf`.
    - [X] **Sub-Task:** Create Nginx config for Admin Frontend SPA.
        - File: `packages/admin-frontend/nginx.conf` (Create this file)
        - Action: Add Nginx configuration identical to the Customer Frontend's `nginx.conf`.
          ```nginx
          server {
              listen 80;
              server_name localhost;
              root /usr/share/nginx/html;
              index index.html;

              location / {
                  try_files $uri $uri/ /index.html;
              }

              location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|otf)$ {
                  expires 1y;
                  add_header Cache-Control "public";
              }
          }
          ```
        - **Verification:** Confirm the file is created and identical to the customer frontend one.

## Phase 3: Root Level Docker Compose & Configuration

### 3.1. Root `.dockerignore`
    - [X] **Sub-Task:** Create/Update Root Dockerignore.
        - File: `.dockerignore` (at the project root)
        - Action: Ensure this file exists and contains at least:
          ```
          # Git
          .git
          .gitignore

          # Node
          node_modules
          **/node_modules

          # Env files
          .env
          **/.env

          # IDE/OS files
          .idea
          .vscode
          .DS_Store
          Thumbs.db

          # Build outputs (might be redundant if dockerignore exists in packages, but good practice)
          **/dist
          **/build

          # Logs
          logs/
          *.log
          npm-debug.log*
          yarn-debug.log*
          pnpm-debug.log*

          # Coverage
          **/coverage
          ```
        - **Verification:** Confirm the root `.dockerignore` exists and excludes common development/build artifacts, especially `node_modules` and `.env`.

### 3.2. Root Environment Files
    - [X] **Sub-Task:** Create Root `.env.example`.
        - File: `.env.example` (at the project root)
        - Action: Create this file and consolidate *all* required environment variables for Docker Compose:
          ```env
          # PostgreSQL Credentials (Used by 'postgres' service and backend)
          POSTGRES_USER=postgres
          POSTGRES_PASSWORD=postgres # Change locally if desired
          POSTGRES_DB=hybriddb

          # Backend Configuration
          # IMPORTANT: This URL is for container-to-container communication
          DATABASE_URL="postgresql://postgres:postgres@postgres:5432/hybriddb"
          # Set a strong, unique secret
          JWT_SECRET="your_strong_jwt_secret_key_replace_me"
          # Port *inside* the backend container (must match EXPOSE in backend/Dockerfile)
          PORT=10000
          # Set allowed origins for CORS (space-separated URLs) for LOCAL DOCKER COMPOSE ONLY
          # When deploying BE/FE separately, these will be different
          CORS_ORIGIN="http://localhost:3000 http://localhost:3011" # Allow local FEs

          # Cloudinary Credentials
          CLOUDINARY_CLOUD_NAME="YOUR_CLOUD_NAME"
          CLOUDINARY_API_KEY="YOUR_API_KEY"
          CLOUDINARY_API_SECRET="YOUR_API_SECRET"

          # Frontend Build Arguments (Passed during 'docker compose build')
          # URL for frontend containers to reach the backend container
          VITE_API_BASE_URL=http://localhost:3001/api

          # Host Port Mappings (Used by docker-compose.yml but good to document)
          CUSTOMER_FE_PORT=3000
          ADMIN_FE_PORT=3011
          BACKEND_PORT=3001
          DB_PORT=5432
          ```
        - **Verification:** Check all variables are present, especially the specific internal `DATABASE_URL` format and Cloudinary placeholders.
    - [X] **Sub-Task:** Create local root `.env` file (from `.env.example`).
        - File: `.env` (at the project root, **DO NOT COMMIT TO GIT**)
        - Action: Copy `.env.example` to `.env`. Replace placeholder values (`YOUR_...`, secrets) with your actual *local development* or Cloudinary credentials. Change the local DB password if desired (ensure it matches `POSTGRES_PASSWORD`).
        - **Verification:** Confirm `.env` file exists and contains actual (or dummy) values.

### 3.3. Docker Compose Configuration
    - [X] **Sub-Task:** Create `docker-compose.yml`.
        - File: `docker-compose.yml` (at the project root)
        - Action: Add the following Docker Compose configuration:
          ```yaml
          version: '3.8'

          services:
            # Backend Service
            backend:
              build:
                context: ./packages/backend
                dockerfile: Dockerfile
              container_name: hybrid_backend
              ports:
                - "${BACKEND_PORT:-3001}:10000" # Map host BACKEND_PORT to container 10000 (where Node runs)
              environment:
                # Pass env vars needed by the backend application at runtime
                DATABASE_URL: ${DATABASE_URL}
                JWT_SECRET: ${JWT_SECRET}
                PORT: 10000 # Keep this consistent with EXPOSE in Dockerfile
                CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
                CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
                CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
                CORS_ORIGIN: ${CORS_ORIGIN}
                # NODE_ENV is often set inside the container/Dockerfile
              depends_on:
                postgres:
                  condition: service_healthy # Wait for DB to be ready
              restart: unless-stopped
              networks:
                - hybrid_network

            # Customer Frontend Service
            customer-frontend:
              build:
                context: . # Build from root context to access files if needed
                dockerfile: packages/customer-frontend/Dockerfile
                args: # Pass build-time variables to the frontend Dockerfile
                  VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:3001/api}
              container_name: hybrid_customer_frontend
              ports:
                - "${CUSTOMER_FE_PORT:-3000}:80" # Map host port 3000 to Nginx port 80
              restart: unless-stopped
              networks:
                - hybrid_network
              # depends_on: - No direct dependency needed, Nginx serves static

            # Admin Frontend Service
            admin-frontend:
              build:
                context: . # Build from root context
                dockerfile: packages/admin-frontend/Dockerfile
                args:
                  VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:3001/api}
              container_name: hybrid_admin_frontend
              ports:
                - "${ADMIN_FE_PORT:-3011}:80" # Map host port 3011 to Nginx port 80
              restart: unless-stopped
              networks:
                - hybrid_network
              # depends_on: - No direct dependency needed

            # Database Service
            postgres:
              image: postgres:15-alpine
              container_name: hybrid_postgres_db
              environment:
                POSTGRES_USER: ${POSTGRES_USER}
                POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
                POSTGRES_DB: ${POSTGRES_DB}
              volumes:
                - postgres_data:/var/lib/postgresql/data
              ports:
                - "${DB_PORT:-5432}:5432" # Map host DB_PORT to container 5432
              networks:
                - hybrid_network
              healthcheck: # Wait until postgres is ready to accept connections
                  test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
                  interval: 10s
                  timeout: 5s
                  retries: 5

          # Define Persistent Volume for DB Data
          volumes:
            postgres_data:
              driver: local

          # Define Custom Network
          networks:
            hybrid_network:
              driver: bridge
          ```
        - **Verification:** Confirm services `backend`, `customer-frontend`, `admin-frontend`, `postgres` are defined. Check `build context` and `dockerfile` paths. Verify port mappings. Confirm `environment` variables pull from the root `.env` (`${VAR_NAME}`). Check backend `DATABASE_URL` uses the `postgres` service name. Check `depends_on` and `healthcheck` for `backend` depending on `postgres`. Verify `volumes` and `networks`. Check frontend build `args`.

### 3.4. Update Root `package.json` (Optional)
    - [X] **Sub-Task:** Add Docker Compose scripts to root `package.json`.
        - File: `package.json` (at the project root)
        - Action: Add scripts like:
          ```json
          "scripts": {
            // ... keep existing scripts ...
            "compose:up": "docker compose up -d --build",
            "compose:down": "docker compose down",
            "compose:logs": "docker compose logs -f",
            "compose:logs:be": "docker compose logs -f backend"
          },
          ```
        - **Verification:** Confirm the scripts exist in the `scripts` section.

## Phase 4: Final Checks & Testing

### 4.1. Code Review (AI Self-Check)
    - [X] **Task:** Review all modified files (`uploadRoutes.ts`, `.env.example`, `Dockerfile`s, `nginx.conf`, `docker-compose.yml`, `package.json` files).
    - **Action:** Confirm syntax is correct, environment variables match between files (docker-compose uses `${VAR}`, code uses `process.env.VAR`), file paths are correct, Cloudinary SDK is used for uploads, and old local storage logic is removed. Check that S3 dependencies/logic are fully removed.
    - **Verification:** Checklist task complete based on internal review.

### 4.2. Local Docker Compose Test (Simulated)
    - [X] **Task:** Simulate running `docker compose up --build` from the root directory.
    - **Action:** Mentally trace the build process for each service, ensuring dependencies are installed, build args are passed (like `VITE_API_BASE_URL`), builds succeed, and services start. Verify the backend attempts to connect to `postgres:5432` using the credentials from the root `.env`.
    - **Verification:** Assume successful local build and service startup based on the configuration.

---

**Final Output Expectation for AI:** The codebase should be modified according to the checklist. New Dockerfiles, Nginx configs, `docker-compose.yml`, and root `.env` / `.env.example` should be created/updated. Backend upload logic should use Cloudinary, and S3 dependencies/references should be removed. Frontend image utility should correctly handle Cloudinary URLs. Environment variables should be consistently defined and referenced for a containerized setup.