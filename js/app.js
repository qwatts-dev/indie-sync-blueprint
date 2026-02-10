/* =============================================
   Indie Sync Blueprint — Application Logic
   
   Architecture:
   1. Loads data from data/sync-data.json (the "database")
   2. Renders categories, brands, songs, and charts dynamically
   3. Zero build tools — runs directly on GitHub Pages
   ============================================= */

// ----- State -----
let syncData = {};
let currentCategory = null;
let currentBrandIndex = 0;
let radarChartInstance = null;
let barChartInstance = null;

// ----- Inline SVG Icons (kept here to avoid external deps) -----
const ICONS = {
  spotify: `<svg viewBox="0 0 24 24" fill="currentColor" class="text-[#1DB954]"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`,
  apple: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 361 361"><path fill="#FA233B" d="M180,361C80.6,361,0,280.4,0,181C0,81.6,80.6,1,180,1c99.4,0,180,80.6,180,180C360,280.4,279.4,361,180,361z"/><path fill="#FFFFFF" d="M254.5,55c-0.87,0.08-8.6,1.45-9.53,1.64l-107,21.59l-0.04,0.01c-2.79,0.59-4.98,1.58-6.67,3c-2.04,1.71-3.17,4.13-3.6,6.95c-0.09,0.6-0.24,1.82-0.24,3.62c0,0,0,109.32,0,133.92c0,3.13-0.25,6.17-2.37,8.76c-2.12,2.59-4.74,3.37-7.81,3.99c-2.33,0.47-4.66,0.94-6.99,1.41c-8.84,1.78-14.59,2.99-19.8,5.01c-4.98,1.93-8.71,4.39-11.68,7.51c-5.89,6.17-8.28,14.54-7.46,22.38c0.7,6.69,3.71,13.09,8.88,17.82c3.49,3.2,7.85,5.63,12.99,6.66c5.33,1.07,11.01,0.7,19.31-0.98c4.42-0.89,8.56-2.28,12.5-4.61c3.9-2.3,7.24-5.37,9.85-9.11c2.62-3.75,4.31-7.92,5.24-12.35c0.96-4.57,1.19-8.7,1.19-13.26l0-116.15c0-6.22,1.76-7.86,6.78-9.08c0,0,88.94-17.94,93.09-18.75c5.79-1.11,8.52,0.54,8.52,6.61l0,79.29c0,3.14-0.03,6.32-2.17,8.92c-2.12,2.59-4.74,3.37-7.81,3.99c-2.33,0.47-4.66,0.94-6.99,1.41c-8.84,1.78-14.59,2.99-19.8,5.01c-4.98,1.93-8.71,4.39-11.68,7.51c-5.89,6.17-8.49,14.54-7.67,22.38c0.7,6.69,3.92,13.09,9.09,17.82c3.49,3.2,7.85,5.56,12.99,6.6c5.33,1.07,11.01,0.69,19.31-0.98c4.42-0.89,8.56-2.22,12.5-4.55c3.9-2.3,7.24-5.37,9.85-9.11c2.62-3.75,4.31-7.92,5.24-12.35c0.96-4.57,1-8.7,1-13.26V64.46C263.54,58.3,260.29,54.5,254.5,55z"/></svg>`,
};

// =============================================
// Initialization
// =============================================

async function initApp() {
  try {
    const response = await fetch("data/sync-data.json");
    if (!response.ok)
      throw new Error(`Failed to load data: ${response.status}`);
    const rawData = await response.json();
    syncData = rawData.categories;

    // Build category tabs dynamically from data
    renderCategoryTabs();

    // Default to first category
    const firstCategory = Object.keys(syncData)[0];
    setCategory(firstCategory);

    // Wire up search
    document
      .getElementById("brand-search")
      .addEventListener("input", handleBrandSearch);
  } catch (err) {
    console.error("Failed to initialize app:", err);
    document.querySelector("main").innerHTML = `
      <div class="text-center py-20">
        <h2 class="text-2xl font-bold text-red-400 mb-4">Failed to load data</h2>
        <p class="text-[var(--secondary-text)]">Check that <code>data/sync-data.json</code> exists and is valid JSON.</p>
        <pre class="text-sm text-red-300 mt-4">${err.message}</pre>
      </div>`;
  }
}

// =============================================
// Category Tabs (Dynamic from data)
// =============================================

function renderCategoryTabs() {
  const container = document.getElementById("category-tabs");
  container.innerHTML = "";

  Object.entries(syncData).forEach(([key, cat]) => {
    const btn = document.createElement("button");
    btn.id = `tab-${key}`;
    btn.className =
      "no-tap-highlight px-6 py-2 text-sm font-bold uppercase tracking-wider focus:outline-none transition-all whitespace-nowrap rounded-full border border-[var(--border-color)] bg-transparent text-[var(--secondary-text)] hover:text-[var(--primary-text)]";
    btn.textContent = cat.label;
    btn.onclick = () => setCategory(key);
    container.appendChild(btn);
  });
}

