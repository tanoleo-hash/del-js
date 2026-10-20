/**
 * ==============================================================================
 * DEL.js - Desktop Easy Language Transpiler & Runtime Engine
 * ==============================================================================
 * DEL is a lightweight, zero-dependency Domain-Specific Language (DSL) parser
 * designed to transform human-readable UI, CSS, SQL, and JS syntax inside 
 * `<script type="text/del">` tags into fully interactive HTML5/CSS3 web apps.
 *
 * Core Features:
 * 1. UI DSL Compiler (Window, Text, Input, Button)
 * 2. Tailwind CSS & Custom Style Injector
 * 3. In-Browser Persistent SQLite Database (sql.js WASM)
 * 4. Native JavaScript Block Execution
 * 5. Persistent Dark/Light Theme Switcher
 * ==============================================================================
 */

(function () {
    "use strict";

    /**
     * Main Initialization Event Listener
     * Executes automatically when the DOM content is fully loaded.
     */
    document.addEventListener("DOMContentLoaded", async () => {
        // Step 1: Initialize Persistent Dark/Light Theme from localStorage
        initPersistentTheme();

        // Step 2: Query all DEL DSL script blocks in the HTML document
        const delScripts = document.querySelectorAll('script[type="text/del"]');
        if (delScripts.length === 0) return;

        // Step 3: Initialize SQL Engine if database keywords are present in any DEL script
        let sqlDb = null;
        const hasSqlKeywords = Array.from(delScripts).some(s => /Database|Table|Save|Fetch/.test(s.textContent));
        if (hasSqlKeywords) {
            sqlDb = await initSqlDatabase();
        }

        // Step 4: Parse and transpile each DEL script block
        delScripts.forEach(script => {
            const rawDelCode = script.textContent;
            transpileAndExecuteDEL(rawDelCode, sqlDb);
        });
    });

    /**
     * Checks and applies the saved user theme (Dark or Light mode) from localStorage.
     */
    function initPersistentTheme() {
        const savedTheme = localStorage.getItem("del_app_theme");
        const body = document.body;

        if (savedTheme === "light") {
            body.classList.remove("dark", "bg-slate-900");
            body.classList.add("bg-slate-100");
        } else {
            // Default theme is Dark Mode
            body.classList.add("dark", "bg-slate-900");
            body.classList.remove("bg-slate-100");
        }
    }

    /**
     * Initializes the SQLite WASM library (sql.js) and restores state from localStorage.
     * @returns {Promise<Object>} The initialized SQLite database object.
     */
    async function initSqlDatabase() {
        try {
            if (typeof initSqlJs === "undefined") {
                console.warn("DEL.js Warning: sql.js library not detected. Load sql.js CDN to use Database functions.");
                return null;
            }

            // Load SQLite WASM binary from public CDN
            const SQL = await initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
            });

            // Restore existing database binary from localStorage if available
            const savedDbBinary = localStorage.getItem("del_app_sql_db");
            if (savedDbBinary) {
                const uInt8Array = new Uint8Array(JSON.parse(savedDbBinary));
                return new SQL.Database(uInt8Array);
            }

            return new SQL.Database();
        } catch (error) {
            console.error("DEL.js SQL Initialization Error:", error);
            return null;
        }
    }

    /**
     * Transpiles DEL DSL syntax into valid HTML, CSS, and JS components.
     * @param {string} code - Raw DEL DSL source code.
     * @param {Object|null} db - SQLite database instance.
     */
    function transpileAndExecuteDEL(code, db) {
        let cleanCode = code;

        // ----------------------------------------------------------------------
        // A. Extract and Execute Native JS Scripts: Script { ... }
        // ----------------------------------------------------------------------
        cleanCode = cleanCode.replace(/Script\s*\{([\s\S]*?)\}/g, (match, jsCode) => {
            const scriptTag = document.createElement("script");
            scriptTag.textContent = jsCode;
            document.body.appendChild(scriptTag);
            return ""; // Remove JS script block from DEL code string
        });

        // ----------------------------------------------------------------------
        // B. Extract and Inject CSS Styles: Style Element { ... }
        // ----------------------------------------------------------------------
        const styleTag = document.createElement("style");
        styleTag.type = "text/css";
        let compiledCss = "";

        cleanCode = cleanCode.replace(/Style\s+(.*?)\s*\{([\s\S]*?)\}/g, (match, selector, rules) => {
            // Convert custom DEL selector names to standard HTML elements
            let cssSelector = selector.trim();
            if (cssSelector === "Window") cssSelector = "#del-app-container";
            else if (cssSelector === "Text") cssSelector = ".del-text";
            else if (cssSelector === "Input") cssSelector = ".del-input";
            else if (cssSelector === "Button") cssSelector = ".del-button";

            compiledCss += `${cssSelector} { ${rules} }\n`;
            return ""; // Remove Style block from DEL code string
        });

        if (compiledCss) {
            styleTag.textContent = compiledCss;
            document.head.appendChild(styleTag);
        }

        // ----------------------------------------------------------------------
        // C. Process Database Queries: Database, Table, Save, Fetch
        // ----------------------------------------------------------------------
        if (db) {
            // Process Table creation: Table "table_name" (schema)
            cleanCode = cleanCode.replace(/Table\s+"(.*?)"\s*\((.*?)\)/g, (match, tableName, schema) => {
                db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (${schema});`);
                saveDatabaseToLocalStorage(db);
                return "";
            });

            // Process Save query: Save "table_name" (columns) -> value
            cleanCode = cleanCode.replace(/Save\s+"(.*?)"\s*\((.*?)\)\s*->\s*(.*)/g, (match, tableName, columns, value) => {
                const evalVal = evalValue(value.trim());
                db.run(`INSERT INTO ${tableName} (${columns}) VALUES ('${evalVal}');`);
                saveDatabaseToLocalStorage(db);
                return `console.log("DEL SQL: Data saved to ${tableName}");`;
            });
        }

        // ----------------------------------------------------------------------
        // D. Process UI Layout & Window Components
        // ----------------------------------------------------------------------
        let appContainer = document.getElementById("del-app-container");
        if (!appContainer) {
            appContainer = document.createElement("div");
            appContainer.id = "del-app-container";
            document.body.appendChild(appContainer);
        }

        // Process Window directive: Window "Title", width, height
        cleanCode = cleanCode.replace(/Window\s+"(.*?)",\s*(\d+),\s*(\d+)/g, (match, title, w, h) => {
            document.title = title;
            appContainer.style.width = w + "px";
            appContainer.style.minHeight = h + "px";
            return "";
        });

        // Process Text directive: Text "Content"
        cleanCode = cleanCode.replace(/Text\s+"(.*?)"/g, (match, textContent) => {
            return `<div class="del-text">${textContent}</div>`;
        });

        // Process Input directive: Input "Placeholder" -> variableName
        cleanCode = cleanCode.replace(/Input\s+"(.*?)"\s*->\s*([a-zA-Z0-9_]+)/g, (match, placeholder, varName) => {
            return `<input type="text" id="${varName}" class="del-input" placeholder="${placeholder}" oninput="window.${varName} = this.value;" />`;
        });

        // Process Button directive: Button "Label" -> { action }
        cleanCode = cleanCode.replace(/Button\s+"(.*?)"\s*->\s*\{([\s\S]*?)\}/g, (match, label, actionCode) => {
            const cleanAction = actionCode.trim().replace(/"/g, "&quot;");
            return `<button class="del-button" onclick="${cleanAction}">${label}</button>`;
        });

        // Process Notify directive: Notify "Message"
        cleanCode = cleanCode.replace(/Notify\s+(.*)/g, (match, msg) => {
            return `alert(${msg});`;
        });

        // Append generated UI elements into the container
        appContainer.innerHTML += cleanCode;
    }

    /**
     * Helper to safely evaluate input values or string variables.
     */
    function evalValue(val) {
        if (window[val] !== undefined) {
            return window[val];
        }
        return val.replace(/^["']|["']$/g, ""); // Strip quotes if literal string
    }

    /**
     * Exports the SQLite binary and persists it to localStorage.
     */
    function saveDatabaseToLocalStorage(db) {
        if (!db) return;
        const data = db.export();
        const array = Array.from(data);
        localStorage.setItem("del_app_sql_db", JSON.stringify(array));
    }

    /**
     * Global Helper Function: Toggles Dark/Light Theme and persists choice.
     */
    window.toggleTheme = function () {
        const body = document.body;
        body.classList.toggle("dark");

        if (body.classList.contains("dark")) {
            body.classList.remove("bg-slate-100");
            body.classList.add("bg-slate-900");
            localStorage.setItem("del_app_theme", "dark");
        } else {
          body.classList.remove("bg-slate-900");
          body.classList.add("bg-slate-100");
          localStorage.setItem("del_app_theme", "light");
        }
    };
})();
