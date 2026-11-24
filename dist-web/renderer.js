/**
 * 简墨简历 - A4 简历纯前端安全渲染引擎
 * 支持 5 套风格模板、XSS 严格转义、轻量 **加粗** 语法、空字段自动隐藏
 */
(function (root) {
  const TEMPLATES = [
    { id: 'tech-minimal', name: '极简大厂风', desc: '高信息密度 · 技术/互联网首选' },
    { id: 'classic-exec', name: '经典商务风', desc: '稳重典雅 · 产品/运营/管理' },
    { id: 'modern-sidebar', name: '现代双栏风', desc: '左右分栏 · 视觉层次分明' },
    { id: 'academic-cv', name: '学术科研风', desc: '严谨工整 · 教研/留学/申博' },
    { id: 'fresh-grad', name: '清新应届风', desc: '清爽活力 · 校招/实习生推荐' }
  ];

  const ACCENT_PRESETS = [
    { name: '深海蓝', color: '#1e3a8a' },
    { name: '墨玉青', color: '#0f766e' },
    { name: '靛青紫', color: '#4338ca' },
    { name: '石榴红', color: '#9f1239' },
    { name: '石墨灰', color: '#334155' },
    { name: '琥珀棕', color: '#92400e' }
  ];

  const FONT_PRESETS = [
    { id: 'sans', name: '现代无衬线（黑体 / 微软雅黑）' },
    { id: 'serif', name: '经典衬线体（宋体 / 思源宋体）' }
  ];

  function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatInline(value) {
    const escaped = escapeHtml(value);
    return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  function sanitizeColor(color) {
    const raw = String(color || '').trim();
    if (/^#[0-9a-fA-F]{3,8}$/.test(raw)) return raw;
    return '#1e3a8a';
  }

  function sanitizeAvatar(url) {
    const raw = String(url || '').trim();
    if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(raw)) {
      return raw;
    }
    return '';
  }

  function clampNumber(val, min, max, fallback) {
    const num = Number(val);
    if (!Number.isFinite(num)) return fallback;
    return Math.min(max, Math.max(min, num));
  }

  function getFontStack(fontId) {
    if (fontId === 'serif') {
      return "'Songti SC', 'SimSun', 'Noto Serif SC', 'STSong', 'Source Han Serif SC', Georgia, serif";
    }
    return "'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', 'Noto Sans SC', 'Source Han Sans SC', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  }

  function buildContactItems(profile) {
    const list = [];
    const phone = String(profile.phone || '').trim();
    const email = String(profile.email || '').trim();
    const location = String(profile.location || '').trim();
    const website = String(profile.website || '').trim();

    if (phone) list.push({ label: '电话', icon: '☎', text: escapeHtml(phone) });
    if (email) list.push({ label: '邮箱', icon: '✉', text: escapeHtml(email) });
    if (location) list.push({ label: '城市', icon: '⌖', text: escapeHtml(location) });
    if (website) list.push({ label: '主页', icon: '⌘', text: escapeHtml(website) });
    return list;
  }

  function cleanSectionItems(items) {
    if (!Array.isArray(items)) return [];
    return items
      .map((item) => {
        const title = String((item && item.title) || '').trim();
        const subtitle = String((item && item.subtitle) || '').trim();
        const date = String((item && item.date) || '').trim();
        const location = String((item && item.location) || '').trim();
        const bullets = Array.isArray(item && item.bullets)
          ? item.bullets.map((b) => String(b || '').trim()).filter(Boolean)
          : [];
        return { title, subtitle, date, location, bullets };
      })
      .filter((item) => item.title || item.subtitle || item.date || item.location || item.bullets.length > 0);
  }

  function renderItemHtml(item) {
    const hasTop = item.title || item.date;
    const hasSub = item.subtitle || item.location;

    const topHtml = hasTop
      ? `<div class="item-head">
          <div class="item-title">${formatInline(item.title)}</div>
          ${item.date ? `<div class="item-date">${escapeHtml(item.date)}</div>` : ''}
        </div>`
      : '';

    const subHtml = hasSub
      ? `<div class="item-sub">
          <div class="item-subtitle">${formatInline(item.subtitle)}</div>
          ${item.location ? `<div class="item-location">${escapeHtml(item.location)}</div>` : ''}
        </div>`
      : '';

    const bulletsHtml = item.bullets.length
      ? `<ul class="item-bullets">${item.bullets
          .map((line) => `<li>${formatInline(line)}</li>`)
          .join('')}</ul>`
      : '';

    return `<article class="resume-item">${topHtml}${subHtml}${bulletsHtml}</article>`;
  }

  function renderSectionHtml(section) {
    const title = String((section && section.title) || '').trim();
    const items = cleanSectionItems(section && section.items);
    if (!title && items.length === 0) return '';

    return `<section class="resume-section">
      ${title ? `<h2 class="section-header"><span>${escapeHtml(title)}</span></h2>` : ''}
      <div class="section-body">
        ${items.map(renderItemHtml).join('')}
      </div>
    </section>`;
  }

  function isSidebarPreferredSection(section) {
    const title = String((section && section.title) || '');
    return /技能|能力|证书|荣誉|获奖|语言|教育|自我评价|技术栈/i.test(title);
  }

  function renderModernSidebarLayout(profile, sections, contacts, safeAvatar) {
    const sideSections = [];
    const mainSections = [];

    (sections || []).forEach((sec) => {
      const items = cleanSectionItems(sec && sec.items);
      if (!String((sec && sec.title) || '').trim() && items.length === 0) return;
      if (isSidebarPreferredSection(sec)) {
        sideSections.push(sec);
      } else {
        mainSections.push(sec);
      }
    });

    // 若没有明显短模块被分到侧栏，取最后一个有效模块到侧栏以保持双栏均衡
    if (sideSections.length === 0 && mainSections.length > 1) {
      sideSections.push(mainSections.pop());
    }

    const nameHtml = escapeHtml(profile.name || '未命名简历');
    const titleHtml = escapeHtml(profile.title || '');
    const summary = String(profile.summary || '').trim();

    return `<div class="sidebar-shell">
      <aside class="sidebar-col">
        ${
          safeAvatar
            ? `<div class="avatar-wrap avatar-sidebar"><img src="${safeAvatar}" alt="${nameHtml}" /></div>`
            : ''
        }
        <header class="sidebar-identity">
          <h1 class="resume-name">${nameHtml}</h1>
          ${titleHtml ? `<p class="resume-title">${titleHtml}</p>` : ''}
        </header>
        ${
          contacts.length
            ? `<div class="sidebar-contacts">
                <h2 class="section-header"><span>联系方式</span></h2>
                <ul class="contact-list-vertical">
                  ${contacts
                    .map(
                      (c) =>
                        `<li><span class="c-icon" aria-hidden="true">${c.icon}</span><span class="c-text">${c.text}</span></li>`
                    )
                    .join('')}
                </ul>
              </div>`
            : ''
        }
        ${sideSections.map(renderSectionHtml).join('')}
      </aside>
      <main class="main-col">
        ${
          summary
            ? `<section class="resume-section summary-section">
                <h2 class="section-header"><span>个人简介</span></h2>
                <p class="resume-summary">${formatInline(summary)}</p>
              </section>`
            : ''
        }
        ${mainSections.map(renderSectionHtml).join('')}
      </main>
    </div>`;
  }

  function renderSingleColumnLayout(profile, sections, contacts, safeAvatar) {
    const nameHtml = escapeHtml(profile.name || '未命名简历');
    const titleHtml = escapeHtml(profile.title || '');
    const summary = String(profile.summary || '').trim();

    const contactRowHtml = contacts.length
      ? `<ul class="contact-list-inline">
          ${contacts
            .map(
              (c) =>
                `<li><span class="c-icon" aria-hidden="true">${c.icon}</span><span>${c.text}</span></li>`
            )
            .join('')}
        </ul>`
      : '';

    const headerHtml = `<header class="resume-header ${safeAvatar ? 'has-avatar' : 'no-avatar'}">
      <div class="header-main">
        <h1 class="resume-name">${nameHtml}</h1>
        ${titleHtml ? `<p class="resume-title">${titleHtml}</p>` : ''}
        ${contactRowHtml}
      </div>
      ${
        safeAvatar
          ? `<div class="avatar-wrap avatar-header"><img src="${safeAvatar}" alt="${nameHtml}" /></div>`
          : ''
      }
    </header>`;

    const summaryHtml = summary
      ? `<section class="resume-section summary-section">
          <h2 class="section-header"><span>个人简介</span></h2>
          <p class="resume-summary">${formatInline(summary)}</p>
        </section>`
      : '';

    const sectionsHtml = (sections || []).map(renderSectionHtml).join('');

    return `${headerHtml}${summaryHtml}${sectionsHtml}`;
  }

  function renderResumeHtml(resumeData) {
    const data = resumeData || {};
    const meta = data.meta || {};
    const profile = data.profile || {};
    const sections = Array.isArray(data.sections) ? data.sections : [];

    const validIds = TEMPLATES.map((t) => t.id);
    const templateId = validIds.includes(meta.template) ? meta.template : 'tech-minimal';
    const accent = sanitizeColor(meta.accent);
    const fontSize = clampNumber(meta.fontSize, 11, 16, 13.5);
    const lineHeight = clampNumber(meta.lineHeight, 1.25, 1.9, 1.55);
    const pagePadding = clampNumber(meta.pagePadding, 10, 24, 16);
    const fontStack = getFontStack(meta.fontFamily);

    const contacts = buildContactItems(profile);
    const safeAvatar = sanitizeAvatar(profile.avatar);

    const innerHtml =
      templateId === 'modern-sidebar'
        ? renderModernSidebarLayout(profile, sections, contacts, safeAvatar)
        : renderSingleColumnLayout(profile, sections, contacts, safeAvatar);

    const styleAttr = [
      `--accent:${accent}`,
      `--font-size:${fontSize}px`,
      `--line-height:${lineHeight}`,
      `--page-pad:${pagePadding}mm`,
      `--font-family:${fontStack}`
    ].join(';');

    return `<div class="resume-paper tpl-${templateId}" style="${styleAttr}">${innerHtml}</div>`;
  }

  root.JianMoRenderer = {
    TEMPLATES,
    ACCENT_PRESETS,
    FONT_PRESETS,
    escapeHtml,
    formatInline,
    renderResumeHtml
  };
})(typeof window !== 'undefined' ? window : globalThis);
