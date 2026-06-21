# Trao AI Travel Planner

![Trao AI](https://via.placeholder.com/1200x600.png?text=Trao+AI+Travel+Planner)

Trao AI is a production-ready SaaS application that generates personalized travel itineraries, estimated budgets, and weather-aware packing lists using Google's Gemini 2.5 Flash API.

## 🚀 Features

- **Smart Itineraries:** Day-by-day plans tailored to your destination, budget, and personal interests.
- **AI Weather-Aware Packing Assistant:** Solves the common traveler problem of forgetting essential items by generating a personalized packing list based on the destination's weather and planned activities. Users can interactively check off items as they pack!
- **Editable Trips:** Don't like a specific day? Click "Regenerate Day" and the AI will rewrite just that day based on your custom prompt.
- **Budget Estimation:** Realistic AI estimations for flights, food, and stays based on your budget tier (Low/Medium/High).
- **Hotel Suggestions:** Get 3 curated hotel recommendations (budget, mid-range, luxury) per trip.

## 🧱 Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4 (AI Globe Theme: Blue, Teal, Orange, Slate 900)
- Framer Motion
- React Hook Form + Zod
- Lucide React Icons

### Backend
- Node.js & Express.js
- TypeScript
- MongoDB Atlas (Mongoose ODM)
- JWT Authentication & bcrypt
- Google Gen AI SDK (`@google/genai`)

## 🏗️ Architecture

The project is structured as a monorepo with separated `frontend` and `backend` directories.

- **Frontend:** Built with Next.js App Router. Uses custom Server/Client components, protected routes via local storage JWT checking (for MVP), and Framer motion for seamless micro-interactions.
- **Backend:** Layered architecture (`controllers`, `routes`, `models`, `services`, `middleware`, `utils`).
- **AI Agent Design:** The `aiService` integrates with Gemini 2.5 Flash using strict JSON schema validation (`responseSchema`). This guarantees the AI output precisely matches the TypeScript interfaces for itineraries, hotels, budgets, and packing lists. It includes an exponential backoff retry mechanism for handling rate limits gracefully.

## 🔐 Authentication Approach
- Users register with Name, Email, and Password.
- Passwords are salted and hashed using `bcrypt` before hitting MongoDB.
- A JWT is generated upon login, granting access to protected routes via the `authMiddleware`.
- Users can only access, edit, and delete trips tied to their own `userId`.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas URI
- Google Gemini API Key

### 1. Clone & Install
```bash
git clone <repo-url>
cd ai-travel-planner
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key
```
Run the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Run the frontend:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📦 Deployment Steps

### Frontend (Vercel)
1. Push the repo to GitHub.
2. Go to Vercel and import the repository.
3. Set the **Root Directory** to `frontend`.
4. Deploy.

### Backend (Render / Railway)
1. Go to Render or Railway and create a New Web Service.
2. Connect the GitHub repo and set **Root Directory** to `backend`.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add your `.env` variables in the dashboard.
6. Deploy.

## 🤔 Design Decisions & Trade-offs
- **Client-Side Auth State:** For this MVP, JWTs are stored in `localStorage` and checked on the client side. In a strict enterprise scenario, `HttpOnly` cookies would be used to mitigate XSS attacks.
- **Tailwind v4:** Adopted the latest Tailwind v4 alpha via Next.js 15, which uses pure CSS variables instead of `tailwind.config.ts`.
- **Database Schema:** `itinerary` and `packingList` are stored as nested JSON arrays (`Schema.Types.Mixed`) to accommodate the dynamic output from Gemini, rather than creating strict sub-collections, optimizing for read speed.

## ⚠️ Known Limitations
- Email Verification is designed in the model but the SMTP email transport (Nodemailer) is currently mocked/pending setup.
- Rate limiting middleware is installed but currently uses basic memory store (recommended to use Redis for production).
