# Database Setup Guide

## Prerequisites
- MySQL 8.0+ installed and running
- Node.js 18+

## Step 1: Create Database

```sql
CREATE DATABASE IF NOT EXISTS incroute;
```

## Step 2: Update `.env`

Uncomment and fill in your MySQL credentials in `.env`:

```env
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD="your_password"
DB_NAME="incroute"
DATABASE_URL="mysql://root:your_password@localhost:3306/incroute"
```

## Step 3: Generate Prisma Client

```bash
npx prisma generate
```

## Step 4: Push Schema to Database

```bash
npx prisma db push
```

This creates all tables (Users, Clients, Entities, ComplianceTasks, Documents, Invoices, Tickets, etc.) in your MySQL database.

## Step 5: (Optional) Seed Admin User

```bash
npx prisma db seed
```

Or register via API:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@incroute.com","password":"Admin@123","firstName":"Admin","lastName":"User"}'
```

## Step 6: Restart Server

```bash
npm run dev
```

## Verify

Visit: `http://localhost:3000/api/health`

Should return: `{"status":"ok"}`

## Tables Created

The following tables will be created by Prisma:

- `User` — Authentication & RBAC
- `Permission` — Granular permissions
- `UserPermission` — User-permission mapping
- `Session` — Active sessions
- `RefreshToken` — JWT refresh tokens
- `TeamAssignment` — Team member assignments
- `EntityAccess` — Entity access control
- `AuditLog` — All security events
- `PasswordReset` — Password reset tokens
- `Client` — CRM client records
- `Entity` — Business entities (Pvt Ltd, LLP, etc.)
- `ComplianceTask` — Compliance deadlines & tasks
- `Task` — Internal operations tasks
- `Document` — Document management
- `Invoice` — Billing & payments
- `Ticket` — Support tickets
- `Consultation` — Advisory sessions
- `LegalMatter` — Legal cases
- `TrademarkApp` — Trademark applications
- `Activity` — Activity timeline
- `ServiceRequest` — Onboarding requests
- `ServiceStep` — Service delivery steps
- `ServiceDocument` — Document collection
- `TimelineEntry` — Client timeline
- `WhatsAppMessage` — Message queue
- `MessageTemplate` — Communication templates
- `RelationshipAssignment` — RM assignments
