(() => {
  function initWorkbenchMenu() {
    const toggle = document.querySelector(".mcn-workbench-toggle");
    const sidebar = document.querySelector(".mcn-sidebar");
    if (!toggle || !sidebar) return;

    const menu = document.createElement("div");
    menu.className = "mcn-workbench-menu";
    menu.hidden = true;
    menu.innerHTML = `
      <div class="mcn-workbench-search"><span>⌕</span><span>搜索业务平台应用</span></div>
      <div class="mcn-workbench-head"><strong>业务平台</strong><span>全部应用</span></div>
      <div class="mcn-app-grid">
        <button class="mcn-app-item" type="button" data-app="聊TA">
          <span class="mcn-app-icon chat"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12a8 8 0 01-8 8H5l-3 2 1-5a8 8 0 118-5z"></path></svg></span>
          <span>聊TA</span>
        </button>
        <button class="mcn-app-item" type="button" data-app="泰客">
          <span class="mcn-app-icon customer"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H2v-2a4 4 0 014-4h3m7-6a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></span>
          <span>泰客</span>
        </button>
        <button class="mcn-app-item" type="button" data-app="乐伴">
          <span class="mcn-app-icon companion"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"></path></svg></span>
          <span>乐伴</span>
        </button>
        <a class="mcn-app-item" href="http://stable-gjkff8udy769pk5q-sandbox-preview.fe.htsc/">
          <span class="mcn-app-icon skills"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3zm6 11l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14zM6 14l1.2 2.8L10 18l-2.8 1.2L6 22l-1.2-2.8L2 18l2.8-1.2L6 14z"></path></svg></span>
          <span>Skills</span>
        </a>
      </div>`;
    document.body.appendChild(menu);

    function placeMenu() {
      const sideRect = sidebar.getBoundingClientRect();
      const buttonRect = toggle.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const left = Math.min(sideRect.right + 10, window.innerWidth - menuRect.width - 12);
      const top = Math.max(12, Math.min(buttonRect.top - 18, window.innerHeight - menuRect.height - 12));
      menu.style.left = `${Math.max(12, left)}px`;
      menu.style.top = `${top}px`;
    }

    function closeMenu() {
      menu.hidden = true;
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", event => {
      event.stopPropagation();
      menu.hidden = !menu.hidden;
      toggle.classList.toggle("active", !menu.hidden);
      toggle.setAttribute("aria-expanded", String(!menu.hidden));
      if (!menu.hidden) placeMenu();
    });
    menu.addEventListener("click", event => {
      event.stopPropagation();
      const app = event.target.closest("[data-app]");
      if (!app) return;
      closeMenu();
      document.querySelector(".mcn-app-toast")?.remove();
      const toast = document.createElement("div");
      toast.className = "mcn-app-toast";
      toast.textContent = `已选择 ${app.dataset.app}`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1500);
    });
    document.addEventListener("click", closeMenu);
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", closeMenu);
  }

  function initNotifications() {
    const defaults = {
      content: ["alert-industry", "alert-major", "portfolio-0", "commission-gold", "trend-signal", "calendar-reminder"],
      lead: ["newclient", "redeem", "churn", "live", "consult", "hot-lead", "return-visit"],
      qa: ["welcome", "fund", "product-faq", "risk-query", "complaint-escalation"],
      review: ["wealth", "weekly", "live", "monthly-report", "campaign-summary", "retention-alert"],
    };
    const labelKeys = {
      "内容创作": "content",
      "线索洞察": "lead",
      "客户问答": "qa",
      "运营复盘": "review",
    };
    const storageKey = "mcn-workbench-read-notifications-v1";
    let readState = {};
    try {
      readState = JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch (_) {
      readState = {};
    }

    function hasRead(key, id) {
      return Array.isArray(readState[key]) && readState[key].includes(id);
    }

    function isUnread(key, id) {
      return Boolean(defaults[key]?.includes(id) && !hasRead(key, id));
    }

    function save() {
      try {
        localStorage.setItem(storageKey, JSON.stringify(readState));
      } catch (_) {}
    }

    function updateBadges() {
      const countBooleanValues = (key, fallback) => {
        try {
          const value = JSON.parse(localStorage.getItem(key) || "null");
          if (value && typeof value === "object" && !Array.isArray(value)) {
            return Object.values(value).filter(Boolean).length;
          }
        } catch (_) {}
        return fallback;
      };
      const reviewCount = (() => {
        try {
          const value = JSON.parse(localStorage.getItem("mcn_unread_review_v2") || "null");
          if (Number.isFinite(value?.total)) return Math.max(0, value.total);
          if (value && typeof value === "object") {
            const assistantTotal = Object.values(value.assistants || {})
              .reduce((sum, count) => sum + (Number(count) || 0), 0);
            const taskTotal = Array.isArray(value.tasks)
              ? value.tasks.filter(task => task?.viewed === false).length
              : 0;
            return assistantTotal + taskTotal;
          }
        } catch (_) {}
        return 0;
      })();
      const counts = {
        content: countBooleanValues("mcn_unread_content_v2", 5),
        lead: countBooleanValues("mcn_unread_lead_v2", 3),
        qa: countBooleanValues("mcn_unread_qa_v2", 3),
        review: reviewCount,
      };
      document.querySelectorAll(".mcn-nav-item").forEach(item => {
        const label = item.querySelector(".mcn-nav-label")?.textContent.trim();
        const key = labelKeys[label];
        if (!key) return;
        const badge = item.querySelector(".mcn-nav-badge");
        if (!badge) return;
        const count = counts[key];
        badge.textContent = String(count);
        badge.classList.toggle("is-empty", count === 0);
        badge.style.display = count === 0 ? "none" : "grid";
      });
    }

    const navRoutes = {
      "首页": "index.html",
      "内容创作": "content-workbench.html",
      "线索洞察": "lead-insights.html",
      "客户问答": "http://stable-mncou8kdwb7xte0s-sandbox-preview.fe.htsc/",
      "运营复盘": "operations-review.html",
    };
    document.querySelectorAll(".mcn-nav-item").forEach(item => {
      const label = item.querySelector(".mcn-nav-label")?.textContent.trim();
      const route = navRoutes[label];
      if (!route) return;
      item.onclick = () => {
        window.location.href = route;
      };
    });

    function decorate(root = document) {
      const items = [];
      if (root instanceof Element && root.matches("[data-notification-key]")) items.push(root);
      root.querySelectorAll?.("[data-notification-key]").forEach(item => items.push(item));
      items.forEach(item => {
        const key = item.dataset.notificationKey;
        const id = item.dataset.notificationId;
        const unread = isUnread(key, id);
        let dot = item.querySelector(":scope > .mcn-unread-dot");
        /* 已有数字角标（.count / .mcn-nav-badge）时不再添加红点 */
        const hasBadge = !!item.querySelector(":scope > .count, :scope > .mcn-nav-badge");
        if (unread && !dot && !hasBadge) {
          dot = document.createElement("span");
          dot.className = "mcn-unread-dot";
          dot.setAttribute("aria-label", "未读");
          item.appendChild(dot);
        } else if (!unread && dot) {
          dot.remove();
        }
      });
    }

    function markRead(key, id) {
      if (!isUnread(key, id)) return;
      readState[key] = Array.from(new Set([...(readState[key] || []), id]));
      save();
      updateBadges();
      decorate();
    }

    document.addEventListener("click", event => {
      const item = event.target.closest("[data-notification-key]");
      if (!item) return;
      markRead(item.dataset.notificationKey, item.dataset.notificationId);
    });

    const observer = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType === 1) decorate(node);
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("storage", updateBadges);
    document.addEventListener("mcn:unread-updated", updateBadges);
    updateBadges();
    decorate();
    window.mcnNotifications = { markRead, isUnread, updateBadges };
  }

  /* ===== 共享全局搜索索引（所有页面共用） ===== */
  window.__mcnGlobalSearch = {
    messages: [
      { key: 'wealth-review', name: '财富圈复盘助手', sub: '自动复盘财富圈长图文表现、定位高转化内容', href: null },
      { key: 'wealth-weekly', name: '每周财富圈复盘', sub: '汇总财富圈长图文表现，输出订阅/曝光/TOP文章', href: null },
      { key: 'morning-strategy', name: '早盘策略生成', sub: '生成今日早盘策略并发布至财富圈', href: null },
      { key: 'industry-deep', name: '行业深读 · 财富圈', sub: '行业解读稿件，适配财富圈发布格式', href: null },
      { key: 'live-review', name: '直播复盘分析', sub: '复盘直播场次表现与客户转化数据', href: null },
      { key: 'group-ops', name: '社群运营日报', sub: '企微群活跃度、问答统计与跟进建议', href: null },
      { key: 'content-effect', name: '内容效果查询', sub: '各渠道阅读量、点击率与转化数据', href: null },
      { key: 'compliance', name: '合规预审检查', sub: '自动检测内容合规风险并给出修改建议', href: null },
      { key: 'lead-new', name: '新客线索跟进', sub: '高意向客户识别与分配建议', href: null },
      { key: 'churn-alert', name: '流失预警提醒', sub: '高流失风险客户识别与挽留话术', href: null },
    ],
    workflows: [
      { name: '内容生产工作流', sub: '采集→分析→搜索→生成→校验→复核' },
      { name: '财富圈发布流程', sub: '生成→合规预审→财富圈发布' },
      { name: '直播运营流程', sub: '策划→预热→直播→复盘→分发' },
      { name: '线索跟进流程', sub: '识别→分配→触达→转化→入金' },
      { name: '社群运营流程', sub: '素材准备→群发→互动→答疑→沉淀' },
    ],
    apps: [
      { name: '聊TA', action: () => toast('打开应用：聊TA') },
      { name: '泰客', action: () => toast('打开应用：泰客') },
      { name: '乐伴', action: () => toast('打开应用：乐伴') },
      { name: 'TEC', action: () => toast('打开应用：TEC') },
      { name: '乐道', action: () => toast('打开应用：乐道') },
    ]
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initWorkbenchMenu();
      initNotifications();
      initAvatarLightbox();
    });
  } else {
    initWorkbenchMenu();
    initNotifications();
    initAvatarLightbox();
  }

  /* 工作室头像菜单：已由 mcn-account-menu.js 接管，此处禁用 lightbox */
  function initAvatarLightbox() {
    const lb = document.getElementById('mcnAvatarLightbox');
    if (lb) lb.remove();
  }
})();

