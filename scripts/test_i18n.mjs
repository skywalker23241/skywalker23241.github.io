// Run with a DOM parser outside the site: node scripts/test_i18n.mjs <path-to-linkedom>
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { parseHTML } = createRequire(import.meta.url)(process.argv[2] || 'linkedom');
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const i18n = fs.readFileSync(new URL('../assets/js/i18n.js', import.meta.url), 'utf8');
const interactions = fs.readFileSync(new URL('../assets/js/script.js', import.meta.url), 'utf8');

function setup({ saved, locale = 'zh-CN', blocked = false } = {}) {
  const { window } = parseHTML(html);
  const { document } = window;
  const storage = new Map(saved ? [['resume-language', saved]] : []);
  const sandbox = { window, document, URL, navigator: { language: locale },
    localStorage: {
      getItem(key) { if (blocked) throw Error('disabled'); return storage.get(key); },
      setItem(key, value) { if (blocked) throw Error('disabled'); storage.set(key, value); },
    },
  };
  window.scrollTo = () => {};
  const missing = [];
  const queryAll = document.querySelectorAll.bind(document);
  document.querySelectorAll = selector => {
    const result = queryAll(selector);
    if (!result.length) missing.push(selector);
    return result;
  };
  vm.createContext(sandbox);
  vm.runInContext(i18n, sandbox);
  vm.runInContext(interactions, sandbox);
  assert.deepEqual(missing, [], 'Translation selectors must match the actual HTML');
  return { document, window, storage };
}

const { document, window, storage } = setup();
assert.ok(document.querySelector('.language-switch').closest('.navbar'));
assert.equal(document.querySelector('[data-language="zh"]').textContent, '中');
assert.equal(document.querySelector('[data-language="en"]').textContent, 'En');
const click = selector => document.querySelector(selector).click();
assert.equal(document.documentElement.lang, 'zh-CN');
assert.equal(document.querySelector('.resume .article-title').textContent, '个人简历');
assert.equal(document.querySelector('[name="fullname"]').getAttribute('placeholder'), '姓名');
click('[data-nav-link="portfolio"]');
assert.equal(document.querySelector('article.active').dataset.page, 'portfolio');
click('[data-filter-btn="plugins"]');
assert.equal(document.querySelectorAll('[data-filter-item].active').length, 1);
assert.equal(document.querySelector('[data-filter-item].active').dataset.category, 'plugins');
click('[data-language="en"]');
assert.equal(document.documentElement.lang, 'en');
assert.equal(document.querySelector('article.active').dataset.page, 'portfolio');
assert.equal(document.querySelector('[data-selecct-value]').textContent, 'Plugins');
assert.equal(document.querySelectorAll('[data-filter-item].active').length, 1);
assert.equal(storage.get('resume-language'), 'en');
assert.equal(document.querySelector('.project-item--maintenance a').getAttribute('href'), null);
assert.ok(document.querySelector('.project-item--maintenance .project-title').textContent.includes('Under maintenance'));
click('[data-select-item="applications"]');
assert.equal(document.querySelectorAll('[data-filter-item].active').length, 3);
assert.equal(document.querySelector('[data-filter-btn].active').dataset.filterBtn, 'applications');
const status = document.querySelector('[data-form-status]');
status.dataset.statusKey = 'success';
click('[data-language="zh"]');
assert.equal(status.textContent, '谢谢！你的留言已发送。');
assert.equal(document.querySelector('[data-selecct-value]').textContent, '应用');
assert.equal(document.querySelector('.blog-item-title').textContent, '当生活只剩 1% 的电量');
click('[data-language="en"]');
assert.equal(document.querySelector('.blog-item-title').textContent, 'When Life Is Down to 1% Battery');
assert.equal(window.resumeI18n.text('network'), 'Network error. Please check your connection and try again.');
assert.equal(setup({ saved: 'en', locale: 'zh-CN' }).document.documentElement.lang, 'en');
assert.equal(setup({ saved: 'invalid', locale: 'en-US' }).document.documentElement.lang, 'en');
const denied = setup({ blocked: true });
denied.document.querySelector('[data-language="en"]').click();
assert.equal(denied.document.documentElement.lang, 'en');
console.log('PASS: real HTML translations, navigation, desktop/mobile filters, maintenance links, form messages, storage and locale fallbacks');
