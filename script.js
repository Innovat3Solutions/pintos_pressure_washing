// Hero quote form
(function(){
  const form = document.getElementById('heroForm');
  const success = document.getElementById('heroFormSuccess');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    console.log('Hero quote request:', data);
    form.hidden = true;
    success.hidden = false;
  });
})();

// Mobile nav toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.style.display === 'flex';
    navLinks.style.display = open ? '' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '70px';
    navLinks.style.right = '20px';
    navLinks.style.background = '#fff';
    navLinks.style.padding = '20px';
    navLinks.style.borderRadius = '8px';
    navLinks.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)';
  });
}

// Service area tabs + interactive Leaflet map
(function(){
  const root = document.getElementById('areaTabs');
  const mapEl = document.getElementById('areaMap');
  if(!root || !mapEl || typeof L === 'undefined') return;

  // County bounds + cities (approx lat/lng)
  const DATA = {
    dade: {
      name: 'Miami-Dade County',
      bounds: [[25.13,-80.87],[25.98,-80.12]],
      cities: [
        ['Miami',25.7617,-80.1918],['Miami Beach',25.7907,-80.1300],
        ['Coral Gables',25.7215,-80.2684],['Coconut Grove',25.7283,-80.2434],
        ['Key Biscayne',25.6936,-80.1626],['Doral',25.8195,-80.3553],
        ['Hialeah',25.8576,-80.2781],['Aventura',25.9565,-80.1393],
        ['North Miami',25.8901,-80.1867],['North Miami Beach',25.9331,-80.1625],
        ['Sunny Isles Beach',25.9495,-80.1228],['Bal Harbour',25.8898,-80.1267],
        ['Pinecrest',25.6668,-80.3084],['Palmetto Bay',25.6215,-80.3248],
        ['Kendall',25.6793,-80.3173],['Tamiami',25.7587,-80.3984],
        ['Westchester',25.7556,-80.3428],['Cutler Bay',25.5788,-80.3468],
        ['Homestead',25.4687,-80.4776],['Florida City',25.4473,-80.4792]
      ]
    },
    broward: {
      name: 'Broward County',
      bounds: [[25.95,-80.48],[26.40,-80.03]],
      cities: [
        ['Fort Lauderdale',26.1224,-80.1373],['Hollywood',26.0112,-80.1495],
        ['Pompano Beach',26.2379,-80.1248],['Pembroke Pines',26.0031,-80.2239],
        ['Miramar',25.9860,-80.3032],['Weston',26.1003,-80.3998],
        ['Davie',26.0765,-80.2521],['Plantation',26.1275,-80.2331],
        ['Sunrise',26.1334,-80.1670],['Coral Springs',26.2710,-80.2707],
        ['Parkland',26.3106,-80.2376],['Coconut Creek',26.2514,-80.1789],
        ['Deerfield Beach',26.3184,-80.0998],['Tamarac',26.2128,-80.2497],
        ['Dania Beach',26.0512,-80.1439],['Hallandale Beach',25.9812,-80.1484],
        ['Cooper City',26.0578,-80.2717],['Southwest Ranches',26.0587,-80.3337]
      ]
    },
    palm: {
      name: 'Palm Beach County',
      bounds: [[26.32,-80.68],[27.00,-80.03]],
      cities: [
        ['West Palm Beach',26.7153,-80.0534],['Palm Beach',26.7056,-80.0364],
        ['Palm Beach Gardens',26.8234,-80.1387],['Boca Raton',26.3683,-80.1289],
        ['Delray Beach',26.4615,-80.0728],['Boynton Beach',26.5318,-80.0905],
        ['Jupiter',26.9342,-80.0942],['Wellington',26.6618,-80.2414],
        ['Royal Palm Beach',26.7084,-80.2303],['Lake Worth',26.6167,-80.0608],
        ['Greenacres',26.6276,-80.1253],['Lantana',26.5867,-80.0517],
        ['Juno Beach',26.8784,-80.0536],['Tequesta',26.9670,-80.1256],
        ['Loxahatchee',26.7059,-80.2615]
      ]
    },
    monroe: {
      name: 'Monroe County (Florida Keys)',
      bounds: [[24.54,-81.85],[25.27,-80.30]],
      cities: [
        ['Key Largo',25.0865,-80.4473],['Tavernier',25.0054,-80.5153],
        ['Islamorada',24.9243,-80.6277],['Marathon',24.7265,-81.0901],
        ['Big Pine Key',24.6697,-81.3537],['Summerland Key',24.6576,-81.4462],
        ['Cudjoe Key',24.6651,-81.5012],['Sugarloaf Key',24.6470,-81.5609],
        ['Stock Island',24.5692,-81.7354],['Key West',24.5551,-81.7800]
      ]
    }
  };

  const BLUE = '#3BA9DC', NAVY = '#0D2148';

  const map = L.map(mapEl, {
    scrollWheelZoom:false, zoomControl:true, attributionControl:true
  }).setView([25.78,-80.3], 9);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom:19,
    attribution:'© OpenStreetMap © CARTO'
  }).addTo(map);

  let activeLayer = null;
  let markers = [];

  function renderCounty(key){
    const d = DATA[key];
    if(!d) return;
    if(activeLayer) map.removeLayer(activeLayer);
    markers.forEach(m=>map.removeLayer(m));
    markers = [];

    // County highlight rectangle
    activeLayer = L.rectangle(d.bounds, {
      color:BLUE, weight:2, fillColor:BLUE, fillOpacity:.08, dashArray:'4 6'
    }).addTo(map);

    // City markers
    d.cities.forEach(([name,lat,lng])=>{
      const icon = L.divIcon({
        className:'pin',
        html:`<div style="width:14px;height:14px;border-radius:50%;background:${BLUE};border:3px solid #fff;box-shadow:0 3px 10px rgba(13,33,72,.4)"></div>`,
        iconSize:[14,14], iconAnchor:[7,7]
      });
      const m = L.marker([lat,lng], {icon}).addTo(map).bindPopup(`<b>${name}</b>`);
      m._cityName = name;
      markers.push(m);
    });

    map.flyToBounds(d.bounds, {padding:[30,30], duration:0.8});
  }

  // Tabs
  const tabs = root.querySelectorAll('.area-tab');
  const panels = root.querySelectorAll('.area-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.area;
      tabs.forEach(t => t.classList.toggle('active', t === tab));
      panels.forEach(p => p.classList.toggle('active', p.dataset.area === key));
      renderCounty(key);
    });
  });

  // City chip → flyTo + popup
  panels.forEach(panel=>{
    panel.querySelectorAll('.city-chip').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        const name = chip.textContent.trim();
        const m = markers.find(x=>x._cityName===name);
        if(m){
          map.flyTo(m.getLatLng(), 12, {duration:0.6});
          m.openPopup();
        }
      });
    });
  });

  // Initial render
  renderCounty('dade');
  setTimeout(()=>map.invalidateSize(), 300);
})();

