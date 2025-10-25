console.log("IT’S ALIVE!")

export function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector))
}

const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1"
const isGithubPages = location.hostname.endsWith(".github.io")

const BASE_PATH = isLocal ? "/" : isGithubPages ? "/portfolio/" : "/"

const pages = [
  { url: "",          title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "resume/",   title: "Resume" },
  { url: "contact/",  title: "Contact" },
  { url: "https://linkedin.com/in/nqotrunnada/", title: "LinkedIn" },
  { url: "https://github.com/nabilafifahq",      title: "GitHub" }
]

const nav = document.createElement("nav")
nav.id = "site-nav"
document.body.prepend(nav)

for (const p of pages) {
  let href = p.url.startsWith("http") ? p.url : BASE_PATH + p.url
  const a = document.createElement("a")
  a.href = href
  a.textContent = p.title

  const isExternal = a.host !== location.host
  a.toggleAttribute("target", isExternal)
  if (isExternal) a.rel = "noopener"

  a.classList.toggle(
    "current",
    a.host === location.host && a.pathname === location.pathname
  )

  nav.append(a)
}

document.body.insertAdjacentHTML(
  "afterbegin",
  `
  <label class="color-scheme"
         style="position: fixed; top: 10px; left: 10px; z-index: 1001;
                backdrop-filter: blur(10px); background: rgba(255,255,255,0.15);
                padding: 8px 12px; border-radius: 8px;">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
)

const select = document.querySelector(".color-scheme select")

function applyColorScheme(mode) {
  if (mode === "automatic") mode = "light dark"
  const valid = new Set(["light dark", "light", "dark"])
  if (!valid.has(mode)) mode = "light dark"
  document.documentElement.style.setProperty("color-scheme", mode)
  localStorage.colorScheme = mode
  select.value = mode
}

applyColorScheme(localStorage.colorScheme || "light dark")
select.addEventListener("input", e => applyColorScheme(e.target.value))

const form = document.querySelector("form")
if (form) {
  form.addEventListener("submit", event => {
    event.preventDefault()
    const data = new FormData(form)
    const parts = []
    for (const [name, value] of data.entries()) {
      parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    }
    const targetURL = `${form.action}?${parts.join("&")}`
    location.href = targetURL
  })
}

export async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error("fetchJSON error for", url, err);
    throw err;
  }
}

export function renderProjects(projects, containerElement, headingLevel = "h2") {
  if (!containerElement) return;

  const valid = new Set(["h1","h2","h3","h4","h5","h6"]);
  if (!valid.has(headingLevel)) headingLevel = "h2";

  if (!Array.isArray(projects) || projects.length === 0) {
    containerElement.innerHTML = `<p>No projects to display.</p>`;
    return;
  }

  const html = projects.map((p) => {
    const title        = p?.title ?? "Untitled";
    const role         = p?.role ?? "";
    const period       = p?.period ?? (p?.year ? String(p.year) : "");
    const description  = p?.description ?? "";
    const tools        = Array.isArray(p?.tools) ? p.tools : [];
    const deliverables = Array.isArray(p?.deliverables) ? p.deliverables : [];
    
    let listSection = "";
    if (tools.length > 0) {
      listSection = `
        <div class="small" style="margin-top: 10px; font-weight: 600;">
          Tools Used: ${tools.join(", ")}
        </div>
      `;
    } else if (deliverables.length > 0) {
      listSection = `
        <div class="small" style="margin-top: 10px; font-weight: 600;">
          Deliverables: ${deliverables.join(", ")}
        </div>
      `;
    }

    const Heading = headingLevel;

    return `
      <article class="card">
        <div class="label">
          <div>
            <${Heading}>${title}</${Heading}>
            ${role ? `<p class="small">${role}</p>` : ""}
          </div>
          ${period ? `<span class="period small">${period}</span>` : ""}
        </div>

        ${description ? `<p>${description}</p>` : ""}
        ${listSection}
      </article>
    `;
  }).join("");

  containerElement.innerHTML = html;
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}