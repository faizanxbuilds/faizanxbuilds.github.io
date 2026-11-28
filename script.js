const root = document.documentElement;
const themeButton = document.querySelector('#themeToggle');
let redraw = () => {};
function setTheme(theme) {
  root.dataset.theme = theme;
  themeButton.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme');
  redraw();
}
try { setTheme(localStorage.getItem('fp-theme') === 'light' ? 'light' : 'dark'); } catch { setTheme('dark'); }
themeButton.onclick = () => {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  try { localStorage.setItem('fp-theme', root.dataset.theme); } catch {}
};
const clock = document.querySelector('time');
function tick() {
  clock.textContent = 'Noida / ' + new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit'}).format(new Date()) + ' IST';
}
tick();
setInterval(tick, 30000);
for (const link of document.querySelectorAll('nav a')) {
  if (link.pathname === (location.pathname.endsWith('/') ? location.pathname+'index.html' : location.pathname) && !link.hash) link.setAttribute('aria-current','page');
}
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    entry.target.classList.add('arrived','in');
    observer.unobserve(entry.target);
  }
});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const canvas = document.querySelector('canvas');
if (canvas) mountSignalField(canvas);
function mountSignalField(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const button = document.querySelector('#motion');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = preference.matches, visible = true, frame = 0, last = 0, phase = .72, tilt = 0, target = 0;
  let w, h, radius;
  function paint() {
    ctx.clearRect(0,0,w,h);
    const light = root.dataset.theme === 'light';
    const ink = light ? '118,55,20' : '255,153,94';
    const cx=w*.5, cy=h*.49;
    ctx.strokeStyle=light?'#c9c7b9':'#34382f';
    ctx.lineWidth=.65;
    ctx.setLineDash([1,6]);
    ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(w,cy);ctx.moveTo(cx,7);ctx.lineTo(cx,h-6);ctx.stroke();
    ctx.setLineDash([]);
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-.32+tilt);
    // Contour rings describe a rotating, rippled signal surface.
    for(let row=0;row<=76;row++){
      const lat=-1.53+row/76*3.06;
      const band=Math.cos(lat);
      ctx.beginPath();
      for(let j=0;j<=110;j++){
        const lon=j/110*Math.PI*2;
        const swell=1+.075*Math.sin(lon*3+lat*5+phase)*band+.055*Math.cos(lon*2-lat*7-phase*.65)*band;
        const x=radius*swell*band*Math.cos(lon);
        const y=radius*swell*(Math.sin(lat)*.89+band*Math.sin(lon)*.45);
        if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.strokeStyle='rgba('+ink+','+(.28+.52*(row/76))+')';ctx.lineWidth=.95;ctx.stroke();
    }
    ctx.rotate(-.18);
    ctx.beginPath();ctx.ellipse(0,0,radius*1.38,radius*.27,0,0,Math.PI*2);
    ctx.strokeStyle='rgba('+ink+',.55)';ctx.stroke();
    const a=phase*.65;
    ctx.beginPath();ctx.arc(radius*1.38*Math.cos(a),radius*.27*Math.sin(a),4,0,Math.PI*2);
    ctx.fillStyle=light?'#81330c':'#ffd5ac';ctx.fill();ctx.restore();
  }
  function animate(now) {
    frame=0;
    if(now-last>=32){phase+=Math.min(now-last,64)*.00032;tilt+=(target-tilt)*.12;paint();last=now;}
    schedule();
  }
  function schedule(){
    if(!paused && visible && !document.hidden && !frame) frame=requestAnimationFrame(animate);
  }
  function resize(){
    w=canvas.clientWidth;h=canvas.clientHeight;radius=Math.min(w*.322,h*.423);
    const ratio=Math.min(devicePixelRatio,2);
    canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);paint();
  }
  function sync(){
    cancelAnimationFrame(frame);frame=0;button.textContent=paused?'Play motion ▷':'Pause motion Ⅱ';schedule();
  }
  button.onclick=()=>{paused=!paused;sync();};
  preference.onchange=()=>{paused=preference.matches;sync();};
  canvas.onpointermove=e=>{target=(e.offsetX/w-.5)*.4;};
  canvas.onpointerleave=()=>{target=0;};
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();}).observe(canvas);
  document.addEventListener('visibilitychange',sync);
  redraw=paint;resize();sync();
}
const gallery=document.querySelector('.projects-grid');
if(gallery){
  const [prev,next]=document.querySelectorAll('.pager button');
  function syncPager(){
    prev.disabled=gallery.scrollLeft<2;
    next.disabled=gallery.scrollLeft+gallery.clientWidth>=gallery.scrollWidth-2;
  }
  function advance(direction){
    const step=gallery.children[1].offsetLeft-gallery.children[0].offsetLeft;
    gallery.scrollBy({left:direction*step,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  }
  prev.onclick=()=>advance(-1);
  next.onclick=()=>advance(1);
  gallery.addEventListener('scroll',syncPager,{passive:true});
  new ResizeObserver(syncPager).observe(gallery);
}

const atlas = document.querySelector('.atlas');
if (atlas) {
  const nodes = [...atlas.querySelectorAll('.specimen')];
  const tabs = [...atlas.querySelectorAll('.group-tabs button')];
  const wide = matchMedia('(min-width: 821px)');
  function inspect(node) {
    for (const item of nodes) item.open = item === node;
  }
  function selectGroup(group) {
    for (const node of nodes) node.hidden = node.dataset.group !== group;
    for (const tab of tabs) tab.setAttribute('aria-pressed', String(tab.dataset.group === group));
    inspect(wide.matches ? nodes.find(node => !node.hidden) : null);
  }
  for (const tab of tabs) tab.onclick = () => selectGroup(tab.dataset.group);
  for (const node of nodes) {
    const handle = node.querySelector('summary');
    handle.addEventListener('pointerenter', event => {
      if (wide.matches && event.pointerType === 'mouse') inspect(node);
    });
    handle.addEventListener('focus', () => { if (wide.matches) inspect(node); });
    handle.addEventListener('click', event => {
      event.preventDefault();
      inspect(node.open && !wide.matches ? null : node);
    });
  }
  atlas.classList.add('interactive');
  atlas.querySelector('.group-tabs').hidden = false;
  selectGroup('0');
  wide.addEventListener('change', () => selectGroup(tabs.find(tab => tab.getAttribute('aria-pressed') === 'true').dataset.group));
}

// A damped spring follows native scrolling and settles when the viewport stops.
const still = matchMedia('(prefers-reduced-motion: reduce)');
let lastScroll = scrollY, drift = 0, speed = 0, springFrame = 0, lastFrame = 0;
function settleWater(now) {
  const step = Math.min(2, (now - lastFrame) / 16.67 || 1);
  lastFrame = now;
  speed = (speed - drift * .085 * step) * Math.pow(.76, step);
  drift = Math.max(-12, Math.min(12, drift + speed * step));
  if (still.matches || (Math.abs(speed) < .025 && Math.abs(drift) < .08)) {
    drift = speed = springFrame = 0;
    root.style.removeProperty('--water-shift');
    return;
  }
  root.style.setProperty('--water-shift', drift.toFixed(2) + 'px');
  springFrame = requestAnimationFrame(settleWater);
}
window.addEventListener('scroll', () => {
  const delta = scrollY - lastScroll;
  lastScroll = scrollY;
  if (still.matches || !delta) return;
  speed = Math.max(-4, Math.min(4, speed + delta * .07));
  if (!springFrame) {
    lastFrame = performance.now();
    springFrame = requestAnimationFrame(settleWater);
  }
}, {passive:true});
