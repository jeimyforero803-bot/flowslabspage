/* ═══════════════════════════════════════════════════════════════════
   FLOWSLABS — Ultra Premium Experience v4.0
   Lenis Smooth Scroll · GSAP Hero · Scroll Bot
   ═══════════════════════════════════════════════════════════════════ */

// ── Matrix Rain ──────────────────────────────────────────────────────
class MatrixRain {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.chars  = '01アイウエオカキフロウスラブスAI10';
    this.fs     = 13;
    this.cols   = [];
    this._vis   = false;
    this._run   = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    const io = new IntersectionObserver(e => {
      this._vis = e[0].isIntersecting;
      if (this._vis && !this._run) this.tick();
    }, { threshold: 0 });
    io.observe(this.canvas);
  }
  resize() {
    const p = this.canvas.parentElement;
    this.canvas.width  = p.offsetWidth  || window.innerWidth;
    this.canvas.height = p.offsetHeight || 600;
    this.cols = new Array(Math.floor(this.canvas.width / this.fs)).fill(1);
  }
  tick() {
    if (!this._vis || document.hidden) { this._run = false; return; }
    this._run = true;
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(13,13,13,.07)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.font = `${this.fs}px monospace`;
    this.cols.forEach((y, i) => {
      const ch = this.chars[Math.floor(Math.random() * this.chars.length)];
      ctx.fillStyle = i % 3 === 0
        ? `rgba(249,115,22,${Math.random() * .4 + .12})`
        : `rgba(26,100,120,${Math.random() * .4 + .1})`;
      ctx.fillText(ch, i * this.fs, y * this.fs);
      if (y * this.fs > this.canvas.height && Math.random() > .975) this.cols[i] = 0;
      this.cols[i]++;
    });
    requestAnimationFrame(() => this.tick());
  }
}

