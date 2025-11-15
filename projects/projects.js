import { fetchJSON } from "../global.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let allProjects = [];
let query = "";
let selectedYear = null;

const svg = () => d3.select("#projects-pie");
const legend = () => d3.select(".legend");
const colors = d3.scaleOrdinal(d3.schemeTableau10);

function getYear(p) {
  const y = p.year ?? (p.period?.match(/\d{4}/)?.[0] ?? "");
  return String(y);
}

function filterByQuery() {
  const q = (query || "").toLowerCase();
  return allProjects.filter((project) => {
    const hay = Object.values(project).join("\n").toLowerCase();
    return hay.includes(q);
  });
}

function filterByYear(projects) {
  return selectedYear ? projects.filter((p) => getYear(p) === String(selectedYear)) : projects;
}

function renderList(projects) {
  const container = document.querySelector(".projects");
  if (!container) return;

  const titleEl = document.querySelector(".projects-title");
  if (titleEl) titleEl.textContent = `Projects and Campaigns (${projects.length})`;

  const sorted = [...projects].sort((a, b) => {
    const ya = parseInt(getYear(a) || 0);
    const yb = parseInt(getYear(b) || 0);
    return yb - ya;
  });

  container.innerHTML = sorted
    .map((p) => {
      const hasTools = Array.isArray(p.tools) && p.tools.length > 0;
      const hasDeliverables = Array.isArray(p.deliverables) && p.deliverables.length > 0;

      let listSection = "";
      if (hasTools) {
        listSection = `
          <div class="small" style="margin-top: 10px; font-weight: 600;">
            Tools Used: ${p.tools.join(", ")}
          </div>`;
      } else if (hasDeliverables) {
        listSection = `
          <div class="small" style="margin-top: 10px; font-weight: 600;">
            Deliverables: ${p.deliverables.join(", ")}
          </div>`;
      }

      return `
        <article class="card">
  ${p.image ? `<img class="card-image" src="${p.image}" alt="${p.title}">` : ""}

  <div class="label">
    <div>
      <h3>
        ${
          p.url
          ? `<a class="project-link" href="${p.url}" target="_blank" rel="noopener noreferrer">${p.title}</a>`
          : p.title
        }
      </h3>
      ${p.role ? `<p class="small">${p.role}</p>` : ""}
    </div>
    ${p.period ? `<span class="period">${p.period}</span>` : ""}
  </div>

  <p>${p.description}</p>
  ${listSection}
</article>`;
    })
    .join("");
}

function rollupByYear(projects) {
  const rolled = d3.rollups(projects, v => v.length, d => getYear(d));
  return rolled
    .filter(([year]) => year)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([label, value]) => ({ label, value }));
}

function renderPie(projects) {
  const data = rollupByYear(projects);
  const g = svg();
  const L = legend();

  g.selectAll("path").remove();
  L.selectAll("li").remove();

  if (data.length === 0) return;

  // const yearsInPie = new Set(data.map(d => d.label));
  // if (selectedYear && !yearsInPie.has(selectedYear)) {
  //   selectedYear = null;
  // }

  const arcGen = d3.arc().innerRadius(0).outerRadius(50);
  const sliceGen = d3.pie().value(d => d.value);
  const arcData = sliceGen(data);

  arcData.forEach((d, i) => {
    g.append("path")
      .attr("d", arcGen(d))
      .attr("fill", colors(i))
      .classed("selected", selectedYear === data[i].label)
      .on("click", () => {
        selectedYear = selectedYear === data[i].label ? null : data[i].label;
        updateAll();
      })
      .append("title")
      .text(`${data[i].label}: ${data[i].value}`);
  });

  data.forEach((d, i) => {
    L.append("li")
      .attr("style", `--color:${colors(i)}`)
      .classed("selected", selectedYear === d.label)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on("click", () => {
        selectedYear = selectedYear === d.label ? null : d.label;
        updateAll();
      });
  });
}

function wireSearch() {
  const input = document.querySelector(".searchBar");
  if (!input) return;
  input.addEventListener("input", e => {
    query = e.target.value || "";
    updateAll();
  });
}

function updateAll() {
  const textFiltered = filterByQuery(); 
  const listFiltered = filterByYear(textFiltered);

  renderList(listFiltered); 
  renderPie(textFiltered); 
}

async function main() {
  const container = document.querySelector(".projects");
  if (!container) return;

  try {
    allProjects = await fetchJSON("../lib/projects.json");
  } catch (err) {
    console.error("Error loading projects:", err);
    container.innerHTML = `<p class="gh-error">Couldn’t load projects.</p>`;
    return;
  }

  wireSearch();
  updateAll();
}

main();