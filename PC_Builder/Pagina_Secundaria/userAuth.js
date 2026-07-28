/* userAuth.js  —  estado de usuario global (frontend) */
(function () {
  const KEYS = {
    logged: 'user:logged',
    name: 'user:name',
    email: 'user:email',
    avatar: 'user:avatarDataUrl' // opcional, si algún día permites subir foto
  };

  const $ = (sel, root = document) => root.querySelector(sel);

  function getUser() {
    const logged = localStorage.getItem(KEYS.logged) === 'true';
    if (!logged) return { logged: false };
    return {
      logged: true,
      name: localStorage.getItem(KEYS.name) || 'Usuario',
      email: localStorage.getItem(KEYS.email) || '',
      avatar: localStorage.getItem(KEYS.avatar) || ''
    };
  }

  function setUser({ name, email, avatar } = {}) {
    if (name != null) localStorage.setItem(KEYS.name, name);
    if (email != null) localStorage.setItem(KEYS.email, email);
    if (avatar != null) localStorage.setItem(KEYS.avatar, avatar);
    localStorage.setItem(KEYS.logged, 'true');
    renderHeader();
  }

  function logout() {
  // Borra todo lo relacionado con usuario y direcciones
  const keysToRemove = [
    'user:logged', 'user:name', 'user:username', 'user:email', 'user:phone',
    'user:avatarDataUrl',
    'addr:name', 'addr:phone', 'addr:line', 'addr:city', 'addr:state', 'addr:zip'
  ];

  keysToRemove.forEach(k => localStorage.removeItem(k));

  // Si quieres limpiar TODO el almacenamiento, puedes usar:
  // localStorage.clear();

  renderHeader();
  location.reload(); // refresca para que el header y formularios se vacíen
}


  function renderHeader() {
    const area = $('#user-area'); // <div class="header-btns" id="user-area">...</div>
    if (!area) return; // por si estás en una página sin header

    const u = getUser();
    if (u.logged) {
      const initials = (u.name || 'U')
        .split(' ')
        .map(s => s[0]?.toUpperCase() || '')
        .slice(0, 2)
        .join('');

      const avatarImg = u.avatar
        ? `<img src="${u.avatar}" alt="User" class="user-icon">`
        : `<div class="user-initials user-icon">${initials}</div>`;

      area.innerHTML = `
        <div class="user-profile">
          ${avatarImg}
          <span class="user-name">${u.name}</span>
          <button id="logout" class="logout-btn">Logout</button>
        </div>
      `;

      const logoutBtn = $('#logout');
      logoutBtn?.addEventListener('click', () => {
        logout();
        // Si prefieres refrescar la página:
        location.reload();
      });
    } else {
      // Asegura que existan estos ids en tu HTML
      area.innerHTML = `
        <a href="Login.html" id="login-btn" class="btn-black">Login</a>
        <a href="Register.html" id="register-btn" class="btn-white">Register</a>
      `;
    }
  }

  // 1) Render al cargar
  document.addEventListener('DOMContentLoaded', renderHeader);

  // 2) Sincroniza entre pestañas: si cambia localStorage en otra pestaña, re-render aquí
  window.addEventListener('storage', (e) => {
    if (!e.key || e.key.startsWith('user:')) {
      renderHeader();
    }
  });

  // 3) Expón utilidades globales si las necesitas desde otras páginas
  window.UserAuth = { getUser, setUser, logout };
})();
