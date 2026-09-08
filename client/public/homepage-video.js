/* Local silent intro; respect reduced motion and data saving on every screen. */
(() => {
  'use strict';
  const video = document.getElementById('homepage-video');
  const toggle = document.getElementById('homepage-video-toggle');
  const status = document.getElementById('homepage-video-status');
  if (!video || !toggle || !status) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let userActed = false;
  let visible = true;
  let pending = false;
  let generation = 0;
  video.muted = true;
  video.defaultMuted = true;
  toggle.hidden = false;
  function label() {
    toggle.textContent = pending ? 'Cancel video' : !video.paused ? 'Pause video' : video.ended ? 'Replay video' : 'Play video';
  }
  function stop() {
    generation++;
    pending = false;
    video.pause();
    label();
  }
  async function play() {
    const attempt = ++generation;
    pending = true;
    status.hidden = true;
    label();
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    if (video.ended) video.currentTime = 0;
    try {
      await video.play();
    } catch (error) {
      if (attempt === generation && userActed && error.name !== 'AbortError') {
        status.textContent = 'Video unavailable. The MineTrans image and all website services remain available.';
        status.hidden = false;
      }
    } finally {
      if (attempt === generation) { pending = false; label(); }
    }
  }
  toggle.addEventListener('click', () => {
    userActed = true;
    if (pending || !video.paused) stop(); else play();
  });
  video.addEventListener('playing', () => { video.classList.add('has-frame'); pending = false; label(); });
  ['pause', 'ended'].forEach(event => video.addEventListener(event, label));
  video.addEventListener('error', () => { stop(); video.classList.remove('has-frame'); });
  function constrained() {
    return reduced.matches || (connection && (connection.saveData || /(^|-)2g$|^3g$/.test(connection.effectiveType)));
  }
  function policyChanged() { if (constrained()) stop(); }
  reduced.addEventListener('change', policyChanged);
  if (connection && connection.addEventListener) connection.addEventListener('change', policyChanged);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible) stop();
    }).observe(video);
  }
  // Loop silently after page loading and a paint opportunity; never delay navigation.
  function schedule() {
    window.setTimeout(() => {
      if (!userActed && !constrained() && !document.hidden && visible) play();
    }, 300);
  }
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
})();
