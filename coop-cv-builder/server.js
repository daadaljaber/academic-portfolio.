const express = require("express");
const path = require("path");
const pool = require("./db");

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

function normalizeSkillList(value) {
  if (!value) {
    return [];
  }

  return [...new Set(
    String(value)
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean)
  )];
}

function buildProfilePayload({
  full_name,
  email,
  phone_number,
  city,
  professional_summary,
  availability,
  preferred_industry,
  university_name,
  major,
  degree_level,
  gpa,
  expected_graduation,
  experience_title,
  organization_name,
  experience_description,
}) {
  return {
    student: {
      full_name,
      email,
      phone_number,
      city,
      professional_summary,
      availability,
      preferred_industry,
    },
    education: {
      university_name,
      major,
      degree_level,
      gpa,
      expected_graduation,
    },
    experience: {
      experience_title,
      organization_name,
      experience_description,
    },
  };
}

function validateProfile(payload) {
  const requiredStudentFields = Object.values(payload.student);
  const requiredEducationFields = Object.values(payload.education);
  const requiredExperienceFields = Object.values(payload.experience);

  return [...requiredStudentFields, ...requiredEducationFields, ...requiredExperienceFields]
    .every((value) => String(value || "").trim() !== "");
}

async function getPreferredTemplateId(connection) {
  const [rows] = await connection.query(
    `SELECT template_id
     FROM templates
     ORDER BY is_featured DESC, template_id ASC
     LIMIT 1`
  );

  return rows[0]?.template_id || null;
}

async function resolveTemplateId(connection, requestedTemplateId) {
  const parsedId = Number(requestedTemplateId);

  if (parsedId) {
    const [rows] = await connection.query(
      "SELECT template_id FROM templates WHERE template_id = ? LIMIT 1",
      [parsedId]
    );

    if (rows.length > 0) {
      return parsedId;
    }
  }

  return getPreferredTemplateId(connection);
}

async function fetchCvProfile(studentId) {
  const normalizedId = Number(studentId);

  if (!normalizedId) {
    return null;
  }

  const [[studentRows], [educationRows], [experienceRows], [skillRows], [cvRows]] = await Promise.all([
    pool.query(
      `SELECT
        student_id,
        full_name,
        email,
        phone_number,
        city,
        professional_summary,
        portfolio_link,
        linkedin_link,
        availability,
        preferred_industry
      FROM students
      WHERE student_id = ?`,
      [normalizedId]
    ),
    pool.query(
      `SELECT
        education_id,
        university_name,
        major,
        degree_level,
        gpa,
        DATE_FORMAT(expected_graduation, '%Y-%m') AS expected_graduation
      FROM education_records
      WHERE student_id = ?
      ORDER BY education_id ASC
      LIMIT 1`,
      [normalizedId]
    ),
    pool.query(
      `SELECT
        experience_id,
        title AS experience_title,
        organization_name,
        description AS experience_description
      FROM experience_entries
      WHERE student_id = ?
      ORDER BY experience_id ASC
      LIMIT 1`,
      [normalizedId]
    ),
    pool.query(
      `SELECT skill_name, skill_category
      FROM skills
      WHERE student_id = ?
      ORDER BY skill_id ASC`,
      [normalizedId]
    ),
    pool.query(
      `SELECT
        cv_id,
        cv_title,
        cv.template_id,
        t.template_name,
        t.style_type,
        t.description,
        t.is_featured
      FROM cvs cv
      JOIN templates t ON cv.template_id = t.template_id
      WHERE cv.student_id = ?
      ORDER BY cv.updated_at DESC, cv.cv_id DESC
      LIMIT 1`,
      [normalizedId]
    ),
  ]);

  const student = studentRows[0];

  if (!student) {
    return null;
  }

  const technicalSkills = skillRows
    .filter((skill) => skill.skill_category === "Technical")
    .map((skill) => skill.skill_name);

  const softSkills = skillRows
    .filter((skill) => skill.skill_category === "Soft")
    .map((skill) => skill.skill_name);

  return {
    ...student,
    education: educationRows[0] || null,
    experience: experienceRows[0] || null,
    technical_skills: technicalSkills,
    soft_skills: softSkills,
    selected_template: cvRows[0] || null,
  };
}