// ── Contact Particles ────────────────────────────────────────────────
class SectionParticles {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.pts    = [];
    this.t      = 0;
    this._vis   = false;
    this._run   = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    const io = new IntersectionObserver(e => {
      this._vis = e[0].isIntersecting;
      if (this._vis && !this._run) this.tick();
    }, { threshold: 0 });
    io.observe(this.canvas);
  }
  resize() {
    const p = this.canvas.parentElement;
    this.canvas.width  = p.offsetWidth  || window.innerWidth;
    this.canvas.height = p.offsetHeight || 700;
    this.pts = [];
    const n = Math.min(40, Math.floor(this.canvas.width / 35));
    for (let i = 0; i < n; i++) this.pts.push({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - .5) * .4,
      vy: (Math.random() - .5) * .4,
      r: Math.random() * 2.5 + .8,
      a: Math.random() * .25 + .08,
      c: Math.random() > .5 ? '249,115,22' : '26,100,120',
      p: Math.random() * Math.PI * 2
    });
  }
  tick() {
    if (!this._vis || document.hidden) { this._run = false; return; }
    this._run = true;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.t += .012;
    this.pts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.p += .015;
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width)  p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;
      const a = p.a + Math.sin(p.p) * .05;
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
      grd.addColorStop(0, `rgba(${p.c},${a})`);
      grd.addColorStop(1, `rgba(${p.c},0)`);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();
    });
    for (let i = 0; i < this.pts.length; i++) {
      for (let j = i + 1; j < this.pts.length; j++) {
        const dx = this.pts[i].x - this.pts[j].x;
        const dy = this.pts[i].y - this.pts[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(this.pts[i].x, this.pts[i].y);
          ctx.lineTo(this.pts[j].x, this.pts[j].y);
          ctx.strokeStyle = `rgba(249,115,22,${(1 - d/110) * .07})`;
          ctx.lineWidth = .6; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(() => this.tick());
  }
}

// NeuralSphere (Three.js version of the hero illustration) removed —
// the hand-drawn android SVG in the enfoque section replaces it (pure CSS animation, no JS).

// ── Service Card Visualizations ──────────────────────────────────────
class SvcViz {
  constructor(canvas) {
    this.cv  = canvas;
    this.ctx = canvas.getContext('2d');
    this.t   = 0;
    this.type = canvas.dataset.viz || 'agents';
    this._vis = true;
    this._run = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    // Pause/resume with visibility — without this a card animated once
    // years ago just keeps painting off-screen forever (up to 12 of these
    // running at once after a normal scroll through the services grid).
    const io = new IntersectionObserver(entries => {
      this._vis = entries[0].isIntersecting;
      if (this._vis && !this._run) this.tick();
    }, { threshold: 0 });
    io.observe(canvas.closest('.svc-item') || canvas);
    this.tick();
  }
  resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = this.cv.parentElement.clientWidth;
    const h = 90;
    this.W = w; this.H = h;
    this.cv.width  = w * dpr;
    this.cv.height = h * dpr;
    this.cv.style.width  = w + 'px';
    this.cv.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.init();
  }
  init() {
    const { type, W, H } = this;
    this.data = {};
    if (type === 'agents') {
      // Neural network nodes
      this.data.nodes = Array.from({ length: 14 }, (_, i) => ({
        x: 30 + Math.random() * (W - 60),
        y: 10 + Math.random() * (H - 20),
        r: 2 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.02,
      }));
    } else if (type === 'social') {
      // Scrolling feed cards
      this.data.cards = Array.from({ length: 5 }, (_, i) => ({
        x: 8 + i * (W / 5),
        y: -20 + Math.random() * H,
        w: W / 5 - 10, h: 28,
        speed: 0.4 + Math.random() * 0.3,
        color: i % 2 === 0 ? '#F97316' : '#1A6478',
      }));
    } else if (type === 'intel') {
      // Animated bar chart
      this.data.bars = Array.from({ length: 8 }, (_, i) => ({
        x: 10 + i * (W / 8),
        h: 20 + Math.random() * 45,
        targetH: 20 + Math.random() * 50,
        color: i % 3 === 0 ? '#F97316' : '#1A6478',
        phase: i * 0.4,
      }));
    } else if (type === 'wave') {
      // Audio waveform
      this.data.points = Array.from({ length: 60 }, (_, i) => ({
        x: (i / 59) * W,
        amp: 8 + Math.random() * 22,
        freq: 0.05 + Math.random() * 0.08,
        phase: Math.random() * Math.PI * 2,
      }));
    } else if (type === 'cluster') {
      // Particle clusters
      this.data.particles = Array.from({ length: 30 }, (_, i) => ({
        x: W / 2 + (Math.random() - 0.5) * W * 0.8,
        y: H / 2 + (Math.random() - 0.5) * H * 0.7,
        r: 2 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        color: i % 3 === 0 ? '#F97316' : i % 3 === 1 ? '#1A6478' : '#fff',
      }));
    } else if (type === 'dashboard') {
      // Dashboard grid metrics
      this.data.metrics = [
        { x: W*0.12, y: H*0.3, val: 0, target: 84, label: 'ROI' },
        { x: W*0.38, y: H*0.3, val: 0, target: 67, label: 'CTR' },
        { x: W*0.63, y: H*0.3, val: 0, target: 92, label: 'CVR' },
        { x: W*0.88, y: H*0.3, val: 0, target: 73, label: 'LTV' },
      ];
    } else if (type === 'gauge') {
      // Score gauge / needle
      this.data.angle  = -Math.PI * 0.8;
      this.data.target = Math.PI * 0.1;
    } else if (type === 'video') {
      // Film strip frames
      this.data.frames = Array.from({ length: 5 }, (_, i) => ({
        x: 4 + i * (W / 5), y: 4, w: W / 5 - 8, h: H - 8, phase: i * 0.5,
      }));
    } else if (type === 'funnel') {
      // Funnel with dots flowing through
      this.data.dots = Array.from({ length: 12 }, (_, i) => ({
        y: -10 + (i / 12) * (H + 20),
        speed: 0.5 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      }));
    }
  }

  tick() {
    if (!this._vis || document.hidden) { this._run = false; return; }
    this._run = true;
    requestAnimationFrame(() => this.tick());
    this.t += 0.016;
    const { ctx, W, H, t, type, data } = this;
    ctx.clearRect(0, 0, W, H);

    if (type === 'agents') {
      // Connection lines
      data.nodes.forEach((a, i) => {
        data.nodes.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 80) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(249,115,22,${(1 - d/80)*0.4})`;
            ctx.lineWidth = 0.8; ctx.stroke();
          }
        });
      });
      // Nodes
      data.nodes.forEach(n => {
        const pulse = 0.6 + 0.4 * Math.sin(t * n.speed * 60 + n.phase);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,115,22,${0.7 * pulse})`;
        ctx.fill();
      });

    } else if (type === 'social') {
      data.cards.forEach(c => {
        c.y += c.speed;
        if (c.y > H + 10) c.y = -30;
        ctx.fillStyle = c.color + '22';
        ctx.strokeStyle = c.color + '55';
        ctx.lineWidth = 1;
        const rr = 4;
        ctx.beginPath();
        ctx.rect(c.x, c.y, c.w, c.h);
        ctx.fill(); ctx.stroke();
        // Like bar
        ctx.fillStyle = c.color + '88';
        ctx.fillRect(c.x + 5, c.y + c.h - 7, (c.w - 10) * (0.4 + 0.5 * Math.sin(t + c.x)), 3);
      });

    } else if (type === 'intel') {
      data.bars.forEach((b, i) => {
        b.h += (b.targetH - b.h) * 0.04;
        if (Math.random() < 0.005) b.targetH = 20 + Math.random() * 50;
        const x = b.x + 2; const bw = W / 8 - 8;
        const y = H - b.h - 8;
        ctx.fillStyle = b.color + '33';
        ctx.fillRect(x, y, bw, b.h);
        ctx.fillStyle = b.color + 'bb';
        ctx.fillRect(x, y, bw, 3);
      });

    } else if (type === 'wave') {
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      data.points.forEach(p => {
        const y = H / 2 + Math.sin(t * p.freq * 60 + p.phase) * p.amp;
        ctx.lineTo(p.x, y);
      });
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, 'rgba(249,115,22,0)');
      grad.addColorStop(0.5, 'rgba(249,115,22,0.8)');
      grad.addColorStop(1, 'rgba(26,100,120,0.5)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2; ctx.stroke();

    } else if (type === 'cluster') {
      data.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + p.x);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = p.color + (p.color === '#fff' ? '44' : '99');
        ctx.fill();
      });

    } else if (type === 'dashboard') {
      data.metrics.forEach(m => {
        m.val += (m.target - m.val) * 0.015;
        const pct = m.val / 100;
        // Arc bg
        ctx.beginPath();
        ctx.arc(m.x, m.y, 24, -Math.PI * 0.7, Math.PI * 0.7);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 5; ctx.stroke();
        // Arc fill
        ctx.beginPath();
        ctx.arc(m.x, m.y, 24, -Math.PI * 0.7, -Math.PI * 0.7 + pct * Math.PI * 1.4);
        ctx.strokeStyle = '#F97316';
        ctx.lineWidth = 5; ctx.stroke();
        // Value
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = 'bold 10px DM Mono, monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(m.val) + '%', m.x, m.y);
        ctx.fillStyle = 'rgba(249,115,22,0.7)';
        ctx.font = '8px DM Mono, monospace';
        ctx.fillText(m.label, m.x, m.y + 16);
      });

    } else if (type === 'gauge') {
      data.angle += (data.target - data.angle) * 0.02;
      if (Math.abs(data.angle - data.target) < 0.01)
        data.target = -Math.PI * 0.8 + Math.random() * Math.PI * 0.9;
      const cx = W / 2, cy = H - 15, r = 38;
      // Track
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI, 0);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 6; ctx.stroke();
      // Fill
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI, data.angle);
      ctx.strokeStyle = '#F97316'; ctx.lineWidth = 6; ctx.stroke();
      // Needle
      const nx = cx + Math.cos(data.angle) * r;
      const ny = cy + Math.sin(data.angle) * r;
      ctx.beginPath();
      ctx.moveTo(cx, cy); ctx.lineTo(nx, ny);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();

    } else if (type === 'video') {
      data.frames.forEach((f, i) => {
        const bright = 0.04 + 0.04 * Math.sin(t * 0.8 + f.phase);
        ctx.fillStyle = `rgba(26,100,120,${bright})`;
        ctx.strokeStyle = 'rgba(26,100,120,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(f.x, f.y, f.w, f.h);
        ctx.fill(); ctx.stroke();
        // Play triangle on center frame
        if (i === 2) {
          const pulse = 0.7 + 0.3 * Math.sin(t * 2);
          ctx.fillStyle = `rgba(249,115,22,${pulse})`;
          const cx2 = f.x + f.w / 2, cy2 = f.y + f.h / 2, s = 8;
          ctx.beginPath();
          ctx.moveTo(cx2 - s * 0.6, cy2 - s);
          ctx.lineTo(cx2 + s, cy2);
          ctx.lineTo(cx2 - s * 0.6, cy2 + s);
          ctx.closePath(); ctx.fill();
        }
      });

    } else if (type === 'funnel') {
      // Funnel shape
      const levels = [
        { y: 8,  w: W * 0.9, col: 'rgba(249,115,22,0.15)' },
        { y: 32, w: W * 0.6, col: 'rgba(249,115,22,0.2)' },
        { y: 55, w: W * 0.35, col: 'rgba(249,115,22,0.28)' },
        { y: 72, w: W * 0.18, col: 'rgba(249,115,22,0.4)' },
      ];
      levels.forEach(l => {
        ctx.fillStyle = l.col;
        ctx.fillRect((W - l.w) / 2, l.y, l.w, 14);
      });
      // Moving dots
      data.dots.forEach(d => {
        d.y += d.speed;
        if (d.y > H + 10) d.y = -10;
        const progress = Math.min(1, d.y / H);
        const fw = W * 0.9 * (1 - progress * 0.8);
        const x = W / 2 + (Math.sin(d.phase + t) * fw * 0.3);
        ctx.beginPath();
        ctx.arc(x, d.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249,115,22,${0.4 + 0.5 * progress})`;
        ctx.fill();
      });
    }
  }
}

function initSvcViz() {
  document.querySelectorAll('.svc-viz').forEach(cv => {
    let started = false;
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        new SvcViz(cv);
        io.disconnect();
      }
    }, { threshold: 0 });
    io.observe(cv.closest('.svc-item') || cv);
  });
}

// ── Service Card Accordion ────────────────────────────────────────────
function initServiceAccordion() {
  function closeCard(card) {
    const expand = card.querySelector('.svc-expand');
    const btn    = card.querySelector('.svc-toggle');
    expand.style.maxHeight = '0px';
    card.classList.remove('svc-item--open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function openCard(card) {
    const expand = card.querySelector('.svc-expand');
    const btn    = card.querySelector('.svc-toggle');
    card.classList.add('svc-item--open');
    // Force a reflow so transition triggers from 0
    expand.style.maxHeight = '0px';
    requestAnimationFrame(() => {
      expand.style.maxHeight = expand.scrollHeight + 'px';
    });
    if (btn) btn.setAttribute('aria-expanded', 'true');
    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 120);
  }

  document.querySelectorAll('.svc-toggle').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const card   = btn.closest('.svc-item');
      const isOpen = card.classList.contains('svc-item--open');

      // Close all open cards
      document.querySelectorAll('.svc-item--open').forEach(c => closeCard(c));

      if (!isOpen) openCard(card);
    });
  });

  // CTA click should not bubble to card
  document.querySelectorAll('.svc-expand-cta').forEach(cta => {
    cta.addEventListener('click', e => e.stopPropagation());
  });
}

// ── Page Loader ──────────────────────────────────────────────────────
function initLoader(onComplete) {
  const fill   = document.getElementById('ldrFill');
  const pct    = document.getElementById('ldrPct');
  const loader = document.getElementById('loader');
  if (!fill || !loader) { onComplete(); return; }
  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 18 + 6;
    if (p > 100) p = 100;
    fill.style.width   = p + '%';
    pct.textContent    = Math.floor(p) + '%';
    if (p >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        loader.classList.add('done');
        document.body.classList.remove('loading');
        onComplete();
      }, 280);
    }
  }, 80);
}

// ── Custom Cursor + Trail ─────────────────────────────────────────────
class Cursor {
  constructor() {
    this.dot  = document.getElementById('cursorDot');
    this.ring = document.getElementById('cursorRing');
    if (!this.dot) return;
    this.mx = 0; this.my = 0;
    this.rx = 0; this.ry = 0;
    this._running = true;
    const container = document.getElementById('cursorTrail');
    const N = 14;
    this.trail  = [];
    this.trailX = new Array(N).fill(0);
    this.trailY = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      const d = document.createElement('div');
      d.className = 'trail-dot';
      const size = Math.max(2, 5 - i * .25);
      d.style.cssText = `width:${size}px;height:${size}px;opacity:${Math.max(.05, .55 - i*.04)};`;
      container.appendChild(d);
      this.trail.push(d);
    }
    this.bind(); this.loop();
  }
  bind() {
    document.addEventListener('mousemove', e => {
      this.mx = e.clientX; this.my = e.clientY;
      this.dot.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
      if (!this._running) { this._running = true; this.loop(); }
    });
    document.addEventListener('mousedown', () => {
      this.dot.classList.add('clicked');
      setTimeout(() => this.dot.classList.remove('clicked'), 200);
    });
    document.querySelectorAll('a,button,.svc-item,.vm-card,.btn-orange,.btn-ghost,.cli-logo-item').forEach(el => {
      el.addEventListener('mouseenter', () => { this.dot.classList.add('hovered'); this.ring.classList.add('hovered'); });
      el.addEventListener('mouseleave', () => { this.dot.classList.remove('hovered'); this.ring.classList.remove('hovered'); });
    });
  }
  loop() {
    this.rx += (this.mx - this.rx) * .1;
    this.ry += (this.my - this.ry) * .1;
    this.ring.style.transform = `translate(${this.rx}px,${this.ry}px) translate(-50%,-50%)`;
    this.trailX[0] = this.mx;
    this.trailY[0] = this.my;
    let settled = Math.abs(this.mx - this.rx) < .05 && Math.abs(this.my - this.ry) < .05;
    for (let i = 1; i < this.trail.length; i++) {
      this.trailX[i] += (this.trailX[i-1] - this.trailX[i]) * (.18 - i * .008);
      this.trailY[i] += (this.trailY[i-1] - this.trailY[i]) * (.18 - i * .008);
      this.trail[i].style.transform = `translate(${this.trailX[i]}px,${this.trailY[i]}px) translate(-50%,-50%)`;
      settled = settled && Math.abs(this.trailX[i-1] - this.trailX[i]) < .05 && Math.abs(this.trailY[i-1] - this.trailY[i]) < .05;
    }
    // Stop polling once the trail has fully caught up to the cursor — a
    // stationary mouse no longer needs 60 style writes/sec forever.
    // mousemove (see bind()) restarts the loop.
    this._running = !settled;
    if (this._running) requestAnimationFrame(() => this.loop());
  }
}

// ── Lenis Smooth Scroll ───────────────────────────────────────────────
function initLenis() {
  if (typeof Lenis === 'undefined') return null;
  const lenis = new Lenis({ lerp: .08, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', () => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
  });
  const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  return lenis;
}

// ══════════════════════════════════════════════════════════════════════
// SKILL: GSAP 3 + ScrollTrigger — Use 1: Text Scramble on hero tagline
// ══════════════════════════════════════════════════════════════════════
class TextScramble {
  constructor(el) {
    this.el    = el;
    this.chars = '!<>—_\\/[]{}=+*^?#0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    this.queue = [];
    this.frame = 0;
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.textContent;
    const len     = Math.max(oldText.length, newText.length);
    this.queue = [];
    for (let i = 0; i < len; i++) {
      const from  = oldText[i] || '';
      const to    = newText[i] || '';
      const start = Math.floor(Math.random() * 20);
      const end   = start + Math.floor(Math.random() * 20) + 8;
      this.queue.push({ from, to, start, end, char: '' });
    }
    cancelAnimationFrame(this.raf);
    this.frame = 0;
    this.update();
  }
  update() {
    let out = ''; let done = 0;
    this.queue.forEach(q => {
      if (this.frame >= q.end) {
        done++;
        out += q.to;
      } else if (this.frame >= q.start) {
        if (!q.char || Math.random() < .28) {
          q.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        }
        out += `<span class="scramble-char">${q.char}</span>`;
      } else {
        out += q.from;
      }
    });
    this.el.innerHTML = out;
    if (done < this.queue.length) {
      this.raf = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

// ══════════════════════════════════════════════════════════════════════
// SKILL: GSAP 3 + ScrollTrigger — Use 2: Metric counter + parallax
// ══════════════════════════════════════════════════════════════════════
function initGSAP() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.lagSmoothing(0);

  // ─ Hero entrance
  const tl = gsap.timeline({ delay: .15 });
  tl
    .fromTo('#heroLogo',    { opacity: 0, scale: .82, y: 50 }, { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'back.out(1.8)' })
    .fromTo('#heroTagline', { opacity: 0, y: 24 },             { opacity: 1, y: 0, duration: .9, ease: 'power3.out' }, '-=.6')
    .fromTo('#heroCard',    { opacity: 0, y: 28, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .9, ease: 'power3.out' }, '-=.5');

  // ─ Text scramble on hero tagline after entrance
  const taglineEl = document.getElementById('heroTagline');
  if (taglineEl) {
    const fx = new TextScramble(taglineEl);
    const original = taglineEl.textContent;
    tl.add(() => fx.setText(original), '-=.3');
  }

  // ─ Metric counter animation via ScrollTrigger
  document.querySelectorAll('.mn').forEach(el => {
    const raw = el.textContent.trim();
    // Extract prefix/suffix for display
    const match = raw.match(/([\d.]+)/);
    if (!match) return;
    const end    = parseFloat(match[1]);
    const prefix = raw.slice(0, match.index);
    const suffix = raw.slice(match.index + match[0].length);
    const obj    = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: end,
          duration: 2.2,
          ease: 'power2.out',
          onUpdate() {
            const disp = Number.isInteger(end)
              ? Math.round(obj.val)
              : obj.val.toFixed(1);
            el.textContent = prefix + disp + suffix;
          }
        });
      }
    });
  });

  // Section headings (.dh2) intentionally have no GSAP reveal here — the
  // matrix letter-scramble effect (initMatrixText) already animates them in
  // on scroll. Running both was two effects fighting on the same heading.

  // ─ Hero background parallax on scroll
  const hero = document.querySelector('.hero');
  if (hero) {
    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: self => {
        const y = self.progress * 80;
        const canvas = document.getElementById('threeCanvas');
        if (canvas) canvas.style.transform = `translateY(${y}px)`;
      }
    });
  }
}

// ══════════════════════════════════════════════════════════════════════
// SKILL: GSAP — Letter stagger on service numbers (svc-num)
// Creates a typewriter-ripple that runs when card enters viewport
// (migrado de Anime.js — GSAP ya estaba cargado, evita una librería extra)
// ══════════════════════════════════════════════════════════════════════
function initAnimeJS() {
  if (typeof gsap === 'undefined') return;

  // ─ Stagger svc-num on scroll enter
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const numEl = entry.target;
      const text  = numEl.textContent.trim();
      // Split into chars
      numEl.innerHTML = text.split('').map(c => `<span class="letter" style="display:inline-block">${c}</span>`).join('');
      gsap.fromTo(numEl.querySelectorAll('.letter'),
        { y: -14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'elastic.out(1, 0.5)' });
      observer.unobserve(numEl);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.svc-num').forEach(el => observer.observe(el));

  // ─ Nav logo morph on hover (scale + skew ripple)
  const navLogo = document.querySelector('.nav-logo img');
  if (navLogo) {
    navLogo.addEventListener('mouseenter', () => {
      gsap.timeline()
        .to(navLogo, { skewX: 3, scale: 1.06, duration: 0.15, ease: 'sine.inOut' })
        .to(navLogo, { skewX: -2, scale: 1, duration: 0.2, ease: 'sine.inOut' })
        .to(navLogo, { skewX: 0, duration: 0.15, ease: 'sine.inOut' });
    });
  }
}

// ══════════════════════════════════════════════════════════════════════
// SKILL: WAAPI — Web Animations API for contact section clip reveal
// Uses WAAPI directly for GPU-accelerated clip-path entrance
// ══════════════════════════════════════════════════════════════════════
function initWAAPI() {
  if (!document.querySelector('.s-contact')) return;
  const contactSection = document.querySelector('.s-contact');
  const grid = contactSection.querySelector('.contact-grid');
  if (!grid) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // WAAPI animate the two columns with stagger
      const cols = grid.querySelectorAll('.contact-l, .contact-r');
      cols.forEach((col, i) => {
        col.style.willChange = 'clip-path, opacity, transform';
        col.animate([
          { clipPath: `inset(0 ${i === 0 ? '100%' : '0'} 0 ${i === 0 ? '0' : '100%'})`, opacity: 0, transform: 'translateY(20px)' },
          { clipPath: 'inset(0 0% 0 0%)', opacity: 1, transform: 'translateY(0px)' }
        ], {
          duration: 900,
          delay: i * 200,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards'
        });
      });
      io.unobserve(contactSection);
    });
  }, { threshold: 0.2 });

  io.observe(contactSection);

  // ─ WAAPI on metric items — scale bounce on scroll
  document.querySelectorAll('.metric-item').forEach((item, i) => {
    const ioM = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        item.animate([
          { transform: 'scale(0.7)', opacity: 0 },
          { transform: 'scale(1.05)', opacity: 1, offset: 0.7 },
          { transform: 'scale(1)', opacity: 1 }
        ], { duration: 700, delay: i * 120, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'forwards' });
        ioM.unobserve(item);
      });
    }, { threshold: 0.5 });
    ioM.observe(item);
  });
}

// ── IntersectionObserver Reveals (reliable, no library dependency) ───
function initRevealObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const delay = parseFloat(el.dataset.delay || 0) * 1000;
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}


// ── Navbar Scroll Effect ──────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
  // Mobile menu
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;
  function toggleMenu() {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  }
  hamburger.addEventListener('click', toggleMenu);
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    if (navLinks.classList.contains('open')) toggleMenu();
  }));

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navItems = navLinks.querySelectorAll('a[href^="#"]');
  window.addEventListener('scroll', () => {
    const pos = window.scrollY + 160;
    sections.forEach(sec => {
      const top = sec.offsetTop, h = sec.offsetHeight, id = sec.id;
      if (pos >= top && pos < top + h) {
        navItems.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
      }
    });
  }, { passive: true });
}

// ── Smooth Scroll Anchors ─────────────────────────────────────────────
// Routes through the Lenis instance when it's running, so anchor clicks use
// the same smoothing curve as wheel scroll instead of fighting it with a
// second, native smooth-scroll animation.
function initSmoothScroll(lenis) {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -80 });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ── Magnetic Button Effect ─────────────────────────────────────────────
function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r   = btn.getBoundingClientRect();
      const cx  = r.left + r.width  / 2;
      const cy  = r.top  + r.height / 2;
      const dx  = (e.clientX - cx) * .3;
      const dy  = (e.clientY - cy) * .3;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

// ── Tilt on Service Cards ──────────────────────────────────────────────
function initTilt() {
  document.querySelectorAll('.svc-item').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - .5;
      const y  = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `translateY(-8px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ── Gooey Text Morphing (hero) ────────────────────────────────────────
function initGooeyText() {
  const container = document.getElementById('heroGooey');
  if (!container) return;
  const span1 = container.querySelector('.gooey-span-1');
  const span2 = container.querySelector('.gooey-span-2');
  if (!span1 || !span2) return;

  const texts = ['Inteligencia Artificial', 'Automatización', 'Marketing Digital', 'Análisis de Datos', 'Predicción'];

  // Mobile: the blob-merge relies on a per-frame rAF blur loop plus an SVG
  // filter referenced via CSS url() — heavy on phone CPUs and unreliable on
  // iOS Safari. Use the same lightweight crossfade as the text-cycle CTA.
  if (window.innerWidth < 768) {
    const inner = container.querySelector('.gooey-inner');
    if (inner) inner.style.filter = 'none';
    span2.style.display = 'none';
    let i = 0;
    span1.textContent = texts[0];
    span1.classList.add('cycle-visible');
    setInterval(() => {
      span1.classList.remove('cycle-visible');
      span1.classList.add('cycle-exit');
      setTimeout(() => {
        i = (i + 1) % texts.length;
        span1.textContent = texts[i];
        span1.classList.remove('cycle-exit');
        void span1.offsetWidth;
        span1.classList.add('cycle-visible');
      }, 300);
    }, 2200);
    return;
  }

  const morphTime = 1.1, cooldownTime = 0.35;

  let textIndex = texts.length - 1;
  let time = Date.now(), morph = 0, cooldown = cooldownTime;

  span1.textContent = texts[textIndex % texts.length];
  span2.textContent = texts[(textIndex + 1) % texts.length];

  const setMorph = fraction => {
    span2.style.filter  = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
    span2.style.opacity = Math.pow(fraction, 0.4);
    const f = 1 - fraction;
    span1.style.filter  = `blur(${Math.min(8 / f - 8, 100)}px)`;
    span1.style.opacity = Math.pow(f, 0.4);
  };

  const tick = () => {
    requestAnimationFrame(tick);
    if (document.hidden) return;
    const now = Date.now();
    const wasInCooldown = cooldown > 0;
    const dt = (now - time) / 1000;
    time = now;
    cooldown -= dt;

    if (cooldown <= 0) {
      if (wasInCooldown) {
        textIndex = (textIndex + 1) % texts.length;
        span1.textContent = texts[textIndex % texts.length];
        span2.textContent = texts[(textIndex + 1) % texts.length];
      }
      morph -= cooldown; cooldown = 0;
      let f = morph / morphTime;
      if (f > 1) { cooldown = cooldownTime; f = 1; }
      setMorph(f);
    } else {
      morph = 0;
      span2.style.filter = ''; span2.style.opacity = '1';
      span1.style.filter = ''; span1.style.opacity = '0';
    }
  };
  tick();
}

// ── Team panel dashboard mockup — interactive range filters ───────────
function initDashMock() {
  const wrap = document.getElementById('dashMock');
  if (!wrap) return;
  const filters = document.getElementById('dashFilters');
  const kpiLeads  = document.getElementById('dashKpiLeads');
  const kpiTime   = document.getElementById('dashKpiTime');
  const kpiUptime = document.getElementById('dashKpiUptime');
  const line = document.getElementById('dashLine');
  const area = document.getElementById('dashArea');
  const bars = document.querySelectorAll('#dashBars span');

  const DATA = {
    hoy: {
      leads: '42', time: '1.4s', uptime: '99.7%',
      pts: '0,78 40,74 80,76 120,66 160,70 200,58 240,62 300,50',
      bars: [24, 32, 20, 38, 28, 44, 34, 48]
    },
    '7d': {
      leads: '312', time: '1.2s', uptime: '99.9%',
      pts: '0,70 40,58 80,62 120,38 160,44 200,20 240,26 300,8',
      bars: [42, 64, 50, 78, 56, 88, 70, 96]
    },
    '30d': {
      leads: '1,180', time: '1.1s', uptime: '99.95%',
      pts: '0,60 40,50 80,54 120,30 160,36 200,14 240,18 300,4',
      bars: [55, 72, 60, 85, 68, 92, 80, 100]
    }
  };

  function render(key) {
    const d = DATA[key];
    if (!d) return;
    [kpiLeads, kpiTime, kpiUptime, line, area].forEach(el => el.style.opacity = '0');
    setTimeout(() => {
      kpiLeads.textContent  = d.leads;
      kpiTime.textContent   = d.time;
      kpiUptime.textContent = d.uptime;
      line.setAttribute('points', d.pts);
      area.setAttribute('points', d.pts + ' 300,90 0,90');
      [kpiLeads, kpiTime, kpiUptime, line, area].forEach(el => el.style.opacity = '1');
    }, 160);
    bars.forEach((b, i) => { b.style.setProperty('--h', d.bars[i] + '%'); });
  }

  filters.addEventListener('click', e => {
    const btn = e.target.closest('.dash-filter[data-range]');
    if (!btn) return;
    filters.querySelectorAll('.dash-filter').forEach(f => f.classList.remove('active'));
    btn.classList.add('active');
    render(btn.dataset.range);
  });
}

// ── Animated Text Cycle (CTA before contacto) ─────────────────────────
function initTextCycle() {
  const el = document.getElementById('textCycle');
  if (!el) return;
  const words = ['empresa', 'equipo', 'proceso', 'marca', 'negocio', 'proyecto'];
  let index = 0;
  el.textContent = words[0];
  el.classList.add('cycle-visible');

  setInterval(() => {
    el.classList.remove('cycle-visible');
    el.classList.add('cycle-exit');
    setTimeout(() => {
      index = (index + 1) % words.length;
      el.textContent = words[index];
      el.classList.remove('cycle-exit');
      // Two rAFs let the browser paint the class removal before we add
      // 'cycle-visible', so the transition restarts — same effect as
      // reading offsetWidth, without the forced synchronous reflow.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.classList.add('cycle-visible');
      }));
    }, 300);
  }, 3000);
}

// ── WebGL Shader Background — Orange Plasma (Hero) ───────────────────
function initShaderBg() {
  const canvas = document.getElementById('shaderCanvas');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
  if (!gl) return;

  const vsSource = `attribute vec4 p;void main(){gl_Position=p;}`;
  const fsSource = `
    precision mediump float;
    uniform vec2 iR; uniform float iT;
    const float spd=0.10,lspd=1.0*spd,wspd=0.18*spd,ospd=1.2*spd;
    const float lamp=1.0,lfreq=0.2,wfreq=0.5,wamp=1.0,ofreq=0.5;
    const float mnW=0.01,mxW=0.2,minOs=0.6,maxOs=2.0;
    const vec4 lCol=vec4(0.98,0.45,0.09,1.0);
    float rnd(float t){return(cos(t)+cos(t*1.3+1.3)+cos(t*1.4+1.4))/3.0;}
    float gy(float x,float hf,float off){return rnd(x*lfreq+iT*lspd)*hf*lamp+off;}
    void main(){
      vec2 uv=gl_FragCoord.xy/iR.xy;
      vec2 sp=(gl_FragCoord.xy-iR.xy*.5)/iR.x*10.0;
      float hf=1.0-(cos(uv.x*6.28)*.5+.5);
      float vf=1.0-(cos(uv.y*6.28)*.5+.5);
      sp.y+=rnd(sp.x*wfreq+iT*wspd)*wamp*(.5+hf);
      sp.x+=rnd(sp.y*wfreq+iT*wspd+2.0)*wamp*hf;
      vec4 lines=vec4(0.0);
      for(int l=0;l<10;l++){
        float nl=float(l)/10.0;
        float ot=iT*ospd, op=float(l)+sp.x*ofreq;
        float r=rnd(op+ot)*.5+.5;
        float hw=mix(mnW,mxW,r*hf)*.5;
        float off=rnd(op+ot*(1.0+nl))*mix(minOs,maxOs,hf);
        float lp=gy(sp.x,hf,off);
        float dw=smoothstep(hw,0.0,abs(lp-sp.y))/2.0+smoothstep(hw*0.15+0.015,hw*0.15,abs(lp-sp.y));
        float cx=mod(float(l)+iT*lspd,25.0)-12.0;
        vec2 cp=vec2(cx,gy(cx,hf,off));
        float dc=smoothstep(0.01+0.015,0.01,length(sp-cp))*4.0;
        lines+=(dw+dc)*lCol*r;
      }
      vec4 bg=mix(vec4(0.04,0.015,0.0,1.0),vec4(0.13,0.048,0.0,1.0),uv.x)*vf;
      bg.a=1.0;
      gl_FragColor=bg+lines*0.28;
    }
  `;

  const mkShader = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); gl.deleteShader(s); return null; }
    return s;
  };
  const vs = mkShader(gl.VERTEX_SHADER, vsSource);
  const fs = mkShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'p');
  const resLoc = gl.getUniformLocation(prog, 'iR');
  const timLoc = gl.getUniformLocation(prog, 'iT');

  let W = 0, H = 0, rafId, t0 = performance.now(), running = false;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = Math.floor(window.innerWidth * dpr);
    H = Math.floor(window.innerHeight * dpr);
    canvas.width = W; canvas.height = H;
    gl.viewport(0, 0, W, H);
  };
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Pause when hero is scrolled away
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { if (!running) { running = true; loop(); } }
    else { running = false; cancelAnimationFrame(rafId); }
  }, { threshold: 0 });
  io.observe(canvas);

  function loop() {
    if (!running) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(posLoc);
    gl.uniform2f(resLoc, W, H);
    gl.uniform1f(timLoc, (performance.now() - t0) / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    rafId = requestAnimationFrame(loop);
  }
  // Start immediately — IO will manage pause/resume
  running = true;
  loop();
}

