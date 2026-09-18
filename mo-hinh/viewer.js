/* ============================================================
   Van Mieu 3D - trinh xem mo hinh Minecraft bang Three.js
   - tai van-mieu.glb.gz (tu giai nen trong trinh duyet)
   - 2 che do: Xoay quanh (orbit) va Bay tu do (WASD / cam ung)
   ============================================================ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const MODEL_URL = new URL('./van-mieu.glb.gz', import.meta.url).href;

const root = document.getElementById('vm-viewer');
if (!root) throw new Error('Khong tim thay #vm-viewer trong trang');

const canvas = root.querySelector('.vm-canvas');
const bar = root.querySelector('.vm-bar-fill');
const loadBox = root.querySelector('.vm-loading');
const loadText = root.querySelector('.vm-loading-text');
const hint = root.querySelector('.vm-hint');
const stats = root.querySelector('.vm-stats');

const isTouch = matchMedia('(hover: none)').matches;

/* ---------------------------------------------------------- scene */

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,                       // nen troi la gradient CSS phia sau
  antialias: window.devicePixelRatio < 1.5,
  powerPreference: 'high-performance',
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.5 : 2));

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xdbe8f5, 420, 1500);

const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 3000);

scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x6a5a45, 1.35));
const sun = new THREE.DirectionalLight(0xfff2d8, 1.5);
sun.position.set(0.45, 1, 0.35).multiplyScalar(300);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xbdd4ee, 0.45);
fill.position.set(-0.6, 0.35, -0.5).multiplyScalar(300);
scene.add(fill);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.dampingFactor = 0.08;
orbit.maxPolarAngle = Math.PI * 0.495;   // khong chui xuong duoi dat
orbit.minDistance = 8;
orbit.maxDistance = 1400;
orbit.zoomSpeed = 0.9;
orbit.enableZoom = false;   // chi bat sau khi nguoi dung bam vao khung -> khong cuop thao tac cuon trang

/* ---------------------------------------------------------- tai mo hinh */

function human(n) { return (n / 1048576).toFixed(1) + ' MB'; }

async function fetchModel(url, onProgress) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const total = Number(res.headers.get('content-length')) || 0;

  const reader = res.body.getReader();
  const chunks = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress(loaded, total);
  }
  let data = new Uint8Array(loaded);
  let at = 0;
  for (const c of chunks) { data.set(c, at); at += c.length; }

  // may chu co the da tu giai nen (Content-Encoding: gzip) -> kiem tra chu ky
  if (data[0] === 0x1f && data[1] === 0x8b) {
    if (typeof DecompressionStream !== 'function') {
      throw new Error('Trinh duyet khong ho tro giai nen gzip. Hay dung ban van-mieu.glb chua nen.');
    }
    loadText.textContent = 'Đang giải nén mô hình…';
    const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(stream).arrayBuffer();
  }
  return data.buffer;
}

function tuneMaterials(object) {
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const seen = new Map();
  let tris = 0;

  object.traverse((o) => {
    if (!o.isMesh) return;

    // GLB khong luu phap tuyen (de nhe file) -> tinh lai o day.
    // Cac dinh chi duoc gop khi cung huong mat, nen ket qua la shading phang dung kieu Minecraft.
    o.geometry.computeVertexNormals();
    tris += o.geometry.index.count / 3;
    o.frustumCulled = true;

    const src = o.material;
    if (seen.has(src)) { o.material = seen.get(src); return; }

    const map = src.map;
    if (map) {
      map.magFilter = THREE.NearestFilter;              // giu net pixel
      map.minFilter = THREE.NearestMipmapLinearFilter;  // do bong khi nhin xa
      map.anisotropy = Math.min(4, maxAniso);
      map.needsUpdate = true;
    }

    // MeshLambert nhe hon MeshStandard rat nhieu, hop voi khoi vuong khong bong loang
    const mat = new THREE.MeshLambertMaterial({
      map,
      color: src.color,
      side: src.side,
      alphaTest: src.alphaTest,
      transparent: src.transparent,
      opacity: src.opacity,
      depthWrite: true,     // nuoc van ghi depth de khong bi xep chong loi
      fog: true,
    });
    src.dispose();
    seen.set(src, mat);
    o.material = mat;
  });

  return { tris, materials: seen.size };
}

/* ---------------------------------------------------------- khung nhin */

let model = null;
let box = new THREE.Box3();
let center = new THREE.Vector3();
let radius = 100;

// vi tri cong chinh (Van Mieu Mon), quay mat vao trong khu di tich —
// diem xuat phat mac dinh khi nguoi dung moi mo trang
const GATE_POS = new THREE.Vector3(0, 14, -185);
const GATE_LOOK = new THREE.Vector3(0, 11, 40);

