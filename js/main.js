(function () {
    var site = window.GDDB_SITE || {};

    function setText(id, text) {
        var el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    function icon(name, className) {
        var ns = "http://www.w3.org/2000/svg";
        var svg = document.createElementNS(ns, "svg");
        var use = document.createElementNS(ns, "use");
        svg.setAttribute("class", "icon " + (className || ""));
        svg.setAttribute("aria-hidden", "true");
        use.setAttribute("href", "#" + name);
        svg.appendChild(use);
        return svg;
    }

    function renderDownloads(items) {
        var list = document.getElementById("downloadList");
        if (!list) return;
        items.forEach(function (item) {
            var card = el("div", "card download-card");
            card.appendChild(icon(item.platform === "Windows" ? "i-window" : "i-terminal", "platform-icon"));
            card.appendChild(el("span", "platform-tag", item.platform + " · " + item.arch));
            card.appendChild(el("h3", "", item.title));
            card.appendChild(el("p", "requirement", "运行环境：" + item.requirement));
            card.appendChild(el("p", "", item.note));

            if (item.available === false) {
                var unavailable = el("span", "btn btn-disabled", "暂未发布");
                unavailable.setAttribute("aria-disabled", "true");
                card.appendChild(unavailable);
            } else {
                var link = el("a", "btn btn-primary", "下载 V" + site.version);
                link.href = item.file;
                link.setAttribute("aria-label", "下载 " + item.title + " V" + site.version);
                link.appendChild(icon("i-download"));
                card.appendChild(link);
            }
            list.appendChild(card);
        });
    }

    function initDemoTabs() {
        var section = document.getElementById("demo");
        var panels = Array.prototype.slice.call(section.querySelectorAll(".demo-row"));
        var names = ["连接管理", "数据编辑", "SQL 查询", "表结构设计", "导入与传输", "个性化"];
        var tablist = el("div", "demo-tabs");
        tablist.setAttribute("role", "tablist");
        tablist.setAttribute("aria-label", "产品功能演示");
        var tabs = panels.map(function (panel, index) {
            var number = ("0" + (index + 1)).slice(-2);
            var tab = el("button", "demo-tab");
            tab.type = "button";
            tab.id = "demo-tab-" + index;
            tab.setAttribute("role", "tab");
            tab.setAttribute("aria-controls", "demo-panel-" + index);
            tab.appendChild(el("span", "", number));
            tab.appendChild(document.createTextNode(names[index]));
            panel.id = "demo-panel-" + index;
            panel.setAttribute("role", "tabpanel");
            panel.setAttribute("aria-labelledby", tab.id);
            panel.tabIndex = 0;
            var text = panel.querySelector(".demo-text");
            text.insertBefore(el("span", "demo-number", "WORKFLOW / " + number), text.firstChild);
            var heading = panel.querySelector("h3");
            heading.textContent = heading.textContent.replace(/^\d+\.\s*/, "");
            tab.addEventListener("click", function () { activate(index); });
            tab.addEventListener("keydown", function (event) {
                var next;
                if (event.key === "ArrowRight") next = (index + 1) % panels.length;
                if (event.key === "ArrowLeft") next = (index - 1 + panels.length) % panels.length;
                if (event.key === "Home") next = 0;
                if (event.key === "End") next = panels.length - 1;
                if (next === undefined) return;
                event.preventDefault();
                activate(next);
                tabs[next].focus();
            });
            tablist.appendChild(tab);
            return tab;
        });
        function activate(index) {
            panels.forEach(function (panel, i) {
                panel.hidden = i !== index;
                tabs[i].setAttribute("aria-selected", String(i === index));
                tabs[i].tabIndex = i === index ? 0 : -1;
            });
        }
        panels[0].parentNode.insertBefore(tablist, panels[0]);
        activate(0);
    }

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.getElementById("siteNav");
        var mobile = window.matchMedia("(max-width: 800px)");
        var open = false;
        function update() {
            toggle.hidden = !mobile.matches;
            nav.hidden = mobile.matches && !open;
            toggle.setAttribute("aria-expanded", String(mobile.matches && open));
        }
        toggle.addEventListener("click", function () {
            open = !open;
            update();
        });
        nav.addEventListener("click", function (event) {
            if (!event.target.closest("a")) return;
            open = false;
            update();
        });
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && mobile.matches && open) {
                open = false;
                update();
                toggle.focus();
            }
        });
        mobile.addEventListener("change", function () {
            open = false;
            update();
        });
        update();
    }

    function initImageViewer() {
        var dialog = document.querySelector(".image-dialog");
        if (!dialog || typeof dialog.showModal !== "function") return;
        var image = document.getElementById("dialogImage");
        var caption = document.getElementById("imageCaption");
        var trigger;
        document.querySelectorAll('a[href^="assets/screenshots/"]').forEach(function (link) {
            var thumbnail = link.querySelector("img");
            link.setAttribute("aria-haspopup", "dialog");
            link.setAttribute("aria-label", "放大查看：" + thumbnail.alt);
            link.addEventListener("click", function (event) {
                // 保留 Ctrl/Cmd 点击和新标签页的浏览器默认行为。
                if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
                event.preventDefault();
                trigger = link;
                image.src = link.href;
                image.alt = thumbnail.alt;
                caption.textContent = thumbnail.alt;
                dialog.showModal();
                dialog.querySelector(".dialog-image-wrap").scrollTo(0, 0);
                document.body.classList.add("modal-open");
            });
        });
        dialog.querySelector(".dialog-close").addEventListener("click", function () { dialog.close(); });
        dialog.addEventListener("click", function (event) {
            var bounds = dialog.getBoundingClientRect();
            if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right ||
                    event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
        });
        dialog.addEventListener("close", function () {
            document.body.classList.remove("modal-open");
            if (trigger) trigger.focus({ preventScroll: true });
        });
    }

    if (site.version) {
        setText("heroVersion", "当前版本 V" + site.version);
        setText("downloadVersion", "V" + site.version);
    }
    if (site.releaseDate) setText("downloadDate", site.releaseDate);
    renderDownloads(site.downloads || []);
    initDemoTabs();
    initMenu();
    initImageViewer();
})();
