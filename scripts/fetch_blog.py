"""Fetch the blog RSS feed and write static Blog cards into index.html.

The blog itself (https://jackcooper.qzz.io) sits behind a Cloudflare challenge
and sends no CORS headers, so the browser cannot read it directly. This script
runs server-side (GitHub Action / locally) via the rss.beauty proxy instead,
then bakes the latest posts into the static page.
"""

import re
import random
import urllib.request
from email.utils import parsedate_to_datetime
from html import escape
from pathlib import Path
from xml.etree import ElementTree

RSS_URL = "https://rss.beauty/rss?url=https%3A%2F%2Fjackcooper.qzz.io%2Frss.xml"
ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
COVER_DIR = ROOT / "assets" / "images" / "blog-post-cover"
MAX_POSTS = 4
NS = {"content": "http://purl.org/rss/1.0/modules/content/"}
START = "                        <!-- BLOG_POSTS_START -->"
END = "                        <!-- BLOG_POSTS_END -->"

# titles look like 「分类」- 文章标题
TITLE_RE = re.compile(r"^「(.+?)」\s*-\s*(.*)$")


def main():
    req = urllib.request.Request(RSS_URL, headers={"User-Agent": "Mozilla/5.0 (blog-sync)"})
    xml = urllib.request.urlopen(req, timeout=30).read().decode("utf-8")
    root = ElementTree.fromstring(xml)

    posts = []
    for item in root.iter("item"):
        raw_title = (item.findtext("title") or "").strip()
        m = TITLE_RE.match(raw_title)
        title = m.group(2) if m else raw_title

        pub = item.findtext("pubDate")
        date = parsedate_to_datetime(pub).date().isoformat() if pub else ""

        posts.append({
            "title": title,
            "link": (item.findtext("link") or "").strip(),
            "date": date,
        })

    posts.sort(key=lambda p: p["date"], reverse=True)
    posts = posts[:MAX_POSTS]

    cover_images = [
        "./" + path.relative_to(ROOT).as_posix()
        for path in COVER_DIR.iterdir()
        if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".avif"}
    ]
    random.shuffle(cover_images)

    if not cover_images:
        cover_images = [
            "./assets/images/blog-1.svg",
            "./assets/images/blog-2.svg",
            "./assets/images/blog-3.svg",
        ]

    cards = []
    for index, post in enumerate(posts):
        title = escape(post["title"], quote=True)
        link = escape(post["link"], quote=True)
        date = escape(post["date"], quote=True)
        image = escape(cover_images[index % len(cover_images)], quote=True)

        cards.append(f'''                        <li class="blog-post-item">
                            <a href="{link}" target="_blank" rel="noopener noreferrer">
                                <figure class="blog-banner-box">
                                    <img src="{image}" alt="{title}" loading="lazy">
                                </figure>

                                <div class="blog-content">
                                    <div class="blog-meta">
                                        <time datetime="{date}">{date}</time>
                                    </div>

                                    <h3 class="h3 blog-item-title">{title}</h3>
                                </div>
                            </a>
                        </li>''')

    html = INDEX.read_text(encoding="utf-8")
    start = html.index(START) + len(START)
    end = html.index(END)
    updated = html[:start] + "\n" + "\n\n".join(cards) + "\n" + html[end:]
    INDEX.write_text(updated, encoding="utf-8")
    print(f"wrote {len(posts)} static blog posts to {INDEX}")


if __name__ == "__main__":
    main()
