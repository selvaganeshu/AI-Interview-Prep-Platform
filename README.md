# AI Interview Prep Platform

A full-stack interview preparation platform with backend and frontend projects.

## Structure

- `backend/` - Node.js + Express API server
- `frontend/` - React + Vite client application

## Setup

### Backend

1. Navigate to `backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with required environment variables such as:
   - `PORT`
   - `MONGO_URI`
   - `JWT_SECRET`
   - Cloudinary / email settings
4. Start the backend:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

## Notes

- The backend is an Express server using MongoDB.
- The frontend is a Vite React app with Redux and Tailwind CSS.
- Add `.env` values locally; do not commit secrets.
