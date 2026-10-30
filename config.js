/*
 * 官网发布配置：发布新版本时只需修改这里的 version / releaseDate，
 * 并在 GitHub Releases 发布新版本，上传与下方文件名一致的安装包。
 */
var RELEASE_BASE = "https://github.com/tom316-design/gddbstudio-website/releases/latest/download/";

window.GDDB_SITE = {
    version: "0.7.0",
    releaseDate: "2026-09-18",
    downloads: [
        {
            platform: "Windows",
            arch: "x64",
            title: "Windows 解压即用版",
            file: RELEASE_BASE + "GDDBStudio-windows-x64.zip",
            requirement: "Windows 64 位桌面系统",
            note: "解压到任意目录后双击 GDDBStudio.exe 即可运行，无需安装。"
        },
        {
            platform: "统信 UOS",
            arch: "ARM64",
            title: "统信 UOS 20 ARM64 版",
            file: RELEASE_BASE + "GDDBStudio-uos-20-aarch64.tar.gz",
            requirement: "统信 UOS 20 (ARM64)，glibc 2.28 及以上",
            note: "解压后保留整个 GDDBStudio 目录，运行其中的 GDDBStudio 可执行文件。"
        },
        {
            platform: "银河麒麟 / 通用 Linux",
            arch: "x86_64",
            title: "Linux x86_64 版",
            file: RELEASE_BASE + "GDDBStudio-linux-x86_64.tar.gz",
            requirement: "主流 Linux 桌面发行版 64 位",
            note: "解压后保留整个 GDDBStudio 目录，不要删除 _internal 目录。",
            available: false
        }
    ],
    changelog: "downloads/CHANGELOG.txt"
};
