"""Fetch the latest RSS posts and render lightweight, image-free blog cards.

If the feed is unavailable, keep the existing cards unchanged.
Only the RSS feed is fetched; article pages and OG images are not requested.
"""

import re
import sys
import time
import urllib.request
from email.utils import parsedate_to_datetime
from html import escape
from pathlib import Path
from xml.etree import ElementTree

RSS_URLS = [
    "https://blog.abohack.com/rss.xml",
    "https://rss.beauty/rss?url=https%3A%2F%2Fblog.abohack.com%2Frss.xml",
]
ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
MAX_POSTS = 4
FETCH_ATTEMPTS = 3
START = "                        <!-- BLOG_POSTS_START -->"
END = "                        <!-- BLOG_POSTS_END -->"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
TITLE_RE = re.compile(r"^「([^」]+)」\s*(?:[-—–]\s*)?(.*)$")

ARTICLE_ICON = '<svg class="ph-icon" viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM184,96a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,96Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,128Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,160Z"/></svg>'
ARROW_ICON = '<svg class="ph-icon blog-open-icon" viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"/></svg>'


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
    raise last_err  # pyright: ignore[reportGeneralTypeIssues]


def render_card(post):
    title = escape(post["title"], quote=True)
    category = escape(post["category"], quote=True)
    link = escape(post["link"], quote=True)
    date = escape(post["date"], quote=True)
    date_markup = f'<time class="blog-date" datetime="{date}">{date}</time>' if date else ""
    return f'''                        <li class="blog-post-item">
                            <a href="{link}" target="_blank" rel="noopener noreferrer">
                                <div class="blog-card-top">
                                    <div class="blog-icon-box">{ARTICLE_ICON}</div>
                                    <span class="blog-category">{category}</span>
                                    {ARROW_ICON}
                                </div>
                                <h3 class="blog-item-title">{title}</h3>
                                {date_markup}
                            </a>
                        </li>'''


def main():
    items = fetch_feed()
    posts = []
    for item in items:
        raw_title = (item.findtext("title") or "").strip()
        match = TITLE_RE.match(raw_title)
        title = match.group(2).strip() if match else raw_title
        category = match.group(1).strip() if match else (item.findtext("category") or "随笔").strip()
        link = (item.findtext("link") or "").strip()
        if not title or not link.startswith(("https://", "http://")):
            continue
        pub = item.findtext("pubDate")
        try:
            date = parsedate_to_datetime(pub).date().isoformat() if pub else ""
        except (TypeError, ValueError):
            date = ""
        posts.append({"title": title, "category": category, "link": link, "date": date})

    posts.sort(key=lambda post: post["date"], reverse=True)
    posts = posts[:MAX_POSTS]
    if not posts:
        raise RuntimeError("feed parsed but produced no usable posts")
    cards = [render_card(post) for post in posts]
    html = INDEX.read_text(encoding="utf-8")
    start = html.index(START) + len(START)
    end = html.index(END)
    INDEX.write_text(html[:start] + "\n" + "\n\n".join(cards) + "\n" + html[end:], encoding="utf-8")
    print(f"wrote {len(posts)} text blog cards to {INDEX}")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(f"warn: blog sync skipped, keeping existing content: {err}", file=sys.stderr)
        sys.exit(0)
