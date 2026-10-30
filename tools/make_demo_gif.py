"""生成官网首页的循环操作演示 GIF（由软件真实界面截图拼接并加入过渡动画）。

用法：python tools/make_demo_gif.py
输入：assets/screenshots/ 下的截图
输出：assets/demo/workflow.gif（中文）、assets/demo/workflow-en.gif（English）
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "assets" / "screenshots"
OUT_DIR = ROOT / "assets" / "demo"
FONT = "C:/Windows/Fonts/msyh.ttc"

W, H = 1000, 620
HEADER, FOOTER, PAD = 96, 46, 22
BG_TOP, BG_BOTTOM = (9, 28, 43), (14, 42, 58)
ACCENT = (129, 245, 213)
MUTED = (150, 178, 192)
TEXT = (236, 244, 247)
HOLD_MS, FADE_MS, FADE_FRAMES = 2600, 360, 3

LOCALES = {
    "zh": {
        "file": "workflow.gif",
        "brand": "GDDBStudio 操作演示",
        "steps": [
            ("connection-type.png", "新建连接", "选择数据库类型，如 MySQL、PostgreSQL、达梦"),
            ("connection-form.png", "填写参数，测试连接", "主机、端口、账号一目了然，测试成功后保存"),
            ("data-grid.png", "双击表，打开数据网格", "分页浏览大表，单元格可直接编辑"),
            ("data-filter.png", "构建筛选条件，精准管理数据", "可视化条件，也可直接编写原始 WHERE 表达式"),
            ("sql-editor.png", "新建查询，编写 SQL", "语法高亮与自动完成，整段或选中执行"),
            ("sql-result.png", "执行查询，查看结果集", "多条语句生成多个结果集，结果即时呈现"),
        ],
    },
    "en": {
        "file": "workflow-en.gif",
        "brand": "GDDBStudio Demo",
        "steps": [
            ("connection-type.png", "Create a new connection", "Choose a database type: MySQL, PostgreSQL, DM8 and more"),
            ("connection-form.png", "Enter parameters and test", "Host, port and account at a glance; save once the test passes"),
            ("data-grid.png", "Open a table in the data grid", "Page through large tables; edit cells directly"),
            ("data-filter.png", "Build filters to manage data", "Visual conditions, or raw WHERE expressions"),
            ("sql-editor.png", "Open a query and write SQL", "Syntax highlighting, auto-completion; run all or selected SQL"),
            ("sql-result.png", "Run the query, view results", "Multiple statements produce multiple result sets"),
        ],
    },
}


def font(size, bold=False):
    return ImageFont.truetype(FONT, size, index=1 if bold else 0)


def background():
    img = Image.new("RGB", (W, H), BG_TOP)
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y / (H - 1)
        color = tuple(round(BG_TOP[i] + (BG_BOTTOM[i] - BG_TOP[i]) * t) for i in range(3))
        draw.line([(0, y), (W, y)], fill=color)
    return img


def compose(brand, steps, shot_name, index, title, subtitle):
    canvas = background()
    draw = ImageDraw.Draw(canvas)

    draw.text((PAD, 18), brand, font=font(15, True), fill=ACCENT)
    draw.text((W - PAD, 20), f"{index + 1:02d} / {len(steps):02d}", font=font(14), fill=MUTED, anchor="ra")
    draw.text((PAD, 40), title, font=font(24, True), fill=TEXT)
    draw.text((PAD, 72), subtitle, font=font(14), fill=MUTED)

    shot = Image.open(SHOTS / shot_name).convert("RGB")
    avail_w, avail_h = W - PAD * 2, H - HEADER - FOOTER - 14
    scale = min(avail_w / shot.width, avail_h / shot.height, 1.0 if shot.width < 800 else 2.0)
    size = (round(shot.width * scale), round(shot.height * scale))
    shot = shot.resize(size, Image.LANCZOS)
    x = (W - size[0]) // 2
    y = HEADER + (avail_h - size[1]) // 2 + 4

    draw.rounded_rectangle([x - 6, y - 6, x + size[0] + 6, y + size[1] + 6], radius=10, fill=(22, 52, 68), outline=(60, 96, 112))
    canvas.paste(shot, (x, y))

    seg_w = (W - PAD * 2 - (len(steps) - 1) * 6) / len(steps)
    for i in range(len(steps)):
        x0 = PAD + i * (seg_w + 6)
        color = ACCENT if i == index else (48, 78, 94)
        draw.rounded_rectangle([x0, H - 22, x0 + seg_w, H - 17], radius=2, fill=color)
    return canvas


def build(locale):
    config = LOCALES[locale]
    steps = config["steps"]
    slides = [compose(config["brand"], steps, shot, i, title, sub) for i, (shot, title, sub) in enumerate(steps)]
    frames, durations = [], []
    region = (0, HEADER, W, H - FOOTER)
    empty = background().crop(region)
    for i, slide in enumerate(slides):
        frames.append(slide)
        durations.append(HOLD_MS)
        nxt = slides[(i + 1) % len(slides)]
        for k in range(1, FADE_FRAMES + 1):
            frame = slide.copy()
            frame.paste(Image.blend(slide.crop(region), empty, k / FADE_FRAMES), region[:2])
            frames.append(frame)
            durations.append(FADE_MS // FADE_FRAMES)
        for k in range(1, FADE_FRAMES + 1):
            frame = nxt.copy()
            frame.paste(Image.blend(empty, nxt.crop(region), k / FADE_FRAMES), region[:2])
            frames.append(frame)
            durations.append(FADE_MS // FADE_FRAMES)

    palette_frames = [f.quantize(colors=256, method=Image.Quantize.FASTOCTREE) for f in frames]
    out = OUT_DIR / config["file"]
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    palette_frames[0].save(out, save_all=True, append_images=palette_frames[1:], duration=durations, loop=0, optimize=True, disposal=2)
    print(f"wrote {out} frames={len(frames)} size={out.stat().st_size // 1024} KB")


def main():
    for locale in LOCALES:
        build(locale)


if __name__ == "__main__":
    main()
