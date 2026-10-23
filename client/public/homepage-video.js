/* Local silent intro; respect reduced motion and data saving on every screen. */
(() => {
  'use strict';
  const video = document.getElementById('homepage-video');
  const toggle = document.getElementById('homepage-video-toggle');
  const status = document.getElementById('homepage-video-status');
  if (!video || !toggle || !status) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let userPaused = false;
  let userRequestedPlayback = false;
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
    if (pending || !video.paused) return;
    const attempt = ++generation;
    pending = true;
    status.hidden = true;
    label();
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    if (video.ended) video.currentTime = 0;
    try {
      await video.play();
    } catch (error) {
      if (attempt === generation && userRequestedPlayback && error.name !== 'AbortError') {
        status.textContent = 'Video unavailable. The MineTrans image and all website services remain available.';
        status.hidden = false;
      }
    } finally {
      if (attempt === generation) { pending = false; label(); }
    }
  }
  toggle.addEventListener('click', () => {
    if (pending || !video.paused) {
      userPaused = true;
      stop();
    } else {
      userPaused = false;
      userRequestedPlayback = true;
      play();
    }
  });
  video.addEventListener('playing', () => { video.classList.add('has-frame'); pending = false; label(); });
  ['pause', 'ended'].forEach(event => video.addEventListener(event, label));
  video.addEventListener('error', () => { stop(); video.classList.remove('has-frame'); });
  function constrained() {
    return reduced.matches || (connection && (connection.saveData || /(^|-)2g$|^3g$/.test(connection.effectiveType)));
  }
  function reconcile() {
    if (userPaused || document.hidden || !visible || (constrained() && !userRequestedPlayback)) stop();
    else play();
  }
  function policyChanged() {
    if (constrained()) userRequestedPlayback = false;
    reconcile();
  }
  reduced.addEventListener('change', policyChanged);
  if (connection && connection.addEventListener) connection.addEventListener('change', policyChanged);
  document.addEventListener('visibilitychange', reconcile);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      reconcile();
    }).observe(video);
  }
  // This deferred script runs after parsing: do not wait for unrelated images,
  // fonts or analytics to finish loading before attempting the silent intro.
  window.setTimeout(reconcile, 300);
})();
