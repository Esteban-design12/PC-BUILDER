/* ===========================
   0) Utilidades comunes
=========================== */
const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const store = {
  get: (k, def=null) => JSON.parse(localStorage.getItem(k) || JSON.stringify(def)),
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  del: (k) => localStorage.removeItem(k)
};

/* ===========================
   1) Validación avanzada + medidor de password
   - Usa data-attrs en tus forms (login/register)
=========================== */
// HTML ejemplo:
// <input id="reg-pass" type="password" data-strength="#meter" required />
// <div id="meter" aria-live="polite"></div>
(function passwordStrength(){
  const pass = $('[data-strength]');
  if (!pass) return;
  const meter = $(pass.dataset.strength);
  const tests = [
    v => v.length >= 8,
    v => /[A-Z]/.test(v),
    v => /[a-z]/.test(v),
    v => /\d/.test(v),
    v => /[^A-Za-z0-9]/.test(v)
  ];
  pass.addEventListener('input', () => {
    const v = pass.value;
    const score = tests.reduce((a,t)=>a+(t(v)?1:0),0);
    const labels = ['Muy débil','Débil','Media','Buena','Fuerte','Excelente'];
    meter.textContent = `Seguridad: ${labels[score]}`;
    meter.style.color = ['#ff5b5b','#ff7a5b','#f0b035','#9ad13b','#2bd137','#00d137'][score];
  });
})();

/* ===========================
   2) “Recordar al usuario” entre páginas
   - Guarda nombre en register y muéstralo en la Home
=========================== */
// En register.html: <input id="reg-name" />
(function welcomeUser(){
  const regName = $('#reg-name');
  if (regName) {
    const form = regName.closest('form');
    form?.addEventListener('submit', () => {
      store.set('user:name', regName.value.trim());
      store.set('user:logged', true);
    });
  }
  // En la página principal, muestra un saludo (si existe contenedor)
  const welcome = $('#welcome-user'); // <div id="welcome-user"></div>
  if (welcome) {
    const logged = store.get('user:logged', false);
    const name = store.get('user:name', null);
    welcome.textContent = logged && name ? `👋 Bienvenido, ${name}!` : '';
  }
})();

/* ===========================
   3) Favoritos / Wishlist persistente
   - Botones: <button class="fav-btn" data-id="SKU123">❤</button>
   - Añade clase .is-fav si está guardado
=========================== */
(function wishlist(){
  const KEY = 'wishlist';
  const favs = store.get(KEY, []);
  $$('.fav-btn').forEach(btn => {
    const id = btn.dataset.id;
    if (!id) return;
    if (favs.includes(id)) btn.classList.add('is-fav');
    btn.addEventListener('click', () => {
      let list = store.get(KEY, []);
      if (list.includes(id)) {
        list = list.filter(x => x !== id);
        btn.classList.remove('is-fav');
      } else {
        list.push(id);
        btn.classList.add('is-fav');
      }
      store.set(KEY, list);
      // contador (opcional): <span id="fav-count"></span>
      const badge = $('#fav-count');
      if (badge) badge.textContent = list.length;
    });
  });
})();

/* ===========================
   4) Comparador (selecciona hasta 2 y genera link a Versus)
   - Botones: <button class="cmp-btn" data-id="gpu:4090" data-name="RTX 4090">Comparar</button>
   - En la sección Versus lee ?a=...&b=...
=========================== */
(function comparer(){
  const KEY = 'compare';
  const pick = (id, name) => {
    let cur = store.get(KEY, []);
    if (cur.find(x=>x.id===id)) { cur = cur.filter(x=>x.id!==id); }
    else {
      if (cur.length >= 2) cur.shift(); // solo 2
      cur.push({id, name});
    }
    store.set(KEY, cur);
    renderBadge(cur);
  };
  const renderBadge = (cur) => {
    const badge = $('#cmp-count'); // <span id="cmp-count"></span>
    if (badge) badge.textContent = (cur?.length||0);
    const go = $('#cmp-go'); // <a id="cmp-go" class="btn" href="Versus.html">Comparar</a>
    if (go && cur?.length===2) {
      const params = new URLSearchParams({ a: cur[0].id, b: cur[1].id });
      go.href = `Versus.html?${params.toString()}`;
      go.removeAttribute('aria-disabled');
    } else if (go) {
      go.setAttribute('aria-disabled','true');
    }
  };
  $$('.cmp-btn').forEach(b=>{
    b.addEventListener('click',()=>pick(b.dataset.id, b.dataset.name));
  });
  renderBadge(store.get(KEY, []));
})();

