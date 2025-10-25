import { fetchJSON, renderProjects, fetchGitHubData } from "./global.js"

async function main() {
  const all = await fetchJSON("./lib/projects.json")
  const latest = Array.isArray(all)
    ? [...all].sort((a, b) => (+b.year || 0) - (+a.year || 0)).slice(0, 3)
    : []

  const homeContainer = document.querySelector(".projects")
  if (homeContainer) {
    renderProjects(latest, homeContainer, "h3")
  }

  const profileStats = document.querySelector("#profile-stats")
  const githubData = await fetchGitHubData("nabilafifahq")

  if (profileStats && githubData) {
    profileStats.innerHTML = `
      <h2>GitHub Profile Stats</h2>
      <dl style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
        <dt style="grid-row:1">Public Repos</dt><dd style="grid-row:2">${githubData.public_repos}</dd>
        <dt style="grid-row:1">Public Gists</dt><dd style="grid-row:2">${githubData.public_gists}</dd>
        <dt style="grid-row:1">Followers</dt><dd style="grid-row:2">${githubData.followers}</dd>
        <dt style="grid-row:1">Following</dt><dd style="grid-row:2">${githubData.following}</dd>
      </dl>
    `
  }
}

main()