import { fetchJSON, fetchGitHubData, renderProjects } from "./global.js";

async function renderGitHubStats(username = "nabilafifahq") {
  const box = document.querySelector("#profile-stats");
  if (!box) return;

  try {
    const data = await fetchGitHubData(username);

    box.innerHTML = `
      <dl class="gh-grid">
        <div class="gh-cell">
          <dt>Followers</dt>
          <dd>${Number(data.followers).toLocaleString()}</dd>
        </div>
        <div class="gh-cell">
          <dt>Following</dt>
          <dd>${Number(data.following).toLocaleString()}</dd>
        </div>
        <div class="gh-cell">
          <dt>Public Repos</dt>
          <dd>${Number(data.public_repos).toLocaleString()}</dd>
        </div>
        <div class="gh-cell">
          <dt>Public Gists</dt>
          <dd>${Number(data.public_gists).toLocaleString()}</dd>
        </div>
      </dl>
    `;
  } catch (err) {
    box.innerHTML = `<p class="gh-error">Couldn’t load GitHub stats right now.</p>`;
  }
}

async function renderLatestProjects() {
  const container = document.querySelector(".projects");
  if (!container) return;

  try {
    const all = await fetchJSON("./lib/projects.json");
    const latest = all.slice(0, 3);
    renderProjects(latest, container, "h3");
  } catch (err) {
    container.innerHTML = `<p class="gh-error">Couldn’t load projects.</p>`;
  }
}

renderGitHubStats();
renderLatestProjects();