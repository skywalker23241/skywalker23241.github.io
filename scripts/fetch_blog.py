"""Fetch the blog RSS feed and write static Blog cards into index.html.

Fetches https://blog.abohack.com/rss.xml directly (rss.beauty proxy as
fallback) and bakes the latest posts into the static page.

Covers come from each article's og:image meta tag (with the image embedded in
the RSS item as fallback). If the feed cannot be fetched or parsed, the script
leaves index.html untouched and exits 0 so the scheduled workflow stays green.
"""

import re
import sys
import time
import urllib.request
from email.utils import parsedate_to_datetime
from html import escape, unescape
from pathlib import Path
from urllib.parse import urljoin
from xml.etree import ElementTree

RSS_URLS = [
    "https://blog.abohack.com/rss.xml",
    "https://rss.beauty/rss?url=https%3A%2F%2Fblog.abohack.com%2Frss.xml",  # proxy fallback
]
ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
MAX_POSTS = 4
FETCH_ATTEMPTS = 3
NS = {
    "content": "http://purl.org/rss/1.0/modules/content/",
    "media": "http://search.yahoo.com/mrss/",
}
START = "                        <!-- BLOG_POSTS_START -->"
END = "                        <!-- BLOG_POSTS_END -->"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
DEFAULT_COVER = "./assets/images/blog-1.svg"

# titles look like 「分类」- 文章标题
TITLE_RE = re.compile(r"^「(.+?)」\s*-\s*(.*)$")

# og:image with either attribute order
OG_IMAGE_RES = [
    re.compile(r'<meta[^>]+(?:property|name)=["\']og:image["\'][^>]*?content=["\']([^"\']+)["\']', re.I),
    re.compile(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]*?(?:property|name)=["\']og:image["\']', re.I),
]
IMG_SRC_RE = re.compile(r'<img[^>]+src=["\']([^"\']+)["\']', re.I)


def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="replace")


def fetch_feed():
    """Try each RSS source with retries; return parsed items or raise."""
    last_err = None
    for url in RSS_URLS:
        for attempt in range(FETCH_ATTEMPTS):
            try:
                text = fetch(url)
                root = ElementTree.fromstring(text)
                items = root.findall(".//item")
                if items:
                    return items
                last_err = RuntimeError(f"no <item> in feed from {url}")
            except Exception as err:  # bad XML (proxy error page), timeout, HTTP error
                last_err = err
                print(f"warn: fetch {url} attempt {attempt + 1} failed: {err}", file=sys.stderr)
            time.sleep(3 * (attempt + 1))
    raise last_err


def image_from_item(item):
    """Image embedded in the RSS item itself, if any."""
    enclosure = item.find("enclosure")
    if enclosure is not None:
        url = (enclosure.get("url") or "").strip()
        if url.startswith("http") and enclosure.get("type", "image").startswith("image"):
            return url
    media = item.find("media:content", NS)
    if media is not None and (media.get("url") or "").startswith("http"):
        return media.get("url").strip()
    body = item.findtext("content:encoded", default="", namespaces=NS) or item.findtext("description") or ""
    m = IMG_SRC_RE.search(unescape(body))
    if m and m.group(1).startswith("http"):
        return m.group(1).strip()
    return ""


def og_image(link):
    """og:image from the article page; empty string on any failure."""
    if not link:
        return ""
    try:
        page = fetch(link, timeout=20)
    except Exception as err:
        print(f"warn: cover fetch failed for {link}: {err}", file=sys.stderr)
        return ""
    for pattern in OG_IMAGE_RES:
        m = pattern.search(page)
        if m:
            return urljoin(link, unescape(m.group(1)).strip())
    return ""


def main():
    items = fetch_feed()

    posts = []
    for item in items:
        raw_title = (item.findtext("title") or "").strip()
        m = TITLE_RE.match(raw_title)
        title = m.group(2).strip() if m else raw_title
        if not title:
            continue

        pub = item.findtext("pubDate")
        try:
            date = parsedate_to_datetime(pub).date().isoformat() if pub else ""
        except (TypeError, ValueError):
            date = ""

        posts.append({
            "title": title,
            "link": (item.findtext("link") or "").strip(),
            "date": date,
            "item": item,
        })

    posts.sort(key=lambda p: p["date"], reverse=True)
    posts = posts[:MAX_POSTS]
    if not posts:
        raise RuntimeError("feed parsed but produced no usable posts")

    cards = []
    for post in posts:
        cover = og_image(post["link"]) or image_from_item(post["item"]) or DEFAULT_COVER
        title = escape(post["title"], quote=True)
        link = escape(post["link"], quote=True)
        date = escape(post["date"], quote=True)
        image = escape(cover, quote=True)

        cards.append(f'''                        <li class="blog-post-item">
                            <a href="{link}" target="_blank" rel="noopener noreferrer">
                                <figure class="blog-banner-box">
                                    <img src="{image}" alt="{title}" loading="lazy">
                                </figure>

                                <div class="blog-content">
                                    <div class="blog-meta">
                                        <time datetime="{date}">{date}</time>
                                    </div>
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
    try:
        main()
    except Exception as err:
        # keep the existing cards and let the scheduled workflow stay green
        print(f"warn: blog sync skipped, keeping existing content: {err}", file=sys.stderr)
        sys.exit(0)