/* ========== 全局浮动任务组件 ========== */
(function(){
  const TASKS=[
    {id:'t16',col:'content',person:'zhong',title:'行业深读 · 财富圈',s:510, e:540, type:'routine', done:true},
    {id:'t1', col:'content',person:'yu',  title:'盘前策略',          s:540, e:570, type:'routine', done:true},
    {id:'t2', col:'content',person:'yu',  title:'直播 · 算力主线',   s:570, e:690, type:'routine', done:true},
    {id:'t17',col:'content',person:'zhong',title:'直播跟播',         s:570, e:660, type:'routine', done:true},
    {id:'t3', col:'content',person:'yu',  title:'半导体异动解读',    s:670, e:700, type:'optional',done:true},
    {id:'t19',col:'content',person:'yu',  title:'盘中小结快评',      s:700, e:720, type:'optional',done:false,link:'content-workbench.html?mode=daily&task=strategy',
      info:{bg:'首个交易小时结束，照例可发一段盘中小结快评',
            need:'确认快评内容后发布财富圈',
            ai:'快评初稿已备好，结合上午异动与直播要点'}},
    {id:'t-semi',col:'content',person:'yu',title:'费半急跌应对稿',   s:800, e:840, type:'must',    done:false,link:'content-workbench.html?mode=alert&task=major',
      info:{bg:'主线观点「算力 · 半导体」监测规则触发：盘内费城半导体指数急跌 4.25%，客户恐慌情绪上升',
            need:'确认应对解读稿，发布至财富圈与跟投群',
            ai:'初稿已完成，合规预审通过，等一句确认'}},
    {id:'t18',col:'content',person:'zhong',title:'视频生产',         s:900, e:960, type:'routine', done:false},
    {id:'t5', col:'content',person:'yu',  title:'核心栏目撰写',      s:1080,e:1140,type:'routine', done:false,link:'content-workbench.html?mode=daily&task=industryDepth'},
    {id:'t6', col:'lead',   person:'cui', title:'早报分发',          s:560, e:590, type:'routine', done:true},
    {id:'t7', col:'lead',   person:'cui', title:'新客企微添加',      s:660, e:700, type:'routine', done:false},
    {id:'t8', col:'lead',   person:'cui', title:'大额赎回挽留跟进',  s:840, e:880, type:'must',    done:false,
      info:{bg:'持有客户昨日提交大额赎回申请 380 万元，触发挽留规则',
            need:'今日内电话挽留，摸清赎回原因并记录',
            ai:'已整理该客户持仓、亏损节点与历史沟通记录，挽留话术已备'}},
    {id:'t9', col:'lead',   person:'yu',  title:'新增5条企微新客线索',s:900,e:930,type:'routine',done:false,link:'lead-insights.html?scene=newclient'},
    {id:'t11',col:'qa',     person:'cai', title:'盘前合规提醒',      s:555, e:575, type:'routine', done:true},
    {id:'t12',col:'qa',     person:'cai', title:'跟播咨询回复',      s:600, e:690, type:'routine', done:true},
    {id:'t13',col:'qa',     person:'cai', title:'赎回意向客户问答',  s:850, e:880, type:'must',    done:false,
      info:{bg:'3 位客户盘中咨询赎回，情绪敏感，属必答场景',
            need:'按合规口径逐一回复并确认',
            ai:'话术草稿已备，敏感词已校验'}},
    {id:'t14',col:'qa',     person:'cai', title:'涨乐非紧急咨询',    s:930, e:960, type:'optional',done:false,
      info:{bg:'涨乐会话积压 6 条非紧急咨询',
            need:'抽空复核 AI 代答后发出',
            ai:'6 条均已代答，平均置信度 92%'}},
    {id:'t15',col:'qa',     person:'cai', title:'夕会',              s:1020,e:1050,type:'routine', done:false},
  ];
  const TYPE_NAME={routine:'定时',optional:'选做',must:'必做'};
  const COL_NAME={content:'内容创作',qa:'客户问答',lead:'线索洞察'};

  function fmt(m){const h=Math.floor(m/60),mm=m%60;return String(h).padStart(2,'0')+':'+String(mm).padStart(2,'0')}
  const NOW_MIN=13*60+15; /* 与首页一致：演示用当前时间 13:15 */
  function getPendingCount(){return TASKS.filter(t=>t.person==='yu'&&!t.done).length}

  function initTaskFab(){
    if(window.__disableTaskFab)return;
    if(document.getElementById('mcnTaskFab'))return;
    const fab=document.createElement('div');
    fab.id='mcnTaskFab';
    fab.className='mcn-task-fab';
    fab.innerHTML=
      '<div class="mcn-task-fab-panel">'+
        '<div class="mcn-task-fab-head"><h4>今日任务</h4><small id="tfDate"></small><button class="mcn-task-fab-close" aria-label="关闭">&times;</button></div>'+
        '<div class="mcn-tf-legend">'+
          '<span class="lg-item"><i class="lg-dot routine"></i>定时</span>'+
          '<span class="lg-item"><i class="lg-dot must"></i>必做</span>'+
          '<span class="lg-item"><i class="lg-dot optional"></i>选做</span>'+
          '<span class="lg-item"><i class="lg-dot done"></i>已完成</span>'+
        '</div>'+
        '<div class="mcn-task-fab-body"><div class="timeline" id="tfTimeline"></div></div>'+
        '<div class="mcn-tf-foot"><span id="tfSummary"></span><a href="index.html">查看完整日历 →</a></div>'+
      '</div>'+
      '<div class="task-pop" id="tfTaskPop"></div>'+
      '<button class="mcn-task-fab-btn" aria-label="今日任务">'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'+
        '<span class="mcn-task-fab-badge" id="tfBadge"></span>'+
        '<span class="mcn-task-fab-hint" id="tfHint">快来看看今日任务吧</span>'+
      '</button>';
    document.body.appendChild(fab);

    /* 更新日期 */
    const now=new Date();
    const months=['01','02','03','04','05','06','07','08','09','10','11','12'];
    const days=['周日','周一','周二','周三','周四','周五','周六'];
    const ds=months[now.getMonth()]+'月'+String(now.getDate()).padStart(2,'0')+'日 '+days[now.getDay()];
    const el=document.getElementById('tfDate');
    if(el)el.textContent=ds+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');

    /* 角标 + 时间流 */
    updateFabBadge();
    renderFabTimeline();

    /* 点击按钮切换 */
    fab.querySelector('.mcn-task-fab-btn').addEventListener('click',(e)=>{
      e.stopPropagation();fab.classList.toggle('open');
      /* 点击一次后隐藏提示文字，用 sessionStorage 跨页面保持（关标签页后自动重置） */
      fab.classList.add('hint-hidden');
      try{sessionStorage.setItem('mcn_fab_hint_seen','1')}catch(e){}
    });
    /* 恢复 hint 状态：同一次浏览器会话内跨页面保持 */
    try{if(sessionStorage.getItem('mcn_fab_hint_seen'))fab.classList.add('hint-hidden');}catch(e){}
    /* 关闭按钮 */
    fab.querySelector('.mcn-task-fab-close').addEventListener('click',(e)=>{
      e.stopPropagation();fab.classList.remove('open');
    });
    /* 点外部关闭 */
    document.addEventListener('click',(e)=>{
      if(!fab.contains(e.target)){fab.classList.remove('open');document.getElementById('tfTaskPop')?.classList.remove('show');}
    });
  }

  function updateFabBadge(){
    const el=document.getElementById('tfBadge');
    if(!el)return;
    const n=getPendingCount();
    el.textContent=n;
    el.style.display=n?'grid':'none';
  }

  /* 与首页 renderTasks 完全一致的时间瀑布流 */
  function renderFabTimeline(){
    const timeline=document.getElementById('tfTimeline');
    const sumEl=document.getElementById('tfSummary');
    if(!timeline)return;

    const mine=TASKS.filter(t=>t.person==='yu').sort((a,b)=>a.s-b.s||a.e-b.e);
    const doneCount=mine.filter(t=>t.done).length;
    if(sumEl)sumEl.textContent=doneCount+' 已完成 · '+(mine.length-doneCount)+' 待处理';

    if(!mine.length){timeline.innerHTML='<div class="empty-flow">今日暂无任务</div>';return;}

    const groups=[];
    for(const t of mine){
      let g=groups.find(x=>x.key===t.s);
      if(!g){g={key:t.s,tasks:[]};groups.push(g);}
      g.tasks.push(t);
    }

    const card=t=>{
      const missed=!t.done&&t.e<NOW_MIN;
      let chip='';
      if(t.done) chip='<span class="t-chip"><svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-1px;margin-right:2px"><path d="M5 13l4 4L19 7"/></svg>已完成</span>';
      else if(missed) chip='<span class="t-chip">未完成</span>';
      else chip=`<span class="t-chip">${TYPE_NAME[t.type]}</span>`;
      const action=!t.done&&t.link?`onclick="location.href='${t.link}'"`:(!t.done&&(t.type==='must'||t.type==='optional')?`onclick="openFabTaskPop(event,TASKS.find(x=>x.id==='${t.id}'))"`:'');
      return `<div class="flow-task ${t.type}${t.done?' done':''}${missed?' missed':''}${!t.done&&t.link?' linked':''}" data-id="${t.id}" ${action}>
        <div class="flow-top"><div class="t-title">${t.title}</div>${chip}</div>
        <div class="flow-meta"><span>${fmt(t.s)} – ${fmt(t.e)}</span><i></i><span>${COL_NAME[t.col]}</span></div>
      </div>`;
    };
    const groupHtml=(g)=>{
      const now=g.key<=NOW_MIN&&Math.max(...g.tasks.map(t=>t.e))>=NOW_MIN;
      return `<div class="time-group${now?' current':''}"><div class="time-label">${fmt(g.key)}</div><div class="time-cards">${g.tasks.map(card).join('')}</div></div>`;
    };
    const nowRow='<div class="now-row"><span class="nw-t">13:15</span><span class="nw-l"></span></div>';

    const foldGroups=groups.filter(g=>Math.max(...g.tasks.map(t=>t.e))<NOW_MIN&&g.tasks.every(t=>t.done));
    const restGroups=groups.filter(g=>!foldGroups.includes(g));

    let html='';
    if(foldGroups.length){
      const n=foldGroups.reduce((a,g)=>a+g.tasks.length,0);
      html+=`<div class="fold-bar" onclick="toggleFabFold(this)"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-1px;margin-right:3px"><path d="M5 13l4 4L19 7"/></svg>上午已完成 ${n} 项 · 点击<b>展开</b></div><div class="fold-body">${foldGroups.map(g=>groupHtml(g)).join('')}</div>`;
    }
    const upIdx=restGroups.findIndex(g=>g.key>=NOW_MIN);
    restGroups.forEach((g,i)=>{
      if(i===upIdx)html+=nowRow;
      html+=groupHtml(g);
    });
    if(upIdx===-1)html+=nowRow;
    timeline.innerHTML=html;
  }

  function toggleFabFold(bar){
    const body=bar.nextElementSibling;body.classList.toggle('open');
    bar.querySelector('b').textContent=body.classList.contains('open')?'收起':'展开';
  }

  function openFabTaskPop(ev,t){
    ev.stopPropagation();
    const pop=document.getElementById('tfTaskPop');
    if(!pop||!t.info)return;
    const chipCls=t.type==='must'?'background:#f7d6d6;color:#dc454b':'background:#f7e6c4;color:#c07f16';
    pop.innerHTML=`<div class="pop-head"><strong>${t.title}</strong><span class="t-chip-static" style="${chipCls}">${TYPE_NAME[t.type]}</span></div>
      <div class="pop-rows">
        <div class="pop-row"><b>背景</b><span>${t.info.bg}</span></div>
        <div class="pop-row"><b>需要你做</b><span>${t.info.need}</span></div>
        <div class="pop-row"><b>AI 已做</b><span>${t.info.ai}</span></div>
      </div>`;
    pop.classList.add('show');
    const pw=296,ph=210;
    let x=ev.clientX+12,y2=ev.clientY+12;
    if(x+pw>innerWidth-12)x=ev.clientX-pw-12;
    if(y2+ph>innerHeight-12)y2=innerHeight-ph-12;
    pop.style.left=x+'px';pop.style.top=y2+'px';
    document.addEventListener('click',function closePop(e){if(!pop.contains(e.target)){pop.classList.remove('show');document.removeEventListener('click',closePop);}});
  }

  /* 暴露给全局，供内联 onclick 调用（IIFE 内函数无法被 onclick="..." 直接访问） */
  window.TASKS=TASKS;
  window.TYPE_NAME=TYPE_NAME;
  window.COL_NAME=COL_NAME;
  window.fmt=fmt;
  window.toggleFabFold=toggleFabFold;
  window.openFabTaskPop=openFabTaskPop;

  /* 页面加载后初始化 */
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',initTaskFab);
  }else{
    initTaskFab();
  }
})();
