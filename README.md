# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

# PETROGEL Plant & QC Portal

React + Vite frontend with an Express, Mongoose, and MongoDB API.

## Configure MongoDB

1. Copy `.env.example` to `.env`.
2. Set `MONGO_URI` to your MongoDB Atlas connection string. Keep credentials only in `.env`.
3. Set `PORT=5000` and, when needed, set `CLIENT_ORIGIN=http://localhost:5173`.

Example local configuration:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/petrogel_portal
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

## Run locally

Install dependencies:

```bash
npm install
```

Run the backend:

```bash
npm run server
```

Run the frontend in a second terminal:

```bash
npm run dev
```

Or run both with:

```bash
npm run dev:all
```

The API is available at `http://localhost:5000/api` and the Vite proxy makes it available to the frontend at `/api`.

Health check:

```text
GET http://localhost:5000/api/health
```

The response includes `status: "ok"` and a `database` value of `connected` or `unavailable`.

## API resources

CRUD routes are available for `/api/customers`, `/api/products`, `/api/formulations`, `/api/production`, `/api/qc`, `/api/lab`, `/api/inventory`, and `/api/requirements`. Alerts support `GET /api/alerts` and `PUT /api/alerts/:id`. Dashboard totals are served by `GET /api/dashboard`.

The frontend loads API data first and keeps the existing local demo snapshot as an offline fallback when MongoDB is unavailable. Once MongoDB is configured, CRUD mutations are written through to the API.

## Validation

```bash
npm run lint
npm run build
```
