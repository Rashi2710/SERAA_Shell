/**
 * SERAA Wireframes — Shared Shell JavaScript
 * - Highlights active nav items based on current URL / filename
 * - Manages "locked" tooltip on entitlement-gated cards & elements
 */

/* ==========================================================================
   SERAA prototype configuration
   Single source of truth for licensing + which optional surfaces are shown.
   Nothing in the markup should hardcode Active/Locked — read it from here.
   ========================================================================== */
window.SERAA_CONFIG = {
  // 'saas'       → unlicensed products stay visible, dimmed, with "Request license"
  // 'enterprise' → unlicensed products are hidden everywhere
  deployment: 'saas',

  showHomeExtras: false,   // Quick Start, I want to…, Meet your Avatars, Connect your tools
  showUpsell: false,       // top entitlement banner + "Activate other products" card

  owned: {
    pulze:   { sales: true, market: false, liquidity: false },
    axon:    false,
    synapse: false,
    cortex:  { workbench: true, controlTower: true, registry: false,
               testBench: false, strategyCompass: false }
  }
};

/* isOwned('pulze') | isOwned('pulze.sales') | isOwned('cortex.workbench') */
window.isOwned = function (path) {
  var parts = String(path).split('.');
  var node = window.SERAA_CONFIG.owned[parts[0]];
  if (node === undefined) return false;
  if (parts.length > 1) {
    if (typeof node !== 'object' || node === null) return false;
    return !!node[parts[1]];
  }
  if (typeof node === 'object' && node !== null) {
    return Object.keys(node).some(function (k) { return !!node[k]; });
  }
  return !!node;
};

/* True when unlicensed things should be removed rather than dimmed. */
window.isEnterprise = function () {
  return window.SERAA_CONFIG.deployment === 'enterprise';
};

