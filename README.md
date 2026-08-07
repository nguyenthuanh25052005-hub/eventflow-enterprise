# EventFlow Enterprise

A fresh full-stack foundation for an enterprise event-management platform.

## Included in V0.1
- React + Vite frontend
- Node.js + Express API
- MongoDB + Mongoose
- JWT authentication
- Role-based access control
- Seeded SUPER_ADMIN account
- Operations dashboard
- Customer CRM: list/search/create/deactivate API
- Responsive enterprise shell/navigation
- Routed placeholders for Event Requests, Events, Tasks, Finance, Reports and Settings

## 1. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed:admin
npm run dev
```

Edit `.env` and set a working `MONGO_URI` and `JWT_SECRET` before seeding.

Default seed credentials from `.env.example`:
- Email: `admin@eventflow.local`
- Password: `Admin@123456`

Change them for any real deployment.

## 2. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173

## API foundation
- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/customers`
- `GET /api/customers/:id`
- `POST /api/customers`
- `PUT /api/customers/:id`
- `DELETE /api/customers/:id` (soft-deactivate)

## Product roadmap
1. Customer CRM
2. Event Request pipeline
3. Quotation + approval
4. Request → Event conversion
5. Event workspace
6. Tasks + team
7. Budget + expenses
8. Suppliers + equipment
9. Attendees + QR check-in
10. Reports + audit logs
