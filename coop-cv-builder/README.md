# COOP CV Builder

A student CV and COOP opportunity website using HTML, CSS, JavaScript, Node.js, Express and MySQL.

**Course:** IS311, Prince Sultan University

## Context and credit

Academic portfolio material shared by Daad Aljaber. Team-member credits in the original deliverables are retained; this collection does not claim sole authorship. Company case studies are coursework, not commissioned work or verified statements about current company systems.

## Files

See the source files and setup instructions below.

## Scope

Original academic results have not been independently validated. No reuse license is assigned to team or third-party material.

## Features

- CV creation, saved profiles and template selection
- Browser-print CV export
- Opportunity search, filters, favorites and recommendations
- MySQL-backed student record management

## Run locally

1. Install Node.js/npm and MySQL.
2. Import `phase3_mysql_schema.sql` into a local MySQL instance. Use a disposable demo database: inspect the SQL before running it.
3. Copy `.env.example` to `.env` and enter your local database settings.
4. Run `npm ci`, then `npm start`.
5. Open http://localhost:3000.

This is a local academic demonstration. Its APIs do not implement user authentication or authorization, and its static server serves the project directory. Do not deploy it publicly or use real personal data without addressing those limitations. GitHub Pages does not run the Node.js/MySQL backend.

## Verification

JavaScript syntax checked during packaging. The database-backed app was not run end-to-end in this review.
