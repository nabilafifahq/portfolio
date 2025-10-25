import { fetchJSON, renderProjects } from "../global.js"

const projects = await fetchJSON("../lib/projects.json")

const sorted = Array.isArray(projects)
  ? [...projects].sort((a, b) => (+b.year || 0) - (+a.year || 0))
  : []

const container = document.querySelector(".projects")
renderProjects(sorted, container, "h2")

const titleEl = document.querySelector(".projects-title")
if (titleEl && Array.isArray(projects)) {
  titleEl.textContent = `Projects and Campaigns (${projects.length})`
}