// Video cards — tap to play with sound, tap again to pause
(function(){
  const cards = document.querySelectorAll('.video-card');
  if(!cards.length) return;

  // Autoplay muted previews when in view
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      const v = e.target.querySelector('video');
      if(!v) return;
      if(e.isIntersecting && !e.target.classList.contains('playing')){
        v.muted = true; v.play().catch(()=>{});
      } else if(!e.isIntersecting){
        v.pause();
      }
    });
  }, {threshold:0.3});

  cards.forEach(card=>{
    io.observe(card);
    const v = card.querySelector('video');
    const handle = ()=>{
      if(card.classList.contains('playing')){
        v.pause();
        card.classList.remove('playing');
      } else {
        // pause others
        cards.forEach(c=>{
          if(c!==card){
            c.classList.remove('playing');
            const ov = c.querySelector('video');
            ov.muted = true;
          }
        });
        v.muted = false;
        v.currentTime = 0;
        v.play();
        card.classList.add('playing');
      }
    };
    card.addEventListener('click', handle);
    v.addEventListener('ended', ()=>card.classList.remove('playing'));
  });
})();

// Before/After slider
(function(){
  const stage = document.getElementById('baStage');
  const dotsEl = document.getElementById('baDots');
  if(!stage) return;

  const PAIRS = 11; // Before (1)..Before (11) / After (1)..After (11)
  let active = 0;
  const slides = [];

  // Build slides — "After" shows on the LEFT, "Before" on the RIGHT,
  // and the clipped after-wrap reveals After as the handle moves right.
  for(let i=1;i<=PAIRS;i++){
    const slide = document.createElement('div');
    slide.className = 'ba-slide' + (i===1?' active':'');
    slide.innerHTML = `
      <img class="ba-img ba-before-img" src="Before and Afters/Before (${i}).png" alt="Before ${i}"/>
      <div class="ba-after-wrap">
        <img class="ba-img" src="Before and Afters/After (${i}).png" alt="After ${i}"/>
      </div>
      <span class="ba-label before">BEFORE</span>
      <span class="ba-label after">AFTER</span>
      <div class="ba-handle" role="slider" aria-label="Reveal"></div>
    `;
    stage.appendChild(slide);
    slides.push(slide);

    const dot = document.createElement('button');
    dot.className = 'ba-dot' + (i===1?' active':'');
    dot.addEventListener('click', ()=>go(i-1));
    dotsEl.appendChild(dot);
  }

  function go(idx){
    active = (idx + PAIRS) % PAIRS;
    slides.forEach((s,i)=>s.classList.toggle('active', i===active));
    dotsEl.querySelectorAll('.ba-dot').forEach((d,i)=>d.classList.toggle('active', i===active));
  }

  document.querySelector('.ba-prev').addEventListener('click', ()=>go(active-1));
  document.querySelector('.ba-next').addEventListener('click', ()=>go(active+1));

  // Drag logic — applies to whichever slide is active
  let dragging = false;
  function setPos(clientX){
    const slide = slides[active];
    const rect = slide.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    slide.querySelector('.ba-after-wrap').style.clipPath = `inset(0 ${100-pct}% 0 0)`;
    slide.querySelector('.ba-handle').style.left = pct + '%';
  }
  function start(e){
    dragging = true;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setPos(x);
    e.preventDefault();
  }
  function move(e){
    if(!dragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setPos(x);
  }
  function end(){ dragging = false; }

  stage.addEventListener('mousedown', start);
  stage.addEventListener('touchstart', start, {passive:false});
  window.addEventListener('mousemove', move);
  window.addEventListener('touchmove', move, {passive:false});
  window.addEventListener('mouseup', end);
  window.addEventListener('touchend', end);
})();

// Scroll reveal — fade-up with stagger
(function(){
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        reveal.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Auto-apply .reveal to key elements
  const targets = document.querySelectorAll(
    '.section-title, .eyebrow:not(.hero-eyebrow-text), .about-copy > *, .about-media, ' +
    '.service-card, .process-step, .test-card, .county, ' +
    '.contact-copy > *, .contact-form, .faq-grid > *, .cta-inner > *, ' +
    '.video-card, .counties, .area-tabs, .area-map-wrap, ' +
    '.hero-eyebrow, .hero-title, .hero-sub, .hero-trust, .hero-regions, .hero-quote'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger siblings inside the same parent
    const siblingIndex = Array.from(el.parentElement?.children || []).indexOf(el);
    const staggerClass = `delay-${Math.min((siblingIndex % 5) + 1, 5)}`;
    el.classList.add(staggerClass);
    reveal.observe(el);
  });
})();

// Primary button water ripple
(function(){
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-primary');
    if(!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
})();

// Parallax on hero background (subtle)
(function(){
  const bg = document.querySelector('.hero-bg');
  const spray = document.querySelectorAll('.hero-spray');
  if(!bg) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if(ticking) return;
    window.requestAnimationFrame(() => {
      const y = window.scrollY;
      if(y < window.innerHeight){
        bg.style.transform = `translateY(${y * 0.25}px) scale(1.05)`;
        spray.forEach((s, i) => {
          s.style.transform = `translateY(${y * (i === 0 ? 0.15 : -0.1)}px)`;
        });
      }
      ticking = false;
    });
    ticking = true;
  }, {passive:true});
})();
