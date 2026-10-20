# DEL.js (Desktop Easy Language) 🚀

[![License: LGPL v3](https://img.shields.io/badge/License-LGPL_v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

**DEL.js** is an ultra-lightweight, zero-dependency Domain-Specific Language (DSL) transpiler & engine designed to help developers build desktop-like web applications effortlessly. Write intuitive UI components, styling, persistent SQLite database queries, and native JavaScript inside a single `<script type="text/del">` block—no `npm install` or build steps required!

---

## ✨ Key Features

- ⚡ **Zero Configuration:** Drop in via CDN; works instantly in any browser.
- 🎨 **Tailwind CSS & Custom Styling:** Define UI styles using `@apply` and CSS directly inside DEL.
- 💾 **Persistent In-Browser SQLite:** Built-in SQL support powered by `sql.js` (WASM) & LocalStorage. Data stays intact across app reloads.
- 🌙 **Persistent Theme Switcher:** Automatic Dark/Light mode switching with LocalStorage state memory.
- 💻 **Native JS Integration:** Execute raw JavaScript logic seamlessly within `Script { ... }` blocks.
- 📦 **Desktop App Ready:** Easily package into standalone `.exe` binaries using Neutralino.js or Edge App Mode.

---

## 📖 Syntax Cheatsheet

| Directive | Description | Syntax Example |
| :--- | :--- | :--- |
| `Window` | Sets window title and container bounds | `Window "App Title", width, height` |
| `Text` | Renders heading/text element | `Text "Hello World"` |
| `Input` | Creates input field bound to a variable | `Input "Placeholder" -> varName` |
| `Button` | Creates clickable button with action | `Button "Label" -> { action() }` |
| `Style` | Applies custom CSS or Tailwind `@apply` | `Style Window { @apply p-4; }` |
| `Database` | Initializes persistent local SQLite file | `Database "app.db"` |
| `Table` | Creates SQL schema if not exists | `Table "users" (id INT, name TEXT)` |
| `Save` | Inserts data into specified table | `Save "users" (name) -> "Aung Aung"` |
| `Script` | Embeds raw JavaScript execution block | `Script { console.log('JS execution'); }` |

---

## 📄 License

This project is licensed under the **GNU Lesser General Public License v3.0 (LGPL-3.0)**.

- You **CAN** use DEL.js as a library inside commercial or closed-source applications.
- Any modifications or enhancements made directly to the **`del.js` core engine** MUST be open-sourced under the LGPL-3.0 license.

See the [LICENSE](LICENSE) file for details.
