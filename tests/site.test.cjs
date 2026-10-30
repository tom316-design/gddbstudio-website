const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "css/style.css"), "utf8");

test("local resources exist and section anchors resolve", () => {
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, "duplicate HTML ids");
    for (const match of html.matchAll(/(?<![-\w])(?:href|src)="([^"]+)"/g)) {
        const target = match[1];
        if (target.startsWith("#")) {
            assert.ok(ids.includes(target.slice(1)), "missing anchor: " + target);
        } else if (!/^https?:/.test(target)) {
            assert.ok(fs.existsSync(path.join(root, target)), "missing resource: " + target);
        }
    }
    for (const file of ["assets/demo/workflow.gif", "assets/demo/workflow-en.gif"]) {
        assert.ok(fs.existsSync(path.join(root, file)), "missing demo: " + file);
    }
});

test("every translation key used in markup exists in both dictionaries", () => {
    const i18n = fs.readFileSync(path.join(root, "js/i18n.js"), "utf8");
    const keys = new Set([...i18n.matchAll(/^\s*"([^"]+)":/gm)].map(match => match[1]));
    const used = [...html.matchAll(/data-i18n(?:-[a-z]+)?="([^"]+)"/g)].map(match => match[1]);
    for (const key of used) assert.ok(keys.has(key), "missing translation key: " + key);
    assert.ok(used.length > 100, "translation markup is unexpectedly small");
});

test("all product screenshots have descriptive alternative text", () => {
    const images = [...html.matchAll(/<img\b[^>]*>/g)].map(match => match[0]);
    for (const image of images) {
        assert.match(image, /\balt="[^"]*"/);
        if (image.includes("screenshots/")) assert.match(image, /\balt="[^"]+"/);
    }
    assert.equal((html.match(/class="demo-row/g) || []).length, 6);
});

test("published packages retain their release URLs and unreleased Linux is disabled", () => {
    const context = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(root, "config.js"), "utf8"), context);
    const site = context.window.GDDB_SITE;
    assert.equal(site.version, "0.7.0");
    assert.equal(site.downloads.length, 3);
    const available = site.downloads.filter(item => item.available !== false);
    assert.equal(available.length, 2);
    for (const item of available) {
        assert.ok(item.file.startsWith("https://github.com/tom316-design/gddbstudio-website/releases/latest/download/"));
    }
    assert.equal(site.downloads[2].available, false);
});

test("styles support reduced motion, hidden panels and native image proportions", () => {
    assert.match(css, /prefers-reduced-motion:\s*reduce/);
    assert.match(css, /\[hidden\]\s*\{\s*display:\s*none\s*!important/);
    assert.match(css, /object-fit:\s*contain/);
    assert.doesNotMatch(css, /backdrop-filter/);
    assert.doesNotMatch(css, /var\(--(?:primary|border|radius|bg|text)\)/);
});

test("public page and changelog omit restricted organization names", () => {
    const restricted = /\u4e2d\u56fd\u79fb\u52a8|\u5e7f\u4e1c\u79fb\u52a8|chinamobile/i;
    for (const file of ["index.html", "config.js", "js/main.js", "downloads/CHANGELOG.txt"]) {
        assert.doesNotMatch(fs.readFileSync(path.join(root, file), "utf8"), restricted);
    }
});
