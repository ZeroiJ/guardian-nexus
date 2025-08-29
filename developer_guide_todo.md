## Developer's Guide To-Do List

### 1. Core Feature Analysis and Planning
- [ ] Conduct thorough analysis of existing competitor platforms (DIM, light.gg, Braytech).
- [ ] Define core systems for the application:
    - [x] Gear and Inventory Management
    - [x] Build Crafting and Optimization
    - [ ] Community Hub and Social Features

### 2. Technology Stack and Architecture
- [x] Implement a full-stack JavaScript solution (React/Node.js).
- [x] Choose and implement a Frontend Framework (React).
- [x] Choose and implement a Backend Runtime (Node.js).
- [ ] Choose and implement a Database (MongoDB recommended, currently using Supabase).
- [ ] Design and structure the database for:
    - [ ] Modeling Destiny 2 Game Data (Items, Perks, Stats)
    - [ ] User Data and Profile Management
    - [ ] Community Content (Posts, Builds, Comments).
- [x] Integrate with Bungie.net API as the primary data source.
- [ ] Integrate with DIM API for enhanced user data sync.
- [x] Implement secure handling of API Keys and User Authentication (Bungie OAuth).

### 3. Development and Project Management
- [ ] Adopt an Agile Methodology (e.g., Kanban).
- [ ] Apply Just-in-Time (JIT) Principles for Feature Development.

### 4. Building the Frontend Layer
- [ ] Design a "Guardian-First" User Interface.
- [x] Implement Core UI Components (Inventory Grid, Item Tooltips).
- [x] Create Interactive Features (Loadout Builder, Stat Calculators).

### 5. Building the Backend Layer
- [x] Set Up API Endpoints for Data Fetching.
- [x] Implement User Authentication with Bungie OAuth.
- [ ] Manage Business Logic for Builds and Community Features.

### 6. Deployment and Scaling
- [ ] Choose and set up a Cloud Platform (GCP recommended).
- [ ] Prepare application for deployment (e.g., `app.yaml`, `package.json` for App Engine).
- [ ] Configure App Engine and Cloud Storage.
- [ ] Set up MongoDB on a service like MongoDB Atlas (if using MongoDB).
- [ ] Implement strategies for Caching API Responses.
- [ ] Implement strategies for Handling High Traffic and User Load.
- [ ] Implement Monitoring Application Health and Performance.

### 7. Supabase Configuration Guide

#### 7.1. Project Setup
- [ ] Create a new Supabase project on the Supabase website.
- [ ] Choose a project name, set a strong database password, and select a region.

#### 7.2. Get Supabase Connection Details
- [ ] Navigate to "Project Settings" -> "API" in the Supabase dashboard.
- [ ] Copy the "Project URL" and "`anon` (public) key".
- [ ] Copy the "`service_role` (secret) key" and keep it secure (do not expose in frontend).

#### 7.3. Set Up Your Database (Schema)
- [ ] Understand that `supabase/migrations` defines your database structure.
- [ ] View your tables in the Supabase dashboard under "Table Editor".
- [ ] Ensure initial tables are defined for:
    - [ ] `profiles` (for user data)
    - [ ] `items` (for Bungie data)
    - [ ] `loadouts`
    - [ ] `posts`, `comments` (for community features)

#### 7.4. Configure Authentication
- [ ] Go to "Authentication" -> "Providers" in the Supabase dashboard.
- [ ] Enable desired authentication providers (e.g., Email, Google).
- [ ] For Bungie OAuth:
    - [ ] Register your application with Bungie to get a "Client ID" and "Client Secret".
    - [ ] In Supabase, use the "Custom OAuth" provider option.
    - [ ] Input Bungie's Client ID and Client Secret.
    - [ ] Configure "Redirect URIs" in both Bungie's developer portal and Supabase's Custom OAuth settings to match exactly.

#### 7.5. Secure Your Data with Row Level Security (RLS)
- [ ] Understand RLS as rules for who can see/change what data.
- [ ] Go to "Authentication" -> "Policies" in the Supabase dashboard.
- [ ] Enable RLS for each table that contains sensitive user data.
- [ ] Create policies for each table (e.g., allowing users to read/write their own data).

### 8. Backend Development Plan

#### 8.1. Backend Framework Setup
- [x] Set up the core structure for your server-side application using Node.js with Express.js.
- [x] Install Express.js and configure it to handle incoming web requests.
- [x] Set up basic routing and middleware.

#### 8.2. Bungie API Proxy Endpoints
- [x] Implement API endpoints in your backend to fetch data from the Bungie.net API.
- [x] Ensure the proxy hides your API key and handles rate limiting.
- [x] Examples: `/api/bungie/profile`, `/api/bungie/inventory`, `/api/bungie/item/:id`.

#### 8.3. Bungie OAuth Authentication Flow
- [ ] Implement the full OAuth 2.0 process with Bungie for user login.
- [ ] Handle redirects, exchange authorization codes for access tokens, and refresh tokens.
- [ ] Securely store user tokens (likely in Supabase).

#### 8.4. Supabase Integration
- [ ] Set up your Node.js backend to communicate with your Supabase database and services.
- [ ] Use the Supabase client library for Node.js.
- [ ] Configure with your Supabase Project URL and the `service_role` key.

#### 8.5. Database Interaction (Supabase)
- [ ] Implement logic to store and retrieve data from Supabase.
- [ ] Model Destiny 2 Game Data (Items, Perks, Stats) in Supabase tables.
- [ ] Manage User Data and Profiles (linking Bungie ID to Supabase user).
- [ ] Manage Community Content (Posts, Builds, Comments).

#### 8.6. Business Logic Implementation
- [ ] Implement server-side logic for features like:
    - [ ] Calculating stats for builds.
    - [ ] Validating perk combinations.
    - [ ] Saving and retrieving user-created loadouts.
    - [ ] Handling creation, moderation, and retrieval of community posts and comments.

#### 8.7. Error Handling & Logging
- [ ] Implement robust error handling for API calls and database operations.
- [ ] Set up logging for debugging and monitoring.

#### 8.8. Testing
- [ ] Write unit and integration tests for backend logic and API endpoints.

#### 8.9. Deployment Preparation
- [ ] Prepare the backend for deployment (e.g., `Dockerfile` if containerizing, `app.yaml` for App Engine).
