# INCroute Document Verification Portal

This project implements a secure role-based Customer & Partner portal for INCroute. Clients can upload incorporation, tax, and compliance filings, and partners can check portfolios, verify attachments, or reject submissions with review feedback in real-time.

---

## 1. Technology Stack

- **Frontend**: React 19, Vite, TailwindCSS, Motion
- **Backend**: Express (TypeScript), served via `tsx`
- **Database**: MySQL (via `mysql2/promise` connection pool + Prisma ORM)
- **Auth**: JWT-based (bcryptjs for hashing, jsonwebtoken for tokens)
- **File Storage**: Cloudflare R2 (S3-compatible)
- **AI**: Google GenAI (Gemini) for advisory features
- **Email**: Nodemailer + SMTP

---

## 2. Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your credentials (MySQL, SMTP, Cloudflare R2, Gemini API key).
4. Run the development server:
   ```bash
   npm run dev
   ```

---

## 3. Database

The app connects to two MySQL databases:

- **Leads DB** (`u453824837_Client`) — stores contact form submissions.
- **Platform DB** (`u453824837_Platform`) — main application data (users, sessions, clients, entities, compliance tasks, documents, invoices, tickets).

Schema migrations are managed via Prisma. Run `npx prisma db push` or apply SQL scripts like `migrate-documents.sql` in phpMyAdmin.

---

## 4. Authentication

All authentication is handled via REST API endpoints:

- `POST /api/auth/register` — create new user
- `POST /api/auth/login` — sign in (returns JWT access + refresh tokens)

Tokens are stored in `localStorage` on the client. Admin routes are protected by middleware that validates the JWT.

---

## 5. Build & Deploy

```bash
npm run build   # Vite frontend build + esbuild server bundle
npm start       # Run production server from dist/server.cjs
```
