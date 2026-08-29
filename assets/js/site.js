/* site.js — theme, language, reveals, nav shortcuts, bibtex */
(function () {
  var html = document.documentElement;

  /* theme */
  var savedTheme = null;
  try { savedTheme = localStorage.getItem('ag-theme'); } catch (e) {}
  html.setAttribute('data-theme', savedTheme || 'dark');

  /* language: saved -> browser -> en */
  var savedLang = null;
  try { savedLang = localStorage.getItem('ag-lang'); } catch (e) {}
  var browser = (navigator.language || 'en').toLowerCase().indexOf('de') === 0 ? 'de' : 'en';
  var lang = savedLang || browser;
  html.setAttribute('data-lang', lang);
  html.setAttribute('lang', lang);

  function paint() {
    var t = html.getAttribute('data-theme'), l = html.getAttribute('data-lang');
    var tb = document.getElementById('theme-btn');
    var lb = document.getElementById('lang-btn');
    if (tb) { tb.textContent = t === 'dark' ? 'LIGHT' : 'DARK'; tb.setAttribute('aria-pressed', t === 'light'); }
    if (lb) { lb.textContent = l === 'en' ? 'DE' : 'EN'; }
    document.title = (l === 'de' && document.body.dataset.titleDe) ? document.body.dataset.titleDe : (document.body.dataset.titleEn || document.title);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('#theme-btn');
    if (t) {
      var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      try { localStorage.setItem('ag-theme', next); } catch (err) {}
      paint();
    }
    var l = e.target.closest('#lang-btn');
    if (l) {
      var nl = html.getAttribute('data-lang') === 'en' ? 'de' : 'en';
      html.setAttribute('data-lang', nl);
      html.setAttribute('lang', nl);
      try { localStorage.setItem('ag-lang', nl); } catch (err) {}
      paint();
    }
    var b = e.target.closest('[data-bib]');
    if (b) {
      var box = document.getElementById(b.getAttribute('data-bib'));
      if (box) box.classList.toggle('open');
    }
    var c = e.target.closest('[data-copy]');
    if (c) {
      var src = document.getElementById(c.getAttribute('data-copy'));
      if (src && navigator.clipboard) {
        navigator.clipboard.writeText(src.textContent.trim()).then(function () {
          var old = c.textContent; c.textContent = 'COPIED';
          setTimeout(function () { c.textContent = old; }, 1400);
        });
      }
    }
  });

  /* scroll reveals */
  var els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && els.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    els.forEach(function (el) { io.observe(el); });
    /* safety net: never leave content permanently hidden */
    var revealAll = function () { els.forEach(function (el) { el.classList.add('in'); }); };
    setTimeout(revealAll, 2500);
    window.addEventListener('resize', revealAll, { once: true });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  /* keyboard nav: 1-6 */
  var routes = ['', 'work.html', 'research.html', 'publications.html', 'blog.html', 'cv.html'];
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
    var i = ['1', '2', '3', '4', '5', '6'].indexOf(e.key);
    if (i > -1) {
      var base = document.body.dataset.base || '';
      window.location.href = base + (i === 0 ? 'index.html' : routes[i]);
    }
    if (e.key === 'l' || e.key === 'L') { var lb = document.getElementById('lang-btn'); if (lb) lb.click(); }
    if (e.key === 't' || e.key === 'T') { var tb = document.getElementById('theme-btn'); if (tb) tb.click(); }
  });

  paint();
})();