(function () {
  'use strict';

  // Helper to determine root relative prefix based on script tag location
  function getRootPrefix() {
    const scriptTag = document.querySelector('script[src*="shell.js"]');
    if (scriptTag) {
      const src = scriptTag.getAttribute('src') || '';
      return src.replace('shared/shell.js', '');
    }
    return '';
  }

  // Highlight active nav item based on current page URL
  function initActiveNav() {
    const currentPath = window.location.pathname;
    const currentFile = currentPath.split('/').pop() || 'index.html';

    const navLinks = document.querySelectorAll('.nav-link, .global-nav a, .shell-sidebar a');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
        return;
      }

      // Check if current file matches href destination
      const linkFile = href.split('/').pop().split('#')[0].split('?')[0];

      if (linkFile === currentFile && !link.classList.contains('active')) {
        // If neither had explicit active class, or matches directly
        if (!document.querySelector('.nav-link.active')) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      }
    });

    // Optional click handler for hash-based nav items in wireframe mode
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.nav-link');
      if (link && link.getAttribute('href')?.startsWith('#')) {
        const parentNav = link.closest('.global-nav, .nav-group');
        if (parentNav) {
          parentNav.querySelectorAll('.nav-link').forEach(l => {
            l.classList.remove('active');
            l.removeAttribute('aria-current');
          });
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      }
    });
  }

  // Manage "Locked" card tooltips
  function initLockedTooltips() {
    const lockedElements = document.querySelectorAll('.locked, [data-locked="true"]');

    lockedElements.forEach(el => {
      // Create tooltip DOM element if not already present
      let tooltip = el.querySelector('.locked-tooltip');
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'locked-tooltip';
        const customMessage = el.getAttribute('data-locked-msg') || 'Not activated — Request access from your administrator';
        tooltip.textContent = customMessage;
        el.appendChild(tooltip);
      }

      // Show on hover
      el.addEventListener('mouseenter', () => {
        tooltip.classList.add('visible');
      });

      // Hide on leave
      el.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
      });

      // Intercept clicks on locked cards or elements inside
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        tooltip.classList.add('visible');
        clearTimeout(el._tooltipTimeout);
        el._tooltipTimeout = setTimeout(() => {
          tooltip.classList.remove('visible');
        }, 2500);
      });
    });
  }

  // Manage Account Dropdown Menu
  function initAccountDropdown() {
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('.account-menu-wrapper .user-avatar, [data-account-toggle]');
      const openDropdowns = document.querySelectorAll('.account-dropdown.open');

      if (toggle) {
        e.preventDefault();
        e.stopPropagation();
        const wrapper = toggle.closest('.account-menu-wrapper');
        const dropdown = wrapper ? wrapper.querySelector('.account-dropdown') : null;

        // Close others
        openDropdowns.forEach(d => {
          if (d !== dropdown) d.classList.remove('open');
        });

        if (dropdown) {
          dropdown.classList.toggle('open');
        }
      } else if (!e.target.closest('.account-dropdown')) {
        // Click outside closes all
        openDropdowns.forEach(d => d.classList.remove('open'));
      }
    });
  }

  // Manage App Switcher Drawer / Popover (Anchored to top-left corner)
  function initAppSwitcher() {
    const switchers = document.querySelectorAll('.app-switcher');
    if (!switchers.length) return;

    const rootPrefix = getRootPrefix();

    switchers.forEach(switcher => {
      const headerLeft = switcher.closest('.app-header-left') || switcher.parentElement;
      if (!headerLeft) return;

      headerLeft.style.position = 'relative';

      let popover = headerLeft.querySelector('.app-switcher-popover');
      if (!popover) {
        popover = document.createElement('div');
        popover.className = 'app-switcher-popover';
        popover.innerHTML = `
          <div class="app-switcher-header">
            <span class="app-switcher-title">SERAA Platform</span>
            <span class="app-switcher-sub">Unified Suite</span>
          </div>
          <div class="app-switcher-grid-2x2">
            <a href="${rootPrefix}pulze/index.html" class="app-switcher-tile" title="Pulze — Sense">
              <div class="product-icon-badge badge-teal" style="width: 34px; height: 34px;">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                  <circle cx="5" cy="15" r="1.8" fill="currentColor" stroke="none"/>
                  <path d="M5 10a5 5 0 0 1 5 5"/>
                  <path d="M5 5a10 10 0 0 1 10 10"/>
                  <path d="M5 0.5a14.5 14.5 0 0 1 14.5 14.5"/>
                </svg>
              </div>
              <div class="app-switcher-tile-name">Pulze</div>
              <div class="app-switcher-tile-tag">Sense</div>
            </a>
            <a href="${rootPrefix}axon/rule-library.html" class="app-switcher-tile" title="Axon — Reason">
              <div class="product-icon-badge badge-purple" style="width: 34px; height: 34px;">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="10" cy="4" r="2.2" fill="currentColor" stroke="none"/>
                  <circle cx="4" cy="15" r="2.2" fill="currentColor" stroke="none"/>
                  <circle cx="16" cy="15" r="2.2" fill="currentColor" stroke="none"/>
                  <circle cx="10" cy="11" r="2" fill="currentColor" stroke="none"/>
                  <line x1="10" y1="4" x2="10" y2="11"/>
                  <line x1="10" y1="11" x2="4" y2="15"/>
                  <line x1="10" y1="11" x2="16" y2="15"/>
                </svg>
              </div>
              <div class="app-switcher-tile-name">Axon</div>
              <div class="app-switcher-tile-tag">Reason</div>
            </a>
            <a href="${rootPrefix}synapse/workspace.html" class="app-switcher-tile" title="Synapse — Remember">
              <div class="product-icon-badge badge-pink" style="width: 34px; height: 34px;">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                  <polygon points="7,2 13,2 16,7 13,12 7,12 4,7"/>
                  <polygon points="10,8 16,8 19,13 16,18 10,18 7,13"/>
                </svg>
              </div>
              <div class="app-switcher-tile-name">Synapse</div>
              <div class="app-switcher-tile-tag">Remember</div>
            </a>
            <a href="${rootPrefix}cortex/home.html" class="app-switcher-tile" title="Cortex — Act">
              <div class="product-icon-badge badge-coral" style="width: 34px; height: 34px;">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
                  <polygon points="10,2 17,6 17,14 10,18 3,14 3,6"/>
                  <rect x="8" y="8" width="4" height="4" rx="0.5" fill="currentColor" stroke="none"/>
                </svg>
              </div>
              <div class="app-switcher-tile-name">Cortex</div>
              <div class="app-switcher-tile-tag">Act</div>
            </a>
          </div>
          <div class="app-switcher-footer">
            <a href="${rootPrefix}index.html" class="app-switcher-home-link">
              <span>SERAA Home &bull; All Products</span> &rarr;
            </a>
          </div>
        `;
        headerLeft.appendChild(popover);
      }

      switcher.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = popover.classList.contains('open');
        document.querySelectorAll('.app-switcher-popover.open').forEach(p => p.classList.remove('open'));
        if (!isOpen) {
          popover.classList.add('open');
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.app-switcher-popover') && !e.target.closest('.app-switcher')) {
        document.querySelectorAll('.app-switcher-popover.open').forEach(p => p.classList.remove('open'));
      }
    });
  }

  // Manage Thin Agent Icon Rail (Tooltips / Mini-Popovers)
  function initUtilityDrawers() {
    const overlay = document.getElementById('drawer-overlay');
    const drawers = document.querySelectorAll('.utility-drawer');

    function closeAllDrawers() {
      drawers.forEach(d => d.classList.remove('open'));
      if (overlay) overlay.classList.remove('open');
    }

    // Toggle drawer via data-drawer-target
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('[data-drawer-target]');
      if (toggle) {
        e.preventDefault();
        e.stopPropagation();
        const targetId = toggle.getAttribute('data-drawer-target');
        const targetDrawer = document.getElementById(targetId);
        if (!targetDrawer) return;

        const isCurrentlyOpen = targetDrawer.classList.contains('open');
        closeAllDrawers();

        if (!isCurrentlyOpen) {
          targetDrawer.classList.add('open');
          if (overlay) overlay.classList.add('open');
        }
      }
    });

    // Close buttons inside drawers
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-drawer-close]')) {
        e.preventDefault();
        closeAllDrawers();
      }
    });

    // Overlay click closes
    if (overlay) {
      overlay.addEventListener('click', () => {
        closeAllDrawers();
      });
    }

    // Escape key closes drawers and popovers
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllDrawers();
        document.querySelectorAll('.app-switcher-popover.open').forEach(p => p.classList.remove('open'));
      }
    });
  }

  // Manage SERAA Assistant (Hero Ask Bar & Header Drawer with Entitlement-Aware Routing)
  /* ======================================================================
     Launcher pivot: licensing-driven surfaces, Cortex shell, billing rollup.
     Paths here are site-relative and resolved through getRootPrefix(), so the
     same code works from /, /cortex/ and /pulze/sales/.
     ====================================================================== */

  function url(path) { return getRootPrefix() + path; }

  var MARKS = {
    pulze: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="5" cy="15" r="1.8" fill="currentColor" stroke="none"/><path d="M5 10a5 5 0 0 1 5 5"/><path d="M5 5a10 10 0 0 1 10 10"/><path d="M5 0.5a14.5 14.5 0 0 1 14.5 14.5"/></svg>',
    axon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="4" r="2.2" fill="currentColor" stroke="none"/><circle cx="4" cy="15" r="2.2" fill="currentColor" stroke="none"/><circle cx="16" cy="15" r="2.2" fill="currentColor" stroke="none"/><circle cx="10" cy="11" r="2" fill="currentColor" stroke="none"/><line x1="10" y1="4" x2="10" y2="11"/><line x1="10" y1="11" x2="4" y2="15"/><line x1="10" y1="11" x2="16" y2="15"/></svg>',
    synapse: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><polygon points="7,2 13,2 16,7 13,12 7,12 4,7"/><polygon points="10,8 16,8 19,13 16,18 10,18 7,13"/></svg>',
    cortex: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><polygon points="10,2 17,6 17,14 10,18 3,14 3,6"/><rect x="8" y="8" width="4" height="4" rx="0.5" fill="currentColor" stroke="none"/></svg>'
  };

  var PRODUCTS = [
    { key: 'pulze',   name: 'Pulze',   tag: 'Sense — meetings, market signal, liquidity',
      badge: 'badge-teal',   page: 'pulze/index.html',
      subs: [ { key: 'pulze.sales', label: 'Sales Pulze' },
              { key: 'pulze.market', label: 'Market Pulze' },
              { key: 'pulze.liquidity', label: 'Liquidity Pulze' } ] },
    { key: 'axon',    name: 'Axon',    tag: 'Reason — rules and data intelligence',
      badge: 'badge-purple', page: 'axon/rule-library.html', subs: [] },
    { key: 'synapse', name: 'Synapse', tag: 'Remember — adaptive enterprise memory',
      badge: 'badge-pink',   page: 'synapse/workspace.html', subs: [] },
    { key: 'cortex',  name: 'Cortex',  tag: 'Act — build, deploy and run agents',
      badge: 'badge-coral',  page: 'cortex/home.html',
      subs: [ { key: 'cortex.workbench', label: 'Agent Work Bench' },
              { key: 'cortex.controlTower', label: 'Control Tower' },
              { key: 'cortex.registry', label: 'Agent Registry' },
              { key: 'cortex.testBench', label: 'Test Bench' },
              { key: 'cortex.strategyCompass', label: 'Strategy Compass' } ] }
  ];

  // Each product is its own micro-frontend: launching opens a new tab.
  window.launchProduct = function (page) {
    window.open(url(page), '_blank', 'noopener');
  };

  function chip(label, owned) {
    return '<span class="sub-product-tag"' + (owned ? '' : ' style="opacity:.55"') + '>' + label +
      ' <span style="color:var(--' + (owned ? 'success' : 'text-subtle') + ');font-weight:500">' +
      (owned ? 'Licensed' : 'Not licensed') + '</span></span>';
  }

  function productCard(p) {
    var owned = window.isOwned(p.key);
    var ent = window.isEnterprise();
    var chips = p.subs.filter(function (sb) { return ent ? window.isOwned(sb.key) : true; })
      .map(function (sb) { return chip(sb.label, window.isOwned(sb.key)); }).join('');
    var extra = '';
    if (p.key === 'cortex') {
      var missing = p.subs.filter(function (sb) { return !window.isOwned(sb.key); }).length;
      if (missing && !ent) extra = '<span class="sub-product-tag" style="border-style:dashed">+' +
        missing + ' more available</span>';
    }
    var action = owned
      ? '<button type="button" class="btn btn-sm btn-primary" data-launch="' + p.page + '">Launch &rarr;</button>'
      : '<button type="button" class="btn btn-sm" data-request="' + p.name + '">Request license</button>';
    return '<div class="card" data-product="' + p.key + '"' + (owned ? '' : ' style="opacity:.62"') + '>' +
      '<div class="card-header" style="align-items:flex-start">' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<div class="product-icon-badge ' + p.badge + '">' + MARKS[p.key] + '</div>' +
          '<div><h3 class="card-title" style="margin:0 0 2px">' + p.name + '</h3>' +
          '<span class="card-subtitle">' + p.tag + '</span></div></div>' +
        '<span class="badge ' + (owned ? 'badge-active">Licensed' : 'badge-muted">Not licensed') + '</span>' +
      '</div>' +
      (chips || extra ? '<div class="card-body"><div class="sub-products-row">' + chips + extra + '</div></div>' : '') +
      '<div class="card-footer"><span class="request-note" style="font-size:12px;color:var(--success)"></span>' +
      action + '</div></div>';
  }

  function markRequested(btn, scope) {
    var note = scope.querySelector('.request-note');
    if (note) note.textContent = 'Request sent';
    btn.disabled = true;
  }

  // Compact icon row under the welcome line. Same licensing source as the
  // cards below it, so it can never link into an unlicensed product.
  function renderQuickRow() {
    var host = document.getElementById('product-quickrow');
    if (!host) return;
    host.innerHTML = PRODUCTS.filter(function (p) {
      return window.isEnterprise() ? window.isOwned(p.key) : true;
    }).map(function (p) {
      var owned = window.isOwned(p.key);
      return '<a class="hero-product-item" ' +
        (owned ? 'href="' + url(p.page) + '" target="_blank" rel="noopener" title="Launch ' + p.name + ' in a new tab"'
               : 'role="button" aria-disabled="true" style="opacity:.5;cursor:default" title="' + p.name + ' is not licensed"') +
        '><div class="hero-product-icon">' + MARKS[p.key] + '</div>' +
        '<span class="hero-product-name">' + p.name + '</span></a>';
    }).join('');
  }

  function renderLauncher() {
    var host = document.getElementById('product-launcher');
    if (!host) return;
    host.innerHTML = PRODUCTS.filter(function (p) {
      return window.isEnterprise() ? window.isOwned(p.key) : true;
    }).map(productCard).join('');

    host.addEventListener('click', function (e) {
      var l = e.target.closest('[data-launch]');
      if (l) { window.launchProduct(l.getAttribute('data-launch')); return; }
      var r = e.target.closest('[data-request]');
      if (r) markRequested(r, r.closest('.card-footer'));
    });
  }

  // Per-product documentation cards on the platform docs page.
  var PRODUCT_DOCS = {
    pulze:   { page: 'pulze/index.html',        topics: 'Intel Hub, market signals, liquidity radar, SBAC &amp; admin' },
    axon:    { page: 'axon/rule-library.html',  topics: 'Rule authoring, confidence bands, trigger history, insights' },
    synapse: { page: 'synapse/workspace.html',  topics: 'Adaptive layer, static layers, revision promotion' },
    cortex:  { page: 'cortex/docs.html',        topics: 'Work Bench, Control Tower, registry, test bench, MCP Hub' }
  };

  function renderProductDocs() {
    var host = document.getElementById('docs-products');
    if (!host) return;
    host.innerHTML = PRODUCTS.filter(function (p) {
      return window.isEnterprise() ? window.isOwned(p.key) : true;
    }).map(function (p) {
      var d = PRODUCT_DOCS[p.key];
      var owned = window.isOwned(p.key);
      var action = owned
        ? '<a class="btn btn-sm btn-primary" href="' + url(d.page) + '">Open docs &rarr;</a>'
        : '<span class="badge badge-muted">Available once licensed</span>';
      return '<div class="card"' + (owned ? '' : ' style="opacity:.62"') + '>' +
        '<div class="card-header" style="align-items:flex-start">' +
          '<div style="display:flex;align-items:center;gap:12px">' +
            '<div class="product-icon-badge ' + p.badge + '">' + MARKS[p.key] + '</div>' +
            '<div><h3 class="card-title" style="margin:0 0 2px">' + p.name + '</h3>' +
            '<span class="card-subtitle">' + p.tag + '</span></div></div>' +
          '<span class="badge ' + (owned ? 'badge-active">Licensed' : 'badge-muted">Not licensed') + '</span>' +
        '</div>' +
        '<div class="card-body">' + d.topics + '</div>' +
        '<div class="card-footer">' + action + '</div></div>';
    }).join('');
  }

  /* ---- Cortex unified shell -------------------------------------------- */

  var TRAIL_KEY = 'seraa.cortexTrail';
  var STATE_KEY = 'seraa.cortexHomeState';

  var CORTEX_CRUMBS = {
    'home.html':         ['Home'],
    'build.html':        ['Build', 'Agent Work Bench'],
    'build-avatars.html':['Build', 'Avatars'],
    'build-mcp.html':    ['Build', 'MCP Hub'],
    'build-agent.html':  ['Build', 'Agent configuration'],
    'operate.html':      ['Observe', 'Control Tower'],
    'manage.html':       ['Manage', 'Agent Registry'],
    'docs.html':         ['Docs']
  };

  var CRUMB_PAGES = {
    'Home': 'cortex/home.html', 'Build': 'cortex/build.html', 'Observe': 'cortex/operate.html',
    'Manage': 'cortex/manage.html', 'Docs': 'cortex/docs.html',
    'Agent Work Bench': 'cortex/build.html', 'Playground': 'cortex/build.html',
    'Avatars': 'cortex/build-avatars.html', 'MCP Hub': 'cortex/build-mcp.html',
    'Agent configuration': 'cortex/build-agent.html',
    'Control Tower': 'cortex/operate.html', 'Alerts': 'cortex/operate.html',
    'Agent Registry': 'cortex/manage.html', 'Registry': 'cortex/manage.html',
    'Test Bench': 'cortex/manage.html', 'Approvals': 'cortex/manage.html'
  };

  function currentFile() {
    return (location.pathname.split('/').pop() || 'index.html');
  }
  function inCortex() {
    return /\/cortex\//.test(location.pathname);
  }

  function readTrail(file) {
    try {
      var raw = sessionStorage.getItem(TRAIL_KEY);
      if (!raw) return null;
      var saved = JSON.parse(raw);
      // a trail only applies to the page the link actually pointed at
      return (saved && saved.page === file && saved.trail) ? saved.trail : null;
    } catch (e) { return null; }
  }

  function mountCortexShell() {
    if (!inCortex()) return;
    var file = currentFile();
    var header = document.querySelector('.app-header');
    if (!header) return;

    var bar = document.getElementById('cortex-crumbs');
    if (!bar) {
      bar = document.createElement('nav');
      bar.id = 'cortex-crumbs';
      bar.className = 'cortex-crumbs';
      bar.setAttribute('aria-label', 'Breadcrumb');
      header.parentNode.insertBefore(bar, header.nextSibling);
    }

    var parts = readTrail(file) || CORTEX_CRUMBS[file] || ['Home'];
    var all = ['Cortex'].concat(parts);
    var lastPage = 'cortex/home.html';
    bar.innerHTML = all.map(function (label, i) {
      var sep = i ? '<span class="crumb-sep">/</span>' : '';
      if (i === all.length - 1) return sep + '<span class="crumb-current">' + label + '</span>';
      var pg = (label === 'Cortex') ? 'cortex/home.html' : (CRUMB_PAGES[label] || lastPage);
      lastPage = pg;
      return sep + '<a href="' + url(pg) + '">' + label + '</a>';
    }).join(' ');
  }

  // Any internal link may carry data-trail="A>B>C"; clicking stores it for the
  // destination page so its breadcrumb shows how you got there.
  function initTrailLinks() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-trail]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      var file = href.split('#')[0].split('/').pop();
      if (!file) return;
      try {
        sessionStorage.setItem(TRAIL_KEY, JSON.stringify({
          page: file, trail: a.getAttribute('data-trail').split('>')
        }));
      } catch (err) {}
    });
  }

  /* ---- Cortex module catalog ------------------------------------------- */

  var CORTEX_MODULES = [
    { key: 'cortex.workbench',       name: 'Agent Work Bench',       desc: 'Authoring canvas, multi-agent mesh',       page: 'cortex/build.html',   trail: 'Build>Agent Work Bench' },
    { key: 'cortex.controlTower',    name: 'Observe: Control Tower', desc: 'Fleet telemetry, guardrail interventions', page: 'cortex/operate.html', trail: 'Observe>Control Tower' },
    { key: 'cortex.registry',        name: 'Agent Registry',         desc: 'Approved agents, versions and schemas',    page: 'cortex/manage.html',  trail: 'Manage>Agent Registry' },
    { key: 'cortex.testBench',       name: 'Agent Test Bench',       desc: 'Synthetic stress tests and safety bounds', page: 'cortex/manage.html',  trail: 'Manage>Test Bench' },
    { key: 'cortex.strategyCompass', name: 'AI Strategy Compass',    desc: 'Portfolio view of agent ROI',              page: 'cortex/manage.html',  trail: 'Manage>Strategy Compass' },
    // not built yet — "Coming soon" is not a licensing state
    { key: null, name: 'EDMS — Enterprise Data Suite', desc: 'Masking, lineage, audit compliance', soon: true },
    { key: null, name: 'RAG Semantic Model Hub',       desc: 'Vector embeddings and reranking',    soon: true },
    { key: null, name: 'Enterprise Connectors',        desc: 'SAP and ServiceNow',                 soon: true }
  ];

  function moduleCard(m) {
    if (m.soon) {
      return '<div class="card" style="opacity:.62"><div class="card-header">' +
        '<span class="card-title">' + m.name + '</span>' +
        '<span class="badge badge-muted">Coming soon</span></div>' +
        '<span class="card-subtitle">' + m.desc + '</span></div>';
    }
    var owned = window.isOwned(m.key);
    var action = owned
      ? '<a class="btn btn-sm btn-primary" href="' + url(m.page) + '" data-trail="' + m.trail + '">Launch &rarr;</a>'
      : '<button type="button" class="btn btn-sm" data-request="' + m.name + '">Request license</button>';
    return '<div class="card"' + (owned ? '' : ' style="opacity:.62"') + '>' +
      '<div class="card-header"><span class="card-title">' + m.name + '</span>' +
      '<span class="badge ' + (owned ? 'badge-active">Licensed' : 'badge-muted">Not licensed') + '</span></div>' +
      '<span class="card-subtitle">' + m.desc + '</span>' +
      '<div class="card-footer"><span class="request-note" style="font-size:12px;color:var(--success)"></span>' +
      action + '</div></div>';
  }

  function renderCortexCatalog() {
    var host = document.getElementById('cortex-catalog');
    if (!host) return;
    host.innerHTML = CORTEX_MODULES.filter(function (m) {
      if (m.soon) return true;
      return window.isEnterprise() ? window.isOwned(m.key) : true;
    }).map(moduleCard).join('');

    var real = CORTEX_MODULES.filter(function (m) { return !m.soon; });
    var count = document.getElementById('cortex-module-count');
    if (count) {
      count.textContent = real.filter(function (m) { return window.isOwned(m.key); }).length +
        ' of ' + real.length + ' modules licensed';
    }
    host.addEventListener('click', function (e) {
      var r = e.target.closest('[data-request]');
      if (r) markRequested(r, r.closest('.card-footer'));
    });
  }

  /* ---- Cortex Home prototype state -------------------------------------- */

  function applyCortexHomeState(state) {
    try { sessionStorage.setItem(STATE_KEY, state); } catch (e) {}
    [].forEach.call(document.querySelectorAll('[data-cortex-view]'), function (el) {
      el.hidden = el.getAttribute('data-cortex-view') !== state;
    });
    [].forEach.call(document.querySelectorAll('[data-cortex-state]'), function (b) {
      b.classList.toggle('active', b.getAttribute('data-cortex-state') === state);
    });
  }

  function initCortexHome() {
    if (!document.querySelector('[data-cortex-view]')) return;
    var state;
    try { state = sessionStorage.getItem(STATE_KEY) || 'first'; } catch (e) { state = 'first'; }
    applyCortexHomeState(state);

    [].forEach.call(document.querySelectorAll('[data-cortex-state]'), function (b) {
      b.addEventListener('click', function () {
        applyCortexHomeState(b.getAttribute('data-cortex-state'));
      });
    });

    function start() {
      applyCortexHomeState('returning');          // first run is now behind you
      try {
        sessionStorage.setItem(TRAIL_KEY, JSON.stringify({
          page: 'build.html', trail: ['Build', 'Agent Work Bench', 'New agent']
        }));
      } catch (e) {}
      location.href = url('cortex/build.html');
    }

    var btn = document.getElementById('cortex-intent-btn');
    var input = document.getElementById('cortex-intent-input');
    if (btn) btn.addEventListener('click', start);
    if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') start(); });
    [].forEach.call(document.querySelectorAll('[data-intent-chip]'), function (c) {
      c.addEventListener('click', function () {
        if (input) input.value = c.textContent.trim();
        start();
      });
    });
  }

  /* ---- MCP Hub + agent configuration ------------------------------------ */

  var MCP_SERVERS = [
    { name: 'SalesPulze MCP',    product: 'Pulze',   key: 'pulze.sales', tools: 'insights, actions' },
    { name: 'Axon MCP',          product: 'Axon',    key: 'axon',        tools: 'rules, evaluations' },
    { name: 'Synapse MCP',       product: 'Synapse', key: 'synapse',     tools: 'memory read/write' },
    { name: 'Acme Internal MCP', product: 'Custom',  key: null,          tools: '3 custom tools' }
  ];
  function mcpOwned(m) { return m.key === null ? true : window.isOwned(m.key); }

  function renderMcpHub() {
    var host = document.getElementById('mcp-rows');
    if (!host) return;
    host.innerHTML = MCP_SERVERS.filter(function (m) {
      return window.isEnterprise() ? mcpOwned(m) : true;
    }).map(function (m) {
      var owned = mcpOwned(m);
      var status = owned
        ? '<span class="badge badge-active">Connected by default</span>'
        : '<button type="button" class="btn btn-sm" data-request="' + m.name + '">Request license</button>' +
          ' <span class="request-note" style="font-size:12px;color:var(--success)"></span>';
      return '<tr' + (owned ? '' : ' style="opacity:.62"') + '><td>' + m.name + '</td><td>' +
             m.product + '</td><td>' + m.tools + '</td><td>' + status + '</td></tr>';
    }).join('');
    host.addEventListener('click', function (e) {
      var r = e.target.closest('[data-request]');
      if (r) markRequested(r, r.parentNode);
    });
  }

  function renderAgentConfig() {
    var tools = document.getElementById('agent-tools');
    if (tools) {
      tools.innerHTML = MCP_SERVERS.map(function (m) {
        var owned = mcpOwned(m);
        return '<label style="display:flex;gap:var(--space-md);align-items:center;margin-bottom:var(--space-md);' +
          (owned ? '' : 'opacity:.62') + '">' +
          '<input type="checkbox"' + (owned ? ' checked' : ' disabled') + '> <span>' + m.name + '</span>' +
          (owned ? '' : '<span class="badge badge-muted" style="margin-left:auto">Not licensed</span>') +
          '</label>';
      }).join('');
    }
    var mem = document.getElementById('agent-memory');
    if (!mem) return;
    if (window.isOwned('synapse')) {
      mem.innerHTML = '<div class="a2ui-field"><span class="a2ui-field-label">Memory scope</span>' +
        '<div class="a2ui-field-control"><span>Support &mdash; Tier 1 resolutions</span>' +
        '<span class="icon icon-chevron-down"></span></div>' +
        '<span class="a2ui-field-hint">Shared by 3 agents</span></div>';
    } else {
      mem.innerHTML = '<div class="a2ui-field" style="opacity:.62">' +
        '<span class="a2ui-field-label">Memory scope</span>' +
        '<div class="a2ui-field-control"><span>No memory available</span>' +
        '<span class="icon icon-chevron-down"></span></div>' +
        '<span class="a2ui-field-hint">Requires Synapse</span></div>' +
        '<button type="button" class="btn btn-sm" data-request="Synapse">Request license</button> ' +
        '<span class="request-note" style="font-size:12px;color:var(--success)"></span>';
      mem.addEventListener('click', function (e) {
        var r = e.target.closest('[data-request]');
        if (r) markRequested(r, mem);
      });
    }
  }

  /* ---- Billing: product -> sub-product -> consumption -------------------- */

  var BILLING = [
    { key: 'pulze', name: 'Pulze', dot: 'dot-teal', desc: 'Sales, Market, Liquidity',
      tier: 'Growth Tier', manage: 'pulze/cost-insights.html',
      subs: [
        { key: 'pulze.sales',     name: 'Sales Pulze',     use: '120 seats · 248.5 hrs', cost: 1840.00 },
        { key: 'pulze.market',    name: 'Market Pulze',    use: '—', cost: 0 },
        { key: 'pulze.liquidity', name: 'Liquidity Pulze', use: '—', cost: 0 } ] },
    { key: 'axon', name: 'Axon', dot: 'dot-purple', desc: 'Rules & Intelligence',
      tier: null, manage: null, subs: [] },
    { key: 'synapse', name: 'Synapse', dot: 'dot-pink', desc: 'Adaptive Memory',
      tier: null, manage: null, subs: [] },
    { key: 'cortex', name: 'Cortex', dot: 'dot-coral', desc: 'Agent Work Bench & Tower',
      tier: 'Enterprise Full Suite', manage: 'cortex/manage.html',
      subs: [
        { key: 'cortex.workbench',       name: 'Agent Work Bench',    use: '8 agents · 11.2M tokens', cost: 1980.00 },
        { key: 'cortex.controlTower',    name: 'Control Tower',       use: '7.2M tokens',                  cost: 1440.80 },
        { key: 'cortex.registry',        name: 'Agent Registry',      use: '—', cost: 0 },
        { key: 'cortex.testBench',       name: 'Agent Test Bench',    use: '—', cost: 0 },
        { key: 'cortex.strategyCompass', name: 'AI Strategy Compass', use: '—', cost: 0 } ] }
  ];

  function money(n) { return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  function renderBilling() {
    var host = document.getElementById('billing-rows');
    if (!host) return;
    var ent = window.isEnterprise();

    host.innerHTML = BILLING.filter(function (p) {
      return ent ? window.isOwned(p.key) : true;
    }).map(function (p) {
      var owned = window.isOwned(p.key);
      var subs = p.subs.filter(function (sb) { return ent ? window.isOwned(sb.key) : true; });
      var total = p.subs.reduce(function (a, sb) { return a + (window.isOwned(sb.key) ? sb.cost : 0); }, 0);
      var licensedN = p.subs.filter(function (sb) { return window.isOwned(sb.key); }).length;
      var manage = (owned && p.manage)
        ? '<a href="' + url(p.manage) + '" class="btn btn-sm btn-primary">Manage &rarr;</a>'
        : (owned ? '' :
           '<button type="button" class="btn btn-sm" data-request="' + p.name + '">Request license</button>' +
           '<div class="request-note" style="font-size:12px;color:var(--success)"></div>');

      var head = '<tr class="billing-row" data-expand="' + p.key + '"' + (owned ? '' : ' style="opacity:.7"') + '>' +
        '<td><div style="display:flex;align-items:center;gap:8px">' +
          (subs.length ? '<span class="billing-caret" style="color:var(--text-subtle);width:10px">&rsaquo;</span>'
                       : '<span style="width:10px;display:inline-block"></span>') +
          '<span class="product-dot ' + p.dot + '"></span>' +
          '<div><div style="font-weight:600">' + p.name + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted)">' + p.desc +
          (subs.length ? ' · ' + licensedN + ' of ' + p.subs.length + ' licensed' : '') +
          '</div></div></div></td>' +
        '<td>' + (owned ? '<span class="badge badge-active">' + p.tier + '</span>'
                        : '<span class="locked-badge">Not licensed</span>') + '</td>' +
        '<td>' + (owned ? (subs.length ? 'expand for detail' : '—') : '—') + '</td>' +
        '<td style="font-weight:600">' + money(total) + '</td>' +
        '<td style="text-align:right">' + manage + '</td></tr>';

      var detail = subs.map(function (sb) {
        var so = window.isOwned(sb.key);
        return '<tr class="billing-sub" data-parent="' + p.key + '" hidden' + (so ? '' : ' style="opacity:.7"') + '>' +
          '<td style="padding-left:46px;color:var(--text-muted)">' + sb.name + '</td>' +
          '<td>' + (so ? '<span class="badge badge-active">Licensed</span>'
                       : '<span class="badge badge-muted">Not licensed</span>') + '</td>' +
          '<td>' + (so ? sb.use : '—') + '</td>' +
          '<td>' + (so ? money(sb.cost) : '—') + '</td>' +
          '<td style="text-align:right">' + (so ? '' :
            '<button type="button" class="btn btn-sm" data-request="' + sb.name + '">Request license</button>' +
            '<div class="request-note" style="font-size:12px;color:var(--success)"></div>') + '</td></tr>';
      }).join('');

      return head + detail;
    }).join('');

    host.addEventListener('click', function (e) {
      var req = e.target.closest('[data-request]');
      if (req) { e.stopPropagation(); markRequested(req, req.parentNode); return; }
      var row = e.target.closest('[data-expand]');
      if (!row) return;
      var key = row.getAttribute('data-expand');
      var open = row.classList.toggle('open');
      var caret = row.querySelector('.billing-caret');
      if (caret) caret.style.transform = open ? 'rotate(90deg)' : '';
      [].forEach.call(host.querySelectorAll('[data-parent="' + key + '"]'), function (r) { r.hidden = !open; });
    });
  }

  // Platform row on the SERAA home: the shell's own surfaces, with live
  // figures derived from the same config the product cards read.
  function renderPlatformRow() {
    var host = document.getElementById('platform-row');
    if (!host) return;

    var ownedProducts = ['pulze','axon','synapse','cortex'].filter(window.isOwned);
    var spend = BILLING.reduce(function (a, p) {
      return a + p.subs.reduce(function (b, sb) {
        return b + (window.isOwned(sb.key) ? sb.cost : 0);
      }, 0);
    }, 0);

    var items = [
      { page: 'docs.html', title: 'Documentation',
        sub: 'Getting started, access &amp; SBAC, licensing',
        stat: ownedProducts.length + ' product' + (ownedProducts.length === 1 ? '' : 's') + ' documented',
        tone: 'muted' },
      { page: 'billing.html', title: 'Billing &amp; Usage',
        sub: 'Spend this cycle across every product',
        stat: money(spend) + ' this cycle', tone: 'strong' },
      { page: 'assure.html', title: 'Assure',
        sub: 'Guardrails and governance across the suite',
        stat: ownedProducts.length + ' watched &middot; 0 open risk items', tone: 'ok' }
    ];

    host.innerHTML = items.map(function (it) {
      var statStyle = it.tone === 'strong' ? 'font-size:var(--text-xl);line-height:var(--line-xl);font-weight:var(--weight-semibold);color:var(--text-heading)'
                    : it.tone === 'ok'     ? 'font-size:var(--text-sm);color:var(--success);font-weight:var(--weight-medium)'
                                           : 'font-size:var(--text-sm);color:var(--text-muted)';
      var dot = it.tone === 'ok' ? '<span class="assure-status-dot" style="margin-right:6px"></span>' : '';
      return '<a class="card card-clickable" href="' + url(it.page) + '">' +
        '<span class="card-title">' + it.title + '</span>' +
        '<span class="card-subtitle">' + it.sub + '</span>' +
        '<div class="card-body" style="' + statStyle + '">' + dot + it.stat + '</div>' +
        '<div class="card-footer"><span style="font-size:12px;color:var(--accent);font-weight:500">Open &rarr;</span></div>' +
      '</a>';
    }).join('');
  }

  /* ---- optional surfaces ------------------------------------------------ */

  function applyConfig() {
    var cfg = window.SERAA_CONFIG;
    [].forEach.call(document.querySelectorAll('[data-optional]'), function (el) {
      var g = el.getAttribute('data-optional');
      el.hidden = !((g === 'extras') ? cfg.showHomeExtras : (g === 'upsell') ? cfg.showUpsell : true);
    });

    renderQuickRow();
    renderLauncher();
    renderCortexCatalog();
    initCortexHome();
    renderMcpHub();
    renderAgentConfig();
    renderBilling();
    renderProductDocs();
    renderPlatformRow();

    var recents = document.getElementById('recents-section');
    if (recents) {
      recents.hidden = ['pulze','axon','synapse','cortex'].filter(window.isOwned).length <= 1;
    }
  }

  function initAll() {
    initActiveNav();
    initLockedTooltips();
    initAccountDropdown();
    initAppSwitcher();
    initUtilityDrawers();
    initTrailLinks();
    mountCortexShell();
    applyConfig();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();

