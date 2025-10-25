import { fetchJSON } from "../global.js"

async function renderProjectsGrid() {
  const container = document.querySelector(".projects");
  if (!container) return;

  try {
    const projects = await fetchJSON("../lib/projects.json");

    // Sort by period (latest first if period includes years like "Mar 2025 - Present")
    const sorted = [...projects].sort((a, b) => {
      const yearA = parseInt(a.period?.match(/\d{4}/)?.[0] || 0);
      const yearB = parseInt(b.period?.match(/\d{4}/)?.[0] || 0);
      return yearB - yearA;
    });

    // Update title with total project count
    const titleEl = document.querySelector(".projects-title");
    if (titleEl) titleEl.textContent = `Projects and Campaigns (${sorted.length})`;

    // Render cards
    container.innerHTML = sorted
      .map(
        (p) => `
      <div class="card">
        <div class="label">
          <h3>${p.title}</h3>
          <span class="small">${p.role || ""}</span>
          <p class="period">${p.period || ""}</p>
        </div>
        <div class="ph">
          <img src="${p.image || "images/empty.svg"}" alt="${p.title}" />
        </div>
        <p>${p.description}</p>
        ${
          p.tools
            ? `<ul>${p.tools.map((tool) => `<li>${tool}</li>`).join("")}</ul>`
            : p.deliverables
            ? `<ul>${p.deliverables.map((item) => `<li>${item}</li>`).join("")}</ul>`
            : ""
        }
      </div>`
      )
      .join("");
  } catch (err) {
    console.error("Error loading projects:", err);
    container.innerHTML = `<p class="gh-error">Couldn’t load projects.</p>`;
  }
}

renderProjectsGrid();