function frameOverview(instant = false) {
  const dist = radius * 1.75;
  const dir = new THREE.Vector3(0.62, 0.42, 0.66).normalize();
  setView(center.clone().add(dir.multiplyScalar(dist)), center.clone(), instant);
}

function frameGate(instant = false) {
  setView(GATE_POS.clone(), GATE_LOOK.clone(), instant);
}

function frameTop() {
  setView(new THREE.Vector3(center.x, box.max.y + radius * 1.5, center.z + 1), center.clone());
}

function frameInside() {
  const p = new THREE.Vector3(center.x, box.min.y + 12, box.max.z - radius * 0.25);
  setView(p, new THREE.Vector3(center.x, box.min.y + 10, center.z));
}

let tween = null;
function setView(pos, target, instant = false) {
  if (instant || mode === 'fly') {
    camera.position.copy(pos);
    orbit.target.copy(target);
    if (mode === 'fly') lookFrom(pos, target);
    return;
  }
  tween = { t: 0, p0: camera.position.clone(), p1: pos, t0: orbit.target.clone(), t1: target };
}

/* ---------------------------------------------------------- che do bay */

let mode = 'orbit';
const keys = new Set();
const move = new THREE.Vector3();
let yaw = 0, pitch = 0;
let speed = 14;             // block / giay

function lookFrom(pos, target) {
  const d = target.clone().sub(pos).normalize();
  yaw = Math.atan2(-d.x, -d.z);
  pitch = Math.asin(THREE.MathUtils.clamp(d.y, -1, 1));
}

function setMode(next, { deriveAngle = true } = {}) {
  mode = next;
  orbit.enabled = next === 'orbit';
  root.dataset.mode = next;
  hint.textContent = next === 'orbit'
    ? (isTouch ? 'Kéo để xoay · chụm hai ngón để phóng to' : 'Kéo chuột để xoay · lăn chuột để phóng to')
    : (isTouch ? 'Cần gạt bên trái để đi · kéo bên phải để nhìn' : 'Nhìn quanh bằng chuột · W A S D để đi · Space lên · Shift xuống · R về lại cổng');
  if (next === 'fly') {
    // deriveAngle=false: goi truoc do da tu dat yaw/pitch (vd tu lien ket ?cam=),
    // khong duoc ghi de bang huong nhin cu cua orbit.target
    if (deriveAngle) lookFrom(camera.position, orbit.target);
    tryLockPointer();   // khoa chuot ngay khi vao che do bay (neu trinh duyet cho phep luc nay)
  } else {
    // dat diem xoay truoc mat may quay
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    orbit.target.copy(camera.position).add(fwd.multiplyScalar(Math.min(radius, 60)));
    if (document.pointerLockElement === canvas) document.exitPointerLock();
  }
}

// trinh duyet chi cho khoa con tro sau mot cu-chi thuc su cua nguoi dung
// (bam, cham, hoac nhan phim) — khong the tu khoa ngay khi trang vua tai xong.
function tryLockPointer() {
  if (isTouch || mode !== 'fly' || document.pointerLockElement === canvas) return;
  try {
    const p = canvas.requestPointerLock();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch (_) { /* trinh duyet chua cho phep luc nay, se thu lai o cu chi ke tiep */ }
}
document.addEventListener('pointerlockerror', () => {});

addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea')) return;
  keys.add(e.code);
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(e.code)) tryLockPointer();
  if (e.code === 'KeyR' && mode === 'fly') { frameGate(true); tryLockPointer(); }   // ve lai cong neu bi ket trong tuong
  if (e.code === 'KeyC' && e.ctrlKey === false && mode === 'fly') {
    const p = camera.position;
    console.log(`?cam=${p.x.toFixed(1)},${p.y.toFixed(1)},${p.z.toFixed(1)},${yaw.toFixed(3)},${pitch.toFixed(3)}`);
  }
  if (mode === 'fly' && ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', (e) => keys.delete(e.code));
addEventListener('blur', () => keys.clear());

// cuon trang van hoat dong cho toi khi nguoi dung bam vao khung hinh
canvas.addEventListener('pointerdown', () => { orbit.enableZoom = true; root.classList.add('active'); });
addEventListener('pointerdown', (e) => {
  if (!root.contains(e.target)) { orbit.enableZoom = false; root.classList.remove('active'); }
}, true);

canvas.addEventListener('click', tryLockPointer);

// ngay sau khi khoa chuot, khung hinh dau tien trinh duyet doi khi bao do lech
// chuot lon bat thuong (nhay tu vi tri con tro cu ve giua man hinh) khien
// huong nhin bi giat manh mot phat — bo qua vai chuc mili-giay dau de tranh loi nay
let lockedAt = 0;
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === canvas) lockedAt = performance.now();
});
document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== canvas) return;
  if (performance.now() - lockedAt < 150) return;
  yaw -= e.movementX * 0.0022;
  pitch = THREE.MathUtils.clamp(pitch - e.movementY * 0.0022, -1.55, 1.55);
});