// =============================================
// Category Selection
// =============================================

function setCategory(category) {
  currentCategory = category;
  currentBrandIndex = 0;

  // Update tab styles
  document.querySelectorAll('button[id^="tab-"]').forEach((btn) => {
    btn.className =
      "no-tap-highlight px-6 py-2 text-sm font-bold uppercase tracking-wider focus:outline-none transition-all whitespace-nowrap rounded-full border border-[var(--border-color)] bg-transparent text-[var(--secondary-text)] hover:text-[var(--primary-text)]";
  });
  const activeTab = document.getElementById(`tab-${category}`);
  if (activeTab) {
    activeTab.className =
      "no-tap-highlight px-6 py-2 text-sm font-bold uppercase tracking-wider focus:outline-none transition-all whitespace-nowrap rounded-full border border-purple bg-[var(--bg-card)] text-purple";
  }

  // Update insight
  const catData = syncData[category];
  document.getElementById("category-insight").innerText = catData.insight;

  // Populate brand lists
  populateBrandList(document.getElementById("brand-list"), catData, false);
  populateBrandList(
    document.getElementById("mobile-brand-list"),
    catData,
    true,
  );

  // Select first brand
  selectBrand(0);
}

// =============================================
// Brand List
// =============================================

function populateBrandList(container, catData, isMobile) {
  container.innerHTML = "";

  catData.brands.forEach((brand, index) => {
    const btn = document.createElement("button");
    btn.dataset.brandIndex = index;

    if (isMobile) {
      btn.className =
        "text-left px-5 py-4 rounded-xl text-lg font-bold transition-all w-full border bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--primary-text)]";
    } else {
      const isActive = index === 0;
      btn.className = isActive
        ? "text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all w-full border bg-purple text-white border-purple"
        : "text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all w-full border bg-[var(--bg-color)] text-[var(--secondary-text)] hover:bg-[var(--highlight-bg)] hover:text-[var(--primary-text)] border-[var(--border-color)]";
    }

    btn.innerHTML = `
      <div class="flex justify-between items-center">
        <span class="tracking-wide uppercase">${brand.name}</span>
        ${!isMobile ? `<span class="brand-dot text-lg ${index === 0 ? "" : "invisible"}">●</span>` : ""}
      </div>`;

    btn.onclick = () => {
      currentBrandIndex = index;
      selectBrand(index);
      if (isMobile) toggleBottomSheet(false);
    };

    container.appendChild(btn);
  });
}

// =============================================
// Brand Selection & Content Render
// =============================================

function selectBrand(index) {
  const catData = syncData[currentCategory];
  const brandData = catData.brands[index];

  // Update desktop brand list active state
  updateBrandListStyles(index);

  // Update header
  document.getElementById("brand-name").innerText = brandData.name;
  document.getElementById("brand-name-mobile").innerText = brandData.name;
  document.getElementById("brand-tag").innerText = brandData.tag;

  const descEl = document.getElementById("brand-desc");
  descEl.innerText = brandData.desc;
  descEl.classList.add("line-clamp-2");
  document.getElementById("read-more-btn").innerText = "Read More";

  // Render songs
  renderSongList(brandData.songs);

  // Render charts
  updateCharts(brandData);
}

function updateBrandListStyles(activeIndex) {
  const list = document.getElementById("brand-list");
  Array.from(list.children).forEach((btn) => {
    const idx = parseInt(btn.dataset.brandIndex);
    if (idx === activeIndex) {
      btn.className =
        "text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all w-full border bg-purple text-white border-purple";
      const dot = btn.querySelector(".brand-dot");
      if (dot) dot.classList.remove("invisible");
    } else {
      btn.className =
        "text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all w-full border bg-[var(--bg-color)] text-[var(--secondary-text)] hover:bg-[var(--highlight-bg)] hover:text-[var(--primary-text)] border-[var(--border-color)]";
      const dot = btn.querySelector(".brand-dot");
      if (dot) dot.classList.add("invisible");
    }
  });
}

// =============================================
// Song List
// =============================================

