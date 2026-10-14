DROP DATABASE IF EXISTS coop_cv_builder;
CREATE DATABASE coop_cv_builder;
USE coop_cv_builder;

CREATE TABLE templates (
    template_id INT AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(50) NOT NULL,
    style_type VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    city VARCHAR(50) NOT NULL,
    professional_summary TEXT NOT NULL,
    portfolio_link VARCHAR(255),
    linkedin_link VARCHAR(255),
    availability ENUM('Full-time COOP', 'Part-time Internship', 'Flexible') NOT NULL,
    preferred_industry VARCHAR(100) NOT NULL
);

CREATE TABLE cvs (
    cv_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    template_id INT NOT NULL,
    cv_title VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (template_id) REFERENCES templates(template_id)
);

CREATE TABLE education_records (
    education_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    university_name VARCHAR(120) NOT NULL,
    major VARCHAR(100) NOT NULL,
    degree_level ENUM('Diploma', 'Bachelor''s', 'Master''s') NOT NULL,
    gpa VARCHAR(20) NOT NULL,
    expected_graduation DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

CREATE TABLE skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    skill_category ENUM('Technical', 'Soft') NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

CREATE TABLE experience_entries (
    experience_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(120) NOT NULL,
    organization_name VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

CREATE TABLE companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(120) NOT NULL,
    field_name VARCHAR(80) NOT NULL,
    city VARCHAR(50) NOT NULL,
    work_mode ENUM('On-site', 'Hybrid', 'Remote') NOT NULL
);

CREATE TABLE opportunities (
    opportunity_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    opportunity_title VARCHAR(120) NOT NULL,
    deadline DATE NOT NULL,
    status_label ENUM('Open', 'Closing Soon', 'Remote', 'Reviewing') NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
);

INSERT INTO templates (template_name, style_type, description, is_featured) VALUES
('Classic', 'Professional', 'Clean layout with balanced spacing for academic and technical information.', FALSE),
('Modern', 'Bold', 'Highlighted headings and bold sections for strong first impressions.', TRUE),
('Minimal', 'Simple', 'Simple professional design suitable for internship and COOP submissions.', FALSE),
('Executive', 'Formal', 'Structured template for students targeting enterprise companies.', FALSE),
('Creative', 'Visual', 'A modern layout with stronger section emphasis for portfolio-focused students.', FALSE);

INSERT INTO students (
    full_name,
    email,
    phone_number,
    city,
    professional_summary,
    portfolio_link,
    linkedin_link,
    availability,
    preferred_industry
) VALUES
('Sara Alharbi', 'sara.alharbi@example.com', '0000000000', 'Riyadh', 'Information Systems student interested in frontend development and digital product design.', 'https://portfolio.example.com/sara', 'https://example.com/profile', 'Full-time COOP', 'Technology'),
('Noura Almutairi', 'noura.almutairi@example.com', '0000000000', 'Jeddah', 'Senior student with strong teamwork and documentation skills seeking a business analysis COOP placement.', 'https://portfolio.example.com/noura', 'https://example.com/profile', 'Flexible', 'Business Analysis'),
('Reema Alqahtani', 'reema.alqahtani@example.com', '0000000000', 'Dammam', 'Cybersecurity-focused student with hands-on academic projects in network monitoring and risk awareness.', 'https://portfolio.example.com/reema', 'https://example.com/profile', 'Full-time COOP', 'Cybersecurity'),
('Layan Alshehri', 'layan.alshehri@example.com', '0000000000', 'Riyadh', 'Student developer who enjoys building responsive websites and improving user experience for student tools.', 'https://portfolio.example.com/layan', 'https://example.com/profile', 'Part-time Internship', 'Web Development'),
('Huda Alotaibi', 'huda.alotaibi@example.com', '0000000000', 'Khobar', 'Analytical student interested in data-driven decision-making, reporting, and internship opportunities in tech.', 'https://portfolio.example.com/huda', 'https://example.com/profile', 'Flexible', 'Data Analysis');

INSERT INTO cvs (student_id, template_id, cv_title) VALUES
(1, 2, 'Sara Alharbi COOP CV'),
(2, 1, 'Noura Almutairi Internship CV'),
(3, 3, 'Reema Alqahtani Security CV'),
(4, 2, 'Layan Alshehri Frontend CV'),
(5, 4, 'Huda Alotaibi Analyst CV');

INSERT INTO education_records (
    student_id,
    university_name,
    major,
    degree_level,
    gpa,
    expected_graduation
) VALUES
(1, 'Prince Sultan University', 'Information Systems', 'Bachelor''s', '4.72 / 5', '2026-06-01'),
(2, 'Prince Sultan University', 'Information Systems', 'Bachelor''s', '4.43 / 5', '2026-06-01'),
(3, 'Imam Abdulrahman Bin Faisal University', 'Cybersecurity', 'Bachelor''s', '4.68 / 5', '2026-06-01'),
(4, 'King Saud University', 'Computer Information Systems', 'Bachelor''s', '4.51 / 5', '2026-06-01'),
(5, 'Prince Mohammad Bin Fahd University', 'Management Information Systems', 'Bachelor''s', '4.36 / 5', '2026-06-01');

INSERT INTO skills (student_id, skill_name, skill_category) VALUES
(1, 'HTML', 'Technical'),
(1, 'CSS', 'Technical'),
(1, 'Communication', 'Soft'),
(2, 'Requirements Gathering', 'Technical'),
(2, 'Teamwork', 'Soft'),
(3, 'Network Security', 'Technical'),
(3, 'Problem Solving', 'Soft'),
(4, 'Bootstrap', 'Technical'),
(4, 'JavaScript', 'Technical'),
(5, 'Data Visualization', 'Technical'),
(5, 'Time Management', 'Soft');

INSERT INTO experience_entries (student_id, title, organization_name, description) VALUES
(1, 'Web Development Project', 'IS311 Web Development', 'Built a responsive CV builder website using HTML, CSS, Bootstrap, and JavaScript.'),
(2, 'Business Analysis Case Study', 'Senior Project Course', 'Prepared user stories, process flows, and presentation reports for a simulated client case.'),
(3, 'Security Awareness Campaign', 'University Cyber Club', 'Created awareness materials and helped organize student sessions about phishing and password safety.'),
(4, 'Frontend Developer Trainee', 'Code Valley Bootcamp', 'Designed page layouts and improved usability for a student-focused dashboard prototype.'),
(5, 'Data Reporting Assistant', 'College Operations Unit', 'Supported reporting tasks by organizing spreadsheet data and summarizing weekly performance trends.');

INSERT INTO companies (company_name, field_name, city, work_mode) VALUES
('Saudi Digital Solutions', 'Web Development', 'Riyadh', 'On-site'),
('Future Tech', 'Cybersecurity', 'Riyadh', 'Hybrid'),
('Smart Systems Co.', 'Business Analysis', 'Jeddah', 'On-site'),
('Code Valley', 'Frontend Development', 'Remote', 'Remote'),
('SecureSphere', 'Information Security', 'Dammam', 'Hybrid');

INSERT INTO opportunities (company_id, opportunity_title, deadline, status_label) VALUES
(1, 'COOP Trainee - Web Development', '2026-05-12', 'Open'),
(2, 'Cybersecurity Intern', '2026-05-15', 'Closing Soon'),
(3, 'Business Analyst COOP', '2026-05-18', 'Open'),
(4, 'Frontend Developer Intern', '2026-05-21', 'Remote'),
(5, 'Information Security Trainee', '2026-05-25', 'Reviewing');

SELECT * FROM templates;
SELECT * FROM students;
SELECT * FROM cvs;
SELECT * FROM education_records;
SELECT * FROM skills;
SELECT * FROM experience_entries;
SELECT * FROM companies;
SELECT * FROM opportunities;
