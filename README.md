# NotionLab🧪

> Smarter, lightweight widgets and customized tools crafted for Notion — designed for effortless navigation and better productivity.

[![Notion Compatible](https://img.shields.io/badge/Notion-Compatible-black?logo=notion)](https://notion.so)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Pages Ready](https://img.shields.io/badge/Deploy-GitHub%20Pages-24292e?logo=github)](https://pages.github.com/)

---

## 💡 About NotionLab

**NotionLab** is a curated suite of modular widgets and developer utilities built to bridge the gap between Notion's clean canvas and dynamic, real-time interactivity. Every tool in NotionLab is built with three core tenets:

1. **Zero Bloat & Zero Dependencies**: Vanilla HTML, CSS, and JS — lightning-fast load times.
2. **Native Aesthetic**: Blends seamlessly into Notion’s default typography, spacing, and both Light & Dark modes.
3. **Plug-and-Play**: Hosted anywhere (GitHub Pages, Vercel, Netlify) and embeddable in seconds using `/embed`.

---

## 🧰 Tools & Widgets

### 1. 🔍 Notion Knowledge Directory Search (`/widgets/search-widget`)
A client-side instant search engine built to navigate complex knowledge bases, wikis, and central workspaces directly from your top-level dashboard.

* **Instant Search & Real-Time Highlighting**: Fuzzy-matches keywords across titles, categories, tags, and page descriptions.
* **Category Filter Chips**: Filter entries quickly by topic (Architecture, Development, Research, Personal).
* **Keyboard-First Navigation**: Press `/` to focus the search bar from anywhere on the page, and `Esc` to clear/blur.
* **Direct Deep Links**: One-click jumps directly to your nested Notion pages or external resources.
* **Adaptive Theme**: Matches Notion’s light and dark color palettes automatically.

---

## 📂 Repository Structure

NotionLab is structured to support both embeddable web widgets and standalone scripts:

```text
notion-lab/
├── notion-widgets/
│   └── search-widget/             # Embeddable Knowledge Search Bar
│       ├── index.html
│       ├── style.css
│       ├── app.js
│       └── README.md
│
├── customised-tools/              # Automation scripts, sync tools & CLI utilities
│   └── (tools)
│
└── README.md                      # NotionLab Central Overview
```

---

## 🚀 Quick Start: How to Embed in Notion

### 1. Host via GitHub Pages (Free & 1-Click)
1. Fork or push this repository to GitHub.
2. Go to **Settings** > **Pages** in your repository.
3. Under **Branch**, select `main` (or root/docs directory) and click **Save**.
4. Your widget is now live at:
   ```text
   https://<Manohar-Krishna>.github.io/<NationLab>/notion-widgets/search-widget/
   ```

### 2. Embed Inside Your Notion Page
1. Open any Notion page or dashboard.
2. Type `/embed` and press **Enter**.
3. Paste your live URL and click **Embed link**.
4. Resize and reposition the widget banner across your dashboard as desired.

> [!TIP]
> **Keyboard Tip**: Inside the embedded search widget, tap <kbd>/</kbd> anytime to begin typing your search query instantly.

---

## 🛠️ Local Development

To test or customize widgets locally:

```bash
# Clone the repository
git clone https://github.com/<Manohar-Krishna>/notion-lab.git
cd notion-lab/notion-widgets/search-widget

# Start a local web server
npx serve .
# or
python3 -m http.server 8080
```

Open `http://localhost:8080` in your browser.

---

## 🗺️ Roadmap & Upcoming Tools

- [x] **Knowledge Directory Search Bar**
- [ ] **Minimal Focus & Pomodoro Timer**
- [ ] **Quick Capture & Scratchpad** 
- [ ] **Custom Notion Database Sync Script**
- [ ] **Interactive Progress & Milestone Bar**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free to use, modify, and integrate into your personal and team Notion workspaces.