// ── GTM DataLayer — Service & CTA Tracking ────────────────────────────
function initGTMTracking() {
  window.dataLayer = window.dataLayer || [];

  // Helper
  const push = (event, params) => window.dataLayer.push({ event, ...params });

  // 1. Track section visibility (IntersectionObserver per section)
  const sections = [
    { selector: '#enfoque',   name: 'Nuestro Enfoque' },
    { selector: '#expertos',  name: 'Expertos' },
    { selector: '#servicios', name: 'Servicios' },
    { selector: '#clientes',  name: 'Clientes' },
    { selector: '#contacto',  name: 'Contacto' },
  ];
  sections.forEach(({ selector, name }) => {
    const el = document.querySelector(selector);
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      push('section_view', { section_name: name, page_path: window.location.pathname });
      io.disconnect();
    }, { threshold: 0.3 });
    io.observe(el);
  });

  // 2. Track each service card becoming visible
  const serviceNames = {
    'Agentes de IA':             'agentes_ia',
    'Manejo de Redes Sociales':  'redes_sociales_ia',
    'Medición de Competidores':  'medicion_competidores',
    'Social Listening':          'social_listening',
    'Audiencias Inteligentes':   'audiencias_ml',
    'Control Unificado':         'dashboards_bi',
    'Calculadora de Influencers':'calculadora_influencers',
    'Videos y Doblaje con IA':   'video_ia',
    'Pauta Digital Inteligente': 'pauta_digital_ia',
    'Modelos de Predicción':     'modelos_prediccion',
    'Modelos de Atribución':     'modelos_atribucion',
    'MMM':                       'marketing_mix_model',
  };

  document.querySelectorAll('.svc-item').forEach(card => {
    const title = card.querySelector('h3')?.textContent?.trim() || '';
    const serviceName = Object.entries(serviceNames).find(([k]) => title.includes(k))?.[1] || title;
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      push('service_view', { service_name: serviceName, service_title: title });
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(card);

    // Click on service card
    card.addEventListener('click', () => {
      push('service_click', { service_name: serviceName, service_title: title });
    });
  });

  // 3. Track CTA button clicks
  document.querySelectorAll('a[href="#contacto"], a[href="#servicios"], .btn-orange, .btn-ghost, .text-cta-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      push('cta_click', {
        cta_text:     btn.textContent?.trim(),
        cta_location: btn.closest('section')?.id || 'hero',
        cta_type:     btn.classList.contains('btn-orange') ? 'primary' : 'secondary',
      });
    });
  });

  // 4. Track contact form submission
  const form = document.querySelector('#contacto form, form');
  if (form) {
    form.addEventListener('submit', () => {
      push('form_submit', {
        form_name:     'contacto_flowslabs',
        form_location: 'contacto',
      });
      gtag('event', 'conversion', { send_to: 'G-PBNX2916K4' });
    });
  }

  // 5. Track scroll depth milestones
  const depths = [25, 50, 75, 90];
  const reached = new Set();
  window.addEventListener('scroll', () => {
    const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    depths.forEach(d => {
      if (pct >= d && !reached.has(d)) {
        reached.add(d);
        push('scroll_depth', { depth_percent: d });
      }
    });
  }, { passive: true });

  // 6. Track time on page milestones (30s, 60s, 120s)
  [30, 60, 120].forEach(sec => {
    setTimeout(() => push('time_on_page', { seconds: sec }), sec * 1000);
  });

  // 7. Page view with enriched data
  push('page_view_enriched', {
    page_title:    document.title,
    page_url:      window.location.href,
    content_group: 'Home',
    language:      'es',
    site:          'flowslabssas.com',
  });
}

