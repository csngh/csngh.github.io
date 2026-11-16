(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  $('#yr').textContent = new Date().getFullYear();

  // load choreography
  const start = () => {
    const go = () => document.body.classList.add('loaded');
    if (document.documentElement.classList.contains('intro-run')) addEventListener('introdone', go, { once: true });
    else go();
  };
  document.readyState === 'complete' ? start() : addEventListener('load', start);
  setTimeout(start, 1800);

  // nav state and scroll progress
  const nav = $('#nav'), bar = $('.progress');
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('stuck', y > 30);
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    const tl = $('#timeline'), fill = $('#fill');
    if (tl && fill) {
      const r = tl.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      fill.style.height = p * 100 + '%';
      const ck = $('#clock');
      if (ck) {
        ck.style.top = 17 + p * Math.max(0, r.height - 17) + 'px';
        ck.classList.toggle('on', p > 0.004 && p < 0.985);
        $('#mh').style.transform = `rotate(${-p * 4320}deg)`;
        $('#hh').style.transform = `rotate(${-p * 360}deg)`;
      }
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mobile menu
  const burger = $('#burger'), links = $('#links');
  const setMenu = open => { links.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); };
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  $$('#links a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.matches('.stat')) countUp($('b', e.target));
    io.unobserve(e.target);
  }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(el => { if (!el.closest('.hero')) io.observe(el); });

  // shipment flow: replays each time it scrolls into view, a plane rides the fill
  const fw = $('#flowWrap');
  if (fw) {
    const lis = $$('.flow li', fw);
    let raf = 0, run = 0;
    const set = p => {
      fw.style.setProperty('--p', p);
      const W = $('.flow', fw).offsetWidth;
      lis.forEach(li => li.classList.toggle('lit', p * W >= li.offsetLeft - 1));
    };
    const play = () => {
      cancelAnimationFrame(raf);
      const id = ++run;
      fw.style.setProperty('--po', 1);
      fw.classList.remove('done');
      if (reduce) { set(1); fw.classList.add('done'); return; }
      const t0 = performance.now(), dur = 4400;
      const tick = t => {
        if (id !== run) return;
        const k = Math.min(1, (t - t0) / dur);
        set(1 - Math.pow(1 - k, 1.6));
        if (k < 1) raf = requestAnimationFrame(tick);
        else { fw.style.setProperty('--po', 0); fw.classList.add('done'); }
      };
      set(0);
      raf = requestAnimationFrame(tick);
    };
    const reset = () => { run++; fw.classList.remove('done'); cancelAnimationFrame(raf); fw.style.setProperty('--po', 0); set(0); };
    new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? play() : reset()), { threshold: 0.6 }).observe(fw);
  }

  // counters
  function countUp(el) {
    const to = +el.dataset.count;
    el.parentElement.classList.add('on');
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = t => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // skill icons: brand logos from simple-icons and devicon, line icons for the rest
  (() => {
    const si = s => `https://cdn.simpleicons.org/${s}`;
    const dv = s => `https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${s}.svg`;
    const brand = {
      'Python': si('python'), 'Embedded Python': si('python'), 'Kotlin': si('kotlin'), 'JavaScript': si('javascript'),
      'TypeScript': si('typescript'), 'Node.js': si('nodedotjs'), 'MongoDB': si('mongodb'), 'PyTorch': si('pytorch'),
      'TensorFlow': si('tensorflow'), 'scikit-learn': si('scikitlearn'), 'Java': dv('java/java-original'),
      'C++': si('cplusplus'), 'PHP': si('php'), 'R': si('r'), 'Android': si('android'),
      'AWS': dv('amazonwebservices/amazonwebservices-plain-wordmark'), 'Elasticsearch': si('elasticsearch'),
      'MySQL': si('mysql'), 'Git': si('git'), 'GitLab': si('gitlab'), 'Jenkins': si('jenkins'), 'Linux': si('linux'),
      'Jupyter': si('jupyter'), 'Pandas': si('pandas'), 'NumPy': si('numpy'), 'SQLite': si('sqlite'),
      'Next.js': si('nextdotjs'), 'spaCy': si('spacy'), 'Raspberry Pi': si('raspberrypi'), 'Transformers': si('huggingface'),
      'MERN': si('react'), 'macOS': si('apple')
    };
    const cpu = '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>';
    const text = '<path d="M5 6h14M12 6v13M9 19h6"/>';
    const line = {
      'NLP': '<path d="M4 6h16M4 12h10M4 18h13"/>', 'NLTK': '<path d="M4 6h16M4 12h10M4 18h13"/>', 'Text generation': text,
      'REST APIs': '<path d="M9 7 4 12l5 5M15 7l5 5-5 5"/>',
      'API integrations': '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
      'Microservices': '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
      'Product strategy': '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
      'Explainability': '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
      'GPT-2': cpu, 'BERT': cpu, 'LSTM': cpu, 'Particle Photon': cpu,
      'Fine-tuning': '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
      'Random Forests': '<path d="M12 21V11M12 11 7 6M12 11l5-5M12 16l-4-3M12 16l4-3"/>',
      'Neural nets': '<circle cx="5" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6l3.5 5M7 18l3.5-5M13.5 11 17 7M13.5 13l3.5 4"/>',
      'Imblearn': '<path d="M12 4v16M7 20h10M5 8h14M5 8l-2 6a3 3 0 0 0 4 0zM19 8l-2 6a3 3 0 0 0 4 0z"/>',
      'Touch ID': '<path d="M12 11v3a6 6 0 0 1-1.5 4M8.5 13v-1a3.5 3.5 0 0 1 7 0v2.5M6 15.5V12a6 6 0 0 1 12 0v1M15.5 17.5c-.3 1-.7 2-1.3 2.8M9 5.7A6 6 0 0 1 12 5"/>',
      'Encryption': '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
      'iPhone': '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
      'Voice AI': '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
      'Android TV': '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8"/>'
    };
    const make = name => {
      if (brand[name]) {
        const img = new Image();
        img.className = 'ic';
        img.alt = '';
        img.loading = 'lazy';
        img.src = brand[name];
        img.addEventListener('error', () => { img.hidden = true; });
        return img;
      }
      if (line[name]) {
        const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        s.setAttribute('viewBox', '0 0 24 24');
        s.setAttribute('class', 'ic ic-line');
        s.setAttribute('aria-hidden', 'true');
        s.innerHTML = line[name];
        return s;
      }
      return null;
    };
    $$('.chips span').forEach(el => {
      const ic = make(el.textContent.trim());
      if (ic) el.prepend(ic);
    });
    $$('.track span').forEach(el => {
      const name = el.textContent.trim(), ic = make(name);
      if (!ic) return;
      const w = document.createElement('i');
      w.className = 'tk';
      w.append(ic, name);
      el.textContent = '';
      el.append(w);
    });
  })();

  // active section link
  const secs = ['about', 'now', 'journey', 'work', 'personal', 'craft'].map(id => $('#' + id));
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) $$('.links a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => s && so.observe(s));

  // background pops: icons for the work, planes for logistics
  if (!reduce) {
    const host = $('#pops');
    const I = {
      iot: ['IoT', '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4"/>'],
      ai: ['AI', '<path d="M11 3l1.8 4.7 4.7 1.8-4.7 1.8L11 16l-1.8-4.7L4.5 9.5l4.7-1.8z"/><path d="M18 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>'],
      data: ['Data Science', '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>'],
      node: ['Node', '<path d="M12 2.5l8 4.6v9.8l-8 4.6-8-4.6V7.1z"/><path d="M9.5 15.5v-7l5 7v-7"/>'],
      python: ['Python', '<path d="M12 3c-3.3 0-4 1.4-4 3v2.5h4.2v1H6.5c-1.7 0-3 1.5-3 4s1.2 4 3 4H8v-2.2c0-1.5 1.3-2.8 2.8-2.8h4c1.2 0 2.2-1 2.2-2.2V6c0-1.6-1.6-3-5-3z"/><path d="M12 21c3.3 0 4-1.4 4-3v-2.5h-4.2v-1h5.7c1.7 0 3-1.5 3-4s-1.2-4-3-4H16v2.2"/><circle cx="9.7" cy="6" r=".6"/><circle cx="14.3" cy="18" r=".6"/>'],
      logistics: ['Logistics', '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>'],
      linkedin: ['LinkedIn Automation', '<rect x="2.5" y="2.5" width="12.5" height="12.5" rx="2.4"/><path d="M6.2 8.8v4M8.9 12.8V8.8M8.9 10.4c0-.9.7-1.6 1.7-1.6s1.7.7 1.7 1.7v2.3"/><circle cx="6.2" cy="6.3" r=".4"/><circle cx="17.8" cy="17.8" r="2.4"/><circle cx="17.8" cy="17.8" r=".8"/><path d="M17.8 13.6v1.1M17.8 20.9v1.1M13.6 17.8h1.1M20.9 17.8h1.1M14.8 14.8l.8.8M20 20l.8.8M20.8 14.8l-.8.8M15.6 20l-.8.8"/>'],
      research: ['Research', '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M7.8 12.5l2-2 1.6 1.6 2.3-3"/>']
    };
    const BLOCK = '.pop,h1,h2,h3,h4,p,li,time,.btn,.eyebrow,.card,.panel,.feature,.stats,.skill,.hero-art,.chip,.ticker,.links-row,.mail,.socials,.foot,.nav';
    const keys = Object.keys(I);
    const small = innerWidth < 760;
    const maxLive = small ? 4 : 8;
    let bag = [], last = '';
    const live = new Set();
    const next = () => {
      if (!bag.length) bag = keys.slice().sort(() => Math.random() - 0.5);
      for (let n = 0; n < bag.length; n++) {
        const k = bag[bag.length - 1 - n];
        if (!live.has(k) && k !== last) { bag.splice(bag.length - 1 - n, 1); return (last = k); }
      }
      return null;
    };
    const rnd = (a, b) => a + Math.random() * (b - a);
    const spawn = () => {
      if (document.hidden || host.querySelectorAll('.pop').length >= maxLive) return;
      const k = next();
      if (!k) return;
      const el = document.createElement('div');
      el.className = 'pop';
      const sz = Math.round(rnd(small ? 42 : 48, small ? 54 : 70));
      const bw = sz + 40, bh = sz + 24;
      const blockers = $$(BLOCK).map(n => n.getBoundingClientRect()).filter(r => r.bottom > 0 && r.top < innerHeight && r.width && r.height);
      let spot = null;
      for (let n = 0; n < 16 && !spot; n++) {
        const x = rnd(8, innerWidth - bw - 8), y = rnd(70, innerHeight - bh - 8);
        const hit = blockers.some(r => x < r.right + 10 && x + bw > r.left - 10 && y < r.bottom + 10 && y + bh > r.top - 10);
        if (!hit) spot = [x, y];
      }
      if (!spot) { bag.push(k); return; }
      live.add(k);
      el.style.cssText = `left:${spot[0].toFixed(0)}px;top:${spot[1].toFixed(0)}px;--sz:${sz}px;--life:${rnd(6, 9).toFixed(1)}s`;
      el.innerHTML = `<i><svg viewBox="0 0 24 24">${I[k][1]}</svg></i><b>${I[k][0]}</b>`;
      el.addEventListener('animationend', () => { live.delete(k); el.remove(); });
      host.appendChild(el);
    };
    const plane = () => {
      if (document.hidden) return;
      const el = document.createElement('div');
      el.className = 'plane';
      const w = innerWidth, h = innerHeight;
      const y0 = rnd(h * 0.14, h * 0.7), dy = rnd(-h * 0.22, h * 0.22);
      const x0 = w + 30, x1 = -440;
      const ang = -Math.atan2(dy, x0 - x1) * 180 / Math.PI;
      el.style.cssText = `--x0:${x0}px;--x1:${x1}px;--y0:${y0}px;--y1:${y0 + dy}px;--rot:${ang}deg;--life:${rnd(13, 17).toFixed(1)}s`;
      el.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 12h16M10 12L6 5h2.5l6 7-6 7H6zM4 12L2.5 9H5l1.8 3-1.8 3H2.5z"/></svg><span class="rope"></span><span class="banner">International Logistics</span>';
      el.addEventListener('animationend', () => el.remove());
      host.appendChild(el);
    };
    setTimeout(() => { spawn(); setInterval(spawn, small ? 1900 : 1200); }, 900);
    setTimeout(() => { plane(); setInterval(plane, 11000); }, 3500);
  }

  if (reduce || !fine) return;

  // portrait tilt
  const art = $('#art');
  const hero = $('.hero');
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    art.style.transform = `perspective(1000px) rotateY(${x * 7}deg) rotateX(${-y * 5}deg) translate3d(${x * 10}px,${y * 8}px,0)`;
  });
  hero.addEventListener('pointerleave', () => { art.style.transform = ''; });

  // magnetic buttons
  $$('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  // card spotlight
  $$('.card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--cx', e.clientX - r.left + 'px');
    c.style.setProperty('--cy', e.clientY - r.top + 'px');
  }));
})();
