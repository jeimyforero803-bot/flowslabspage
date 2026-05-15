/* ═══════════════════════════════════════════════════════════════════
   FLOWSLABS — Ultra Premium Experience v4.0
   Three.js 3D Circuit · Lenis Smooth Scroll · GSAP Hero · Scroll Bot
   ═══════════════════════════════════════════════════════════════════ */

// ── Three.js 3D Circuit Network ─────────────────────────────────────
class ThreeCircuit {
  constructor(canvas) {
    this.canvas   = canvas;
    this.scene    = new THREE.Scene();
    this.camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.camera.position.set(0, 0, 38);

    this.mouse  = { x: 0, y: 0 };
    this.rot    = { x: 0, y: 0 };
    this.nodes  = [];
    this.time   = 0;
    this.active = true;

    this.ORANGE = new THREE.Color('#F97316');
    this.TEAL   = new THREE.Color('#1A6478');
    this.WHITE  = new THREE.Color('#FFFFFF');

    this.buildNodes();
    this.buildLines();
    this.buildChips();
    this.bindEvents();
    this.tick();
  }

  buildNodes() {
    const count = window.innerWidth < 768 ? 45 : 80;
    for (let i = 0; i < count; i++) {
      const size = Math.random() * .28 + .07;
      const geo  = new THREE.SphereGeometry(size, 8, 8);
      const r    = Math.random();
      const col  = r < .45 ? this.ORANGE : r < .85 ? this.TEAL : this.WHITE;
      const mat  = new THREE.MeshBasicMaterial({ color: col.clone(), transparent: true, opacity: Math.random() * .14 + .05 });
      const mesh = new THREE.Mesh(geo, mat);
      const spread = 30;
      mesh.position.set(
        (Math.random() - .5) * spread * 2,
        (Math.random() - .5) * spread * 1.2,
        (Math.random() - .5) * spread * .7
      );
      mesh.userData = {
        vx: (Math.random() - .5) * .018,
        vy: (Math.random() - .5) * .013,
        vz: (Math.random() - .5) * .009,
        base: mat.opacity,
        phase: Math.random() * Math.PI * 2
      };
      this.scene.add(mesh);
      this.nodes.push(mesh);
    }
  }

  buildLines() {
    const max = 300;
    const pos = new Float32Array(max * 2 * 3);
    const col = new Float32Array(max * 2 * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .10 });
    this.lines = new THREE.LineSegments(geo, mat);
    this.scene.add(this.lines);
    this.lPos = pos; this.lCol = col; this.lMax = max;
  }

  buildChips() {
    for (let i = 0; i < 12; i++) {
      const size = Math.random() * 1.2 + .4;
      const geo  = new THREE.BoxGeometry(size, size, .05);
      const col  = Math.random() > .5 ? this.ORANGE : this.TEAL;
      const mat  = new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: .15 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - .5) * 50, (Math.random() - .5) * 30, (Math.random() - .5) * 15);
      mesh.rotation.set(Math.random(), Math.random(), Math.random());
      mesh.userData.rotV = { x: (Math.random() - .5) * .003, y: (Math.random() - .5) * .003 };
      this.scene.add(mesh);
      this.nodes.push(mesh);
    }
  }

  updateLines() {
    let idx = 0;
    const maxD = 12;
    const spheres = this.nodes.filter(n => n.geometry.type === 'SphereGeometry');
    for (let i = 0; i < spheres.length && idx < this.lMax; i++) {
      for (let j = i + 1; j < spheres.length && idx < this.lMax; j++) {
        const d = spheres[i].position.distanceTo(spheres[j].position);
        if (d < maxD) {
          const a = (1 - d / maxD) * .7;
          const ci = spheres[i].material.color;
          const cj = spheres[j].material.color;
          this.lPos.set([spheres[i].position.x, spheres[i].position.y, spheres[i].position.z, spheres[j].position.x, spheres[j].position.y, spheres[j].position.z], idx * 6);
          this.lCol.set([ci.r*a, ci.g*a, ci.b*a, cj.r*a, cj.g*a, cj.b*a], idx * 6);
          idx++;
        }
      }
    }
    this.lines.geometry.setDrawRange(0, idx * 2);
    this.lines.geometry.attributes.position.needsUpdate = true;
    this.lines.geometry.attributes.color.needsUpdate = true;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    window.addEventListener('mousemove', e => {
      this.mouse.x = (e.clientX / window.innerWidth  - .5) * 2;
      this.mouse.y = (e.clientY / window.innerHeight - .5) * 2;
    });
    window.addEventListener('scroll', () => {
      this.active = window.scrollY < window.innerHeight * 1.5;
    });
  }

  tick() {
    requestAnimationFrame(() => this.tick());
    if (!this.active) return;
    this.time += .01;
    this.nodes.forEach(n => {
      if (n.geometry.type === 'SphereGeometry') {
        n.position.x += n.userData.vx;
        n.position.y += n.userData.vy;
        n.position.z += n.userData.vz;
        if (Math.abs(n.position.x) > 34) n.userData.vx *= -1;
        if (Math.abs(n.position.y) > 22) n.userData.vy *= -1;
        if (Math.abs(n.position.z) > 16) n.userData.vz *= -1;
        n.material.opacity = n.userData.base + Math.sin(this.time + n.userData.phase) * .14;
      } else {
        n.rotation.x += n.userData.rotV.x;
        n.rotation.y += n.userData.rotV.y;
      }
    });
    this.rot.y += (this.mouse.x * .55 - this.rot.y) * .04;
    this.rot.x += (this.mouse.y * .32 - this.rot.x) * .04;
    this.scene.rotation.y = this.rot.y;
    this.scene.rotation.x = this.rot.x;
    this.updateLines();
    this.renderer.render(this.scene, this.camera);
  }
}

