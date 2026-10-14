COOP CV Builder - IS311 Phase 5

Project Overview:
This project is a full COOP and internship support website for students. In phase 5, the website is connected end-to-end so a student can create a CV profile, choose a template, preview the final result, explore opportunities, and manage saved records from one working system.

Phase 5 Features:
- Node.js and Express server for running the website locally
- MySQL database connection using mysql2
- Full CV profile save and update across related tables
- Dynamic template selection saved for the active CV
- Live preview page with printable PDF download using the browser print flow
- Opportunities page loaded from the database with search, filter, favorites, and personalized recommendations
- Manage Students page for select, update, and delete operations
- Home page live statistics from the database
- Draft persistence in localStorage so form progress is not lost

Additional Features Beyond Class Basics:
- Opportunity recommendation matching based on preferred industry, city, and remote availability
- Favorite opportunity saving in the browser
- Auto-saved CV draft state across pages
- Printable final CV preview for demonstration

Files Included:
- home.html
- CVBuilder.html
- templates.html
- Opportunities.html
- Database.html
- Tips.html
- Download.html
- styles.css
- script.js
- server.js
- db.js
- package.json
- package-lock.json
- .env.example
- phase3_mysql_schema.sql
- PHASE3_DATABASE_DESIGN.md
- PHASE4_NODEJS_GUIDE.md

Database Tables Used:
- students
- templates
- companies
- opportunities
- cvs
- education_records
- skills
- experience_entries

How to Run:
1. Open the project folder in VS Code or terminal.
2. Import the file phase3_mysql_schema.sql into MySQL.
3. Create a .env file using the values in .env.example.
4. Run: npm install
5. Run: npm start
6. Open http://localhost:3000 in your browser.

Suggested Demo Flow:
1. Open the home page and show the live statistics.
2. Open Templates and choose a template.
3. Open CV Builder and save a full student CV profile.
4. Open Preview & Download and show the generated CV preview.
5. Click Download PDF to print/save the CV.
6. Open Opportunities and show search, filters, favorites, and recommendations.
7. Open Manage Students and show update/delete operations.

Important Pages:
- Home page: http://localhost:3000/
- CV Builder page: http://localhost:3000/CVBuilder.html
- Templates page: http://localhost:3000/templates.html
- Opportunities page: http://localhost:3000/Opportunities.html
- Manage Students page: http://localhost:3000/Database.html
- Preview page: http://localhost:3000/Download.html

Main API Routes:
- GET /api/stats
- GET /api/students
- GET /api/students/:id
- PUT /api/students/:id
- DELETE /api/students/:id
- GET /api/templates
- GET /api/opportunities
- GET /api/cv-profiles/latest
- GET /api/cv-profiles/:id
- POST /api/cv-profiles
- PUT /api/cv-profiles/:id

Summary:
This phase 5 version turns the website into a full functional project rather than a static design demo. It combines frontend pages, database storage, CRUD operations, template selection, preview/download, and extra intelligent features for the final viva.