/* ===========================
   5) Filtros persistentes via URL (Explore)
   - Lee/Escribe search, brand, sort, price en URL
   - HTML: name="q" | name="brand" | name="sort" | <input type="range" name="price">
=========================== */
(function exploreFilters(){
  const form = $('.explore-filters');
  if (!form) return;
  const params = new URLSearchParams(location.search);
  // Inicializa campos desde URL
  $$('input[name], select[name]', form).forEach(el=>{
    const k = el.name;
    if (params.has(k)) el.value = params.get(k);
  });
  // Al enviar, escribe a URL (sin recargar si quieres)
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const next = new URLSearchParams();
    $$('input[name], select[name]', form).forEach(el=> next.set(el.name, el.value));
    history.replaceState({}, '', `${location.pathname}?${next.toString()}`);
    // aquí podrías filtrar el grid cliente si tuvieras dataset de productos
  });
})();

/* ===========================
   6) Lazy-loading + Intersección + skeleton
   - <img class="lazy" data-src="..." />
   - Aplica clase .loaded al cargar
=========================== */
(function lazyImages(){
  const imgs = $$('.lazy');
  if (!imgs.length) return;
  const io = new IntersectionObserver((entries, obs)=>{
    entries.forEach(e=>{
      if (e.isIntersecting) {
        const img = e.target;
        img.src = img.dataset.src;
        img.onload = ()=> img.classList.add('loaded');
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '200px 0px' });
  imgs.forEach(i=> io.observe(i));
})();

/* ===========================
   7) Modal accesible + focus trap
   - Estructura:
     <div id="modal" class="modal" aria-hidden="true" role="dialog" aria-modal="true">
       <div class="modal__panel" role="document">
         <button data-close>×</button>
         ...contenido...
       </div>
     </div>
     <button data-open="#modal">Abrir</button>
=========================== */
(function modal(){
  const opens = $$('[data-open]');
  const body  = document.body;
  const focusable = sel => $$('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])', sel)
                           .filter(el => !el.disabled && el.offsetParent !== null);
  let lastFocus = null;

  opens.forEach(btn=>{
    const targetSel = btn.getAttribute('data-open');
    const modal = $(targetSel);
    if (!modal) return;

    const closeBtn = $('[data-close]', modal);
    const panel = $('.modal__panel', modal);

    const open = () => {
      lastFocus = document.activeElement;
      modal.setAttribute('aria-hidden','false');
      body.style.overflow = 'hidden';
      const f = focusable(panel)[0];
      f?.focus();
      document.addEventListener('keydown', trap);
    };
    const close = () => {
      modal.setAttribute('aria-hidden','true');
      body.style.overflow = '';
      lastFocus?.focus();
      document.removeEventListener('keydown', trap);
    };
    const trap = (e) => {
      if (e.key === 'Escape') return close();
      if (e.key !== 'Tab') return;
      const list = focusable(panel);
      if (!list.length) return;
      const first = list[0], last = list[list.length-1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    btn.addEventListener('click', open);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    closeBtn?.addEventListener('click', close);
  });
})();

/* ===========================
   8) Búsqueda con debounce + ordenamiento local
   - HTML:
     <input id="q" placeholder="Buscar...">
     <select id="sort"><option value="name">Nombre</option>...</select>
     <div id="grid"><article class="card" data-name="... " data-price="123"></article>...</div>
=========================== */
(function searchAndSort(){
  const q = $('#q'), sort = $('#sort'), grid = $('#grid');
  if (!q || !grid) return;
  const items = $$('.card', grid);

  const render = () => {
    const term = q.value.trim().toLowerCase();
    const mode = sort?.value || 'name';
    const visible = items.filter(it => {
      const name = (it.dataset.name||'').toLowerCase();
      return name.includes(term);
    });
    // ordenar
    visible.sort((a,b)=>{
      if (mode === 'price') return (+a.dataset.price||0) - (+b.dataset.price||0);
      return (a.dataset.name||'').localeCompare(b.dataset.name||'');
    });
    // pintar
    grid.innerHTML = '';
    visible.forEach(it => grid.appendChild(it));
  };
  const debounce = (fn, t=200) => {
    let id; return (...args)=>{ clearTimeout(id); id = setTimeout(()=>fn(...args), t); };
  };
  q.addEventListener('input', debounce(render, 180));
  sort?.addEventListener('change', render);
  render();
})();