// ── Matrix Rain ──────────────────────────────────────────────────────
class MatrixRain {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.chars  = '01アイウエオカキフロウスラブスAI10';
    this.fs     = 13;
    this.cols   = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.tick();
  }
  resize() {
    const p = this.canvas.parentElement;
    this.canvas.width  = p.offsetWidth  || window.innerWidth;
    this.canvas.height = p.offsetHeight || 600;
    this.cols = new Array(Math.floor(this.canvas.width / this.fs)).fill(1);
  }
  tick() {
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
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.tick();
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

// ── Neural Sphere (Three.js) ──────────────────────────────────────────
class NeuralSphere {
  constructor(canvas) {
    if (typeof THREE === 'undefined') return;
    this.canvas = canvas;
    const w = canvas.parentElement.clientWidth || 500;
    const h = canvas.parentElement.clientHeight || 520;

    this.scene    = new THREE.Scene();
    this.camera   = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
    this.camera.position.set(0, 0, 5.5);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    this.mouse  = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.time   = 0;

    this.ORANGE = new THREE.Color('#F97316');
    this.TEAL   = new THREE.Color('#1A6478');

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.buildSphere();
    this.buildRings();
    this.buildConnections();
    this.buildAmbientParticles();
    this.bindEvents();
    this.tick();
  }

  buildSphere() {
    // 220 Fibonacci-distributed points on a sphere
    const count   = 220;
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle

    this.nodePositions = [];

    for (let i = 0; i < count; i++) {
      const y   = 1 - (i / (count - 1)) * 2;
      const r   = Math.sqrt(1 - y * y);
      const th  = phi * i;
      const x   = Math.cos(th) * r;
      const z   = Math.sin(th) * r;
      const R   = 2.0 + (Math.random() - 0.5) * 0.25;

      positions[i * 3]     = x * R;
      positions[i * 3 + 1] = y * R;
      positions[i * 3 + 2] = z * R;
      this.nodePositions.push(new THREE.Vector3(x * R, y * R, z * R));

      const t = Math.random();
      const c = t < 0.55 ? this.ORANGE : this.TEAL;
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      sizes[i] = Math.random() * 3 + 1.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      vertexColors: true,
      sizeAttenuation: true,
      size: 0.06,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });

    this.sphere = new THREE.Points(geo, mat);
    this.group.add(this.sphere);

    // ── SKILL: Three.js — Additive blending glow pass ──
    // Second identical point cloud at 3x size with AdditiveBlending = bloom-like glow
    const glowMat = new THREE.PointsMaterial({
      vertexColors: true,
      sizeAttenuation: true,
      size: 0.18,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.glowSphere = new THREE.Points(geo, glowMat);
    this.group.add(this.glowSphere);
  }

  buildRings() {
    this.rings = [];
    const ringDefs = [
      { radius: 2.15, tube: 0.007, color: '#F97316', tiltX: 0.35, tiltZ: 0.1,  speed: 0.004 },
      { radius: 2.15, tube: 0.005, color: '#1A6478', tiltX: 1.22, tiltZ: 0.55, speed: -0.003 },
      { radius: 2.15, tube: 0.006, color: '#F97316', tiltX: 0.65, tiltZ: 1.05, speed: 0.0025 },
    ];
    ringDefs.forEach(def => {
      const geo = new THREE.TorusGeometry(def.radius, def.tube, 6, 120);
      const mat = new THREE.MeshBasicMaterial({
        color: def.color, transparent: true, opacity: 0.55, depthWrite: false
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = def.tiltX;
      ring.rotation.z = def.tiltZ;
      ring.userData.speed = def.speed;
      this.group.add(ring);
      this.rings.push(ring);
    });
  }

  buildConnections() {
    // Connect nearby nodes with faint lines
    const maxDist = 1.1;
    const verts   = [];
    const cols    = [];
    const nodes   = this.nodePositions;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < maxDist) {
          verts.push(nodes[i].x, nodes[i].y, nodes[i].z);
          verts.push(nodes[j].x, nodes[j].y, nodes[j].z);
          const t = Math.random();
          const c = t < 0.5 ? this.ORANGE : this.TEAL;
          cols.push(c.r, c.g, c.b, c.r, c.g, c.b);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(cols), 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.12, depthWrite: false
    });
    this.lines = new THREE.LineSegments(geo, mat);
    this.group.add(this.lines);
  }

  buildAmbientParticles() {
    // 80 slow-drifting particles in a wider shell
    const count = 80;
    const pos   = new Float32Array(count * 3);
    const col   = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.8 + Math.random() * 1.4;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
      const c = Math.random() < 0.6 ? this.ORANGE : this.TEAL;
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      vertexColors: true, size: 0.04, transparent: true, opacity: 0.4,
      sizeAttenuation: true, depthWrite: false
    });
    this.ambient = new THREE.Points(geo, mat);
    this.scene.add(this.ambient);
  }

  bindEvents() {
    const canvas = this.canvas;
    const rect   = () => canvas.getBoundingClientRect();
    window.addEventListener('mousemove', e => {
      const r = rect();
      this.mouse.x =  ((e.clientX - r.left)  / r.width  - 0.5) * 2;
      this.mouse.y = -((e.clientY - r.top)   / r.height - 0.5) * 2;
    });
    window.addEventListener('resize', () => {
      const p = canvas.parentElement;
      const w = p.clientWidth || 500;
      const h = p.clientHeight || 520;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  tick() {
    requestAnimationFrame(() => this.tick());
    this.time += 0.007;

    // Smooth mouse-driven rotation
    this.target.x += (this.mouse.y * 0.6 - this.target.x) * 0.04;
    this.target.y += (this.mouse.x * 0.6 - this.target.y) * 0.04;
    this.group.rotation.x = this.target.x;
    this.group.rotation.y = this.target.y + this.time * 0.18;

    // Animate rings
    this.rings.forEach(r => { r.rotation.y += r.userData.speed; });

    // Pulse node opacity + glow sync
    this.sphere.material.opacity = 0.7 + 0.15 * Math.sin(this.time * 1.2);
    if (this.glowSphere) this.glowSphere.material.opacity = 0.06 + 0.06 * Math.sin(this.time * 0.8);

    // Slow ambient drift
    this.ambient.rotation.y += 0.0008;
    this.ambient.rotation.x += 0.0004;

    this.renderer.render(this.scene, this.camera);
  }
}

// ── Service Card Visualizations ──────────────────────────────────────
class SvcViz {
  constructor(canvas) {
    this.cv  = canvas;
    this.ctx = canvas.getContext('2d');
    this.t   = 0;
    this.type = canvas.dataset.viz || 'agents';
    this.resize();
    window.addEventListener('resize', () => this.resize());
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
  document.querySelectorAll('.svc-viz').forEach(cv => new SvcViz(cv));
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

// ── Neural Sphere Init ────────────────────────────────────────────────
function initNeuralSphere() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  if (typeof THREE === 'undefined') return;
  new NeuralSphere(canvas);
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
      this.dot.style.left = e.clientX + 'px';
      this.dot.style.top  = e.clientY + 'px';
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
    this.ring.style.left = this.rx + 'px';
    this.ring.style.top  = this.ry + 'px';
    this.trailX[0] = this.mx;
    this.trailY[0] = this.my;
    for (let i = 1; i < this.trail.length; i++) {
      this.trailX[i] += (this.trailX[i-1] - this.trailX[i]) * (.18 - i * .008);
      this.trailY[i] += (this.trailY[i-1] - this.trailY[i]) * (.18 - i * .008);
      this.trail[i].style.left = this.trailX[i] + 'px';
      this.trail[i].style.top  = this.trailY[i] + 'px';
    }
    requestAnimationFrame(() => this.loop());
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

  // ─ Section headings — staggered clip-path reveal via ScrollTrigger
  document.querySelectorAll('.dh2').forEach(el => {
    gsap.fromTo(el,
      { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
      {
        clipPath: 'inset(0 0% 0 0)', opacity: 1,
        duration: 1.1, ease: 'power3.inOut',
        scrollTrigger: {
          trigger: el, start: 'top 85%', once: true
        }
      }
    );
  });

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
// SKILL: Anime.js — Letter stagger on service numbers (svc-num)
// Creates a typewriter-ripple that runs when card enters viewport
// ══════════════════════════════════════════════════════════════════════
function initAnimeJS() {
  if (typeof anime === 'undefined') return;

  // ─ Stagger svc-num on scroll enter
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const numEl = entry.target;
      const text  = numEl.textContent.trim();
      // Split into chars
      numEl.innerHTML = text.split('').map(c => `<span class="letter" style="display:inline-block">${c}</span>`).join('');
      anime({
        targets: numEl.querySelectorAll('.letter'),
        translateY: [{ value: -14, duration: 0 }, { value: 0, duration: 400, easing: 'easeOutElastic(1,.5)' }],
        opacity:    [{ value: 0, duration: 0 }, { value: 1, duration: 300 }],
        delay:      anime.stagger(60),
      });
      observer.unobserve(numEl);
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.svc-num').forEach(el => observer.observe(el));

  // ─ Nav logo morph on hover (scale + skew ripple)
  const navLogo = document.querySelector('.nav-logo img');
  if (navLogo) {
    navLogo.addEventListener('mouseenter', () => {
      anime({ targets: navLogo, skewX: [0, 3, -2, 0], scale: [1, 1.06, 1],
              duration: 500, easing: 'easeInOutSine' });
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

// ══════════════════════════════════════════════════════════════════════
// SKILL: Three.js — Enhance NeuralSphere with glow additive blending
// Adds a ghost sphere with AdditiveBlending for bloom-like glow
// ══════════════════════════════════════════════════════════════════════
// (Applied inside NeuralSphere.buildSphere — see class above, adds a
// second PointsMaterial pass with AdditiveBlending at larger size)

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
  });
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
  });
}

// ── Smooth Scroll Anchors ─────────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
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

// ── Animated Text Cycle (CTA before contacto) ─────────────────────────
function initTextCycle() {
  const el = document.getElementById('textCycle');
  if (!el) return;
  const words = ['empresa', 'equipo', 'proceso', 'campaña', 'marca', 'negocio', 'proyecto'];
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
      void el.offsetWidth; // force reflow
      el.classList.add('cycle-visible');
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
    const float spd=0.30,lspd=1.0*spd,wspd=0.22*spd,ospd=1.33*spd;
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
      gl_FragColor=bg+lines*0.65;
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

// ── Orbital Services Timeline ─────────────────────────────────────────
function initOrbital() {
  const stage = document.getElementById('orbitalStage');
  if (!stage) return;

  const services = [
    { id: 1, title: 'Agentes IA',       sub: 'VOZ Y CHAT',         desc: 'Asistentes virtuales de voz y chat integrados a WhatsApp, web y CRM. Aprenden de tus conversaciones reales y mejoran con el tiempo.' },
    { id: 2, title: 'Redes Sociales',   sub: 'SOCIAL MEDIA IA',    desc: 'Copies generados por IA entrenada en tu marca, calendarios editoriales por tendencias y análisis de rendimiento detallado.' },
    { id: 3, title: 'Automatización',   sub: 'WORKFLOW IA',         desc: 'Flujos automáticos que conectan tus plataformas, eliminan tareas repetitivas y reducen tiempos de respuesta hasta un 50%.' },
    { id: 4, title: 'Social Listening', sub: 'NLP',                 desc: 'Monitoreo de menciones y sentimiento de marca en redes, foros y medios digitales con alertas configurables en tiempo real.' },
    { id: 5, title: 'Audiencias IA',    sub: 'MACHINE LEARNING',    desc: 'Segmentación dinámica por comportamiento real y LTV. Activación directa en Meta, Google y TikTok Ads.' },
    { id: 6, title: 'Dashboards',       sub: 'CONTROL UNIFICADO',   desc: '+20 fuentes de datos integradas. La IA analiza todo y entrega recomendaciones accionables cada semana.' },
    { id: 7, title: 'Pauta Digital',    sub: 'MEDIA BUYING IA',     desc: 'Redistribución de presupuesto en tiempo real. Reducción del CPA mediante IA continua en Google, Meta y TikTok.' },
    { id: 8, title: 'MMM',              sub: 'MEDIA MIX MODEL',     desc: 'Modelo econométrico que cuantifica el ROI real de cada canal y optimiza la distribución total del presupuesto de marketing.' },
  ];

  let angle = 0, autoRotate = true, activeId = null, rafId;
  const isMobile = window.innerWidth < 768;
  const radius   = isMobile ? 130 : 220;

  // Build nodes
  const nodes = services.map((svc, i) => {
    const el = document.createElement('div');
    el.className = 'orb-node';
    el.innerHTML = `
      <div class="orb-node-dot"><span class="orb-node-num">0${svc.id}</span></div>
      <div class="orb-node-label"><strong>${svc.title}</strong><small>${svc.sub}</small></div>`;
    stage.appendChild(el);

    el.addEventListener('click', e => {
      e.stopPropagation();
      if (activeId === svc.id) {
        activeId = null; autoRotate = true;
        el.classList.remove('orb-node--active');
        hidePanel();
      } else {
        stage.querySelectorAll('.orb-node--active').forEach(n => n.classList.remove('orb-node--active'));
        activeId = svc.id; autoRotate = false;
        el.classList.add('orb-node--active');
        showPanel(svc);
      }
    });
    return { el, svc };
  });

  stage.addEventListener('click', e => {
    if (e.target === stage || e.target.classList.contains('orb-track-ring')) {
      activeId = null; autoRotate = true;
      stage.querySelectorAll('.orb-node--active').forEach(n => n.classList.remove('orb-node--active'));
      hidePanel();
    }
  });

  function showPanel(svc) {
    const p = document.getElementById('orbInfoPanel');
    if (!p) return;
    p.innerHTML = `<div class="orb-info-content">
      <span class="orb-info-tag" style="color:var(--orange)">${svc.sub}</span>
      <h3 class="orb-info-title">${svc.title}</h3>
      <p class="orb-info-desc">${svc.desc}</p>
      <a href="#servicios" class="orb-info-cta">Ver servicio completo →</a>
    </div>`;
    requestAnimationFrame(() => p.classList.add('orb-info--show'));
  }
  function hidePanel() {
    const p = document.getElementById('orbInfoPanel');
    if (p) p.classList.remove('orb-info--show');
  }

  const N = nodes.length;
  function tick() {
    if (autoRotate) angle += 0.0025;
    nodes.forEach(({ el }, i) => {
      const a = (i / N) * Math.PI * 2 + angle;
      const x = Math.cos(a) * radius;
      const y = Math.sin(a) * radius * 0.4; // flatten to ellipse
      const depth = (Math.sin(a - Math.PI / 2) + 1) / 2;
      el.style.transform = `translate(${x}px, ${y}px) scale(${0.72 + depth * 0.36})`;
      el.style.opacity   = String(0.3 + depth * 0.7);
      el.style.zIndex    = String(Math.round(depth * 90 + 10));
    });
    rafId = requestAnimationFrame(tick);
  }

  // Pause when off screen
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) tick();
    else cancelAnimationFrame(rafId);
  }, { threshold: 0.1 });
  io.observe(stage);
}

// ─── Entry Point ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLoader(() => {
    // 3D + canvas effects
    const threeCanvas = document.getElementById('threeCanvas');
    if (threeCanvas && typeof THREE !== 'undefined') new ThreeCircuit(threeCanvas);

    const matrixCanvas = document.getElementById('matrixCanvas');
    if (matrixCanvas) new MatrixRain(matrixCanvas);

    const contactCanvas = document.getElementById('contactCanvas');
    if (contactCanvas) new SectionParticles(contactCanvas);

    // Neural Sphere
    initNeuralSphere();

    // Service card visualizations
    initSvcViz();

    // Service card accordion
    initServiceAccordion();

    // Shader background + Gooey text + Text cycle
    initShaderBg();
    initGooeyText();
    initTextCycle();

    // Hide Spline watermark via shadow DOM
    const splineEl = document.querySelector('.neural-spline');
    if (splineEl) {
      const tryHide = () => {
        const root = splineEl.shadowRoot;
        if (root) {
          const badge = root.querySelector('#logo, .logo, [class*="logo"], a[href*="spline"]');
          if (badge) { badge.style.display = 'none'; return; }
        }
        setTimeout(tryHide, 800);
      };
      setTimeout(tryHide, 1500);
    }

    // Interactions
    new Cursor();
    initLenis();
    initGSAP();
    initAnimeJS();
    initWAAPI();
    initRevealObserver();
    initNavbar();
    initSmoothScroll();
    initMagnetic();
    initTilt();
  });
});