/* --- DEBUG TAM THOI: bay den goc muon dat lam diem xuat phat, bam phim P,
   mo Console (F12) de lay toa do, dan vao GATE_POS / GATE_LOOK roi xoa doan nay --- */
window.addEventListener('keydown', (e) => {
  if (e.code !== 'KeyP') return;
  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const look = camera.position.clone().addScaledVector(dir, 60);
  const r = (v) => Math.round(v * 10) / 10;
  console.log(
    `GATE_POS = new THREE.Vector3(${r(camera.position.x)}, ${r(camera.position.y)}, ${r(camera.position.z)});\n` +
    `GATE_LOOK = new THREE.Vector3(${r(look.x)}, ${r(look.y)}, ${r(look.z)});`
  );
});

/* cam ung: nua trai = can gat di chuyen, nua phai = nhin quanh */
const stick = { id: null, x: 0, y: 0, dx: 0, dy: 0 };
const look = { id: null, x: 0, y: 0 };
const knob = root.querySelector('.vm-stick');

canvas.addEventListener('pointerdown', (e) => {
  if (mode !== 'fly' || e.pointerType === 'mouse') return;
  const r = canvas.getBoundingClientRect();
  const left = (e.clientX - r.left) < r.width * 0.45;
  if (left && stick.id === null) {
    stick.id = e.pointerId; stick.x = e.clientX; stick.y = e.clientY; stick.dx = stick.dy = 0;
    knob.style.left = (e.clientX - r.left) + 'px';
    knob.style.top = (e.clientY - r.top) + 'px';
    knob.classList.add('on');
  } else if (look.id === null) {
    look.id = e.pointerId; look.x = e.clientX; look.y = e.clientY;
  }
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId === stick.id) {
    stick.dx = THREE.MathUtils.clamp((e.clientX - stick.x) / 60, -1, 1);
    stick.dy = THREE.MathUtils.clamp((e.clientY - stick.y) / 60, -1, 1);
    knob.style.setProperty('--dx', stick.dx * 26 + 'px');
    knob.style.setProperty('--dy', stick.dy * 26 + 'px');
  } else if (e.pointerId === look.id) {
    yaw -= (e.clientX - look.x) * 0.006;
    pitch = THREE.MathUtils.clamp(pitch - (e.clientY - look.y) * 0.006, -1.55, 1.55);
    look.x = e.clientX; look.y = e.clientY;
  }
});
function endPointer(e) {
  if (e.pointerId === stick.id) { stick.id = null; stick.dx = stick.dy = 0; knob.classList.remove('on'); }
  if (e.pointerId === look.id) look.id = null;
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);

/* ---------------------------------------------------------- vong lap */

function resize() {
  const w = root.clientWidth, h = root.clientHeight;
  if (!w || !h) return;
  if (canvas.width !== Math.round(w * renderer.getPixelRatio()) || canvas.height !== Math.round(h * renderer.getPixelRatio())) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}
new ResizeObserver(resize).observe(root);

let visible = true;
new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0.01 }).observe(root);

let shoot = false;
const clock = new THREE.Clock();
let fpsAcc = 0, fpsN = 0, lowStreak = 0, ratio = renderer.getPixelRatio();
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');   // tai dung moi khung hinh, tranh cap phat lien tuc gay giat

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.1);
  if (!visible || document.hidden) return;
  resize();

  if (tween) {
    tween.t = Math.min(1, tween.t + dt * 1.6);
    const k = 1 - Math.pow(1 - tween.t, 3);
    camera.position.lerpVectors(tween.p0, tween.p1, k);
    orbit.target.lerpVectors(tween.t0, tween.t1, k);
    if (tween.t >= 1) tween = null;
  }

  if (mode === 'orbit') {
    orbit.update();
  } else {
    _euler.set(pitch, yaw, 0);
    camera.quaternion.setFromEuler(_euler);
    move.set(0, 0, 0);
    if (keys.has('KeyW')) move.z -= 1;
    if (keys.has('KeyS')) move.z += 1;
    if (keys.has('KeyA')) move.x -= 1;
    if (keys.has('KeyD')) move.x += 1;
    move.x += stick.dx; move.z += stick.dy;
    const up = (keys.has('Space') ? 1 : 0) - (keys.has('ShiftLeft') || keys.has('ShiftRight') ? 1 : 0);
    if (move.lengthSq() > 0) {
      move.normalize().applyQuaternion(camera.quaternion);
      const s = speed * (keys.has('ControlLeft') ? 3.5 : 1) * dt;
      camera.position.addScaledVector(move, s);
    }
    if (up) camera.position.y += up * speed * dt;
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, box.min.y - 20, box.max.y + 400);
  }

  renderer.render(scene, camera);

  if (shoot) {
    shoot = false;
    canvas.toBlob((b) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = 'van-mieu-3d.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    });
  }

  // tu ha do phan giai neu may yeu
  fpsAcc += dt; fpsN++;
  if (fpsAcc > 1.5) {
    const fps = fpsN / fpsAcc;
    fpsAcc = 0; fpsN = 0;
    if (fps < 26 && ratio > 0.75) { lowStreak++; if (lowStreak >= 2) { ratio = Math.max(0.75, ratio - 0.25); renderer.setPixelRatio(ratio); lowStreak = 0; } }
    else lowStreak = 0;
  }
}

