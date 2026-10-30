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

    function renderDownloads(items) {
        var list = document.getElementById("downloadList");
        if (!list) return;
        items.forEach(function (item) {
            var card = el("div", "card download-card");
            card.appendChild(el("span", "platform-tag", item.platform + " · " + item.arch));
            card.appendChild(el("h3", "", item.title));
            card.appendChild(el("p", "requirement", "运行环境：" + item.requirement));
            card.appendChild(el("p", "", item.note));

            if (item.available === false) {
                card.appendChild(el("span", "btn btn-disabled", "暂未发布"));
            } else {
                var link = el("a", "btn btn-primary", "下载 " + site.version);
                link.href = item.file;
                link.setAttribute("download", "");
                card.appendChild(link);
            }
            list.appendChild(card);
        });
    }

    if (site.version) {
        setText("heroVersion", "当前版本 V" + site.version);
        setText("downloadVersion", "V" + site.version);
    }
    if (site.releaseDate) setText("downloadDate", site.releaseDate);
    renderDownloads(site.downloads || []);
})();
