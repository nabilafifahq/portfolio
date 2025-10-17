document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger")
  const nav = document.getElementById("site-nav") || document.querySelector("nav")
  if (!hamburger || !nav) return

  const toggle = () => {
    const open = nav.classList.toggle("active")
    hamburger.classList.toggle("active", open)
    hamburger.setAttribute("aria-expanded", String(open))
  }

  hamburger.addEventListener("click", toggle)

  hamburger.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggle()
    }
    if (e.key === "Escape") {
      nav.classList.remove("active")
      hamburger.classList.remove("active")
      hamburger.setAttribute("aria-expanded", "false")
    }
  })

  nav.addEventListener("click", e => {
    if (e.target.closest("a")) {
      nav.classList.remove("active")
      hamburger.classList.remove("active")
      hamburger.setAttribute("aria-expanded", "false")
    }
  })
})