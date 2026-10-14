const STORAGE_KEYS = {
  draft: "coopCvDraft",
  selectedTemplate: "coopSelectedTemplate",
  currentStudentId: "coopCurrentStudentId",
  favoriteOpportunities: "coopFavoriteOpportunities",
};

document.addEventListener("DOMContentLoaded", function () {
  const currentPage = document.body.getAttribute("data-page");
  const navLinks = document.querySelectorAll(".main-nav-link");

  navLinks.forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  if (currentPage === "home") {
    loadHomeDashboard();
  }

  if (currentPage === "cvbuilder") {
    setupCvBuilderForm();
  }

  if (currentPage === "opportunities") {
    loadOpportunities();
  }

  if (currentPage === "templates") {
    loadTemplates();
  }

  if (currentPage === "database") {
    setupStudentManagement();
  }

  if (currentPage === "download") {
    loadCvPreview();
  }
});

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

function storageGet(key, fallbackValue) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

function storageSet(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function storageRemove(key) {
  window.localStorage.removeItem(key);
}

function showFeedback(element, message, isSuccess) {
  element.textContent = message;
  element.className = `alert mt-3 ${isSuccess ? "alert-success" : "alert-danger"}`;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusBadgeClass(status) {
  if (status === "Open") {
    return "text-bg-success";
  }

  if (status === "Closing Soon") {
    return "text-bg-warning";
  }

  if (status === "Remote") {
    return "text-bg-info";
  }

  return "text-bg-secondary";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function arrayToTextarea(values) {
  return Array.isArray(values) ? values.join(", ") : "";
}

function getSelectedTemplate() {
  return storageGet(STORAGE_KEYS.selectedTemplate, null);
}

function getCurrentStudentId() {
  return storageGet(STORAGE_KEYS.currentStudentId, null);
}

function setCurrentStudentId(studentId) {
  storageSet(STORAGE_KEYS.currentStudentId, Number(studentId));
}

function getFavoriteOpportunityIds() {
  return storageGet(STORAGE_KEYS.favoriteOpportunities, []);
}

function toggleFavoriteOpportunity(opportunityId) {
  const favorites = new Set(getFavoriteOpportunityIds());

  if (favorites.has(opportunityId)) {
    favorites.delete(opportunityId);
  } else {
    favorites.add(opportunityId);
  }

  storageSet(STORAGE_KEYS.favoriteOpportunities, [...favorites]);
}

function getStudentIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = Number(params.get("studentId"));
  return fromUrl || null;
}

function createDraftFromForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function fillFormFromObject(form, values) {
  Object.entries(values).forEach(([key, value]) => {
    const field = form.elements.namedItem(key);

    if (field) {
      field.value = value ?? "";
    }
  });
}

async function loadHomeDashboard() {
  const statsContainer = document.getElementById("home-stats");
  const savedState = document.getElementById("home-saved-state");

  if (!statsContainer || !savedState) {
    return;
  }

  try {
    const stats = await requestJson("/api/stats");
    const selectedTemplate = getSelectedTemplate();
    const currentStudentId = getCurrentStudentId();

    statsContainer.innerHTML = `
      <div class="col-md-4">
        <div class="preview-card bg-white p-4 text-center h-100">
          <div class="dashboard-number">${stats.total_students}</div>
          <p class="mb-0 text-muted">Saved student CV profiles</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="preview-card bg-white p-4 text-center h-100">
          <div class="dashboard-number">${stats.total_templates}</div>
          <p class="mb-0 text-muted">Templates available from the database</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="preview-card bg-white p-4 text-center h-100">
          <div class="dashboard-number">${stats.total_opportunities}</div>
          <p class="mb-0 text-muted">Opportunity listings ready to explore</p>
        </div>
      </div>
    `;

    const latestStudent = stats.latest_student
      ? `${stats.latest_student.full_name} (${stats.latest_student.preferred_industry})`
      : "No saved CV yet";
    const templateText = selectedTemplate ? selectedTemplate.template_name : "No template selected yet";

    savedState.innerHTML = `
      <div class="tip-card bg-white p-4">
        <h4 class="mb-3">Your Current Progress</h4>
        <p class="mb-2"><strong>Latest saved student:</strong> ${escapeHtml(latestStudent)}</p>
        <p class="mb-2"><strong>Selected template:</strong> ${escapeHtml(templateText)}</p>
        <p class="mb-0"><strong>Current active CV ID:</strong> ${currentStudentId || "None yet"}</p>
      </div>
    `;
  } catch (error) {
    statsContainer.innerHTML = `
      <div class="col-12">
        <div class="preview-card bg-white p-4 text-center text-danger">${escapeHtml(error.message)}</div>
      </div>
    `;
    savedState.innerHTML = "";
  }
}

async function setupCvBuilderForm() {
  const form = document.getElementById("cv-form");
  const feedback = document.getElementById("cv-form-feedback");
  const templateStatus = document.getElementById("selected-template-status");
  const startNewButton = document.getElementById("start-new-cv");
  const hiddenStudentId = document.getElementById("current-student-id");

  const renderTemplateStatus = () => {
    const template = getSelectedTemplate();
    templateStatus.innerHTML = template
      ? `<strong>Selected template:</strong> ${escapeHtml(template.template_name)} <span class="text-muted">(${escapeHtml(template.style_type)})</span>`
      : "<strong>Selected template:</strong> Modern default will be used if you save now.";
  };

  const saveDraft = () => {
    storageSet(STORAGE_KEYS.draft, createDraftFromForm(form));
  };

  const resetDraft = () => {
    form.reset();
    hiddenStudentId.value = "";
    storageRemove(STORAGE_KEYS.draft);
    storageRemove(STORAGE_KEYS.currentStudentId);
    feedback.className = "alert d-none mt-4";
    feedback.textContent = "";
    renderTemplateStatus();
  };

  const populateFromProfile = (profile) => {
    if (!profile) {
      return;
    }

    fillFormFromObject(form, {
      current_student_id: profile.student_id,
      full_name: profile.full_name,
      email: profile.email,
      phone_number: profile.phone_number,
      city: profile.city,
      professional_summary: profile.professional_summary,
      university_name: profile.education?.university_name || "",
      major: profile.education?.major || "",
      degree_level: profile.education?.degree_level || "Bachelor's",
      gpa: profile.education?.gpa || "",
      expected_graduation: profile.education?.expected_graduation || "",
      technical_skills: arrayToTextarea(profile.technical_skills),
      soft_skills: arrayToTextarea(profile.soft_skills),
      portfolio_link: profile.portfolio_link || "",
      linkedin_link: profile.linkedin_link || "",
      experience_title: profile.experience?.experience_title || "",
      organization_name: profile.experience?.organization_name || "",
      experience_description: profile.experience?.experience_description || "",
      availability: profile.availability,
      preferred_industry: profile.preferred_industry,
    });

    hiddenStudentId.value = profile.student_id;
    setCurrentStudentId(profile.student_id);

    if (profile.selected_template) {
      storageSet(STORAGE_KEYS.selectedTemplate, {
        template_id: profile.selected_template.template_id,
        template_name: profile.selected_template.template_name,
        style_type: profile.selected_template.style_type,
      });
    }

    renderTemplateStatus();
    saveDraft();
  };

  const draft = storageGet(STORAGE_KEYS.draft, null);
  if (draft) {
    fillFormFromObject(form, draft);
  }

  const studentIdFromUrl = getStudentIdFromUrl();
  const rememberedStudentId = getCurrentStudentId();
  const activeStudentId = studentIdFromUrl || rememberedStudentId;

  if (activeStudentId) {
    try {
      const profile = await requestJson(`/api/cv-profiles/${activeStudentId}`);
      populateFromProfile(profile);
    } catch (error) {
      showFeedback(feedback, "Could not load the saved CV. You can continue with a new draft.", false);
    }
  } else {
    renderTemplateStatus();
  }

  form.addEventListener("input", saveDraft);
  form.addEventListener("change", saveDraft);

  startNewButton.addEventListener("click", resetDraft);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const selectedTemplate = getSelectedTemplate();

    payload.selected_template_id = selectedTemplate?.template_id || "";

    const currentStudentId = Number(hiddenStudentId.value);
    const isUpdate = Boolean(currentStudentId);
    const url = isUpdate ? `/api/cv-profiles/${currentStudentId}` : "/api/cv-profiles";
    const method = isUpdate ? "PUT" : "POST";

    try {
      const result = await requestJson(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      hiddenStudentId.value = result.studentId;
      setCurrentStudentId(result.studentId);
      storageSet(STORAGE_KEYS.draft, createDraftFromForm(form));

      if (selectedTemplate) {
        storageSet(STORAGE_KEYS.selectedTemplate, selectedTemplate);
      } else if (result.selectedTemplateId) {
        storageSet(STORAGE_KEYS.selectedTemplate, {
          template_id: result.selectedTemplateId,
          template_name: "Selected from database",
          style_type: "Saved",
        });
      }

      showFeedback(feedback, `${result.message} You can now preview and download it.`, true);
    } catch (error) {
      showFeedback(feedback, error.message, false);
    }
  });
}

async function loadOpportunities() {
  const tableBody = document.getElementById("opportunities-table-body");
  const sortSelect = document.getElementById("opportunity-sort");
  const searchInput = document.getElementById("opportunity-search");
  const filterSelect = document.getElementById("opportunity-filter");
  const recommendationBox = document.getElementById("opportunity-recommendations");

  let opportunities = [];
  let currentProfile = null;

  const renderRecommendations = (rows) => {
    if (!recommendationBox) {
      return;
    }

    if (!currentProfile) {
      recommendationBox.innerHTML = `
        <div class="tip-card bg-white p-4">
          <h4 class="mb-2">Smart Matching</h4>
          <p class="mb-0 text-muted">Save a CV first to unlock personalized opportunity recommendations.</p>
        </div>
      `;
      return;
    }

    const preferredIndustry = currentProfile.preferred_industry.toLowerCase();
    const preferredCity = currentProfile.city.toLowerCase();
    const matches = rows
      .map((item) => {
        let score = 0;

        if (item.field_name.toLowerCase().includes(preferredIndustry)) {
          score += 3;
        }

        if (item.city.toLowerCase() === preferredCity || item.work_mode === "Remote") {
          score += 2;
        }

        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 3);

    if (matches.length === 0) {
      recommendationBox.innerHTML = `
        <div class="tip-card bg-white p-4">
          <h4 class="mb-2">Smart Matching</h4>
          <p class="mb-0 text-muted">No strong industry match was found yet, but you can still explore all openings below.</p>
        </div>
      `;
      return;
    }

    recommendationBox.innerHTML = `
      <div class="tip-card bg-white p-4">
        <h4 class="mb-2">Recommended For ${escapeHtml(currentProfile.full_name)}</h4>
        <p class="text-muted">Matches are based on preferred industry, location, and remote availability.</p>
        <div class="d-flex flex-wrap gap-2">
          ${matches.map((item) => `
            <span class="recommendation-chip">${escapeHtml(item.company_name)} - ${escapeHtml(item.opportunity_title)}</span>
          `).join("")}
        </div>
      </div>
    `;
  };

  const render = () => {
    const favorites = new Set(getFavoriteOpportunityIds());
    const filtered = opportunities
      .filter((item) => {
        const searchValue = searchInput.value.trim().toLowerCase();
        const filterValue = filterSelect.value;
        const matchesSearch = searchValue === ""
          || item.company_name.toLowerCase().includes(searchValue)
          || item.field_name.toLowerCase().includes(searchValue)
          || item.opportunity_title.toLowerCase().includes(searchValue);
        const matchesFilter = filterValue === "all"
          || item.field_name === filterValue
          || item.work_mode === filterValue;

        return matchesSearch && matchesFilter;
      })
      .sort((left, right) => {
        const sortKey = sortSelect.value;

        if (sortKey === "deadline") {
          return new Date(left.deadline) - new Date(right.deadline);
        }

        return String(left[sortKey]).localeCompare(String(right[sortKey]));
      });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No opportunities match the selected filters.</td></tr>`;
      renderRecommendations(opportunities);
      return;
    }

    tableBody.innerHTML = filtered.map((item) => `
      <tr>
        <td>${escapeHtml(item.company_name)}<div class="small text-muted">${escapeHtml(item.opportunity_title)}</div></td>
        <td>${escapeHtml(item.field_name)}</td>
        <td>${escapeHtml(item.city)} <span class="text-muted">(${escapeHtml(item.work_mode)})</span></td>
        <td>${formatDate(item.deadline)}</td>
        <td><span class="badge ${statusBadgeClass(item.status_label)}">${escapeHtml(item.status_label)}</span></td>
        <td>
          <button class="btn btn-sm ${favorites.has(item.opportunity_id) ? "btn-dark" : "btn-outline-dark"}" type="button" data-opportunity-id="${item.opportunity_id}">
            ${favorites.has(item.opportunity_id) ? "Saved" : "Save"}
          </button>
        </td>
      </tr>
    `).join("");

    renderRecommendations(filtered);
  };

  try {
    [opportunities, currentProfile] = await Promise.all([
      requestJson("/api/opportunities"),
      requestJson(`/api/cv-profiles/${getCurrentStudentId() || ""}`).catch(() => null),
    ]);

    const fields = [...new Set(opportunities.map((item) => item.field_name))];
    filterSelect.innerHTML = `
      <option value="all">All fields and work modes</option>
      ${fields.map((field) => `<option value="${escapeHtml(field)}">${escapeHtml(field)}</option>`).join("")}
      <option value="Remote">Remote only</option>
      <option value="Hybrid">Hybrid only</option>
      <option value="On-site">On-site only</option>
    `;

    render();
    sortSelect.addEventListener("change", render);
    searchInput.addEventListener("input", render);
    filterSelect.addEventListener("change", render);
    tableBody.addEventListener("click", (event) => {
      const button = event.target.closest("[data-opportunity-id]");

      if (!button) {
        return;
      }

      toggleFavoriteOpportunity(Number(button.dataset.opportunityId));
      render();
    });
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">${escapeHtml(error.message)}</td></tr>`;
  }
}

async function loadTemplates() {
  const grid = document.getElementById("templates-grid");
  const selectedTemplate = getSelectedTemplate();

  try {
    const templates = await requestJson("/api/templates");

    grid.innerHTML = templates.map((template) => {
      const isSelected = selectedTemplate && Number(selectedTemplate.template_id) === template.template_id;

      return `
        <div class="col-lg-4">
          <div class="template-card bg-white p-3 h-100 ${template.is_featured ? "border border-dark" : ""} ${isSelected ? "template-selected" : ""}">
            <div class="template-preview p-3 mb-3">
              <small class="text-muted">Template ${template.template_id}</small>
              <h2 class="mt-2">${escapeHtml(template.template_name)}</h2>
              <p>${escapeHtml(template.description)}</p>
              <p class="mb-0"><strong>Style:</strong> ${escapeHtml(template.style_type)}</p>
            </div>
            <div class="d-grid gap-2">
              <button class="btn ${isSelected ? "btn-dark" : template.is_featured ? "btn-outline-dark" : "btn-outline-secondary"} w-100" type="button" data-template='${escapeHtml(JSON.stringify(template))}'>
                ${isSelected ? "Selected for your CV" : "Use This Template"}
              </button>
              <a href="Download.html" class="btn btn-link text-decoration-none">Preview current CV</a>
            </div>
          </div>
        </div>
      `;
    }).join("");

    grid.onclick = (event) => {
      const button = event.target.closest("[data-template]");

      if (!button) {
        return;
      }

      const template = JSON.parse(button.dataset.template);
      storageSet(STORAGE_KEYS.selectedTemplate, {
        template_id: template.template_id,
        template_name: template.template_name,
        style_type: template.style_type,
      });
      loadTemplates();
    };
  } catch (error) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="template-card bg-white p-4 text-center text-danger">${escapeHtml(error.message)}</div>
      </div>
    `;
  }
}

function setupStudentManagement() {
  const form = document.getElementById("student-management-form");
  const feedback = document.getElementById("student-management-feedback");
  const tableBody = document.getElementById("students-table-body");
  const refreshButton = document.getElementById("refresh-students");
  const clearButton = document.getElementById("clear-student-form");

  const fields = {
    student_id: document.getElementById("student-id"),
    full_name: document.getElementById("manage-full-name"),
    email: document.getElementById("manage-email"),
    phone_number: document.getElementById("manage-phone"),
    city: document.getElementById("manage-city"),
    professional_summary: document.getElementById("manage-summary"),
    portfolio_link: document.getElementById("manage-portfolio"),
    linkedin_link: document.getElementById("manage-linkedin"),
    availability: document.getElementById("manage-availability"),
    preferred_industry: document.getElementById("manage-industry"),
  };

  const resetForm = () => {
    form.reset();
    fields.student_id.value = "";
    feedback.className = "alert d-none mt-3";
    feedback.textContent = "";
  };

  const fillForm = (student) => {
    Object.keys(fields).forEach((key) => {
      fields[key].value = student[key] || "";
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loadStudents = async () => {
    try {
      const students = await requestJson("/api/students");

      if (students.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No student records found yet.</td></tr>`;
        return;
      }

      tableBody.innerHTML = students.map((student) => `
        <tr>
          <td>${student.student_id}</td>
          <td>${escapeHtml(student.full_name)}</td>
          <td>${escapeHtml(student.email)}</td>
          <td>${escapeHtml(student.city)}</td>
          <td>${escapeHtml(student.availability)}</td>
          <td>
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-sm btn-outline-primary" type="button" data-action="edit" data-student='${JSON.stringify(student).replace(/'/g, "&apos;")}'>Edit</button>
              <a class="btn btn-sm btn-outline-dark" href="CVBuilder.html?studentId=${student.student_id}">Open Builder</a>
              <button class="btn btn-sm btn-outline-danger" type="button" data-action="delete" data-id="${student.student_id}" data-name="${escapeHtml(student.full_name)}">Delete</button>
            </div>
          </td>
        </tr>
      `).join("");
    } catch (error) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">${escapeHtml(error.message)}</td></tr>`;
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!fields.student_id.value) {
      showFeedback(feedback, "Choose a student from the table before updating.", false);
      return;
    }

    const payload = {
      full_name: fields.full_name.value,
      email: fields.email.value,
      phone_number: fields.phone_number.value,
      city: fields.city.value,
      professional_summary: fields.professional_summary.value,
      portfolio_link: fields.portfolio_link.value,
      linkedin_link: fields.linkedin_link.value,
      availability: fields.availability.value,
      preferred_industry: fields.preferred_industry.value,
    };

    try {
      const result = await requestJson(`/api/students/${fields.student_id.value}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      showFeedback(feedback, result.message, true);
      await loadStudents();
    } catch (error) {
      showFeedback(feedback, error.message, false);
    }
  });

  tableBody.addEventListener("click", async (event) => {
    const button = event.target.closest("button");

    if (!button) {
      return;
    }

    if (button.dataset.action === "edit") {
      const student = JSON.parse(button.dataset.student.replace(/&apos;/g, "'"));
      fillForm(student);
      return;
    }

    if (button.dataset.action === "delete") {
      const confirmed = window.confirm(`Delete ${button.dataset.name} and all related CV data?`);

      if (!confirmed) {
        return;
      }

      try {
        const result = await requestJson(`/api/students/${button.dataset.id}`, {
          method: "DELETE",
        });

        showFeedback(feedback, result.message, true);
        if (String(fields.student_id.value) === String(button.dataset.id)) {
          resetForm();
        }
        await loadStudents();
      } catch (error) {
        showFeedback(feedback, error.message, false);
      }
    }
  });

  refreshButton.addEventListener("click", loadStudents);
  clearButton.addEventListener("click", resetForm);
  loadStudents();
}

async function loadCvPreview() {
  const previewRoot = document.getElementById("cv-preview-root");
  const templateName = document.getElementById("preview-template-name");
  const summaryBox = document.getElementById("preview-summary-box");
  const recommendationsBox = document.getElementById("preview-opportunity-match");
  const printButton = document.getElementById("download-pdf-button");
  const editButton = document.getElementById("edit-information-button");

  const requestedStudentId = getStudentIdFromUrl() || getCurrentStudentId();

  printButton.addEventListener("click", () => {
    window.print();
  });

  editButton.addEventListener("click", () => {
    const targetStudentId = getCurrentStudentId();
    window.location.href = targetStudentId
      ? `CVBuilder.html?studentId=${targetStudentId}`
      : "CVBuilder.html";
  });

  try {
    const profile = requestedStudentId
      ? await requestJson(`/api/cv-profiles/${requestedStudentId}`)
      : await requestJson("/api/cv-profiles/latest");

    setCurrentStudentId(profile.student_id);
    storageSet(STORAGE_KEYS.draft, {
      current_student_id: profile.student_id,
      full_name: profile.full_name,
      email: profile.email,
      phone_number: profile.phone_number,
      city: profile.city,
      professional_summary: profile.professional_summary,
      university_name: profile.education?.university_name || "",
      major: profile.education?.major || "",
      degree_level: profile.education?.degree_level || "",
      gpa: profile.education?.gpa || "",
      expected_graduation: profile.education?.expected_graduation || "",
      technical_skills: arrayToTextarea(profile.technical_skills),
      soft_skills: arrayToTextarea(profile.soft_skills),
      portfolio_link: profile.portfolio_link || "",
      linkedin_link: profile.linkedin_link || "",
      experience_title: profile.experience?.experience_title || "",
      organization_name: profile.experience?.organization_name || "",
      experience_description: profile.experience?.experience_description || "",
      availability: profile.availability,
      preferred_industry: profile.preferred_industry,
    });

    if (profile.selected_template) {
      storageSet(STORAGE_KEYS.selectedTemplate, {
        template_id: profile.selected_template.template_id,
        template_name: profile.selected_template.template_name,
        style_type: profile.selected_template.style_type,
      });
    }

    templateName.textContent = profile.selected_template?.template_name || "Default Template";
    summaryBox.innerHTML = `
      <h4 class="mb-2">Profile Snapshot</h4>
      <p class="mb-2"><strong>Availability:</strong> ${escapeHtml(profile.availability)}</p>
      <p class="mb-2"><strong>Preferred industry:</strong> ${escapeHtml(profile.preferred_industry)}</p>
      <p class="mb-0"><strong>Location:</strong> ${escapeHtml(profile.city)}</p>
    `;

    previewRoot.innerHTML = `
      <div class="cv-sheet">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
          <div>
            <h2 class="mb-1">${escapeHtml(profile.full_name)}</h2>
            <p class="text-muted mb-2">${escapeHtml(profile.education?.major || "Student")} | ${escapeHtml(profile.preferred_industry)}</p>
            <p class="mb-0">${escapeHtml(profile.email)} | ${escapeHtml(profile.phone_number)} | ${escapeHtml(profile.city)}</p>
          </div>
          <div class="text-lg-end">
            <div class="small text-muted">Template</div>
            <div class="fw-semibold">${escapeHtml(profile.selected_template?.template_name || "Default")}</div>
          </div>
        </div>

        <section class="cv-section">
          <h5>Professional Summary</h5>
          <p>${escapeHtml(profile.professional_summary)}</p>
        </section>

        <section class="cv-section">
          <h5>Education</h5>
          <p class="mb-1"><strong>${escapeHtml(profile.education?.university_name || "")}</strong></p>
          <p class="mb-1">${escapeHtml(profile.education?.degree_level || "")} in ${escapeHtml(profile.education?.major || "")}</p>
          <p class="mb-0">GPA: ${escapeHtml(profile.education?.gpa || "")} | Expected Graduation: ${escapeHtml(profile.education?.expected_graduation || "")}</p>
        </section>

        <section class="cv-section">
          <h5>Technical Skills</h5>
          <div class="d-flex flex-wrap gap-2">
            ${profile.technical_skills.map((skill) => `<span class="skill-chip">${escapeHtml(skill)}</span>`).join("") || '<span class="text-muted">No technical skills added.</span>'}
          </div>
        </section>

        <section class="cv-section">
          <h5>Soft Skills</h5>
          <div class="d-flex flex-wrap gap-2">
            ${profile.soft_skills.map((skill) => `<span class="skill-chip skill-chip-soft">${escapeHtml(skill)}</span>`).join("") || '<span class="text-muted">No soft skills added.</span>'}
          </div>
        </section>

        <section class="cv-section">
          <h5>Experience / Project</h5>
          <p class="mb-1"><strong>${escapeHtml(profile.experience?.experience_title || "")}</strong></p>
          <p class="mb-1 text-muted">${escapeHtml(profile.experience?.organization_name || "")}</p>
          <p class="mb-0">${escapeHtml(profile.experience?.experience_description || "")}</p>
        </section>

        <section class="cv-section">
          <h5>Portfolio Links</h5>
          <p class="mb-1"><strong>Portfolio:</strong> ${profile.portfolio_link ? `<a href="${escapeHtml(profile.portfolio_link)}">${escapeHtml(profile.portfolio_link)}</a>` : "Not provided"}</p>
          <p class="mb-0"><strong>LinkedIn:</strong> ${profile.linkedin_link ? `<a href="${escapeHtml(profile.linkedin_link)}">${escapeHtml(profile.linkedin_link)}</a>` : "Not provided"}</p>
        </section>
      </div>
    `;

    const opportunities = await requestJson("/api/opportunities");
    const relatedOpportunities = opportunities
      .filter((item) =>
        item.field_name.toLowerCase().includes(profile.preferred_industry.toLowerCase())
        || item.city.toLowerCase() === profile.city.toLowerCase()
        || item.work_mode === "Remote"
      )
      .slice(0, 3);

    recommendationsBox.innerHTML = relatedOpportunities.length > 0
      ? relatedOpportunities.map((item) => `
        <div class="recommendation-item">
          <strong>${escapeHtml(item.company_name)}</strong>
          <div>${escapeHtml(item.opportunity_title)}</div>
          <small class="text-muted">${escapeHtml(item.field_name)} | ${escapeHtml(item.city)} | ${formatDate(item.deadline)}</small>
        </div>
      `).join("")
      : '<p class="mb-0 text-muted">No matching opportunity recommendations were found yet.</p>';
  } catch (error) {
    previewRoot.innerHTML = `
      <div class="cv-sheet text-center">
        <h4 class="mb-2">No CV ready to preview</h4>
        <p class="text-muted mb-0">${escapeHtml(error.message)}</p>
      </div>
    `;
    summaryBox.innerHTML = "";
    recommendationsBox.innerHTML = "";
  }
}