/* ---------------------------------------------------------- khoi dong */

function fail(msg, detail) {
  loadBox.classList.add('err');
  loadText.innerHTML = `<strong>${msg}</strong><br><span>${detail}</span>`;
  bar.parentElement.style.display = 'none';
}

(async function start() {
  try {
    const buf = await fetchModel(MODEL_URL, (l, t) => {
      const p = t ? l / t : 0;
      bar.style.width = (p * 100).toFixed(1) + '%';
      loadText.textContent = t
        ? `Đang tải mô hình… ${Math.round(p * 100)}% (${human(l)} / ${human(t)})`
        : `Đang tải mô hình… ${human(l)}`;
    });

    loadText.textContent = 'Đang dựng cảnh…';
    await new Promise(r => setTimeout(r, 16));

    const gltf = await new Promise((res, rej) => new GLTFLoader().parse(buf, '', res, rej));
    model = gltf.scene;
    const info = tuneMaterials(model);
    scene.add(model);

    box.setFromObject(model);
    box.getCenter(center);
    radius = box.getSize(new THREE.Vector3()).length() * 0.5;
    orbit.target.copy(center);
    camera.far = radius * 8;
    camera.updateProjectionMatrix();
    scene.fog.near = radius * 2.0;
    scene.fog.far = radius * 7.0;

    // vi tri may quay tu URL (?cam=x,y,z,yaw,pitch), hoac mac dinh dung o cong chinh
    const q = new URLSearchParams(location.search).get('cam');
    let deriveAngle = true;
    if (q) {
      const [x, y, z, ya, pi] = q.split(',').map(Number);
      camera.position.set(x, y, z);
      yaw = ya || 0; pitch = pi || 0;
      deriveAngle = false;          // gop dung yaw/pitch tu lien ket, khong tinh lai
      // dung mot lan roi xoa khoi dia chi trang — bam F5 lan sau se ve lai cong mac dinh,
      // khong bi "dinh" mai o vi tri da luu (nguyen nhan gay nham lan truoc do)
      history.replaceState(null, '', location.pathname + location.hash);
    } else {
      camera.position.copy(GATE_POS);
      orbit.target.copy(GATE_LOOK); // setMode('fly') se tu tinh yaw/pitch huong vao trong
    }

    stats.textContent = `${(info.tris / 1000).toFixed(0)}K tam giác · ${info.materials} vật liệu`;
    loadBox.classList.add('done');
    setTimeout(() => loadBox.remove(), 700);
    setMode('fly', { deriveAngle });
    root.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === 'fly'));
    tick();
  } catch (err) {
    console.error(err);
    const offline = location.protocol === 'file:';
    fail('Không tải được mô hình 3D',
      offline
        ? 'Trang đang mở bằng file:// nên trình duyệt chặn việc đọc file mô hình. Hãy chạy một máy chủ tĩnh, ví dụ <code>python -m http.server</code>, rồi mở qua địa chỉ http://localhost:8000'
        : `Kiểm tra lại đường dẫn <code>mo-hinh/van-mieu.glb.gz</code>. Chi tiết: ${err.message}`);
  }
})();

/* ---------------------------------------------------------- nut bam */

root.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {
  ({ gate: frameGate, overview: frameOverview, top: frameTop, inside: frameInside })[b.dataset.view]();
}));
root.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
  root.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('on', x === b));
  setMode(b.dataset.mode);
}));
root.querySelector('[data-act="shot"]').addEventListener('click', () => { shoot = true; });
root.querySelector('[data-act="full"]').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else root.requestFullscreen?.();
});
