// Motion layer: intro, hero particle field, split text, scroll-linked parallax,
// velocity ticker, 3D card tilt, custom cursor. Skipped entirely for reduced-motion users.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  root.classList.add('motion');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fine = matchMedia('(pointer: fine)').matches;
  const small = innerWidth < 760;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#%&';

  const scramble = (el, final, dur = 500, set = glyphs) => {
    const t0 = performance.now();
    const step = t => {
      const k = Math.min(1, (t - t0) / dur), n = Math.floor(k * final.length);
      el.textContent = final.slice(0, n) + [...final.slice(n)].map(c => c === ' ' ? ' ' : set[Math.random() * set.length | 0]).join('');
      if (k < 1) requestAnimationFrame(step); else el.textContent = final;
    };
    requestAnimationFrame(step);
  };

  // intro: the name decodes, then shutters lift and the hero plays
  if (root.classList.contains('intro-run')) {
    try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
    const ov = document.createElement('div');
    ov.className = 'intro-ov';
    ov.setAttribute('aria-hidden', 'true');
    ov.innerHTML = '<div class="intro-sh">' + '<i></i>'.repeat(6) + '</div><div class="intro-glow"><i></i><i></i><i></i></div><div class="intro-c"><span class="intro-name"></span></div>';
    $$('.intro-sh i', ov).forEach((i, n) => i.style.setProperty('--i', n));
    document.body.append(ov);
    const label = $('.intro-name', ov), full = 'Chetan Singh';
    label.textContent = full.replace(/\S/g, () => glyphs[Math.random() * glyphs.length | 0]);
    setTimeout(() => scramble(label, full, 1100), 150);
    setTimeout(() => {
      ov.classList.add('out');
      root.classList.remove('intro-run');
      dispatchEvent(new Event('introdone'));
      setTimeout(() => ov.remove(), 1400);
    }, 1700);
  }

  // hero particle field
  const hero = $('.hero');
  if (hero) {
    const cv = document.createElement('canvas');
    cv.className = 'hero-cv';
    cv.setAttribute('aria-hidden', 'true');
    hero.prepend(cv);
    const ctx = cv.getContext('2d');
    const N = small ? 40 : 95, LINK = small ? 110 : 140;
    let W = 0, H = 0, pts = [], mx = -1e4, my = -1e4, visible = true, running = false;
    const size = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      W = hero.offsetWidth; H = hero.offsetHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const seed = () => {
      pts = Array.from({ length: N }, () => {
        const vx = (Math.random() - 0.5) * 0.4, vy = (Math.random() - 0.5) * 0.4;
        return { x: Math.random() * W, y: Math.random() * H, vx, vy, bx: vx, by: vy, r: Math.random() * 1.7 + 0.7 };
      });
    };
    size(); seed();
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { size(); seed(); }, 150); });
    hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { mx = my = -1e4; });
    const draw = () => {
      if (!visible) { running = false; return; }
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 22000) { const f = (1 - d2 / 22000) * 0.9, d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx += (p.bx - p.vx) * 0.04; p.vy += (p.by - p.vy) * 0.04;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 > LINK * LINK) continue;
          ctx.strokeStyle = `rgba(45,74,138,${(1 - Math.sqrt(d2) / LINK) * 0.32})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        const dx = a.x - mx, dy = a.y - my, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 200) {
          ctx.strokeStyle = `rgba(80,120,230,${(1 - d / 200) * 0.6})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke();
        }
        ctx.fillStyle = d < 200 ? 'rgba(63,99,184,.9)' : 'rgba(29,47,92,.5)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !running) { running = true; requestAnimationFrame(draw); }
    }).observe(hero);
  }

  // hero name: per-letter 3D entrance, the letters scramble on hover
  const name = $('.name');
  if (name) {
    let n = 0;
    $$('.line>span', name).forEach(sp => {
      const host = sp.querySelector('em') || sp, txt = host.textContent;
      host.textContent = '';
      [...txt].forEach(c => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = s.dataset.c = c;
        s.style.setProperty('--i', n++);
        host.append(s);
      });
    });
    name.classList.add('split');
    const settle = () => setTimeout(() => name.classList.add('settled'), 1900);
    document.body.classList.contains('loaded') ? settle() : new MutationObserver((m, o) => {
      if (document.body.classList.contains('loaded')) { o.disconnect(); settle(); }
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    // letters scramble with glyphs of their own case, so the name keeps its shape
    const chars = $$('.ch', name), upper = 'ABCDEFGHKMNPRSTUXZ', lower = 'abcdeghknopqrsuvxz';
    let busy = false;
    name.addEventListener('pointerenter', () => {
      if (busy || !name.classList.contains('settled')) return;
      busy = true;
      const t0 = performance.now(), dur = 650;
      const step = t => {
        const k = Math.min(1, (t - t0) / dur), done = Math.floor(k * chars.length);
        chars.forEach((c, i) => {
          const set = c.dataset.c === c.dataset.c.toUpperCase() ? upper : lower;
          c.textContent = i < done ? c.dataset.c : set[Math.random() * set.length | 0];
        });
        if (k < 1) return requestAnimationFrame(step);
        busy = false;
      };
      requestAnimationFrame(step);
    });
  }

  // section headings: words rise from a mask, the index scrambles in
  $$('.sec-head h2, .contact h2').forEach(h => {
    const words = h.textContent.trim().split(/\s+/);
    h.textContent = '';
    words.forEach((w, i) => {
      const o = document.createElement('span'), s = document.createElement('span');
      o.className = 'w';
      s.textContent = w;
      s.style.setProperty('--i', i);
      o.append(s);
      h.append(o, i < words.length - 1 ? ' ' : '');
    });
    h.classList.add('split-h');
  });
  const idxIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const idx = $('.idx', e.target);
    if (idx) scramble(idx, idx.textContent, 700, '0123456789');
    idxIO.unobserve(e.target);
  }), { threshold: 0.4 });
  $$('.sec-head').forEach(s => idxIO.observe(s));

  // giant outlined words drifting behind each section
  const ghosts = $$('.sec').map(sec => {
    const h = $('.sec-head h2', sec);
    if (!h) return null;
    const g = document.createElement('div');
    g.className = 'ghost';
    g.setAttribute('aria-hidden', 'true');
    g.textContent = h.textContent.replace(/\s+/g, ' ').trim();
    sec.prepend(g);
    return { sec, g };
  }).filter(Boolean);

  // cards that rise in 3D and tilt
  $$('.card, .skill, .panel').forEach(c => c.classList.add('tiltable'));

  // staggered children
  $$('.chips').forEach(c => $$('span', c).forEach((s, i) => s.style.setProperty('--i', i)));
  $$('.t-body li').forEach(li => li.style.setProperty('--i', [...li.parentNode.children].indexOf(li)));

  // ticker reacts to scroll speed and direction
  const track = $('.track');
  let tickAnim = null, skewer = null;
  if (track) {
    skewer = document.createElement('div');
    skewer.className = 'skewer';
    track.parentNode.insertBefore(skewer, track);
    skewer.append(track);
    tickAnim = track.getAnimations ? track.getAnimations()[0] : null;
  }

  // contact: drifting light and an outlined marquee
  const contact = $('.contact');
  if (contact) {
    const bl = document.createElement('div');
    bl.className = 'c-blobs';
    bl.setAttribute('aria-hidden', 'true');
    bl.innerHTML = '<i></i><i></i><i></i>';
    const mq = document.createElement('div');
    mq.className = 'c-marq';
    mq.setAttribute('aria-hidden', 'true');
    const phrase = 'Let’s build something · ';
    mq.innerHTML = `<span>${phrase.repeat(4)}</span><span>${phrase.repeat(4)}</span>`;
    contact.prepend(bl, mq);
  }

  // one scroll loop: hero parallax, ghost drift, ticker velocity
  let lastY = scrollY, vel = 0, dir = 1;
  const frame = () => {
    const y = scrollY;
    vel += (y - lastY - vel) * 0.18;
    lastY = y;
    if (hero) root.style.setProperty('--hp', clamp(y / (hero.offsetHeight || 1), 0, 1).toFixed(4));
    for (const { sec, g } of ghosts) {
      const r = sec.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) continue;
      const p = (innerHeight - r.top) / (innerHeight + r.height);
      g.style.transform = `translate3d(${((0.2 - p * 0.55) * 100).toFixed(2)}vw,0,0)`;
    }
    if (tickAnim) {
      if (Math.abs(vel) > 0.6) dir = vel > 0 ? 1 : -1;
      tickAnim.playbackRate = dir * (1 + Math.min(7, Math.abs(vel) * 0.3));
      skewer.style.transform = `skewX(${clamp(-vel * 0.2, -12, 12).toFixed(2)}deg)`;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // nav links scramble on hover
  $$('.links a:not(.btn)').forEach(a => {
    const f = a.textContent;
    a.addEventListener('pointerenter', () => scramble(a, f, 380));
  });

  if (!fine) return;

  // 3D tilt on cards, craft skills and foundation panels
  $$('.tiltable').forEach(c => {
    c.addEventListener('pointerenter', () => c.classList.add('tilting'));
    c.addEventListener('pointermove', e => {
      if (!c.classList.contains('in')) return;
      const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      c.style.setProperty('--rx', (-py * 9).toFixed(2) + 'deg');
      c.style.setProperty('--ry', (px * 11).toFixed(2) + 'deg');
    });
    c.addEventListener('pointerleave', () => {
      c.classList.remove('tilting');
      c.style.setProperty('--rx', '0deg');
      c.style.setProperty('--ry', '0deg');
    });
  });

  // custom cursor: a dot and a trailing ring that swells over anything clickable
  const dot = document.createElement('div'), ring = document.createElement('div');
  dot.className = 'cur-dot';
  ring.className = 'cur-ring';
  ring.innerHTML = '<i></i>';
  document.body.append(dot, ring);
  root.classList.add('has-cursor', 'cur-off');
  let cx = innerWidth / 2, cy = innerHeight / 2, rx = cx, ry = cy;
  addEventListener('pointermove', e => {
    cx = e.clientX; cy = e.clientY;
    dot.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    root.classList.remove('cur-off');
  }, { passive: true });
  document.addEventListener('pointerleave', () => root.classList.add('cur-off'));
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('a,button,.tiltable,.product,.chips span');
    ring.classList.toggle('hot', !!t);
    ring.classList.toggle('big', !!(t && t.matches('.tiltable,.product')));
  });
  addEventListener('pointerdown', () => ring.classList.add('press'));
  addEventListener('pointerup', () => ring.classList.remove('press'));
  const follow = () => {
    rx += (cx - rx) * 0.2; ry += (cy - ry) * 0.2;
    ring.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
})();
