# Phase 3 Database Design

This phase adds the MySQL database for the existing COOP CV Builder website from phases 1 and 2.

## Database name

`coop_cv_builder`

## Tables included

1. `templates`
   Stores the CV templates shown on the Templates page.

2. `students`
   Stores the personal information entered in the CV Builder form, including contact details, summary, links, availability, and preferred industry.

3. `cvs`
   Stores each CV created by a student and links it to the selected template.

4. `education_records`
   Stores the education section from the CV Builder page.

5. `skills`
   Stores both technical and soft skills for each student.

6. `experience_entries`
   Stores project, internship, or course experience added to the CV.

7. `companies`
   Stores the companies displayed on the Opportunities page.

8. `opportunities`
   Stores internship and COOP openings with deadline and status.

## Main relationships

- One student can have one or more CVs.
- One student can have one or more education records.
- One student can have many skills.
- One student can have many experience entries.
- One template can be used by many CVs.
- One company can publish many opportunities.

## Seed data

The SQL file inserts sample data so the database is ready for demonstration:

- 5 templates
- 5 students
- 5 CVs
- 5 education records
- 11 skills
- 5 experience entries
- 5 companies
- 5 opportunities

## File to run

Run this file in MySQL:

`phase3_mysql_schema.sql`

It will:

1. Create the database
2. Create all tables with primary keys and foreign keys
3. Insert sample rows
4. Run `SELECT` statements at the end so the tables can be shown during discussion or demo

## Why this design matches the website

- `CVBuilder.html` maps to `students`, `education_records`, `skills`, and `experience_entries`
- `templates.html` maps to `templates`
- `Opportunities.html` maps to `companies` and `opportunities`
- The `cvs` table connects the student profile with the selected template for later phases using Node.js and full website functionality
