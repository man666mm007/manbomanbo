/**
 * 简墨简历 - 交互式编辑器与实时预览主控制器
 */
(function () {
  const STORAGE_KEY = 'jianmo_resume_state_v1';
  const MODAL_DISMISS_KEY = 'jianmo_export_modal_dismissed';

  const config = window.JIANMO_CONFIG || { edition: 'web', payment: {} };
  const presets = window.JIANMO_PRESETS || {};
  const renderer = window.JianMoRenderer;

  let state = loadInitialState();
  let currentZoom = 'auto';
  let previewTimer = null;

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }

  function loadInitialState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.profile && Array.isArray(parsed.sections)) {
          return parsed;
        }
      }
    } catch (_) {
      // 忽略损坏的本地存储并回退到默认预设
    }
    return deepClone((presets.tech && presets.tech.data) || { meta: {}, profile: {}, sections: [] });
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      const el = document.getElementById('save-status');
      if (el) el.textContent = '已自动保存于本地';
    } catch (_) {
      const el = document.getElementById('save-status');
      if (el) el.textContent = '本地存储空间不足，建议导出 JSON 备份';
    }
  }

  function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2600);
  }

  function initTopbar() {
    const badge = document.getElementById('brand-badge');
    if (badge) {
      badge.textContent =
        config.edition === 'offline' ? '离线永久专业版 · 永不联网' : '纯本地运行 · 无水印免费导出';
    }

    const supportBtn = document.getElementById('btn-open-support');
    if (supportBtn) {
      supportBtn.style.display = config.edition === 'offline' ? 'none' : 'inline-flex';
    }

    // 模板选项
    const tplSelect = document.getElementById('ctrl-template');
    tplSelect.innerHTML = '';
    renderer.TEMPLATES.forEach((tpl) => {
      const opt = document.createElement('option');
      opt.value = tpl.id;
      opt.textContent = `${tpl.name} (${tpl.desc})`;
      tplSelect.appendChild(opt);
    });
    tplSelect.value = state.meta.template || 'tech-minimal';
    tplSelect.addEventListener('change', (e) => {
      state.meta.template = e.target.value;
      persistAndRenderPreview();
    });

    // 主题色板
    const swatchBox = document.getElementById('color-swatches');
    swatchBox.innerHTML = '';
    renderer.ACCENT_PRESETS.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch-btn';
      btn.style.background = item.color;
      btn.title = item.name;
      btn.dataset.color = item.color;
      btn.addEventListener('click', () => {
        state.meta.accent = item.color;
        document.getElementById('ctrl-color-picker').value = item.color;
        syncTopbarValues();
        persistAndRenderPreview();
      });
      swatchBox.appendChild(btn);
    });

    const colorPicker = document.getElementById('ctrl-color-picker');
    colorPicker.addEventListener('input', (e) => {
      state.meta.accent = e.target.value;
      syncTopbarValues();
      persistAndRenderPreview();
    });

    // 字号 / 行距 / 边距 / 字体
    const fontSelect = document.getElementById('ctrl-font');
    fontSelect.innerHTML = '';
    renderer.FONT_PRESETS.forEach((f) => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.name;
      fontSelect.appendChild(opt);
    });
    fontSelect.addEventListener('change', (e) => {
      state.meta.fontFamily = e.target.value;
      persistAndRenderPreview();
    });

    document.getElementById('ctrl-fontsize').addEventListener('change', (e) => {
      state.meta.fontSize = Number(e.target.value);
      persistAndRenderPreview();
    });

    document.getElementById('ctrl-lineheight').addEventListener('change', (e) => {
      state.meta.lineHeight = Number(e.target.value);
      persistAndRenderPreview();
    });

    document.getElementById('ctrl-padding').addEventListener('change', (e) => {
      state.meta.pagePadding = Number(e.target.value);
      persistAndRenderPreview();
    });

    // 示例数据切换
    const presetSelect = document.getElementById('ctrl-preset');
    presetSelect.innerHTML = '<option value="">切换示例简历...</option>';
    Object.keys(presets).forEach((key) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = presets[key].label;
      presetSelect.appendChild(opt);
    });
    presetSelect.addEventListener('change', (e) => {
      const key = e.target.value;
      if (!key || !presets[key]) return;
      if (confirm(`确定载入「${presets[key].label}」示例吗？当前编辑内容将被替换。`)) {
        state = deepClone(presets[key].data);
        syncTopbarValues();
        renderEditor();
        persistAndRenderPreview();
        showToast('已载入示例简历');
      }
      e.target.value = '';
    });

    // 导入导出 JSON 与重置
    document.getElementById('btn-export-json').addEventListener('click', exportJsonBackup);
    document.getElementById('btn-import-json').addEventListener('click', () => {
      document.getElementById('file-import-json').click();
    });
    document.getElementById('file-import-json').addEventListener('change', importJsonBackup);

    document.getElementById('btn-reset').addEventListener('click', () => {
      if (confirm('确定恢复到初始示例简历并清空当前修改吗？')) {
        state = deepClone(presets.tech.data);
        syncTopbarValues();
        renderEditor();
        persistAndRenderPreview();
        showToast('已重置为初始示例');
      }
    });

    // 导出高清 PDF
    document.getElementById('btn-export-pdf').addEventListener('click', handleExportPdf);

    // 打开赞赏 / 离线版引导弹窗
    if (supportBtn) {
      supportBtn.addEventListener('click', () => openExportModal(false));
    }

    syncTopbarValues();
  }

  function syncTopbarValues() {
    document.getElementById('ctrl-template').value = state.meta.template || 'tech-minimal';
    document.getElementById('ctrl-font').value = state.meta.fontFamily || 'sans';
    document.getElementById('ctrl-fontsize').value = String(state.meta.fontSize || 13.5);
    document.getElementById('ctrl-lineheight').value = String(state.meta.lineHeight || 1.55);
    document.getElementById('ctrl-padding').value = String(state.meta.pagePadding || 16);
    const accent = state.meta.accent || '#1e3a8a';
    document.getElementById('ctrl-color-picker').value = accent;
    document.querySelectorAll('.swatch-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.color.toLowerCase() === accent.toLowerCase());
    });
  }

  function persistAndRenderPreview() {
    saveState();
    clearTimeout(previewTimer);
    previewTimer = setTimeout(renderPreview, 35);
  }

  function renderPreview() {
    const stage = document.getElementById('paper-stage');
    if (!stage) return;

    const resumeHtml = renderer.renderResumeHtml(state);
    stage.innerHTML = `<div class="paper-frame" id="paper-frame">${resumeHtml}</div>`;

    updatePageGuidesAndScale();
  }

  function updatePageGuidesAndScale() {
    const frame = document.getElementById('paper-frame');
    const paper = frame && frame.querySelector('.resume-paper');
    const scrollBox = document.getElementById('preview-scroll');
    const stage = document.getElementById('paper-stage');
    if (!frame || !paper || !scrollBox || !stage) return;

    // 借助 210mm 纸张宽度计算精确每页像素高度（297 / 210 * width）
    const paperWidthPx = paper.offsetWidth || 794;
    const singlePageHeightPx = paperWidthPx * (297 / 210);
    const totalHeightPx = paper.scrollHeight;
    const pageCount = Math.max(1, Math.ceil((totalHeightPx - 8) / singlePageHeightPx));

    const badge = document.getElementById('page-count-badge');
    if (badge) {
      badge.textContent = pageCount === 1 ? '约 1 页 A4（最佳篇幅）' : `约 ${pageCount} 页 A4`;
    }

    // 清除旧参考线并插入分页虚线
    frame.querySelectorAll('.page-break-guide').forEach((el) => el.remove());
    for (let i = 1; i < pageCount; i += 1) {
      const guide = document.createElement('div');
      guide.className = 'page-break-guide';
      guide.style.top = `${297 * i}mm`;
      const label = document.createElement('span');
      label.className = 'page-break-label';
      label.textContent = `第 ${i} / ${i + 1} 页分页参考线（打印时自动隐藏）`;
      guide.appendChild(label);
      frame.appendChild(guide);
    }

    // 计算缩放
    let scale = 1;
    if (currentZoom === 'auto') {
      const availWidth = Math.max(300, scrollBox.clientWidth - 48);
      scale = Math.min(1, availWidth / paperWidthPx);
    } else {
      scale = Number(currentZoom) || 1;
    }

    stage.style.transform = scale === 1 ? 'none' : `scale(${scale})`;
    stage.style.height = scale === 1 ? 'auto' : `${frame.offsetHeight * scale}px`;
  }

  function renderEditor() {
    const root = document.getElementById('editor-content');
    if (!root) return;
    root.innerHTML = '';

    // 1. 基本信息卡片
    root.appendChild(buildProfileCard());

    // 2. 各动态模块卡片
    state.sections.forEach((sec, secIdx) => {
      root.appendChild(buildSectionCard(sec, secIdx));
    });

    // 3. 底部新增模块条
    root.appendChild(buildAddSectionBar());
  }

  function createFormField(labelText, inputEl, fullWidth) {
    const wrap = document.createElement('div');
    wrap.className = fullWidth ? 'form-field full' : 'form-field';
    const label = document.createElement('label');
    label.textContent = labelText;
    wrap.appendChild(label);
    wrap.appendChild(inputEl);
    return wrap;
  }

  function createTextInput(value, placeholder, onInput) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'ui-input';
    input.value = value || '';
    input.placeholder = placeholder || '';
    input.addEventListener('input', (e) => {
      onInput(e.target.value);
      persistAndRenderPreview();
    });
    return input;
  }

  function buildProfileCard() {
    const card = document.createElement('section');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'card-header';
    const title = document.createElement('span');
    title.className = 'card-title';
    title.textContent = '基本信息与个人简介';
    header.appendChild(title);
    card.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'form-grid';

    const p = state.profile;
    grid.appendChild(createFormField('姓名', createTextInput(p.name, '例如：陈知行', (v) => (p.name = v))));
    grid.appendChild(createFormField('求职意向 / 头衔', createTextInput(p.title, '例如：高级前端工程师', (v) => (p.title = v))));
    grid.appendChild(createFormField('联系电话', createTextInput(p.phone, '例如：138-0013-8000', (v) => (p.phone = v))));
    grid.appendChild(createFormField('电子邮箱', createTextInput(p.email, '例如：name@example.com', (v) => (p.email = v))));
    grid.appendChild(createFormField('所在城市', createTextInput(p.location, '例如：上海 · 浦东', (v) => (p.location = v))));
    grid.appendChild(createFormField('个人主页 / GitHub', createTextInput(p.website, '选填，留空不显示', (v) => (p.website = v))));

    // 头像本地上传区域
    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'avatar-uploader';

    const thumb = document.createElement('div');
    thumb.className = 'avatar-thumb';
    if (p.avatar) {
      const img = document.createElement('img');
      img.src = p.avatar;
      img.alt = '证件照预览';
      thumb.appendChild(img);
    } else {
      thumb.textContent = '无照片';
    }

    const actions = document.createElement('div');
    actions.className = 'avatar-actions';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/png,image/jpeg,image/webp';
    fileInput.className = 'hidden-file-input';
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      compressAvatarFile(file, (dataUrl) => {
        p.avatar = dataUrl;
        persistAndRenderPreview();
        renderEditor();
        showToast('已更新本地照片（不上传服务器）');
      });
    });

    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'button';
    uploadBtn.className = 'btn btn-sm';
    uploadBtn.textContent = p.avatar ? '更换证件照' : '上传证件照（可选）';
    uploadBtn.addEventListener('click', () => fileInput.click());

    actions.appendChild(fileInput);
    actions.appendChild(uploadBtn);

    if (p.avatar) {
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'btn btn-sm btn-danger-ghost';
      clearBtn.textContent = '移除';
      clearBtn.addEventListener('click', () => {
        p.avatar = '';
        persistAndRenderPreview();
        renderEditor();
      });
      actions.appendChild(clearBtn);
    }

    avatarWrap.appendChild(thumb);
    avatarWrap.appendChild(actions);
    grid.appendChild(createFormField('证件照 / 头像（纯本地裁切，不联网上传）', avatarWrap, true));

    // 个人简介
    const summaryInput = document.createElement('textarea');
    summaryInput.className = 'ui-textarea';
    summaryInput.rows = 3;
    summaryInput.value = p.summary || '';
    summaryInput.placeholder = '用 2-3 句话总结核心优势与量化成果，支持 **加粗** 语法；留空则自动隐藏此模块';
    summaryInput.addEventListener('input', (e) => {
      p.summary = e.target.value;
      persistAndRenderPreview();
    });
    grid.appendChild(createFormField('个人简介（支持 **重点加粗**）', summaryInput, true));

    card.appendChild(grid);
    return card;
  }

  function compressAvatarFile(file, callback) {
    const reader = new FileReader();
    reader.onload = function (ev) {
      const img = new Image();
      img.onload = function () {
        const maxSide = 360;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function buildSectionCard(sec, secIdx) {
    const card = document.createElement('section');
    card.className = 'card';

    const header = document.createElement('div');
    header.className = 'card-header';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'section-title-input';
    titleInput.value = sec.title || '';
    titleInput.placeholder = '模块名称';
    titleInput.addEventListener('input', (e) => {
      sec.title = e.target.value;
      persistAndRenderPreview();
    });

    const tools = document.createElement('div');
    tools.className = 'card-tools';

    if (secIdx > 0) {
      tools.appendChild(makeMiniBtn('↑', '上移模块', () => moveSection(secIdx, -1)));
    }
    if (secIdx < state.sections.length - 1) {
      tools.appendChild(makeMiniBtn('↓', '下移模块', () => moveSection(secIdx, 1)));
    }

    const addItemBtn = document.createElement('button');
    addItemBtn.type = 'button';
    addItemBtn.className = 'btn btn-sm';
    addItemBtn.textContent = '+ 添加条目';
    addItemBtn.addEventListener('click', () => {
      sec.items.push({
        id: uid('item'),
        title: '',
        subtitle: '',
        date: '',
        location: '',
        bullets: ['']
      });
      persistAndRenderPreview();
      renderEditor();
    });
    tools.appendChild(addItemBtn);

    const delSecBtn = makeMiniBtn('✕', '删除整个模块', () => {
      if (confirm(`确定删除「${sec.title || '未命名'}」模块吗？`)) {
        state.sections.splice(secIdx, 1);
        persistAndRenderPreview();
        renderEditor();
      }
    });
    delSecBtn.classList.add('btn-danger-ghost');
    tools.appendChild(delSecBtn);

    header.appendChild(titleInput);
    header.appendChild(tools);
    card.appendChild(header);

    sec.items.forEach((item, itemIdx) => {
      card.appendChild(buildItemBox(sec, item, itemIdx));
    });

    return card;
  }

  function buildItemBox(sec, item, itemIdx) {
    const box = document.createElement('div');
    box.className = 'item-box';

    const bar = document.createElement('div');
    bar.className = 'item-box-bar';

    const badge = document.createElement('span');
    badge.className = 'item-index-badge';
    badge.textContent = `#${itemIdx + 1}`;

    const itemTools = document.createElement('div');
    itemTools.className = 'card-tools';

    if (itemIdx > 0) {
      itemTools.appendChild(makeMiniBtn('↑', '上移条目', () => moveItem(sec, itemIdx, -1)));
    }
    if (itemIdx < sec.items.length - 1) {
      itemTools.appendChild(makeMiniBtn('↓', '下移条目', () => moveItem(sec, itemIdx, 1)));
    }
    const delBtn = makeMiniBtn('删除', '删除此条记录', () => {
      sec.items.splice(itemIdx, 1);
      persistAndRenderPreview();
      renderEditor();
    });
    delBtn.classList.remove('btn-icon');
    delBtn.classList.add('btn-danger-ghost');
    itemTools.appendChild(delBtn);

    bar.appendChild(badge);
    bar.appendChild(itemTools);
    box.appendChild(bar);

    const grid = document.createElement('div');
    grid.className = 'form-grid';
    grid.appendChild(createFormField('公司 / 学校 / 项目名', createTextInput(item.title, '例如：星云智造科技有限公司', (v) => (item.title = v))));
    grid.appendChild(createFormField('时间段', createTextInput(item.date, '例如：2023.04 - 至今', (v) => (item.date = v))));
    grid.appendChild(createFormField('职位 / 专业 / 角色', createTextInput(item.subtitle, '例如：高级前端工程师', (v) => (item.subtitle = v))));
    grid.appendChild(createFormField('地点（选填）', createTextInput(item.location, '例如：上海', (v) => (item.location = v))));

    const bulletsArea = document.createElement('textarea');
    bulletsArea.className = 'ui-textarea';
    bulletsArea.rows = Math.max(2, Math.min(6, (item.bullets || []).length + 1));
    bulletsArea.value = Array.isArray(item.bullets) ? item.bullets.join('\n') : '';
    bulletsArea.placeholder = '每行一条工作成果或核心亮点，支持 **加粗** 突出量化数据（如 **60 FPS**）';
    bulletsArea.addEventListener('input', (e) => {
      item.bullets = e.target.value.split(/\r?\n/);
      persistAndRenderPreview();
    });
    grid.appendChild(createFormField('详情要点（换行分条，支持 **加粗**）', bulletsArea, true));

    box.appendChild(grid);
    return box;
  }

  function makeMiniBtn(label, title, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-sm btn-icon';
    btn.textContent = label;
    btn.title = title;
    btn.addEventListener('click', onClick);
    return btn;
  }

  function moveSection(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= state.sections.length) return;
    const temp = state.sections[index];
    state.sections[index] = state.sections[target];
    state.sections[target] = temp;
    persistAndRenderPreview();
    renderEditor();
  }

  function moveItem(sec, index, delta) {
    const target = index + delta;
    if (target < 0 || target >= sec.items.length) return;
    const temp = sec.items[index];
    sec.items[index] = sec.items[target];
    sec.items[target] = temp;
    persistAndRenderPreview();
    renderEditor();
  }

  function buildAddSectionBar() {
    const bar = document.createElement('div');
    bar.className = 'add-section-bar';

    const title = document.createElement('div');
    title.className = 'add-section-title';
    title.textContent = '添加新的简历模块';
    bar.appendChild(title);

    const btns = document.createElement('div');
    btns.className = 'add-section-btns';

    const quickTypes = ['工作经历', '项目经历', '教育背景', '专业技能', '荣誉证书', '自定义模块'];
    quickTypes.forEach((label) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm';
      btn.textContent = `+ ${label}`;
      btn.addEventListener('click', () => {
        state.sections.push({
          id: uid('sec'),
          title: label === '自定义模块' ? '个人亮点' : label,
          items: [
            {
              id: uid('item'),
              title: '',
              subtitle: '',
              date: '',
              location: '',
              bullets: ['']
            }
          ]
        });
        persistAndRenderPreview();
        renderEditor();
      });
      btns.appendChild(btn);
    });

    bar.appendChild(btns);
    return bar;
  }

  function exportJsonBackup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = (state.profile && state.profile.name) || '简历';
    a.href = url;
    a.download = `${name}-简墨简历备份.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('已导出 JSON 备份文件');
  }

  function importJsonBackup(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed || !parsed.profile || !Array.isArray(parsed.sections)) {
          throw new Error('格式不正确');
        }
        state = Object.assign({ meta: {} }, parsed);
        syncTopbarValues();
        renderEditor();
        persistAndRenderPreview();
        showToast('JSON 备份导入成功');
      } catch (_) {
        alert('导入失败：请选择由简墨简历导出的有效 JSON 文件。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleExportPdf() {
    const prevTitle = document.title;
    const name = String((state.profile && state.profile.name) || '简历').trim();
    const job = String((state.profile && state.profile.title) || '').trim();
    document.title = job ? `${name}-${job}-简历` : `${name}-简历`;

    let handledAfterPrint = false;
    function onAfterPrint() {
      if (handledAfterPrint) return;
      handledAfterPrint = true;
      document.title = prevTitle;
      window.removeEventListener('afterprint', onAfterPrint);
      if (config.edition !== 'offline' && !sessionStorage.getItem(MODAL_DISMISS_KEY)) {
        openExportModal(true);
      }
    }

    window.addEventListener('afterprint', onAfterPrint);
    window.print();
    // 兜底恢复标题（部分浏览器打印取消时不保证立即触发 afterprint）
    setTimeout(onAfterPrint, 1200);
  }

  function openExportModal(afterPrint) {
    const modal = document.getElementById('export-modal');
    if (!modal) return;

    const titleEl = document.getElementById('modal-title-text');
    const tipBox = document.getElementById('modal-print-tip');
    titleEl.textContent = afterPrint ? '导出提示与支持作者' : '支持开发者 / 获取离线永久版';
    tipBox.style.display = afterPrint ? 'block' : 'none';

    renderPaymentArea();
    modal.classList.add('open');
  }

  function renderPaymentArea() {
    const box = document.getElementById('modal-payment-area');
    if (!box) return;
    box.innerHTML = '';

    const pay = config.payment || {};
    const priceText = renderer.escapeHtml(pay.proPriceText || '¥19.9');

    const title = document.createElement('div');
    title.className = 'support-title';
    title.textContent = `喜欢这个零广告、无水印的本地简历工具吗？`;
    box.appendChild(title);

    const desc = document.createElement('p');
    desc.style.margin = '0';
    desc.style.fontSize = '13px';
    desc.textContent =
      pay.xianyuTip ||
      `如果它帮你省下了制作简历的时间，欢迎请作者喝杯咖啡，或以 ${priceText} 获取「离线永久单文件版」（双击本地 HTML 即用，无任何联网与弹窗）。`;
    box.appendChild(desc);

    const linksWrap = document.createElement('div');
    linksWrap.className = 'payment-links';

    if (pay.mianbaoduoUrl) {
      const a = document.createElement('a');
      a.className = 'btn btn-primary btn-sm';
      a.href = pay.mianbaoduoUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = `面包多获取离线永久版 (${priceText})`;
      linksWrap.appendChild(a);
    }

    if (pay.afdianUrl) {
      const a = document.createElement('a');
      const isPrimaryAfdian = !pay.mianbaoduoUrl;
      a.className = isPrimaryAfdian ? 'btn btn-primary btn-sm' : 'btn btn-support btn-sm';
      a.href = pay.afdianUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = isPrimaryAfdian
        ? `前往爱发电获取离线永久版 (${priceText}) / 支持作者`
        : '前往爱发电支持作者';
      linksWrap.appendChild(a);
    }

    if (linksWrap.children.length > 0) {
      box.appendChild(linksWrap);
    }

    const qrGrid = document.createElement('div');
    qrGrid.className = 'qr-grid';
    if (pay.wechatQrPath) {
      qrGrid.appendChild(buildQrCard(pay.wechatQrPath, '微信赞赏支持'));
    }
    if (pay.alipayQrPath) {
      qrGrid.appendChild(buildQrCard(pay.alipayQrPath, '支付宝支持'));
    }

    if (qrGrid.children.length > 0) {
      box.appendChild(qrGrid);
    } else if (linksWrap.children.length === 0) {
      const hint = document.createElement('div');
      hint.style.marginTop = '10px';
      hint.style.fontSize = '12px';
      hint.style.color = '#78350f';
      hint.textContent =
        '提示：站长可在 src/config.js 中填入爱发电、面包多链接或微信/支付宝收款码路径后重新构建上线。';
      box.appendChild(hint);
    }
  }

  function buildQrCard(src, caption) {
    const card = document.createElement('div');
    card.className = 'qr-item';
    const img = document.createElement('img');
    img.src = src;
    img.alt = caption;
    const span = document.createElement('span');
    span.textContent = caption;
    card.appendChild(img);
    card.appendChild(span);
    return card;
  }

  function initPreviewToolbarAndModal() {
    const zoomSelect = document.getElementById('ctrl-zoom');
    zoomSelect.addEventListener('change', (e) => {
      currentZoom = e.target.value;
      updatePageGuidesAndScale();
    });

    const toggleEditorBtn = document.getElementById('btn-toggle-editor');
    const workspace = document.getElementById('workspace');
    toggleEditorBtn.addEventListener('click', () => {
      const collapsed = workspace.classList.toggle('editor-collapsed');
      toggleEditorBtn.textContent = collapsed ? '展开编辑面板' : '收起编辑面板';
      setTimeout(updatePageGuidesAndScale, 30);
    });

    const mobileSwitchBtn = document.getElementById('btn-mobile-switch');
    mobileSwitchBtn.addEventListener('click', () => {
      const isPreview = workspace.classList.toggle('mobile-preview-mode');
      mobileSwitchBtn.textContent = isPreview ? '返回编辑' : '预览简历';
      if (isPreview) setTimeout(updatePageGuidesAndScale, 30);
    });

    window.addEventListener('resize', () => {
      if (currentZoom === 'auto') updatePageGuidesAndScale();
    });

    const modal = document.getElementById('export-modal');
    document.getElementById('btn-modal-close').addEventListener('click', () => {
      modal.classList.remove('open');
    });
    document.getElementById('btn-modal-ok').addEventListener('click', () => {
      modal.classList.remove('open');
    });
    document.getElementById('btn-modal-dismiss').addEventListener('click', () => {
      sessionStorage.setItem(MODAL_DISMISS_KEY, '1');
      modal.classList.remove('open');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }

  function bootstrap() {
    initTopbar();
    initPreviewToolbarAndModal();
    renderEditor();
    renderPreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
