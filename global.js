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

  a.classList.toggle("current", a.host === location.host && a.pathname === location.pathname)

  nav.append(a)
}

document.body.insertAdjacentHTML(
  "afterbegin",
  `
  <label class="color-scheme"
         style="position: fixed; top: 10px; right: 10px; z-index: 1001;
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

function setColorScheme(mode) {
  document.documentElement.style.setProperty("color-scheme", mode)
  localStorage.colorScheme = mode
  select.value = mode
}

if (localStorage.colorScheme) {
  setColorScheme(localStorage.colorScheme)
} else {
  setColorScheme("light dark")
}

select.addEventListener("input", e => setColorScheme(e.target.value))

const form = document.querySelector("form")
if (form) {
  form.addEventListener("submit", event => {
    event.preventDefault()
    const data = new FormData(form)

    const parts = []
    for (const [name, value] of data.entries()) {
      parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    }
    const query = parts.join("&")

    const targetURL = `${form.action}?${query}`
    window.location.href = targetURL
  })
}