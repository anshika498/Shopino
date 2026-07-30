# Shopino – AI-Powered Price Comparison & Aggregators Platform

**🌟 Live Demo**: [https://shopino.vercel.app](https://shopino.vercel.app) (Replace with your actual Vercel URL)
**⚙️ Live API**: `https://shopino-qmdf.onrender.com/api`

Instead of visiting multiple platforms individually, users search once on Shopino and compare prices, delivery estimates, discount percentages, cashbacks, coupon codes, and seller ratings side-by-side. Additionally, users can toggle a detailed **Comparison Matrix** (comparing up to 3 products side-by-side), set **Price Drop Alerts**, and consult our **AI Shopping Assistant** powered by Google Gemini.
---
## Technical Stack

### Frontend
- **Framework**: React 19, Vite (Fast Hot Module Replacement)
- **Styling**: Tailwind CSS v4 (Sleek modern color system, glassmorphism, responsive grid layout)
- **State Management**: Redux Toolkit (Orchestrating auth sessions, comparisons, theme preferences, and AI drawers)
- **Routing**: React Router DOM (Dynamic protected routes for dashboard, wishlist, and admin dashboard)
- **Data Visualizations**: Recharts (Interactive price history charts tracking price drop waves)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB & Mongoose (Schema validation, query filters, composite unique indexes)
- **Security**: JWT Authentication (JSON Web Tokens), BCrypt.js (Password hashing)
- **AI Engine**: Google Generative AI (Gemini 1.5/2.5 Flash API with intelligent rule-based local fallbacks if API keys are absent)

---

## Directory Structure

```
Shopino/
├── README.md (Root documentation)
├── server/
│   ├── server.js (Express bootstrap)
│   ├── .env (Config parameters)
│   ├── config/
│   │   └── db.js (MongoDB configuration)
│   ├── controllers/ (Auth, Products, Alerts, Wishlists, AI)
│   ├── models/ (User, Product, PriceHistory, Wishlist, Alert)
│   ├── routes/ (Express routers)
│   ├── middleware/ (JWT protection & centralized error handles)
│   └── services/
│       ├── scraperService.js (Dynamic mock price scraper)
│       └── geminiService.js (Gemini AI integration service)
└── client/
    ├── vite.config.js (Vite + Tailwind v4 config)
    ├── index.html
    └── src/
        ├── main.jsx (Redux & Route bootstrap)
        ├── index.css (Tailwind direct imports & design system tokens)
        ├── App.jsx (Orchestrating routes)
        ├── store/ (Redux store, auth/ui slices)
        ├── components/ (Navbar, Footer, ProductCard, PriceChart, etc.)
        └── pages/ (Home, SearchResults, ProductDetails, Wishlist, etc.)
```

---

## Installation & Local Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

### 1. Clone the repository and install Backend Dependencies
Go to the server folder and install packages:
```bash
cd server
npm install
```

### 2. Configure Backend Environment Variables
Create a `.env` file in the `server` directory (a template `.env` is already provided):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopino
JWT_SECRET=shopinosecretjwtkey123
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```
> **Note**: If you leave `GEMINI_API_KEY` blank, the AI Shopping Assistant will automatically toggle to a smart **Demo Mode** utilizing local rule-based price analysis.

### 3. Run Backend Development Server
```bash
npm run dev
```
The server will boot up on `http://localhost:5000` and attempt connection to MongoDB.

### 4. Install Client Dependencies
Open a separate terminal window, go to the client folder, and install packages:
```bash
cd client
npm install
```

### 5. Start Client Dev Server
```bash
npm run dev
```
Open your browser and navigate to the address shown (usually `http://localhost:5173`).

---

## Core Features Walkthrough

1. **Universal Aggregated Search**: Enter query terms like `iPhone 16` or `Nike Air Max` on the Home page search card. The backend scraper service dynamically populates 4-6 platform listings (prices, coupons, speeds) and caches them.
2. **Deals & Filters**: Refine search results by price threshold, category tabs, or store tags. Highlight badges automatically denote the **Lowest Price** deal.
3. **Comparison Matrix**: Click **Add to Compare** on up to 3 products, then click **Compare** on the navbar or results panel. A spec-sheet matrix evaluates sizes, weights, details, and price ranges side-by-side.
4. **Price Drop Alerts**: Sign up and log in. Click **Price Drop Alert** on a product details page. Set your target price threshold. The alert records under your **User Dashboard**.
5. **Interactive Recharts**: View historical trends over 7, 30, or 90 days. Line curves depict fluctuations and holiday sale dips.
6. **Gemini Shopping Assistant**: Open the **Ask AI** drawer from the navbar. Input comparisons (e.g. `Compare iPhone 16 and Galaxy S25`) or ask for buy-time suggestions. The agent reads data context directly from the MongoDB product listings.
7. **Wishlists & Profile Management**: Bookmark favorites into your personal wishlist and update settings in real-time.
8. **Admin Panel**: Registered administrators can view global statistics charts and view registered user profiles.