function renderSongList(songs) {
  const songList = document.getElementById("song-list");
  songList.innerHTML = "";

  songs.forEach((song, i) => {
    const links = generateSearchLinks(song.title, song.artist);
    const row = document.createElement("div");
    row.className =
      "song-item flex-none w-[85%] lg:w-full snap-center lg:snap-align-none flex items-start gap-4 p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] lg:bg-[var(--bg-color)] hover:border-purple transition-all group shadow-sm";

    row.innerHTML = `
      <div class="text-[var(--secondary-text)] font-bold text-sm pt-1 group-hover:text-purple transition-colors">0${i + 1}</div>
      <div class="flex-grow flex flex-col gap-2">
        <div class="flex flex-col">
          <div class="text-lg font-bold text-[var(--primary-text)] leading-tight line-clamp-1">${song.title}</div>
          <div class="text-sm text-[var(--secondary-text)] mt-1 line-clamp-1">${song.artist}</div>
        </div>
        <div class="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-text)] bg-[var(--border-color)] px-2 py-1 rounded-lg inline-block self-start border border-[var(--border-color)] group-hover:border-purple transition-colors">
          ${song.vibe}
        </div>
        <div class="flex items-center gap-3 mt-1 pt-3 border-t border-[var(--border-color)] group-hover:border-[rgba(116,86,241,0.3)] transition-colors w-full justify-between">
          <span class="text-[10px] text-[var(--secondary-text)] uppercase font-bold">Listen On</span>
          <div class="flex gap-2">
            <a href="${links.spotify}" target="_blank" rel="noopener noreferrer" class="btn-platform" title="Open in Spotify">${ICONS.spotify}</a>
            <a href="${links.apple}" target="_blank" rel="noopener noreferrer" class="btn-platform" title="Open in Apple Music">${ICONS.apple}</a>
          </div>
        </div>
      </div>`;

    songList.appendChild(row);
  });
}

function generateSearchLinks(title, artist) {
  const query = encodeURIComponent(`${title} ${artist}`);
  return {
    spotify: `https://open.spotify.com/search/${query}`,
    apple: `https://music.apple.com/us/search?term=${query}`,
  };
}

// =============================================
// Charts
// =============================================

function updateCharts(brandData) {
  const isLight = document.body.classList.contains("light-mode");
  const gridColor = isLight ? "#E5E7EB" : "#2d3b4e";
  const textColor = isLight ? "#4B5563" : "#9ca3af";
  const angleLineColor = isLight ? "#d1d5db" : "#E0DCD5";

  // Radar Chart
  const ctxRadar = document.getElementById("radarChart").getContext("2d");
  if (radarChartInstance) radarChartInstance.destroy();

  radarChartInstance = new Chart(ctxRadar, {
    type: "radar",
    data: {
      labels: [
        "Energy",
        "Emotion",
        "Uniqueness",
        "Catchiness",
        "Lyrical Depth",
      ],
      datasets: [
        {
          label: brandData.name,
          data: brandData.fingerprint,
          fill: true,
          backgroundColor: "rgba(116, 86, 241, 0.2)",
          borderColor: "#7456F1",
          pointBackgroundColor: "#7456F1",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#7456F1",
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        r: {
          angleLines: { color: angleLineColor },
          grid: { color: gridColor },
          pointLabels: {
            font: { size: 11, family: "Figtree" },
            color: textColor,
          },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: { display: false },
        },
      },
      plugins: { legend: { display: false } },
    },
  });

  // Bar Chart
  const ctxBar = document.getElementById("barChart").getContext("2d");
  if (barChartInstance) barChartInstance.destroy();

  barChartInstance = new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: brandData.genres,
      datasets: [
        {
          label: "Relevance",
          data: [90, 70, 50],
          backgroundColor: ["#7456F1", "#5e45c4", "#1a2c42"],
          borderRadius: 4,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      indexAxis: "y",
      scales: {
        x: { display: false },
        y: {
          grid: { display: false },
          ticks: { font: { family: "Figtree" }, color: textColor },
        },
      },
      plugins: { legend: { display: false } },
    },
  });
}

// =============================================
// UI Interactions
// =============================================

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  // Re-render charts for new theme colors
  if (currentCategory && syncData[currentCategory]) {
    const brandData = syncData[currentCategory].brands[currentBrandIndex];
    updateCharts(brandData);
  }
}

function toggleBottomSheet(show) {
  document.getElementById("brand-sheet").classList.toggle("open", show);
  document.getElementById("brand-sheet-overlay").classList.toggle("open", show);
}

function toggleDescription() {
  const desc = document.getElementById("brand-desc");
  const btn = document.getElementById("read-more-btn");
  const isCollapsed = desc.classList.toggle("line-clamp-2");
  btn.innerText = isCollapsed ? "Read More" : "Show Less";
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  const navPill = document.querySelector(".nav-pill");
  const offset = navPill ? navPill.offsetHeight + 40 : 80;
  const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top, behavior: "smooth" });
  document
    .querySelectorAll(".nav-item")
    .forEach((el) => el.classList.remove("active"));
  event.currentTarget.classList.add("active");
}

function handleBrandSearch(e) {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll("#mobile-brand-list button").forEach((btn) => {
    btn.style.display = btn.innerText.toLowerCase().includes(term)
      ? "block"
      : "none";
  });
}

// =============================================
// Boot
// =============================================

window.addEventListener("DOMContentLoaded", initApp);
