import { fetchJSON } from "../global.js";

async function renderProjectsGrid() {
  const container = document.querySelector(".projects");
  if (!container) return;

  try {
    const projects = await fetchJSON("../lib/projects.json");

    const sorted = [...projects].sort((a, b) => {
      const yearA = parseInt(a.period?.match(/\d{4}/)?.[0] || 0);
      const yearB = parseInt(b.period?.match(/\d{4}/)?.[0] || 0);
      return yearB - yearA;
    });

    const titleEl = document.querySelector(".projects-title");
    if (titleEl) titleEl.textContent = `Projects and Campaigns (${sorted.length})`;

    container.innerHTML = sorted
      .map((p) => {
        const hasTools = Array.isArray(p.tools) && p.tools.length > 0;
        const hasDeliverables =
          Array.isArray(p.deliverables) && p.deliverables.length > 0;

        let listSection = "";
        if (hasTools) {
          listSection = `
            <div class="small" style="margin-top: 10px; font-weight: 600;">
              Tools Used: ${p.tools.join(", ")}
            </div>
          `;
        } else if (hasDeliverables) {
          listSection = `
            <div class="small" style="margin-top: 10px; font-weight: 600;">
              Deliverables: ${p.deliverables.join(", ")}
            </div>
          `;
        }

        return `
          <article class="card">
            <div class="label">
              <div>
                <h3>${p.title}</h3>
                ${p.role ? `<p class="small">${p.role}</p>` : ""}
              </div>
              ${p.period ? `<span class="period">${p.period}</span>` : ""}
            </div>

            <p>${p.description}</p>
            ${listSection}
          </article>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Error loading projects:", err);
    container.innerHTML = `<p class="gh-error">Couldn’t load projects.</p>`;
  }
}

renderProjectsGrid();