// ── Matrix Text Effect for headings ───────────────────────────────────
function initMatrixText() {
  const STAGGER  = 60;
  const DURATION = 420;

  function wrapLetters(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes  = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(tn => {
      const frag = document.createDocumentFragment();
      [...tn.textContent].forEach(ch => {
        if (ch === ' ' || ch === '\n') {
          frag.appendChild(document.createTextNode(ch));
        } else {
          const s = document.createElement('span');
          s.className    = 'mx-letter';
          s.dataset.char = ch;
          s.textContent  = ch;
          frag.appendChild(s);
        }
      });
      tn.parentNode.replaceChild(frag, tn);
    });
  }

  function triggerMatrix(el) {
    const spans = Array.from(el.querySelectorAll('.mx-letter'));
    if (!spans.length) return;
    spans.forEach((s, i) => {
      setTimeout(() => {
        s.textContent = Math.random() > 0.5 ? '1' : '0';
        s.classList.add('mx-active');
        setTimeout(() => {
          s.textContent = s.dataset.char;
          s.classList.remove('mx-active');
        }, DURATION);
      }, i * STAGGER);
    });
  }

  document.querySelectorAll('h2, h3').forEach(el => {
    wrapLetters(el);
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      setTimeout(() => triggerMatrix(el), 150);
      io.disconnect();
    }, { threshold: 0.4 });
    io.observe(el);
    el.addEventListener('mouseenter', () => triggerMatrix(el));
  });
}

