// Search UI backed by a generated index. Set INDEX_URL to an Apps Script endpoint
// before loading this file if the index is served from Google Drive.
const INDEX_URL = window.SEARCH_INDEX_URL || new URL("index.json", document.currentScript.src).toString();
const CATEGORY_CLASSES = {
  "Architecture & Design": "cat-arch",
  "Development & Code": "cat-dev",
  "Research & Specs": "cat-research",
  "Documentation": "cat-personal",
};

let directoryData = [];
let activeCategory = "ALL";
let searchQuery = "";

const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");
const shortcutHint = document.getElementById("shortcutHint");
const filterChips = document.getElementById("filterChips");
const resultsList = document.getElementById("resultsList");
const resultsCount = document.getElementById("resultsCount");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function highlightText(text, query) {
  const safeText = escapeHtml(text);
  if (!query) return safeText;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safeText.replace(new RegExp(`(${escapedQuery})`, "gi"), "<mark>$1</mark>");
}

function renderChips() {
  const categories = [...new Set(directoryData.map((item) => item.category).filter(Boolean))].sort();
  filterChips.innerHTML = ["ALL", ...categories].map((category) => {
    const label = category === "ALL" ? "All Categories" : category;
    return `<button class="chip${category === activeCategory ? " active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(label)}</button>`;
  }).join("");
}

function renderResults() {
  const query = searchQuery.trim().toLowerCase();
  const filtered = directoryData.filter((item) => {
    if (activeCategory !== "ALL" && item.category !== activeCategory) return false;
    if (!query) return true;
    return [item.title, item.summary, item.category, item.path, ...(item.tags || [])]
      .some((value) => String(value || "").toLowerCase().includes(query));
  });

  resultsCount.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? "resource" : "resources"}`;
  if (filtered.length === 0) {
    resultsList.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">No matching resources found</div><div class="empty-desc">Try another keyword or clear the category filter.</div></div>`;
    return;
  }

  resultsList.innerHTML = filtered.map((item) => {
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const url = item.url || item.path || "#";
    const external = /^https?:/i.test(url);
    const categoryClass = CATEGORY_CLASSES[item.category] || "cat-personal";
    return `<a href="${escapeHtml(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""} class="result-card" role="listitem">
      <div class="card-top"><div class="card-title">${highlightText(item.title, query)}</div><span class="category-tag ${categoryClass}">${escapeHtml(item.category || "General")}</span></div>
      <div class="card-desc">${highlightText(item.summary || item.path || "", query)}</div>
      <div class="card-bottom"><div class="card-tags">${tags.map((tag) => `<span class="tag-badge">#${escapeHtml(tag)}</span>`).join("")}<span class="tag-badge status">${escapeHtml(item.status || "")}</span></div><span class="card-action">Open file <span aria-hidden="true">↗</span></span></div>
    </a>`;
  }).join("");
}

async function loadIndex() {
  try {
    const response = await fetch(INDEX_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Index request failed (${response.status})`);
    const payload = await response.json();
    directoryData = Array.isArray(payload) ? payload : payload.items;
    if (!Array.isArray(directoryData)) throw new Error("Index must contain an items array");
    renderChips();
    renderResults();
    const generatedAt = payload.generatedAt ? new Date(payload.generatedAt) : null;
    document.getElementById("indexStatus").textContent = generatedAt && !Number.isNaN(generatedAt.valueOf())
      ? `Index updated ${generatedAt.toLocaleString()}`
      : "Index ready";
  } catch (error) {
    resultsCount.textContent = "Index unavailable";
    resultsList.innerHTML = `<div class="empty-state"><div class="empty-title">Could not load the search index</div><div class="empty-desc">${escapeHtml(error.message)}. Generate index.json with scan_directory.py and serve this folder over HTTP.</div></div>`;
    document.getElementById("indexStatus").textContent = "Waiting for index";
  }
}

searchInput.addEventListener("input", (event) => {
  searchQuery = event.target.value;
  clearBtn.style.display = searchQuery ? "flex" : "none";
  shortcutHint.style.display = searchQuery ? "none" : "block";
  renderResults();
});
clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  searchQuery = "";
  clearBtn.style.display = "none";
  shortcutHint.style.display = "block";
  searchInput.focus();
  renderResults();
});
filterChips.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  activeCategory = chip.dataset.category;
  renderChips();
  renderResults();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== searchInput) {
    event.preventDefault(); searchInput.focus(); searchInput.select();
  } else if (event.key === "Escape") {
    if (searchInput.value) {
      searchInput.value = ""; searchQuery = ""; clearBtn.style.display = "none";
      shortcutHint.style.display = "block"; renderResults();
    } else searchInput.blur();
  }
});

loadIndex();
