# ConnectUs Backend

## Features
- SOS Alert System
- Business Listings Management
- Community and User Management
- JWT Authentication
- MongoDB Data Storage
- Email Notifications (pluggable)

## Setup
1. Copy `.env.example` to `.env` and fill in your credentials.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

## Endpoints
- `/api/auth` — User authentication and registration
- `/api/community` — Community management
- `/api/business` — Business listings CRUD
- `/api/sos` — SOS alert system