// ─── Entry Point ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLoader(() => {
    const matrixCanvas = document.getElementById('matrixCanvas');
    if (matrixCanvas) new MatrixRain(matrixCanvas);

    const contactCanvas = document.getElementById('contactCanvas');
    if (contactCanvas) new SectionParticles(contactCanvas);

    // Service card visualizations
    initSvcViz();

    // Service card accordion
    initServiceAccordion();

    // Team panel dashboard mockup
    initDashMock();

    // GTM DataLayer tracking
    initGTMTracking();

    // Matrix text effect on all headings
    initMatrixText();

    // Shader background + Gooey text + Text cycle
    if (window.innerWidth >= 768) initShaderBg();
    initGooeyText();
    initTextCycle();

    // Interactions
    const lenis = initLenis();
    initGSAP();
    initAnimeJS();
    initWAAPI();
    initRevealObserver();
    initNavbar();
    initSmoothScroll(lenis);

    // Cursor / magnetic / tilt are mouse-hover effects — on touch devices
    // they used to keep running (14 DOM nodes + a live rAF loop + listeners
    // on every link/card) for a cursor CSS already hides, doing real work
    // for zero visual benefit. Only wire them up when a fine pointer with
    // hover is actually present.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      new Cursor();
      initMagnetic();
      initTilt();
    }
  });
});
