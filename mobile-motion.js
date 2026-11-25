(() => {
  const settings = window.matchMedia('(max-width: 759px) and (prefers-reduced-motion: no-preference)');
  const hero = document.querySelector('.hero');
  const backdrop = hero.querySelector('.hero-parallax');
  const animatedRegions = [backdrop, hero.querySelector('.mobile-portrait'), document.querySelector('.community-art')];
  const layers = Array.from(backdrop.querySelectorAll('[data-depth]'), element => ({
    element,
    depth: Number(element.dataset.depth)
  }));
  if (!('IntersectionObserver' in window)) return;

  let observer;
  let frame = 0;
  let backdropVisible = false;

  function updateFrame() {
    frame = 0;
    if (!backdropVisible || document.hidden) return;
    const scroll = Math.min(400, Math.max(0, -hero.getBoundingClientRect().top));
    for (const {element, depth} of layers) {
      const offset = Math.max(-25, Math.min(40, scroll * depth));
      element.style.setProperty('--parallax-y', Math.round(offset * 10) / 10 + 'px');
    }
  }

  function requestFrame() {
    if (backdropVisible && !frame && !document.hidden) {
      frame = requestAnimationFrame(updateFrame);
    }
  }

  function onVisibility() {
    document.documentElement.classList.toggle('motion-ready', !document.hidden && settings.matches);
    requestFrame();
  }

  function configureMotion() {
    observer?.disconnect();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    backdropVisible = false;
    window.removeEventListener('scroll', requestFrame);
    window.removeEventListener('resize', requestFrame);
    document.removeEventListener('visibilitychange', onVisibility);
    document.documentElement.classList.remove('motion-ready');
    for (const region of animatedRegions) region.classList.remove('is-in-view');
    for (const {element} of layers) element.style.removeProperty('--parallax-y');
    if (!settings.matches) return;

    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-in-view', entry.isIntersecting);
        if (entry.target === backdrop) backdropVisible = entry.isIntersecting;
      }
      requestFrame();
    }, {threshold: 0});
    for (const region of animatedRegions) observer.observe(region);
    window.addEventListener('scroll', requestFrame, {passive:true});
    window.addEventListener('resize', requestFrame, {passive:true});
    document.addEventListener('visibilitychange', onVisibility);
    onVisibility();
  }

  settings.addEventListener('change', configureMotion);
  configureMotion();
})();
