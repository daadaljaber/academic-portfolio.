# Phase 4 Node.js + MySQL Guide

## What was added

This phase connects the website to the MySQL database using Node.js and Express.

Implemented DML operations:
- `SELECT` students, templates, and opportunities
- `INSERT` a new student record from `CVBuilder.html`
- `UPDATE` a student record from `Database.html`
- `DELETE` a student record from `Database.html`

## Files added

- `server.js` - Express server and API routes
- `db.js` - MySQL connection pool
- `package.json` - Node.js project dependencies
- `.env.example` - database configuration example
- `Database.html` - Phase 4 CRUD management page

## How to run

1. Import `phase3_mysql_schema.sql` into MySQL.
2. Create a `.env` file based on `.env.example`.
3. Install packages:

```bash
npm install
```

4. Start the server:

```bash
npm start
```

5. Open:

- `http://localhost:3000/` for the website
- `http://localhost:3000/Database.html` for update and delete operations

## API routes used

- `GET /api/students`
- `POST /api/students`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`
- `GET /api/opportunities`
- `GET /api/templates`
