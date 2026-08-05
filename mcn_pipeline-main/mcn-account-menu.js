/* =====================================================
 * mcn-account-menu.js
 * 跨页面共享：左下角头像下拉菜单 + 输入框模型下拉选择器
 *
 * - 头像菜单：通用设置 / 帮助与反馈 / 版本更新 / 退出登录
 * - 模型下拉：与图示一致，11 个模型 + 配置自定义模型
 *            默认 Deepseek-V4-Pro
 * - 点击外部 / Esc 关闭；切换页面状态互不干扰
 * ===================================================== */
(() => {
  /* ---------- 模型清单（与图示样式一致，去掉折扣标签） ---------- */
  const MODELS = [
    { key: 'auto',     name: 'Auto',            bg: 'linear-gradient(135deg,#94a3b8,#64748b)', label: 'A' },
    { key: 'hy3',      name: 'Hy3',             bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', label: 'H' },
    { key: 'glm52',    name: 'GLM-5.2',         bg: '#1e293b', label: 'Z' },
    { key: 'glm51',    name: 'GLM-5.1',         bg: '#1e293b', label: 'Z' },
    { key: 'glmturbo', name: 'GLM-5v-Turbo',    bg: '#334155', label: 'Z' },
    { key: 'minimax',  name: 'MiniMax-M3',      bg: 'linear-gradient(135deg,#ec4899,#be185d)', label: 'M' },
    { key: 'kimi3',    name: 'Kimi-K3',         bg: '#0f172a', label: 'K' },
    { key: 'kimi27c',  name: 'Kimi-K2.7-Code',  bg: '#0f172a', label: 'K' },
    { key: 'kimi26',   name: 'Kimi-K2.6',       bg: '#0f172a', label: 'K' },
    { key: 'dsflash',  name: 'Deepseek-V4-Flash', bg: '#2563eb', label: 'D' },
    { key: 'dspro',    name: 'Deepseek-V4-Pro',   bg: '#1d4ed8', label: 'D' }
  ];
  const DEFAULT_MODEL_KEY = 'dspro';

  function getModel(key) {
    return MODELS.find(m => m.key === key) || MODELS[0];
  }

  /* SVG 图标库（统一描边风格，零 emoji） */
  const ICONS = {
    settings:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    help:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    refresh:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>',
    logout:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    pencil:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>'
  };

  /* ============================================================
   * 1. 头像下拉菜单
   *    - 自动检测 .mcn-account 容器，注入菜单 HTML
   *    - 兼容 mcn-sidebar.js 中已有的 initAvatarLightbox：禁用其绑定
   * ============================================================ */
  function disableLegacyLightbox() {
    const lb = document.getElementById('mcnAvatarLightbox');
    if (lb) lb.remove();
  }

  function buildAccountMenu(account) {
    if (account.querySelector('.account-menu')) return; // 已有则跳过
    const nameEl = account.querySelector('.mcn-account-copy strong');
    const subEl  = account.querySelector('.mcn-account-copy small');
    const headName = (nameEl && nameEl.textContent.trim()) || '麦西恩';
    const headSub  = (subEl  && subEl.textContent.trim())  || '麦西恩工作室';

    const menu = document.createElement('div');
    menu.className = 'account-menu';
    menu.setAttribute('role', 'menu');
    menu.innerHTML = `
      <div class="acc-head">
        <strong>${escapeHtml(headName)}</strong>
        <small>${escapeHtml(headSub)}</small>
      </div>
      <button class="acc-item" data-action="settings" role="menuitem">
        ${ICONS.settings}<span>通用设置</span>
      </button>
      <button class="acc-item" data-action="help" role="menuitem">
        ${ICONS.help}<span>帮助与反馈</span>
      </button>
      <button class="acc-item" data-action="version" role="menuitem">
        ${ICONS.refresh}<span>版本更新</span>
      </button>
      <div class="acc-sep"></div>
      <button class="acc-item danger" data-action="logout" role="menuitem">
        ${ICONS.logout}<span>退出登录</span>
      </button>
    `;
    account.appendChild(menu);

    // 菜单项交互
    menu.querySelectorAll('.acc-item').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const action = btn.dataset.action;
        hideAccountMenu(menu);
        handleAccountAction(action);
      });
    });
  }

  function toggleAccountMenu(menu, force) {
    const willShow = typeof force === 'boolean' ? force : !menu.classList.contains('show');
    if (willShow) {
      closeAllAccountMenus();
      menu.classList.add('show');
    } else {
      hideAccountMenu(menu);
    }
  }
  function hideAccountMenu(menu) {
    menu.classList.remove('show');
  }
  function closeAllAccountMenus() {
    document.querySelectorAll('.account-menu.show').forEach(m => m.classList.remove('show'));
  }

  function handleAccountAction(action) {
    const labels = { settings: '通用设置', help: '帮助与反馈', version: '版本更新', logout: '退出登录' };
    const msg = labels[action] ? `已选择「${labels[action]}」` : '已选择';
    showToast(msg);
  }

  function showToast(text) {
    // 优先使用页面已有的 toast 元素
    const t = document.getElementById('toast');
    if (t) {
      const textEl = t.querySelector('#toastText') || t;
      if (textEl.tagName === 'SPAN') textEl.textContent = text;
      else t.innerHTML = `<span class="toast-tick" aria-hidden="true"></span><span>${escapeHtml(text)}</span>`;
      t.classList.add('show');
      clearTimeout(showToast._timer);
      showToast._timer = setTimeout(() => t.classList.remove('show'), 1800);
      return;
    }
    // 兜底：自建临时 toast
    const tt = document.createElement('div');
    tt.style.cssText = 'position:fixed;left:50%;bottom:34px;transform:translateX(-50%);background:#25252d;color:#fff;border-radius:9px;padding:10px 16px;font-size:11.5px;z-index:9999;box-shadow:0 12px 30px rgba(0,0,0,.25);display:inline-flex;align-items:center;gap:8px';
    tt.innerHTML = '<span aria-hidden="true" style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#22c55e;position:relative"></span><span></span>';
    tt.querySelector('span:last-child').textContent = text;
    document.body.appendChild(tt);
    setTimeout(() => { tt.style.opacity = '0'; tt.style.transition = 'opacity .25s'; }, 1500);
    setTimeout(() => tt.remove(), 1900);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function initAccountMenus() {
    disableLegacyLightbox();
    const accounts = document.querySelectorAll('.mcn-account');
    accounts.forEach(ac => {
      buildAccountMenu(ac);
      ac.addEventListener('click', e => {
        // 头像/copy 区域点击触发；菜单内部点击已 stopPropagation
        if (e.target.closest('.account-menu')) return;
        e.stopPropagation();
        const menu = ac.querySelector('.account-menu');
        if (menu) toggleAccountMenu(menu);
      });
    });
  }

  /* ============================================================
   * 2. 模型下拉选择器
   *    - 适用于 input/button.uc-model（替换原 picker-btn）
   *    - 默认 Deepseek-V4-Pro
   *    - 同时支持 content-workbench / lead-insights / customer-inquiries
   *      中用 onclick="cycleComposerModel(this)" 的按钮
   * ============================================================ */
  function modelItemHTML(m, activeKey) {
    const active = m.key === activeKey;
    return `<button class="model-item${active ? ' active' : ''}" data-key="${m.key}" role="option" aria-selected="${active}">
      <span class="m-icon" style="background:${m.bg}">${m.label}</span>
      <span class="m-name">${escapeHtml(m.name)}</span>
    </button>`;
  }

  function buildModelMenu(btn) {
    if (btn.parentElement && btn.parentElement.classList.contains('model-picker') &&
        btn.parentElement.querySelector('.model-menu')) return;

    // 包裹一层 model-picker（如尚未包裹）
    let picker = btn.parentElement;
    if (!picker || !picker.classList.contains('model-picker')) {
      picker = document.createElement('div');
      picker.className = 'model-picker';
      btn.parentNode.insertBefore(picker, btn);
      picker.appendChild(btn);
    }
    btn.setAttribute('aria-haspopup', 'listbox');

    const currentKey = btn.dataset.modelKey || DEFAULT_MODEL_KEY;
    const menu = document.createElement('div');
    menu.className = 'model-menu';
    menu.setAttribute('role', 'listbox');
    menu.innerHTML = MODELS.map(m => modelItemHTML(m, currentKey)).join('') +
      '<div class="model-sep"></div>' +
      `<button class="model-custom" type="button" role="menuitem">${ICONS.pencil}<span>配置自定义模型</span></button>`;
    picker.appendChild(menu);

    // 列表项点击
    menu.querySelectorAll('.model-item').forEach(item => {
      item.addEventListener('click', e => {
        e.stopPropagation();
        const key = item.dataset.key;
        const m = getModel(key);
        updateModelButton(btn, m);
        menu.classList.remove('show');
        showToast(`已切换到「${m.name}」`);
      });
    });
    // 配置自定义模型
    menu.querySelector('.model-custom').addEventListener('click', e => {
      e.stopPropagation();
      menu.classList.remove('show');
      showToast('打开自定义模型配置');
    });

    // 按钮点击切换
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = menu.classList.contains('show');
      closeAllModelMenus();
      if (!isOpen) menu.classList.add('show');
    });
  }

  function closeAllModelMenus() {
    document.querySelectorAll('.model-menu.show').forEach(m => m.classList.remove('show'));
  }

  function updateModelButton(btn, m) {
    btn.dataset.modelKey = m.key;
    let iconSpan = btn.querySelector('.uc-model-icon, .m-icon');
    if (iconSpan) {
      iconSpan.textContent = m.label;
      iconSpan.style.background = m.bg;
    }
    let labelSpan = btn.querySelector('.uc-model-label, .model-label, .modelSelectLabel, #modelLabel, #modelSelectLabel');
    if (labelSpan) labelSpan.textContent = m.name;
    // 处理 operations-review.html 中的 modelSelectIcon（独立 span）
    const iconHolder = document.getElementById('modelSelectIcon');
    if (iconHolder && btn.id === 'modelSelectBtn') iconHolder.innerHTML = buildModelIconSVG(m);
  }

  function buildModelIconSVG(m) {
    // 与 model-item 中相同的方形图标风格，缩小到 14px
    return `<span class="m-icon" style="width:14px;height:14px;border-radius:4px;background:${m.bg};color:#fff;display:inline-grid;place-items:center;font-size:8px;font-weight:800">${m.label}</span>`;
  }

  function paintModelButton(btn) {
    const key = btn.dataset.modelKey || DEFAULT_MODEL_KEY;
    const m = getModel(key);
    btn.dataset.modelKey = m.key;
    // icon
    const iconSpan = btn.querySelector('.uc-model-icon');
    if (iconSpan) {
      iconSpan.textContent = m.label;
      iconSpan.style.background = m.bg;
    }
    // label
    const labelSpan = btn.querySelector('.uc-model-label') || btn.querySelector('#modelLabel');
    if (labelSpan) labelSpan.textContent = m.name;
  }

  function initModelPickers() {
    // 收集所有模型按钮
    const candidates = [
      ...document.querySelectorAll('.uc-model')
    ];
    // operations-review.html 独立实现已有，跨页面同步：把 currentModel 应用到 modelSelectLabel / modelSelectIcon
    const orBtn = document.getElementById('modelSelectBtn');
    if (orBtn) {
      const m = getModel(DEFAULT_MODEL_KEY);
      orBtn.dataset.modelKey = m.key;
      const label = document.getElementById('modelSelectLabel');
      if (label) label.textContent = m.name;
      const icon = document.getElementById('modelSelectIcon');
      if (icon) icon.innerHTML = buildModelIconSVG(m);
      // 不接管点击（它已有自己的逻辑），但确保后续切换状态一致
    }

    candidates.forEach(btn => {
      // 移除原有 inline onclick（cycleComposerModel）以避免重复
      btn.removeAttribute('onclick');
      // 初始化默认模型
      if (!btn.dataset.modelKey) btn.dataset.modelKey = DEFAULT_MODEL_KEY;
      paintModelButton(btn);
      // 如果不是 modelSelectBtn（operations-review 已有自己的逻辑），接管
      if (btn.id === 'modelSelectBtn') return;
      buildModelMenu(btn);
    });
  }

  /* ============================================================
   * 3. 关闭事件（点击外部 / Esc）
   * ============================================================ */
  function bindGlobalClose() {
    document.addEventListener('click', () => {
      closeAllAccountMenus();
      closeAllModelMenus();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeAllAccountMenus();
        closeAllModelMenus();
      }
    });
    window.addEventListener('resize', () => {
      closeAllAccountMenus();
      closeAllModelMenus();
    });
  }

  /* ============================================================
   * 4. 引导：与 mcn-sidebar.js 协作
   *    - mcn-sidebar.js 仍可能调用 initAvatarLightbox，需要禁用
   * ============================================================ */
  // 屏蔽 mcn-sidebar.js 旧的 lightbox 初始化（通过在 IIFE 启动时重写其调用结果）
  function shieldLegacyLightbox() {
    // 找到 lightbox 元素（如已存在）即移除
    const lb = document.getElementById('mcnAvatarLightbox');
    if (lb) lb.remove();
  }

  function bootstrap() {
    shieldLegacyLightbox();
    initAccountMenus();
    initModelPickers();
    bindGlobalClose();
    // 处理 welcome 屏 / 动态注入的 composer（index.html 内部有 showWelcome）
    // 当有 picker 元素被动态插入时，自动初始化
    const observer = new MutationObserver(muts => {
      muts.forEach(m => {
        m.addedNodes.forEach(n => {
          if (n.nodeType !== 1) return;
          if (n.classList && n.classList.contains('uc-model') && !n.dataset.modelKey) {
            paintModelButton(n);
            if (n.id !== 'modelSelectBtn') buildModelMenu(n);
          }
          if (n.querySelectorAll) {
            n.querySelectorAll('.uc-model:not([data-model-key])').forEach(btn => {
              if (btn.id === 'modelSelectBtn') return;
              paintModelButton(btn);
              buildModelMenu(btn);
            });
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
