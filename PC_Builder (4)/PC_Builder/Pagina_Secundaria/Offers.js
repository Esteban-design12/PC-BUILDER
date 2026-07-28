// Carrusel vanilla JS con autoplay, flechas, puntitos y arrastre táctil/mouse
(() => {
  const carousels = document.querySelectorAll('.offers-carousel .carousel');
  carousels.forEach((root) => {
    const track = root.querySelector('.track');
    const slides = Array.from(root.querySelectorAll('.slide'));
    const prevBtn = root.querySelector('.prev');
    const nextBtn = root.querySelector('.next');
    const dotsWrap = root.querySelector('.dots');

    // Estado
    let index = 0;
    let isAutoplay = root.dataset.autoplay === 'true';
    let interval = parseInt(root.dataset.interval || '4000', 10);
    let timer = null;

    // Crear dots
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Ir a oferta ${i + 1}`);
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
    });

    // Helpers
    const updateDots = () => {
      dotsWrap.querySelectorAll('button').forEach((b, i) => {
        b.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    };

    const getGap = () => {
        const s = getComputedStyle(track);
        return parseFloat(s.gap || s.columnGap || 0) || 0;
    };

    const slideWidth = () => root.clientWidth + getGap();
    const clampIndex = (i) => (i + slides.length) % slides.length;

    const goTo = (i) => {
      index = clampIndex(i);
      track.scrollTo({ left: index * slideWidth(), behavior: 'smooth' });
      updateDots();
      restartAutoplay();
    };

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    // Botones
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    // Autoplay
    const startAutoplay = () => {
      if (!isAutoplay) return;
      stopAutoplay();
      timer = setInterval(next, interval);
    };
    const stopAutoplay = () => timer && clearInterval(timer);
    const restartAutoplay = () => { if (isAutoplay) { stopAutoplay(); startAutoplay(); } };

    // Pausar al pasar el mouse o tocar
    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', startAutoplay);
    root.addEventListener('touchstart', stopAutoplay, { passive: true });
    root.addEventListener('touchend', startAutoplay);

    // Arrastre táctil / mouse
    let startX = 0, scrollStart = 0, dragging = false;
    const onDown = (e) => {
      dragging = true;
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      scrollStart = track.scrollLeft;
      track.style.scrollBehavior = 'auto';
    };
    const onMove = (e) => {
      if (!dragging) return;
      const x = (e.touches ? e.touches[0].clientX : e.clientX);
      const dx = x - startX;
      track.scrollLeft = scrollStart - dx;
    };
    const onUp = () => {
        if (!dragging) return;
        dragging = false;
  // índice según el ancho de salto (considerando gap)
        index = Math.round(track.scrollLeft / slideWidth());
        goTo(index);                 // re-alinea exacto
        track.style.scrollBehavior = 'smooth';
    };
    track.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    track.addEventListener('touchstart', onDown, { passive: true });
    track.addEventListener('touchmove', onMove, { passive: true });
    track.addEventListener('touchend', onUp);

    // Resize: recalcular posición
    window.addEventListener('resize', () => goTo(index));

    // Init
    updateDots();
    goTo(0);
    startAutoplay();
  });
})();