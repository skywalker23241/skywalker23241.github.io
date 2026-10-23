/* Local copy only: no translation service or additional dependencies. */
(() => {
  'use strict';
  const copy = [
    ['.info-content .title', 'Web developer', 'Web 开发者'],
    ['[data-sidebar-btn] span', 'Show Contacts', '联系信息'],
    ['[data-sidebar-btn]', 'Show contacts', '展开联系信息', 'aria-label'],
    ['.contact-title', 'Email', '邮箱', null, 0],
    ['.contact-title', 'Phone', '电话', null, 1],
    ['.contact-title', 'Birthday', '生日', null, 2],
    ['.contact-title', 'Location', '所在地', null, 3],
    ['time[datetime="2002-01-18"]', 'Jan 18, 2002', '2002 年 1 月 18 日'],
    ['.contact-info address', 'Shenzhen, Guangdong, China', '中国 · 广东 · 深圳'],
    ['.navbar', 'Main navigation', '主导航', 'aria-label'],
    ['[data-nav-link="about"] span', 'About', '关于'],
    ['[data-nav-link="resume"] span', 'Resume', '简历'],
    ['[data-nav-link="portfolio"] span', 'Portfolio', '作品集'],
    ['[data-nav-link="blog"] span', 'Blog', '博客'],
    ['[data-nav-link="contact"] span', 'Contact', '联系'],
    ['[data-nav-link="about"]', 'About', '关于', 'aria-label'],
    ['[data-nav-link="resume"]', 'Resume', '简历', 'aria-label'],
    ['[data-nav-link="portfolio"]', 'Portfolio', '作品集', 'aria-label'],
    ['[data-nav-link="blog"]', 'Blog', '博客', 'aria-label'],
    ['[data-nav-link="contact"]', 'Contact', '联系', 'aria-label'],
    ['.about .article-title', 'About me', '关于我'],
    ['.resume .article-title', 'Resume', '个人简历'],
    ['.portfolio .article-title', 'Portfolio', '作品集'],
    ['.blog .article-title', 'Blog', '博客'],
    ['.contact .article-title', 'Contact', '联系我'],
    ['.about-text p', 'I am an English major and AI enthusiast with a minor in Computer Science and Technology. My background combines language, technology, and digital creativity, with experience in SEO, website optimization, translation, and basic web design.', '我毕业于英语专业，辅修计算机科学与技术，也是一名 AI 爱好者。我的经历结合了语言、技术与数字创作，涵盖 SEO、网站优化、翻译和基础网页设计。', null, 0],
    ['.about-text p', 'I enjoy using AI tools such as Codex and Claude Code to create interesting and practical projects. I also explore new AI platforms and resources independently, staying creative, adaptable, and open to new possibilities.', '我喜欢使用 Codex、Claude Code 等 AI 工具制作有趣、实用的项目，也乐于自主探索新的 AI 平台和资源，保持创造力、适应能力和对新事物的好奇心。', null, 1],
    ['.about-text p', 'With my English communication skills and technical learning experience, I aim to create content and web pages that are clear, attractive, user-friendly, and easy to understand.', '我希望结合英语沟通能力与技术学习经验，创作清晰、美观、易用且易于理解的内容和网页。', null, 2],
    ['.service-title', "What I'm doing", '我正在做的事'],
    ['.service-item-title', 'Web development', 'Web 开发', null, 0],
    ['.service-item-title', 'SEO & site optimization', 'SEO 与网站优化', null, 1],
    ['.service-item-title', 'Web tools & apps', 'Web 工具与应用', null, 2],
    ['.service-item-title', 'Blogging & AI exploration', '博客写作与 AI 探索', null, 3],
    ['.service-item-text', 'Building clean, lightweight websites and themes with Astro, TypeScript, and modern front-end workflows.', '使用 Astro、TypeScript 和现代前端工作流，构建简洁、轻量的网站与主题。', null, 0],
    ['.service-item-text', 'On-page and technical SEO: improving site structure, speed, and search visibility.', '开展页面与技术 SEO，优化网站结构、加载速度与搜索可见性。', null, 1],
    ['.service-item-text', 'Turning ideas into small, practical products like RestCal, RadiantShelf, and the PennyPeek personal finance app.', '将想法转化为实用的小产品，例如 RestCal、RadiantShelf 和个人财务应用 PennyPeek。', null, 2],
    ['.service-item-text', 'Writing practical notes about the web, tools, and real-world projects while exploring AI-assisted development workflows.', '记录 Web 技术、工具和实际项目中的经验，同时探索 AI 辅助开发工作流。', null, 3],
    ['.timeline .title-wrapper h3', 'Education', '教育经历', null, 0],
    ['.timeline .title-wrapper h3', 'Experience', '工作与探索', null, 1],
    ['.timeline-item-title', 'Nanchang Business College of Jiangxi Agricultural University', '江西农业大学南昌商学院', null, 0],
    ['.timeline-item-title', 'Nanchang Business College of Jiangxi Agricultural University', '江西农业大学南昌商学院', null, 1],
    ['.timeline-item-title', 'Linchuan No. 2 Middle School', '临川第二中学', null, 2],
    ['.timeline-item-title', 'Web Developer', 'Web 开发者', null, 3],
    ['.timeline-item-title', 'AI enthusiast', 'AI 爱好者', null, 4],
    ['.timeline-text', 'As an English major, I passed CET-4, CET-6, TEM-4, and TEM-8 and earned the corresponding certificates. During university, I organized class activities and volunteered at college events, developing communication, coordination, and teamwork skills.', '英语专业，通过大学英语四、六级及英语专业四、八级考试并取得相应证书。在校期间积极组织班级活动，参与学院活动的志愿服务，培养了沟通、协调与团队协作能力。', null, 0],
    ['.timeline-text', 'As a Computer Science and Technology minor, I studied HTML web design, basic Photoshop operations, and introductory Android development. Practical demonstrations and project-based exercises helped me build technical awareness, problem-solving skills, and hands-on experience.', '辅修计算机科学与技术，学习 HTML 网页设计、Photoshop 基础和 Android 应用开发入门等实践课程。通过教师指导下的演示和项目练习，积累了技术认知、问题解决能力与动手实践经验。', null, 1],
    ['.timeline-text', 'During junior and senior high school, I focused on building a solid academic foundation and good study habits. Class activities and collaboration helped me develop communication skills and a sense of responsibility.', '初高中阶段注重打好学业基础，养成良好的学习习惯。积极参与班级活动，在协作中提升沟通能力与责任意识。', null, 2],
    ['.timeline-text', 'At iSumsoft, I work on SEO, website design optimization, and translation. My responsibilities include improving content and site structure for search visibility, refining page layouts and user experience, and translating or localizing materials for accuracy, clarity, and readability.', '在 iSumsoft 从事 SEO、网站设计优化及翻译相关工作，包括优化网站内容与结构以提升搜索可见性，改善页面布局和用户体验，以及翻译和本地化材料，确保准确、清晰、易读。', null, 3],
    ['.timeline-text', 'I explore how AI can support fun, useful projects. I use Codex and Claude Code for coding, brainstorming, and project development, and independently discover new AI resources to keep learning about emerging technologies.', '探索 AI 在有趣、实用项目中的应用。熟悉 Codex、Claude Code 等工具，使用它们辅助编程、创意构思和项目开发，并自主寻找新的 AI 资源，持续学习新兴技术。', null, 4],
    ['.timeline-item > span', '2024 — Present', '2024 — 至今', null, 3],
    ['.timeline-item > span', '2025 — Ongoing', '2025 — 持续探索', null, 4],
    ['.skills-title', 'My skills', '专业技能'],
    ['.skills-item h5', 'Web design', '网页设计', null, 0],
    ['.skills-item h5', 'Graphic design', '平面设计', null, 1],
    ['.skills-item h5', 'English translation', '英语翻译', null, 3],
    ['.skills-item h5', 'Spanish', '西班牙语', null, 4],
    ['[data-filter-btn="all"], [data-select-item="all"]', 'All', '全部'],
    ['[data-filter-btn="applications"], [data-select-item="applications"]', 'Applications', '应用'],
    ['[data-filter-btn="plugins"], [data-select-item="plugins"]', 'Plugins', '插件'],
    ['[data-filter-btn="web development"], [data-select-item="web development"]', 'Web development', 'Web 开发'],
    ['.project-item:nth-child(1) .project-description', 'Track attendance, manage leave, and plan around holidays.', '出勤记录、请假管理与节假日规划。'],
    ['.project-item:nth-child(2) .project-description', 'Manage everyday transactions, budgets, and savings goals.', '管理日常账单、预算与储蓄目标。'],
    ['.project-item--maintenance .project-title', 'RadiantShelf · Under maintenance', 'RadiantShelf · 维护中'],
    ['.project-item--maintenance .project-description', 'Send daily Valorant store updates to a webhook. Access is paused during maintenance.', '将 Valorant 每日商店推送到 Webhook。维护期间暂停访问。'],
    ['.project-item:nth-child(4) .project-description', 'View Codex limits, token usage, and reset times in the YASB status bar.', '在状态栏查看 Codex 额度、Token 用量与重置时间。'],
    ['.project-item:nth-child(5) .project-description', 'A personal service monitoring site showing uptime, response times, and incident history.', '个人服务监测站，展示可用性、响应时间与事件历史。'],
    ['.project-item:nth-child(6) .project-description', 'A lightweight personal blog theme built with Astro.', '基于 Astro 的轻量个人博客主题。'],
    ['.project-item:nth-child(1) .project-category', 'Applications · JavaScript + PWA', '应用 · JavaScript + PWA'],
    ['.project-item:nth-child(2) .project-category', 'Applications · React + TypeScript', '应用 · React + TypeScript'],
    ['.project-item:nth-child(3) .project-category', 'Applications · Python', '应用 · Python'],
    ['.project-item:nth-child(4) .project-category', 'Plugins · Python', '插件 · Python'],
    ['.project-item:nth-child(5) .project-category', 'Web development · Next.js + Cloudflare', 'Web 开发 · Next.js + Cloudflare'],
    ['.project-item:nth-child(6) .project-category', 'Web development · Astro', 'Web 开发 · Astro'],
    ['.project-item--maintenance > a:first-child', 'RadiantShelf is under maintenance and temporarily unavailable', 'RadiantShelf 维护中，暂时不可访问', 'title'],
    ['.project-item--maintenance .project-github', 'Under maintenance; temporarily unavailable', '维护中，暂时不可用', 'title'],
    ['.project-item--maintenance .project-github', 'RadiantShelf source, temporarily unavailable during maintenance', 'RadiantShelf 的 GitHub 仓库，维护中，暂时不可用', 'aria-label'],
    ['.form-title', 'Contact Form', '联系表单'],
    ['[name="fullname"]', 'Full name', '姓名', 'placeholder'],
    ['[name="fullname"]', 'Full name', '姓名', 'aria-label'],
    ['[name="email"]', 'Email address', '电子邮箱', 'placeholder'],
    ['[name="email"]', 'Email address', '电子邮箱', 'aria-label'],
    ['[name="message"]', 'Your message', '留言内容', 'placeholder'],
    ['[name="message"]', 'Your message', '留言内容', 'aria-label'],
    ['[data-form-btn] span', 'Send Message', '发送留言'],
    ['.mapbox iframe', 'Map of Shenzhen, Guangdong, China', '中国广东深圳地图', 'title'],
  ];
  const messages = {
    all: ['All', '全部'], applications: ['Applications', '应用'], plugins: ['Plugins', '插件'],
    'web development': ['Web development', 'Web 开发'],
    success: ['Thanks! Your message has been sent.', '谢谢！你的留言已发送。'],
    error: ['Something went wrong. Please try again later.', '发送失败，请稍后重试。'],
    network: ['Network error. Please check your connection and try again.', '网络连接异常，请检查网络后重试。'],
  };
  const blogCategories = { '生活': 'Life', '开源': 'Open source', '配置': 'Setup', '随笔': 'Notes' };
  const blogTitles = {
    'life-at-one-percent-battery': 'When Life Is Down to 1% Battery',
    'yasb-codex-usage-open-source-pr': 'YASB Codex Usage Widget',
    'new-router-for-my-home': 'Setting Up a TP-Link Router',
    'my-think-about-i': 'Some Reflections on Myself',
  };
  let language = 'en';
  const text = key => messages[key]?.[language === 'zh' ? 1 : 0] || key;

  function apply(next) {
    language = next === 'zh' ? 'zh' : 'en';
    const chinese = language === 'zh';
    document.documentElement.lang = chinese ? 'zh-CN' : 'en';
    for (const [selector, en, zh, attribute, index] of copy) {
      const elements = document.querySelectorAll(selector);
      const targets = index === undefined ? elements : [elements[index]].filter(Boolean);
      targets.forEach(element => {
        if (attribute) element.setAttribute(attribute, chinese ? zh : en);
        else element.textContent = chinese ? zh : en;
      });
    }
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    document.querySelectorAll('.project-github[href]').forEach(link => {
      const name = link.closest('.project-item').querySelector('.project-title').textContent;
      link.setAttribute('aria-label', chinese ? `查看 ${name} 的 GitHub 源码` : `View ${name} on GitHub`);
    });
    document.querySelectorAll('.blog-post-item').forEach(card => {
      const category = card.querySelector('.blog-category');
      const title = card.querySelector('.blog-item-title');
      category.dataset.original ||= category.textContent;
      title.dataset.original ||= title.textContent;
      const slug = new URL(card.querySelector('a').href).pathname.split('/').filter(Boolean).pop();
      category.textContent = chinese ? category.dataset.original : blogCategories[category.dataset.original] || category.dataset.original;
      title.textContent = chinese ? title.dataset.original : blogTitles[slug] || title.dataset.original;
    });
    const select = document.querySelector('[data-select]');
    document.querySelector('[data-selecct-value]').textContent = text(select.dataset.value || 'all');
    const status = document.querySelector('[data-form-status]');
    if (status.dataset.statusKey) status.textContent = text(status.dataset.statusKey);
    const description = chinese
      ? 'Abo Le 的个人主页，展示 Web 开发、AI 工具、项目作品和技术博客。'
      : 'Abo Le’s portfolio: web development, AI tools, personal projects, and a technical blog.';
    document.title = chinese ? 'Abo Le | Web 开发者' : 'Abo Le | Web Developer';
    document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').forEach(meta => { meta.content = description; });
    document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach(meta => { meta.content = document.title; });
    const map = document.querySelector('.mapbox iframe');
    const mapURL = new URL(map.src);
    mapURL.searchParams.set('hl', chinese ? 'zh-CN' : 'en');
    if (map.src !== mapURL.href) map.src = mapURL.href;
  }

  window.resumeI18n = { text };
  document.querySelectorAll('[data-language]').forEach(button => {
    button.addEventListener('click', () => {
      apply(button.dataset.language);
      try { localStorage.setItem('resume-language', language); } catch { /* Storage may be disabled. */ }
    });
  });
  let initial = navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  try {
    const saved = localStorage.getItem('resume-language');
    if (saved === 'zh' || saved === 'en') initial = saved;
  } catch { /* Keep browser language when storage is unavailable. */ }
  apply(initial);
})();
