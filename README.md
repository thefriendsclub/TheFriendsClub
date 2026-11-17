# The Friends Club

> A modern, high-performance community and social club platform built for **The Friends Club N3**, Nayapalli, Bhubaneswar (Est. 2006). Designed with a refined midnight navy, forest emerald, and champagne gold aesthetic, fluid GSAP animations, community stories, membership applications, event management, and a hardened administrative dashboard.

[![Built by S AKASH DORA](https://img.shields.io/badge/Architected%20%26%20Built%20By-S%20AKASH%20DORA-0b241f?style=flat&logo=react)](https://portfolio-azureakash.vercel.app/)
[![GitHub: sakashdora](https://img.shields.io/badge/GitHub-sakashdora-181717?style=flat&logo=github)](https://github.com/sakashdora)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)
[![Framework: React 19](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%207-61dafb?style=flat&logo=react)](https://react.dev/)
[![Backend: Express 5](https://img.shields.io/badge/Backend-Express%205%20%7C%20Node%2024-white?style=flat&logo=express)](https://expressjs.com/)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)

---

## 👨‍💻 Developer & Authorship Reference

This application was engineered, designed, and developed from the ground up by:

* **Lead Architect & Developer:** **S AKASH DORA**
* **Portfolio:** [https://portfolio-azureakash.vercel.app/](https://portfolio-azureakash.vercel.app/)
* **GitHub Profile:** [https://github.com/sakashdora](https://github.com/sakashdora)
* **Organization:** The Friends Club N3, Nayapalli, Bhubaneswar, Odisha, India
* **Repository:** [https://github.com/thefriendsclub/TheFriendsClub](https://github.com/thefriendsclub/TheFriendsClub)

---

## ✨ Key Features & Architecture

### 1. Public Experience
* **Typographic & Illustrated Hero:** Editorial header with live time/date, club motto, and reduced-motion-aware GSAP animations.
* **Community Stories & Work Carousel:** Interactive event and service showcases (Rath Yatra Water Service, Free Eye Camps, Independence Day celebrations, Ganesh Puja).
* **Founder & Community Pillars:** Featuring the club's co-founder and dedicated community volunteer wings.
* **Event Discovery & Filterable Gallery:** Accessible media lightbox with keyboard navigation, focus trapping, and category filtering.
* **Membership Application Workflow:** Validated application intake with consent handling and instant server verification.
* **Newsletter Subscription:** Automated deduplication and validation.

### 2. Administrative Clubhouse Dashboard (`/admin`)
* **Real-time Overview:** Live counts for total applications, pending reviews, upcoming calendar events, and newsletter subscribers.
* **Database Health Indicator:** Real-time topbar badge reflecting connection state (`Supabase` cloud PostgreSQL vs `SQLite` local fallback).
* **Application Review & CRM:** Status controls (`pending`, `approved`, `declined`), search filtering, applicant details review.
* **OWASP Secure CSV Export:** Client-side CSV generation with formula injection sanitization (escapes `=`, `+`, `-`, `@`).
* **Event Management:** Create, edit, and delete upcoming club events with image HTTPS URL and date validation.

### 3. Enterprise-Grade Security
* **Zero Credential Leakage:** Private Supabase service role keys and secrets remain strictly on the backend.
* **Session Protection:** SHA-256 session token hashing, issued over `HttpOnly`, `SameSite=Strict`, `Path=/` browser cookies.
* **Password Security:** Multi-round `scrypt` key derivation with unique 16-byte cryptographic salts.
* **CSRF Defense:** Origin header enforcement preventing cross-site state mutations on all API endpoints.
* **Rate Limiting:** IP-based throttles preventing brute-force attacks on login, membership, and newsletter submissions.
* **Row Level Security (RLS):** Strict PostgreSQL policies ensuring anonymous users have read-only access to public events and zero access to administrative sessions or applicant records.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite 7, GSAP 3.13 (ScrollTrigger, matchMedia), Lucide React
* **Backend:** Express 5.1 (Node.js >= 24)
* **Cloud Database:** Supabase (PostgreSQL with Row Level Security)
* **Local Fallback Database:** Node.js native `sqlite` (`DatabaseSync`) with WAL mode
* **Deployment Target:** Vercel (Static Frontend + Serverless API Functions)

---

## 🚀 Getting Started Locally

### Prerequisites
* Node.js `>= 24.0.0`
* npm `>= 10.0.0`

### Installation
```sh
git clone https://github.com/thefriendsclub/TheFriendsClub.git
cd TheFriendsClub
npm install
```

### Environment Configuration
Copy the template and fill in your Supabase credentials:
```sh
cp .env.example .env
```
Edit `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-secret-key
PORT=3001
HOST=127.0.0.1
NODE_ENV=development
APP_ORIGIN=http://127.0.0.1:3001
```

### Run Development Server
```sh
npm run dev
```
* **Website:** [http://127.0.0.1:5173](http://127.0.0.1:5173)
* **Admin Dashboard:** [http://127.0.0.1:5173/admin](http://127.0.0.1:5173/admin)
* **API Backend:** [http://127.0.0.1:3001/api](http://127.0.0.1:3001/api)

### Set Up Administrator Account
```sh
npm run admin:setup
```

### Migrate Local SQLite Data to Supabase
```sh
npm run db:migrate
```

### Run Automated Tests
```sh
npm test
```
*(Runs all 10 unit and API security integration tests)*

---

## ☁️ Deployment to Vercel

The application is pre-configured for **Vercel** with static frontend routing and a serverless API function in `api/index.js`.

### 1. Import Repository into Vercel
1. Push your repository to GitHub:
   ```sh
   git remote add origin https://github.com/thefriendsclub/TheFriendsClub.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Select the `thefriendsclub/TheFriendsClub` repository.

### 2. Configure Environment Variables in Vercel
In the Vercel project deployment settings, add the following under **Environment Variables**:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `SUPABASE_URL` | `https://your-project.supabase.co` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` or `eyJh...` | Secret service role key for DB operations |
| `NODE_ENV` | `production` | Enforces production security and cookie policies |
| `APP_ORIGIN` | `https://your-vercel-domain.vercel.app` | Production origin for CSRF validation |

### 3. Deploy
Click **Deploy**. Vercel will:
- Execute `npm run build` (`vite build`) producing optimized assets in `dist/`.
- Deploy `api/index.js` as the serverless API handler for `/api/*`.
- Serve the Single Page Application on your production URL.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

© 2026 **S AKASH DORA** ([Portfolio](https://portfolio-azureakash.vercel.app/) · [GitHub](https://github.com/sakashdora)). All rights reserved.
