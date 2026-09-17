# 🎬 Kuro Anime Tracker

A sleek, full-stack web application designed to help users search for anime, manage their personal watchlists, log daily viewing journals, and track their watch statistics in a clean dark-mode interface.
<br><br>Live :- https://kuro-anime-tracker.vercel.app<br>
---

## 💡 What the Website Does (Core Features)

*   🔍 **Live Search & Discovery:** Users can search for any anime dynamically, view currently trending series, and see active seasonal airing schedules.
*   📝 **Personal Watchlist Management:** Users can add anime to their personal lists and update their progress (e.g., change watch status, update current episode number, and log personal scores).
*   📊 **Watch Statistics Engine:** The app automatically processes user lists to display analytical graphs like Total Time Spent Watching, Top Genres, and favorite animation studios.
*   🔐 **Secure User Accounts:** Features complete user authentication using emails and passwords, along with a "Sign in with Google" button.

---

## ⚙️ How It Works (Under the Hood)

Kuro is built as an all-in-one full-stack **Next.js** application. Instead of managing a separate frontend website and a backend server, everything is handled inside a single folder layout:

### 1. The Data Source (Where the anime comes from)
The app does not store millions of anime files in its own database. Instead, whenever a user searches for an anime or views a trend, the frontend sends a query to the **AniList GraphQL API**. This fetches up-to-date titles, descriptions, and cover images instantly from the internet.

### 2. User Accounts & Tracking (Where your list is saved)
When a user clicks "Add to List" or updates an episode counter, that information belongs specifically to them. 
*   The data is securely processed through **Next.js Server API Routes** (hidden backend endpoints built right into the app folder structure).
*   The backend saves and updates this personal data inside a cloud database running on **MongoDB Atlas** using **Mongoose** schemas to keep the records clean and structured.

### 3. Authentication & Security
User login sessions are securely managed by **Auth.js (NextAuth)**. This system encrypts passwords, signs users in securely, and protects private profile routes so users can only view and edit their own personal tracker information.

---

## 🛠️ Built With

*   **Frontend & Backend:** Next.js (React Framework)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Dark Mode Design)
*   **Database:** MongoDB & Mongoose ORM
*   **Authentication:** NextAuth.js & Google OAuth

---

## 📄 License

This project is open-source and available under the **MIT License**.
