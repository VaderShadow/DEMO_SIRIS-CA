// ======================== STATE ========================
let selectedCountry = null;
let sourceFilter = 'all';
let activeHorizon = '24h';
// ======================== FUNCTIONS ========================
function project(lat, lon) {
  const x = ((lon + 96) / 30) * 480;
  const y = ((21 - lat) / 15) * 340;
  return [x, y];
}

function updateClock() {
  const now = new Date();
  document.getElementById('clock-time').textContent = now.toLocaleTimeString('es-GT',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  document.getElementById('clock-date').textContent = now.toLocaleDateString('es-GT',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
}

function renderMetrics() {
  const bar = document.getElementById('metrics-bar');
  const src = selectedCountry ? countries.filter(c=>c.id===selectedCountry) : countries;
  const t = src.reduce((a,c)=>({ f:a.f+c.fallecidos, h:a.h+c.heridos, fam:a.fam+c.familias, ev:a.ev+c.evacuados, e:a.e+c.events }),{f:0,h:0,fam:0,ev:0,e:0});
  const prefix = selectedCountry ? countries.find(c=>c.id===selectedCountry).name+' — ' : 'Regional — ';
  bar.innerHTML = `
    <div class="metric-card mc-red"><div class="icon">💀</div><div><div class="val">${t.f}</div><div class="lbl">Fallecidos</div></div></div>
    <div class="metric-card mc-orange"><div class="icon">🏥</div><div><div class="val">${t.h}</div><div class="lbl">Heridos</div></div></div>
    <div class="metric-card mc-yellow"><div class="icon">👨‍👩‍👧‍👦</div><div><div class="val">${t.fam.toLocaleString()}</div><div class="lbl">Familias Afectadas</div></div></div>
    <div class="metric-card mc-blue"><div class="icon">🚸</div><div><div class="val">${t.ev.toLocaleString()}</div><div class="lbl">Evacuados</div></div></div>
    <div class="metric-card mc-purple"><div class="icon">📡</div><div><div class="val">${t.e}</div><div class="lbl">Eventos Activos</div></div></div>
    <div class="filter-group">
      <button class="filter-btn ${sourceFilter==='all'?'active':''}" onclick="setSource('all')">Todas</button>
      <button class="filter-btn ${sourceFilter==='oficial'?'active':''}" onclick="setSource('oficial')">🏛 Oficial</button>
      <button class="filter-btn ${sourceFilter==='sensor'?'active':''}" onclick="setSource('sensor')">📡 Sensor</button>
      <button class="filter-btn ${sourceFilter==='medio'?'active':''}" onclick="setSource('medio')">📰 Medio</button>
    </div>
  `;
}

function renderMap() {
  const svg = document.getElementById('regionMap');
  let html = `<defs>
    <radialGradient id="gr"><stop offset="0%" stop-color="#3b82f6" stop-opacity="0.06"/><stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/></radialGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`;
  html += `<rect width="480" height="340" fill="url(#gr)" rx="8"/>`;
  // Grid
  for(let i=0;i<7;i++) html += `<line x1="0" y1="${i*57}" x2="480" y2="${i*57}" stroke="rgba(255,255,255,0.02)"/>`;
  for(let i=0;i<9;i++) html += `<line x1="${i*60}" y1="0" x2="${i*60}" y2="340" stroke="rgba(255,255,255,0.02)"/>`;
  // Connections
  connections.forEach(([a,b])=>{
    const ca=countries.find(c=>c.id===a), cb=countries.find(c=>c.id===b);
    const [x1,y1]=project(ca.lat,ca.lon), [x2,y2]=project(cb.lat,cb.lon);
    html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(59,130,246,0.1)" stroke-width="1" stroke-dasharray="4,4"/>`;
  });
  // Storm path
  html += `<path d="M 400 30 Q 340 80 290 120 Q 240 160 200 190" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,4" opacity="0.5"/>`;
  html += `<text x="405" y="26" fill="#ef4444" font-size="9" font-weight="700" font-family="Inter,sans-serif">TT Andrea →</text>`;
  // Country nodes
  countries.forEach(c => {
    const [cx,cy] = project(c.lat, c.lon);
    const col = levelColors[c.level];
    const sel = selectedCountry === c.id;
    const r = sel ? 22 : 17;
    html += `<g class="country-node" onclick="selectCountry('${c.id}')">`;
    html += `<circle cx="${cx}" cy="${cy}" r="${r+16}" fill="${col}" opacity="0.08"/>`;
    html += `<circle cx="${cx}" cy="${cy}" r="${r+8}" fill="${col}" opacity="0.12"/>`;
    html += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" opacity="${sel?1:0.85}" filter="url(#glow)" class="node-circle" stroke="${sel?'#fff':'none'}" stroke-width="${sel?2.5:0}">`;
    if(c.level==='rojo') html += `<animate attributeName="r" values="${r};${r+3};${r}" dur="2s" repeatCount="indefinite"/>`;
    html += `</circle>`;
    html += `<text x="${cx}" y="${cy+1}" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="10" font-weight="800" font-family="Inter,sans-serif">${c.abbr}</text>`;
    html += `<text x="${cx}" y="${cy+r+13}" text-anchor="middle" fill="#94a3b8" font-size="8" font-family="Inter,sans-serif">${c.name}</text>`;
    html += `<text x="${cx}" y="${cy-r-7}" text-anchor="middle" fill="${col}" font-size="8" font-weight="700" font-family="Inter,sans-serif">${c.events} eventos</text>`;
    html += `</g>`;
  });
  svg.innerHTML = html;
}

function renderCountryGrid() {
  const grid = document.getElementById('countryGrid');
  const sorted = [...countries].sort((a,b)=>levelOrder[a.level]-levelOrder[b.level]);
  grid.innerHTML = sorted.map(c => `
    <div class="country-item ${selectedCountry===c.id?'selected':''}" onclick="selectCountry('${c.id}')">
      <div class="country-dot" style="background:${levelColors[c.level]}"></div>
      <div style="flex:1;min-width:0;">
        <div class="name">${c.name}</div>
        <div class="entity">${c.entity}</div>
      </div>
      <div class="count" style="color:${levelColors[c.level]}">${c.events}</div>
    </div>
  `).join('');
}

function renderTimeline() {
  const el = document.getElementById('timeline');
  const max = Math.max(...timelineData.map(d=>d.v));
  el.innerHTML = timelineData.map(d => {
    const h = (d.v/max)*45;
    const bg = d.v>12 ? 'linear-gradient(to top,#ef4444,#f97316)' : d.v>6 ? 'linear-gradient(to top,#f97316,#eab308)' : 'linear-gradient(to top,#22c55e,#3b82f6)';
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;"><div class="tbar" style="height:${h}px;background:${bg};opacity:0.8;width:100%;"></div><div class="tbar-label">${d.t}</div></div>`;
  }).join('');
}

function renderEvents() {
  const el = document.getElementById('tab-eventos');
  let filtered = events.filter(e => {
    if(sourceFilter!=='all' && e.source!==sourceFilter) return false;
    if(selectedCountry) {
      const cn = countries.find(c=>c.id===selectedCountry)?.name;
      if(!e.country.includes(cn) && e.country!=='Regional') return false;
    }
    return true;
  });
  document.getElementById('eventCount').textContent = filtered.length;
  el.innerHTML = filtered.map(e => `
    <div class="event-card severity-${e.severity}" onclick="showEventDetail(${e.id})">
      <div class="event-top">
        <div class="event-info">
          <span class="event-icon">${e.icon}</span>
          <div>
            <div class="event-name">${e.name}</div>
            <div class="event-meta">${e.type} • ${e.country}</div>
          </div>
        </div>
        <div class="event-right">
          <span class="source-badge src-${e.source}">${e.source.toUpperCase()}</span>
          <span class="event-time">${e.time}</span>
        </div>
      </div>
    </div>
  `).join('') || '<div style="text-align:center;padding:30px;color:var(--text-muted);font-size:12px;">No hay eventos con los filtros seleccionados</div>';
}

function renderPredictive() {
  const el = document.getElementById('tab-predictivo');
  const p = predictiveHorizons[activeHorizon];
  const col = p.prob>70?'#ef4444':p.prob>50?'#f97316':'#eab308';
  const dash = (p.prob/100)*100;
  el.innerHTML = `
    <div class="horizon-btns">
      ${['24h','48h','72h'].map(h=>`<button class="horizon-btn ${activeHorizon===h?'active':''}" onclick="setHorizon('${h}')"><div class="h-val">${h}</div><div class="h-lbl">Horizonte</div></button>`).join('')}
    </div>
    <div class="pred-card">
      <div class="pred-top">
        <div class="gauge-wrap">
          <svg viewBox="0 0 36 36" style="transform:rotate(-90deg)">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2.5"/>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="${col}" stroke-width="2.5" stroke-dasharray="${dash} ${100-dash}" stroke-linecap="round">
              <animate attributeName="stroke-dasharray" from="0 100" to="${dash} ${100-dash}" dur="1s" fill="freeze"/>
            </circle>
          </svg>
          <div class="gauge-val">${p.prob}%</div>
        </div>
        <div>
          <div class="pred-title">Probabilidad de Impacto — ${activeHorizon} <span style="background:${col}22;color:${col};font-size:8px;padding:2px 6px;border-radius:4px;font-weight:800;margin-left:6px;">${p.risk}</span></div>
          <div class="pred-desc">${p.desc}</div>
        </div>
      </div>
      <div class="threat-tags">${p.threats.map(t=>`<span class="threat-tag">${t}</span>`).join('')}</div>
    </div>
    <div class="models-card">
      <div class="model-title">MODELOS ACTIVOS</div>
      ${['Modelo Hidrológico — Cuencas CA (CRRH)','Trayectoria Ciclónica — NHC / CEPREDENAC','Estabilidad de Laderas — INSIVUMEH','Pronóstico Meteorológico — WRF Regional'].map(m=>`
        <div class="model-row"><div class="model-dot"></div><span>${m}</span></div>
      `).join('')}
    </div>
    <div style="margin-top:10px;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:12px;">
      <div style="font-size:9px;color:var(--text-muted);font-weight:700;margin-bottom:8px;">PRONÓSTICO DE ACUMULADOS DE LLUVIA (mm) — ${activeHorizon}</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
        ${countries.slice(0,8).map(c=>{
          const rain = Math.round(Math.random()*150+20);
          const rc = rain>120?'#ef4444':rain>80?'#f97316':rain>40?'#eab308':'#22c55e';
          return `<div style="text-align:center;padding:6px;background:${rc}11;border:1px solid ${rc}33;border-radius:6px;"><div style="font-size:14px;font-weight:800;color:${rc}">${rain}</div><div style="font-size:8px;color:var(--text-secondary)">${c.abbr}</div></div>`;
        }).join('')}
      </div>
    </div>
  `;
}

function renderRecommendations() {
  document.getElementById('recList').innerHTML = recommendations.map(r=>`
    <div class="rec-card pri-${r.css}">
      <span class="rec-badge rb-${r.css}">${r.priority}</span>
      <div class="rec-text">${r.text}</div>
    </div>
  `).join('');
}

function renderActions() {
  document.getElementById('actionBtns').innerHTML = actions.map(a=>`
    <button class="action-btn" style="color:${a.color};border-color:${a.color}33;background:${a.color}08;" onclick="showActionModal('${a.label}')">
      <span class="act-icon">${a.icon}</span> ${a.label}
    </button>
  `).join('');
}

function renderSysStatus() {
  document.getElementById('sysRows').innerHTML = sysStatus.map(s=>`
    <div class="sys-row"><span class="sys-label">${s.label}</span><div class="sys-val"><div class="dot-ok"></div><span style="color:#86efac">${s.val}</span></div></div>
  `).join('');
}

// ======================== INTERACTIONS ========================
function selectCountry(id) {
  selectedCountry = selectedCountry === id ? null : id;
  document.getElementById('clearFilter').style.display = selectedCountry ? 'block' : 'none';
  renderAll();
}
function clearCountryFilter() { selectedCountry = null; document.getElementById('clearFilter').style.display='none'; renderAll(); }
function setSource(s) { sourceFilter = s; renderMetrics(); renderEvents(); }
function setHorizon(h) { activeHorizon = h; renderPredictive(); }

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
  document.getElementById('tab-eventos').style.display = tab==='eventos'?'block':'none';
  document.getElementById('tab-predictivo').style.display = tab==='predictivo'?'block':'none';
  if(tab==='predictivo') renderPredictive();
}

function showEventDetail(id) {
  const e = events.find(ev=>ev.id===id);
  if(!e) return;
  document.getElementById('modalContent').innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
      <span style="font-size:30px">${e.icon}</span>
      <div><h3 style="margin:0;font-size:18px;">${e.name}</h3><div style="color:var(--text-secondary);font-size:12px;">${e.type}</div></div>
      <span class="source-badge src-${e.source}" style="margin-left:auto;font-size:9px;">${e.source.toUpperCase()}</span>
    </div>
    <div class="detail-row"><span class="dlabel">Severidad</span><span class="dval" style="color:${levelColors[e.severity]}">${e.severity.toUpperCase()}</span></div>
    <div class="detail-row"><span class="dlabel">País / Región</span><span class="dval">${e.country}</span></div>
    <div class="detail-row"><span class="dlabel">Fecha / Hora</span><span class="dval">${e.time}</span></div>
    <div class="detail-row"><span class="dlabel">Fuente</span><span class="dval">${e.source.charAt(0).toUpperCase()+e.source.slice(1)}</span></div>
    <div style="margin-top:14px;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid var(--border);">
      <div style="font-size:9px;color:var(--text-muted);font-weight:700;margin-bottom:6px;">DETALLE TÉCNICO</div>
      <div style="font-size:12px;color:var(--text-secondary);line-height:1.6;">${e.detail}</div>
    </div>
  `;
  document.getElementById('detailModal').classList.add('show');
}

function showActionModal(label) {
  document.getElementById('modalContent').innerHTML = `
    <h3 style="margin-bottom:14px;">⚡ ${label}</h3>
    <div style="padding:12px;background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.15);border-radius:8px;margin-bottom:14px;">
      <div style="font-size:12px;color:var(--text-secondary);line-height:1.6;">Acción "<strong>${label}</strong>" simulada exitosamente. En un entorno de producción, esto activaría el protocolo correspondiente y notificaría a los entes rectores nacionales involucrados.</div>
    </div>
    <div style="display:flex;gap:8px;">
      <button onclick="closeModal()" style="flex:1;padding:10px;border-radius:8px;background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);color:#60a5fa;font-weight:700;cursor:pointer;font-family:inherit;">Confirmar</button>
      <button onclick="closeModal()" style="flex:1;padding:10px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid var(--border);color:var(--text-secondary);cursor:pointer;font-family:inherit;">Cancelar</button>
    </div>
  `;
  document.getElementById('detailModal').classList.add('show');
}

function closeModal() { document.getElementById('detailModal').classList.remove('show'); }
document.getElementById('detailModal').addEventListener('click', function(e){ if(e.target===this) closeModal(); });

// ======================== RENDER ========================
function renderAll() {
  renderMetrics(); renderMap(); renderCountryGrid(); renderTimeline(); renderEvents(); renderRecommendations(); renderActions(); renderSysStatus();
}

updateClock();
setInterval(updateClock, 1000);
renderAll();

// Simulate live updates
setInterval(()=>{
  const idx = Math.floor(Math.random()*countries.length);
  const c = countries[idx];
  if(Math.random()>0.7) {
    c.events += 1;
    c.familias += Math.floor(Math.random()*20);
    c.evacuados += Math.floor(Math.random()*50);
    renderMetrics(); renderMap(); renderCountryGrid();
  }
}, 8000);