app.get("/api/stats", async (req, res) => {
  try {
    const [[studentCount], [templateCount], [opportunityCount], [latestStudentRows]] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total_students FROM students"),
      pool.query("SELECT COUNT(*) AS total_templates FROM templates"),
      pool.query("SELECT COUNT(*) AS total_opportunities FROM opportunities"),
      pool.query(
        `SELECT full_name, preferred_industry
         FROM students
         ORDER BY student_id DESC
         LIMIT 1`
      ),
    ]);

    res.json({
      total_students: studentCount[0].total_students,
      total_templates: templateCount[0].total_templates,
      total_opportunities: opportunityCount[0].total_opportunities,
      latest_student: latestStudentRows[0] || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load home page statistics.", error: error.message });
  }
});

app.get("/api/students", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        student_id,
        full_name,
        email,
        phone_number,
        city,
        professional_summary,
        portfolio_link,
        linkedin_link,
        availability,
        preferred_industry
      FROM students
      ORDER BY student_id DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to load students.", error: error.message });
  }
});

app.get("/api/students/:id", async (req, res) => {
  const profile = await fetchCvProfile(req.params.id).catch(() => null);

  if (!profile) {
    return res.status(404).json({ message: "Student profile not found." });
  }

  res.json(profile);
});

app.get("/api/cv-profiles/latest", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT student_id
       FROM students
       ORDER BY student_id DESC
       LIMIT 1`
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No saved CV profiles were found yet." });
    }

    const profile = await fetchCvProfile(rows[0].student_id);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Failed to load the latest CV profile.", error: error.message });
  }
});

app.get("/api/cv-profiles/:id", async (req, res) => {
  try {
    const profile = await fetchCvProfile(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: "CV profile not found." });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Failed to load CV profile.", error: error.message });
  }
});

app.get("/api/opportunities", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        o.opportunity_id,
        c.company_name,
        c.field_name,
        c.city,
        c.work_mode,
        o.opportunity_title,
        DATE_FORMAT(o.deadline, '%Y-%m-%d') AS deadline,
        o.status_label
      FROM opportunities o
      JOIN companies c ON o.company_id = c.company_id
      ORDER BY o.deadline ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to load opportunities.", error: error.message });
  }
});

app.get("/api/templates", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        template_id,
        template_name,
        style_type,
        description,
        is_featured
      FROM templates
      ORDER BY template_id ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to load templates.", error: error.message });
  }
});

app.post("/api/students", async (req, res) => {
  const {
    full_name,
    email,
    phone_number,
    city,
    professional_summary,
    portfolio_link,
    linkedin_link,
    availability,
    preferred_industry,
  } = req.body;

  if (
    !full_name ||
    !email ||
    !phone_number ||
    !city ||
    !professional_summary ||
    !availability ||
    !preferred_industry
  ) {
    return res.status(400).json({ message: "Please fill in all required student fields." });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO students
      (full_name, email, phone_number, city, professional_summary, portfolio_link, linkedin_link, availability, preferred_industry)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name,
        email,
        phone_number,
        city,
        professional_summary,
        portfolio_link || null,
        linkedin_link || null,
        availability,
        preferred_industry,
      ]
    );

    res.status(201).json({
      message: "Student CV profile saved successfully.",
      studentId: result.insertId,
    });
  } catch (error) {
    const statusCode = error.code === "ER_DUP_ENTRY" ? 409 : 500;
    res.status(statusCode).json({
      message: error.code === "ER_DUP_ENTRY"
        ? "This email already exists in the database."
        : "Failed to save student profile.",
      error: error.message,
    });
  }
});

app.post("/api/cv-profiles", async (req, res) => {
  const {
    portfolio_link,
    linkedin_link,
    technical_skills,
    soft_skills,
    selected_template_id,
  } = req.body;
  const profilePayload = buildProfilePayload(req.body);

  if (!validateProfile(profilePayload)) {
    return res.status(400).json({ message: "Please complete all required CV sections before saving." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const templateId = await resolveTemplateId(connection, selected_template_id);

    const [studentResult] = await connection.query(
      `INSERT INTO students
      (full_name, email, phone_number, city, professional_summary, portfolio_link, linkedin_link, availability, preferred_industry)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profilePayload.student.full_name,
        profilePayload.student.email,
        profilePayload.student.phone_number,
        profilePayload.student.city,
        profilePayload.student.professional_summary,
        portfolio_link || null,
        linkedin_link || null,
        profilePayload.student.availability,
        profilePayload.student.preferred_industry,
      ]
    );

    const studentId = studentResult.insertId;

    await connection.query(
      `INSERT INTO education_records
      (student_id, university_name, major, degree_level, gpa, expected_graduation)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        profilePayload.education.university_name,
        profilePayload.education.major,
        profilePayload.education.degree_level,
        profilePayload.education.gpa,
        `${profilePayload.education.expected_graduation}-01`,
      ]
    );

    await connection.query(
      `INSERT INTO experience_entries
      (student_id, title, organization_name, description)
      VALUES (?, ?, ?, ?)`,
      [
        studentId,
        profilePayload.experience.experience_title,
        profilePayload.experience.organization_name,
        profilePayload.experience.experience_description,
      ]
    );

    const skillRows = [
      ...normalizeSkillList(technical_skills).map((skillName) => [studentId, skillName, "Technical"]),
      ...normalizeSkillList(soft_skills).map((skillName) => [studentId, skillName, "Soft"]),
    ];

    if (skillRows.length > 0) {
      await connection.query(
        "INSERT INTO skills (student_id, skill_name, skill_category) VALUES ?",
        [skillRows]
      );
    }

    const [cvResult] = await connection.query(
      `INSERT INTO cvs
      (student_id, template_id, cv_title)
      VALUES (?, ?, ?)`,
      [studentId, templateId, `${profilePayload.student.full_name} CV`]
    );

    await connection.commit();

    res.status(201).json({
      message: "Full CV profile saved successfully.",
      studentId,
      cvId: cvResult.insertId,
      selectedTemplateId: templateId,
    });
  } catch (error) {
    await connection.rollback();
    const statusCode = error.code === "ER_DUP_ENTRY" ? 409 : 500;
    res.status(statusCode).json({
      message: error.code === "ER_DUP_ENTRY"
        ? "This email already exists in the database."
        : "Failed to save the full CV profile.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

app.put("/api/cv-profiles/:id", async (req, res) => {
  const studentId = Number(req.params.id);
  const {
    portfolio_link,
    linkedin_link,
    technical_skills,
    soft_skills,
    selected_template_id,
  } = req.body;
  const profilePayload = buildProfilePayload(req.body);

  if (!studentId) {
    return res.status(400).json({ message: "A valid student ID is required." });
  }

  if (!validateProfile(profilePayload)) {
    return res.status(400).json({ message: "Please complete all required CV sections before updating." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const templateId = await resolveTemplateId(connection, selected_template_id);

    const [studentUpdate] = await connection.query(
      `UPDATE students
      SET full_name = ?, email = ?, phone_number = ?, city = ?, professional_summary = ?,
          portfolio_link = ?, linkedin_link = ?, availability = ?, preferred_industry = ?
      WHERE student_id = ?`,
      [
        profilePayload.student.full_name,
        profilePayload.student.email,
        profilePayload.student.phone_number,
        profilePayload.student.city,
        profilePayload.student.professional_summary,
        portfolio_link || null,
        linkedin_link || null,
        profilePayload.student.availability,
        profilePayload.student.preferred_industry,
        studentId,
      ]
    );

    if (studentUpdate.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Student profile not found." });
    }

    const [educationRows] = await connection.query(
      "SELECT education_id FROM education_records WHERE student_id = ? ORDER BY education_id ASC LIMIT 1",
      [studentId]
    );

    if (educationRows.length > 0) {
      await connection.query(
        `UPDATE education_records
        SET university_name = ?, major = ?, degree_level = ?, gpa = ?, expected_graduation = ?
        WHERE education_id = ?`,
        [
          profilePayload.education.university_name,
          profilePayload.education.major,
          profilePayload.education.degree_level,
          profilePayload.education.gpa,
          `${profilePayload.education.expected_graduation}-01`,
          educationRows[0].education_id,
        ]
      );
    } else {
      await connection.query(
        `INSERT INTO education_records
        (student_id, university_name, major, degree_level, gpa, expected_graduation)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          studentId,
          profilePayload.education.university_name,
          profilePayload.education.major,
          profilePayload.education.degree_level,
          profilePayload.education.gpa,
          `${profilePayload.education.expected_graduation}-01`,
        ]
      );
    }

    const [experienceRows] = await connection.query(
      "SELECT experience_id FROM experience_entries WHERE student_id = ? ORDER BY experience_id ASC LIMIT 1",
      [studentId]
    );

    if (experienceRows.length > 0) {
      await connection.query(
        `UPDATE experience_entries
        SET title = ?, organization_name = ?, description = ?
        WHERE experience_id = ?`,
        [
          profilePayload.experience.experience_title,
          profilePayload.experience.organization_name,
          profilePayload.experience.experience_description,
          experienceRows[0].experience_id,
        ]
      );
    } else {
      await connection.query(
        `INSERT INTO experience_entries
        (student_id, title, organization_name, description)
        VALUES (?, ?, ?, ?)`,
        [
          studentId,
          profilePayload.experience.experience_title,
          profilePayload.experience.organization_name,
          profilePayload.experience.experience_description,
        ]
      );
    }

    await connection.query("DELETE FROM skills WHERE student_id = ?", [studentId]);

    const skillRows = [
      ...normalizeSkillList(technical_skills).map((skillName) => [studentId, skillName, "Technical"]),
      ...normalizeSkillList(soft_skills).map((skillName) => [studentId, skillName, "Soft"]),
    ];

    if (skillRows.length > 0) {
      await connection.query(
        "INSERT INTO skills (student_id, skill_name, skill_category) VALUES ?",
        [skillRows]
      );
    }

    const [cvRows] = await connection.query(
      "SELECT cv_id FROM cvs WHERE student_id = ? ORDER BY updated_at DESC, cv_id DESC LIMIT 1",
      [studentId]
    );

    if (cvRows.length > 0) {
      await connection.query(
        `UPDATE cvs
        SET template_id = ?, cv_title = ?
        WHERE cv_id = ?`,
        [templateId, `${profilePayload.student.full_name} CV`, cvRows[0].cv_id]
      );
    } else {
      await connection.query(
        `INSERT INTO cvs
        (student_id, template_id, cv_title)
        VALUES (?, ?, ?)`,
        [studentId, templateId, `${profilePayload.student.full_name} CV`]
      );
    }

    await connection.commit();

    res.json({
      message: "Full CV profile updated successfully.",
      studentId,
      selectedTemplateId: templateId,
    });
  } catch (error) {
    await connection.rollback();
    const statusCode = error.code === "ER_DUP_ENTRY" ? 409 : 500;
    res.status(statusCode).json({
      message: error.code === "ER_DUP_ENTRY"
        ? "This email already exists in the database."
        : "Failed to update the CV profile.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

app.put("/api/students/:id", async (req, res) => {
  const studentId = Number(req.params.id);
  const {
    full_name,
    email,
    phone_number,
    city,
    professional_summary,
    portfolio_link,
    linkedin_link,
    availability,
    preferred_industry,
  } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: "A valid student ID is required." });
  }

  try {
    const [result] = await pool.query(
      `UPDATE students
      SET full_name = ?, email = ?, phone_number = ?, city = ?, professional_summary = ?,
          portfolio_link = ?, linkedin_link = ?, availability = ?, preferred_industry = ?
      WHERE student_id = ?`,
      [
        full_name,
        email,
        phone_number,
        city,
        professional_summary,
        portfolio_link || null,
        linkedin_link || null,
        availability,
        preferred_industry,
        studentId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.json({ message: "Student profile updated successfully." });
  } catch (error) {
    const statusCode = error.code === "ER_DUP_ENTRY" ? 409 : 500;
    res.status(statusCode).json({
      message: error.code === "ER_DUP_ENTRY"
        ? "This email already exists in the database."
        : "Failed to update student profile.",
      error: error.message,
    });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  const studentId = Number(req.params.id);

  if (!studentId) {
    return res.status(400).json({ message: "A valid student ID is required." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM cvs WHERE student_id = ?", [studentId]);
    await connection.query("DELETE FROM education_records WHERE student_id = ?", [studentId]);
    await connection.query("DELETE FROM skills WHERE student_id = ?", [studentId]);
    await connection.query("DELETE FROM experience_entries WHERE student_id = ?", [studentId]);
    const [result] = await connection.query("DELETE FROM students WHERE student_id = ?", [studentId]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Student not found." });
    }

    await connection.commit();
    res.json({ message: "Student profile and related CV data deleted successfully." });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      message: "Failed to delete the student profile.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

app.listen(port, () => {
  console.log(`COOP CV Builder server is running on http://localhost:${port}`);
});
