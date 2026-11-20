/* GENERATED from the approved prototype by work/rts/mask-redesign/live/build_order_mask.py – change the
   prototype or the build script, not this file. */
function startMask(LIVE){

/* ---------------- data: the transports of this link (built by RtsV2Map.fromLink in app.js) ---------------- */
const SLOTS=RtsV2Map.SLOTS;
const REASONS=LIVE.reasons;
const transit={};                       // transit times are not part of the link: the arrival date is entered by the provider
let orders=LIVE.orders;
const PLANTS={}, DESTS={};
orders.forEach(o=>{PLANTS[o.plant]=o.plant; DESTS[o.dest]=o.dest;});
const addDays=(iso,k)=>{const t=new Date(iso+'T12:00:00');t.setDate(t.getDate()+k);return t.toISOString().slice(0,10)};
const wkd=(iso,loc,n)=>{const d=new Date(iso+'T12:00:00'); return isNaN(d)?'':d.toLocaleDateString(loc,{weekday:'short'}).replace('.','').slice(0,n)};
const DAYS=[...new Set(orders.map(o=>o.date).filter(Boolean))].sort().map(d=>({d,de:wkd(d,'de-DE',2),en:wkd(d,'en-GB',3)}));
orders.sort((a,b)=>a.date.localeCompare(b.date)||a.plant.localeCompare(b.plant)||a.id.localeCompare(b.id));
orders.forEach(o=>o.base=JSON.parse(JSON.stringify(o.conf)));


/* ---------------- i18n ---------------- */
let lang='de';
const T={
 de:{fWeek:'Kalenderwoche',fSent:'Bestellung versendet',fSentV:'Mi 07.10.',fSentT:'11:00 Uhr',fDue:'Bestätigen bis',fDueV:'Do 08.10.',fDueT:'09:30 Uhr',fDueNote:'danach automatisch „wie bestellt“',sentLine:'Bestellung versendet Mi 07.10. · 11:00',autoNote:'Nicht bestätigte Transporte gelten am Do 08.10. um 09:30 automatisch als wie bestellt bestätigt (Status 12.1).',suppEyebrow:'Dienstleister',title:'Waggonbestellung',brandsub:'Rail Transport System · BMW Group',dlLabel:'Bestätigung bis',h1:'KW 42 · 12.–18.10.2026',
   lead:'Hier sehen Sie nur Ihre eigenen Transporte. Zeiten direkt in der Tabelle ergänzen – wie in Excel – und einzeln oder gesammelt bestätigen.',
   vList:'Liste',vWeek:'Woche',vTable:'Tabelle',fDay:'Tag',fPlant:'Werk',fDest:'Senke',reset:'Filter zurücksetzen',asOrdered:'Wie bestellt bestätigen',bulk:'Sammelbearbeitung',
   clearSel:'Auswahl aufheben',selOpen:'Alle offenen auswählen',bulkTitle:'Sammelbearbeitung',cancel:'Abbrechen',all:'Alle',
   sOpen:'11 · Offen',sDraft:'Entwurf (nicht gesendet)',sSent:'12 / 13 · Bestätigt',sDev:'12.2 · Mit Abweichung',wagonsKpi:'Wagen bestätigt',
   ordered:'Bestellt',confirmed:'Bestätigt',departure:'Abfahrt Werk',arrival:'Ankunft Senke',missing:'fehlt noch',
   edit:'Details',save:'Speichern',okShort:'Wie bestellt',sendDrafts:n=>`Entwürfe senden (${n})`,selected:n=>`${n} ausgewählt`,
   info:(o,d,s)=>`<b>${o}</b> offen · <b>${d}</b> Entwurf · <b>${s}</b> bestätigt`,saved:t=>`Entwurf gespeichert · ${t}`,
   plantCol:'Werk (Abgang)',destCol:'Senke (Ziel)',more:'Bemerkung',
   fWagons:'Bestätigte Wagen',fProfile:'Wagenprofil',fType:'Wagentyp',fTdate:'Transportdatum',fArr:'Ankunft am Werk (2 h)',fDepDate:'Abfahrt Datum',fDepTime:'Abfahrt Uhrzeit',
   fDelDate:'Ankunft Senke Datum',fDelSlot:'Ankunft Senke (2 h)',fReason:'Grund der Abweichung',fComment:'Kommentar',
   hDep:'Abgang',hDest:'Senke',hDev:'Abweichung',devNote:'Wagenanzahl oder Datum weicht von der Bestellung ab – bitte Grund und Kommentar angeben.',
   noDev:'Keine Abweichung zur Bestellung.',reqD:'Pflicht bei Abweichung',chooseSlot:'– Slot wählen –',chooseReason:'– Grund wählen –',
   errDel:'Ankunft an der Senke darf nicht vor der Abfahrt liegen.',errDelMissing:'Ankunftsdatum an der Senke fehlt.',errReason:'Grund ist bei Abweichung Pflicht.',errComment:'Kommentar ist bei Abweichung Pflicht.',errDep:'Abfahrt Datum und Uhrzeit fehlen.',
   reset1:'Zurücksetzen',saveSend:'Speichern & senden',saveDraft:'Als Entwurf',bulkSub:n=>`${n} Transporte ausgewählt – nur angehakte Felder werden geändert.`,
   bWagons:'Wagenanzahl',bSet:'Setzen auf',bMinus:'Abziehen',bProfile:'Wagenprofil',bType:'Wagentyp',bArr:'Ankunft am Werk',bDep:'Abfahrt Uhrzeit',bDepSame:'Abfahrt am Transporttag',
   bDel:'Ankunft Senke',bDelOff:'Tage nach Abfahrt',bReason:'Grund der Abweichung',bComment:'Kommentar',apply:n=>`Auf ${n} übernehmen`,
   toastSent:n=>`${n} Bestätigung${n>1?'en':''} gesendet`,toastDraft:n=>`${n} Transport${n>1?'e':''} als Entwurf geändert`,toastBlocked:n=>`${n} Transport${n>1?'e':''} unvollständig – bitte prüfen`,
   empty:'Keine Transporte für diese Filter.',legend:['Offen','Entwurf','Bestätigt','Mit Abweichung'],wDay:'Tag',wRoute:'Route',week:'Woche',
   deviation:'Abweichung',sentAt:'gesendet',tHint:'<kbd>Tab</kbd> nächste Zelle · <kbd>Enter</kbd> Zeile darunter · aus Excel einfügen möglich · <kbd>⇊</kbd> Wert für andere Transporte übernehmen',tExport:'Als Excel exportieren',tSendSel:'Markierte senden',tPasted:n=>`${n} Werte aus Excel eingefügt`,tFilled:(c,n)=>`${c} auf ${n} Zeilen übernommen`,tNeedSel:'Erst Zeilen markieren',tStatus:'Status',tDay:'Tag',tRoute:'WP · Route',tOrd:'Bestellt',countdown:h=>`noch ${h}`},
 en:{fWeek:'Calendar week',fSent:'Order sent',fSentV:'Wed 07.10.',fSentT:'11:00',fDue:'Confirm by',fDueV:'Thu 08.10.',fDueT:'09:30',fDueNote:'then automatically “as ordered”',sentLine:'Order sent Wed 07.10. · 11:00',autoNote:'Transports not confirmed by Thu 08.10. 09:30 automatically count as confirmed as ordered (status 12.1).',suppEyebrow:'Service provider',title:'Wagon order',brandsub:'Rail Transport System · BMW Group',dlLabel:'Confirm by',h1:'CW 42 · 12–18 Oct 2026',
   lead:'You only see your own transports. Fill in the times right in the table – like in Excel – and confirm one by one or together.',
   vList:'List',vWeek:'Week',vTable:'Table',fDay:'Day',fPlant:'Plant',fDest:'Destination',reset:'Reset filters',asOrdered:'Confirm as ordered',bulk:'Bulk edit',
   clearSel:'Clear selection',selOpen:'Select all open',bulkTitle:'Bulk edit',cancel:'Cancel',all:'All',
   sOpen:'11 · Open',sDraft:'Draft (not sent)',sSent:'12 / 13 · Confirmed',sDev:'12.2 · With deviation',wagonsKpi:'Wagons confirmed',
   ordered:'Ordered',confirmed:'Confirmed',departure:'Departure plant',arrival:'Arrival destination',missing:'missing',
   edit:'Details',save:'Save',okShort:'As ordered',sendDrafts:n=>`Send drafts (${n})`,selected:n=>`${n} selected`,
   info:(o,d,s)=>`<b>${o}</b> open · <b>${d}</b> draft · <b>${s}</b> confirmed`,saved:t=>`Draft saved · ${t}`,
   plantCol:'Plant (origin)',destCol:'Destination',more:'Note',
   fWagons:'Confirmed wagons',fProfile:'Wagon profile',fType:'Wagon type',fTdate:'Transport date',fArr:'Arrival at plant (2 h)',fDepDate:'Departure date',fDepTime:'Departure time',
   fDelDate:'Arrival destination date',fDelSlot:'Arrival destination (2 h)',fReason:'Reason for deviation',fComment:'Comment',
   hDep:'Origin',hDest:'Destination',hDev:'Deviation',devNote:'Wagon count or date differs from the order – please give a reason and a comment.',
   noDev:'No deviation from the order.',reqD:'Required for a deviation',chooseSlot:'– choose slot –',chooseReason:'– choose reason –',
   errDel:'Arrival at the destination cannot be before departure.',errDelMissing:'Arrival date at the destination is missing.',errReason:'A reason is required for a deviation.',errComment:'A comment is required for a deviation.',errDep:'Departure date and time are missing.',
   reset1:'Reset',saveSend:'Save & send',saveDraft:'As draft',bulkSub:n=>`${n} transports selected – only ticked fields are changed.`,
   bWagons:'Wagon count',bSet:'Set to',bMinus:'Subtract',bProfile:'Wagon profile',bType:'Wagon type',bArr:'Arrival at plant',bDep:'Departure time',bDepSame:'Departure on the transport day',
   bDel:'Arrival destination',bDelOff:'days after departure',bReason:'Reason for deviation',bComment:'Comment',apply:n=>`Apply to ${n}`,
   toastSent:n=>`${n} confirmation${n>1?'s':''} sent`,toastDraft:n=>`${n} transport${n>1?'s':''} changed as draft`,toastBlocked:n=>`${n} transport${n>1?'s':''} incomplete – please check`,
   empty:'No transports for these filters.',legend:['Open','Draft','Confirmed','With deviation'],wDay:'Day',wRoute:'Route',week:'Week',
   deviation:'Deviation',sentAt:'sent',tHint:'<kbd>Tab</kbd> next cell · <kbd>Enter</kbd> row below · paste from Excel · <kbd>⇊</kbd> apply value to other transports',tExport:'Export to Excel',tSendSel:'Send selected',tPasted:n=>`${n} values pasted from Excel`,tFilled:(c,n)=>`${c} applied to ${n} rows`,tNeedSel:'Select rows first',tStatus:'Status',tDay:'Day',tRoute:'WP · Route',tOrd:'Ordered',countdown:h=>`${h} left`}
};
const t=k=>T[lang][k];

/* ---------------- state ---------------- */
let view='table', fDay='all', fPlant='all', fDest='all', fStatus='all', q='', selected=new Set(), openRow=null, lastSaved=null;
const $=s=>document.querySelector(s);
const fmt=iso=>{if(!iso)return'';const [y,m,d]=iso.split('-');return `${d}.${m}.`};
const dayOf=iso=>DAYS.find(x=>x.d===iso)||{de:new Date(iso+'T12:00').toLocaleDateString('de-DE',{weekday:'short'}).slice(0,2),en:new Date(iso+'T12:00').toLocaleDateString('en-GB',{weekday:'short'})};
const devList=o=>{const c=o.conf, L=lang==='de', out=[];
  if(c.wagons!==o.ordered) out.push(L?`${c.wagons} statt ${o.ordered} Wagen`:`${c.wagons} instead of ${o.ordered} wagons`);
  if(o.profile&&c.profile!==o.profile) out.push(L?`${c.profile} statt ${o.profile}`:`${c.profile} instead of ${o.profile}`);
  if(o.type&&c.type!==o.type) out.push(L?`${c.type} statt ${o.type}`:`${c.type} instead of ${o.type}`);
  if(c.depDate&&c.depDate!==o.date){const a=dayOf(c.depDate)[lang], b=dayOf(o.date)[lang]; out.push(L?`Abfahrt ${a} ${fmt(c.depDate)} statt ${b} ${fmt(o.date)}`:`departure ${a} ${fmt(c.depDate)} instead of ${b} ${fmt(o.date)}`);}
  return out;};
const isDev=o=>devList(o).length>0;
// reason + comment line (required) only when FEWER wagons are confirmed than ordered – profile/type/date changes stay
// highlighted and still make it 12.2, but need no reason
const isUnder=o=>o.conf.wagons<o.ordered;
const stateOf=o=>o.status==='sent'?(isDev(o)?'dev':'ok'):o.status==='draft'?'draft':'open';
// what RTS shows for this transport: before the provider answers it is 11; after sending 12 or 12.2 (edited);
// later BMW moves it on (13 checked, 12.3 declined) — the mask shows that too
const RTS_ST={'11':{de:'Bestellung versendet',en:'Order sent'},'12':{de:'Bestätigung erfolgt',en:'Confirmed'},'12.1':{de:'Bestätigt durch keine Antwort',en:'Confirmed by no reply'},
  '12.2':{de:'Bestätigung editiert',en:'Confirmation edited'},'12.3':{de:'Abgelehnt, in Prüfung',en:'Declined, in review'},'13':{de:'Bestätigung geprüft',en:'Confirmation checked'}};
const rtsCode=o=>o.status==='sent'?(o.lockedOnOpen?(o.rts||''):(o.rts||RtsV2Map.statusAfterSend(o))):'11';

/* Transports that are no longer in status 11 are locked when the link is opened. The state comes from RTS
   (flow "Transportstatus lesen", applied in app.js). Nothing is remembered in the browser. */
let lockedOnOpen=LIVE.locked||0, lastSentAt='';
const fmtAt=v=>{const d=new Date(v); return v&&!isNaN(d)?d.toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(',',''):'';};
orders.forEach(o=>{ if(o.lockedOnOpen&&o.confirmedAt){ o.sentAt=fmtAt(o.confirmedAt); } });
function saveSent(){}
function renderLock(){const el=document.getElementById('lockBar'); if(!el) return; const n=lockedOnOpen; el.hidden=!n; if(!n) return; const L=lang==='de';
  el.innerHTML=`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg><span>${L?`<b>${n} ${n===1?'Transport':'Transporte'}</b> aus diesem Link ${n===1?'ist':'sind'} in RTS bereits bearbeitet und ${n===1?'ist':'sind'} gesperrt. Änderungen daran bitte an die BMW Logistik melden.`
    :`<b>${n} transport${n===1?'':'s'}</b> from this link ${n===1?'has':'have'} already been processed in RTS and ${n===1?'is':'are'} locked. Please report changes to BMW Logistics.`}</span>`;}
function persist(){
  lastSaved=null;
  saveSent();
}

function validate(o){
  const e={}, c=o.conf;
  if(!c.profile||!c.type) e.pt=lang==='de'?'Wagenprofil und Wagentyp auswählen.':'Choose wagon profile and type.';
  if(!c.depDate||!c.depTime) e.dep=t('errDep');
  if(!c.delDate) e.del=t('errDelMissing');
  else if(c.delDate&&c.depDate&&c.delDate<c.depDate) e.del=t('errDel');
  else if(c.delDate&&c.delDate<c.date) e.del=t('errDel');
  if(isUnder(o)){ if(!c.reason) e.reason=t('errReason'); if(!c.comment.trim()) e.comment=t('errComment'); }
  return e;
}

/* ---------------- render ---------------- */
function filtered(){
  return orders.filter(o=>(fDay==='all'||o.date===fDay)&&(fPlant==='all'||o.plant===fPlant)&&(fDest==='all'||o.dest===fDest)
    &&(fStatus==='all'||stateOf(o)===fStatus)
    &&(!q||(o.id+' '+o.plant+' '+PLANTS[o.plant]+' '+o.dest+' '+DESTS[o.dest]).toLowerCase().includes(q.toLowerCase())));
}
function renderSummary(){
  const c={open:0,draft:0,ok:0,dev:0}; orders.forEach(o=>c[stateOf(o)]++);
  const ordered=orders.reduce((a,o)=>a+o.ordered,0), conf=orders.filter(o=>o.status==='sent').reduce((a,o)=>a+o.conf.wagons,0);
  const tile=(k,lbl,col,v)=>`<button class="tile" data-st="${k}" aria-pressed="${fStatus===k}"><span class="k"><span class="sw" style="background:${col}"></span>${lbl}</span><span class="v num">${v}</span></button>`;
  $('#summary').innerHTML=tile('open',t('sOpen'),'var(--muted)',c.open)+tile('draft',t('sDraft'),'var(--draft)',c.draft)+tile('ok',t('sSent'),'var(--ok)',c.ok)+tile('dev',t('sDev'),'var(--warn)',c.dev)
   +`<div class="tile"><span class="k">${t('wagonsKpi')}</span><span class="v num">${conf} <span style="font-size:14px;color:var(--muted)">/ ${ordered}</span></span><span class="bar"><i style="width:${Math.round(conf/ordered*100)}%"></i></span></div>`;
  document.querySelectorAll('#summary button.tile').forEach(b=>b.onclick=()=>{fStatus=fStatus===b.dataset.st?'all':b.dataset.st;render();});
}
function renderFilters(){
  const cnt=d=>orders.filter(o=>o.date===d).length;
  $('#dayChips').innerHTML=`<button class="chip" data-d="all" aria-pressed="${fDay==='all'}">${t('all')}</button>`+DAYS.filter(d=>cnt(d.d)).map(d=>`<button class="chip" data-d="${d.d}" aria-pressed="${fDay===d.d}">${d[lang]} <span class="c">${cnt(d.d)}</span></button>`).join('');
  document.querySelectorAll('#dayChips .chip').forEach(b=>b.onclick=()=>{fDay=b.dataset.d;render();});
  const opt=(obj,cur)=>`<option value="all">${t('all')}</option>`+Object.keys(obj).filter(k=>orders.some(o=>o.plant===k||o.dest===k)).map(k=>`<option value="${k}" ${cur===k?'selected':''}>${obj[k]}</option>`).join('');
  $('#fPlant').innerHTML=opt(PLANTS,fPlant); $('#fDest').innerHTML=opt(DESTS,fDest);
}
function pill(o){const code=rtsCode(o), cls={'11':'p-open','12':'p-ok','12.1':'p-ok','12.2':'p-dev','12.3':'p-bad','13':'p-done'}[code];
  if(o.status==='draft') return `<span class="pill p-draft" title="RTS-Status 11 · ${lang==='de'?'noch nicht gesendet':'not sent yet'}"><i></i>${lang==='de'?'Entwurf':'Draft'}</span>`;
  const name=RTS_ST[code]?RTS_ST[code][lang]:(o.rtsLabel||'').replace(/^[\d.]+\s*[-·]?\s*/,''); return `<span class="pill ${cls||'p-done'}" title="RTS-Status ${code}"><i></i>${[code,name].filter(Boolean).join(' · ')}</span>`;}
function whenDep(o){const c=o.conf;return c.depDate&&c.depTime?`<b>${dayOf(c.depDate)[lang]} ${fmt(c.depDate)}</b> · ${c.depTime}<div class="muted">${c.arrSlot?(lang==='de'?'Wagen da ':'Wagons in ')+c.arrSlot:''}</div>`:`<span class="missing">${t('missing')}</span>`;}
function whenDel(o){const c=o.conf;return c.delDate?`<b>${dayOf(c.delDate)[lang]} ${fmt(c.delDate)}</b>${c.delSlot?' · '+c.delSlot:''}`:`<span class="missing">${t('missing')}</span>`;}
function rowHTML(o){
  const c=o.conf, sent=o.status==='sent', d=c.wagons-o.ordered, err=o.status==='draft'&&Object.keys(validate(o)).length&&o._tried;
  const dis=sent?'disabled':'';
  return `<article class="row ${selected.has(o.id)?'selected':''} ${openRow===o.id?'open':''} ${err?'err':''}" data-id="${o.id}">
  <div class="rmain">
    <div class="c-cb"><input type="checkbox" class="cb" ${selected.has(o.id)?'checked':''} ${dis} aria-label="${o.id} auswählen"></div>
    <div class="route"><div class="id">${o.id}</div><div class="r">${o.plant}<span class="arr">→</span>${o.dest}</div><div class="n">${PLANTS[o.plant]} → ${DESTS[o.dest]}</div></div>
    <div class="ordered"><div class="lbl">${t('ordered')}</div><div class="big num">${o.ordered}</div><div class="tags">${o.profile} · ${o.type}</div></div>
    <div><div class="lbl">${t('confirmed')}</div>${sent?`<div class="ordered"><div class="big num">${c.wagons}</div></div>`:`<div class="stepper"><button data-a="minus" ${dis} aria-label="weniger">−</button><input class="wg" type="number" min="0" max="60" value="${c.wagons}" ${dis} aria-label="Bestätigte Wagen"><button data-a="plus" ${dis} aria-label="mehr">+</button></div>`}
      <span class="delta ${d<0?'neg':d>0?'pos':''}">${d?(d>0?'+':'')+d+' '+t('deviation'):''}</span></div>
    <div class="when c-when"><div class="lbl">${t('departure')}</div>${whenDep(o)}</div>
    <div class="when c-dest"><div class="lbl">${t('arrival')}</div>${whenDel(o)}</div>
    <div>${pill(o)}</div>
    <div class="acts">${sent?'':`<button class="btn okbtn" data-a="ok" title="${t('asOrdered')}">✓ ${t('okShort')}</button>`}
      <button class="btn sq" data-a="toggle" aria-label="${t('edit')}" aria-expanded="${openRow===o.id}"><svg class="chev" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 6 4 4 4-4"/></svg></button></div>
  </div>
  <div class="rdetail">${openRow===o.id?detailHTML(o):''}</div></article>`;
}
function detailHTML(o){
  const c=o.conf, sent=o.status==='sent', e=o._tried?validate(o):{}, dev=isDev(o), dis=sent?'disabled':'';
  const slot=(name,v)=>`<select data-f="${name}" ${dis}><option value="">${t('chooseSlot')}</option>${SLOTS.map(s=>`<option ${s===v?'selected':''}>${s}</option>`).join('')}</select>`;
  const f=(key,label,ctl,req,hint)=>`<div class="f ${e[key]?'bad':''}"><label>${label}${req?' <span class="req">*</span>':''}</label>${ctl}${e[key]?`<span class="msg">${e[key]}</span>`:hint?`<span class="hint">${hint}</span>`:''}</div>`;
  return `<div class="dgrid">
    <div class="dcol"><h4>📍 ${t('hDep')} · ${PLANTS[o.plant]}</h4>
      <div class="two">${f('x',t('fProfile'),`<select data-f="profile" ${dis}>${['G1','G2'].map(p=>`<option ${p===c.profile?'selected':''}>${p}</option>`).join('')}</select>`)}
        ${f('x',t('fType'),`<select data-f="type" ${dis}>${['Offen','Geschlossen','Offen + Geschlossen'].map(p=>`<option ${p===c.type?'selected':''}>${p}</option>`).join('')}</select>`)}</div>
      ${f('x',t('fTdate'),`<input type="date" data-f="date" value="${c.date}" ${dis}>`)}
      ${f('x',t('fArr'),slot('arrSlot',c.arrSlot))}
      <div class="two">${f('dep',t('fDepDate'),`<input type="date" data-f="depDate" value="${c.depDate}" ${dis}>`,true)}
        ${f('dep2',t('fDepTime'),`<input type="time" step="900" data-f="depTime" value="${c.depTime}" ${dis}>`,true)}</div></div>
    <div class="dcol"><h4>🎯 ${t('hDest')} · ${DESTS[o.dest]}</h4>
      ${f('del',t('fDelDate'),`<input type="date" data-f="delDate" value="${c.delDate}" min="${c.depDate||c.date}" ${dis}>`,false,lang==='de'?'Nicht vor der Abfahrt':'Not before departure')}
      ${f('x',t('fDelSlot'),slot('delSlot',c.delSlot))}</div>
    <div class="dcol"><h4>⚠ ${t('hDev')}</h4>
      ${isUnder(o)?`<div class="devnote">⚠ <span>${t('devNote')}</span></div>`:`<p class="hint" style="color:var(--muted);margin:0 0 10px">${t('noDev')}</p>`}
      ${f('reason',t('fReason'),`<select data-f="reason" ${dis}><option value="">${t('chooseReason')}</option>${REASONS.map(r=>`<option ${r===c.reason?'selected':''}>${r}</option>`).join('')}</select>`,dev)}
      ${f('comment',t('fComment'),`<textarea data-f="comment" ${dis} placeholder="${lang==='de'?'Freitext …':'Free text …'}">${c.comment}</textarea>`,dev)}</div>
  </div>
  ${sent?`<div class="dfoot"><span class="pill p-ok"><i></i>${t('sentAt')} · ${o.sentAt||''}</span></div>`:
  `<div class="dfoot"><button class="btn" data-a="reset">${t('reset1')}</button><span class="sp"></span><button class="btn" data-a="close">${t('saveDraft')}</button><button class="btn primary" data-a="send">${t('saveSend')}</button></div>`}`;
}
function renderList(){
  const list=filtered(), host=$('#listView');
  if(!list.length){host.innerHTML=`<div class="empty">${t('empty')}<br><button class="link" onclick="document.getElementById('resetF').click()">${t('reset')}</button></div>`;return;}
  const byDay={}; list.forEach(o=>(byDay[o.date]=byDay[o.date]||[]).push(o));
  host.innerHTML=Object.keys(byDay).sort().map(d=>{
    const os=byDay[d], ord=os.reduce((a,o)=>a+o.ordered,0), open=os.filter(o=>o.status!=='sent').length, dd=dayOf(d);
    return `<section class="daygroup"><div class="dayhead"><span class="stub"><span class="d num">${d.slice(8)}</span><span class="w">${dd[lang]} · ${lang==='de'?'Okt':'Oct'}</span></span>
      <span class="meta"><b>${os.length}</b> ${lang==='de'?'Transporte':'transports'} · <b class="num">${ord}</b> ${lang==='de'?'Wagen bestellt':'wagons ordered'}${open?` · ${open} ${lang==='de'?'offen':'open'}`:''}</span>
      <span class="grow"></span>${open?`<button class="link selday" data-day="${d}">${lang==='de'?'Tag auswählen':'Select day'}</button>`:''}</div>
      ${os.map(rowHTML).join('')}</section>`;
  }).join('');
}
function renderWeek(){
  const list=filtered(), keys=[...new Set(list.map(o=>o.plant+'_'+o.dest))];
  if(!list.length){$('#weekView').innerHTML=`<div class="empty">${t('empty')}</div>`;return;}
  const head=`<tr><th style="text-align:left">${t('wRoute')}</th>${DAYS.map(d=>`<th>${d[lang]} ${fmt(d.d)}</th>`).join('')}<th>Σ</th></tr>`;
  const rows=keys.map(k=>{const [p,ds]=k.split('_');let so=0,sc=0;
    const cells=DAYS.map(d=>{const o=list.find(x=>x.plant===p&&x.dest===ds&&x.date===d.d); if(!o) return '<td>·</td>'; so+=o.ordered; sc+=o.conf.wagons; const s=stateOf(o);
      return `<td><button class="cell ${s}" data-jump="${o.id}" title="${o.id}"><b>${o.conf.wagons}${o.conf.wagons!==o.ordered?`<span style="font-size:11px;opacity:.7">/${o.ordered}</span>`:''}</b><small>${{open:t('sOpen'),draft:t('sDraft'),ok:'✓',dev:'⚠'}[s]}</small></button></td>`;}).join('');
    return `<tr><td class="rt">${p} → ${ds}<span>${PLANTS[p]} → ${DESTS[ds]}</span></td>${cells}<td class="num"><b>${sc}</b>/${so}</td></tr>`;}).join('');
  $('#weekView').innerHTML=`<div class="week"><table>${head}${rows}</table></div><div class="legend">${t('legend').map((l,i)=>`<span><span class="sw" style="background:${['var(--muted)','var(--draft)','var(--ok)','var(--warn)'][i]}"></span>${l}</span>`).join('')}<span>${lang==='de'?'Zelle antippen = Transport bearbeiten':'Tap a cell to edit the transport'}</span></div>`;
}
function renderBars(){
  const c={open:0,draft:0,sent:0}; orders.forEach(o=>c[o.status]++);
  $('#bInfo').innerHTML=t('info')(c.open,c.draft,c.sent);
  $('#savedNote').innerHTML=lastSaved&&c.draft?`💾 ${t('saved')(lastSaved)}`:'';
  const sd=$('#sendShown'), no=openShown().length; sd.textContent=lang==='de'?`Angezeigte bestätigen (${no})`:`Confirm shown (${no})`; sd.disabled=!no;
}
function render(){
  document.querySelectorAll('[data-i]').forEach(el=>{const v=T[lang][el.dataset.i]; if(typeof v==='string') el.textContent=v;});
  $('#q').placeholder=lang==='de'?'Suchen: WP-Nummer, Werk, Senke …':'Search: WP number, plant, destination …';
  $('#dueCard').title=T[lang].autoNote;
  renderLock(); renderSummary(); renderFilters();
  $('#listView').hidden=view!=='list'; $('#weekView').hidden=view!=='week'; $('#tableView').hidden=view!=='table';
  view==='list'?renderList():view==='week'?renderWeek():renderTable(); renderBars(); countdown(); restoreFocus(); themeUi();
}

/* ---------------- interactions ---------------- */
const byId=id=>orders.find(o=>o.id===id);
function touch(o){ if(o.status==='open') o.status='draft'; persist(); }
function toast(msg,bad){const el=$('#toast');el.textContent=msg;el.style.background=bad?'var(--bad)':'';el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2600);}
function fillDefaults(o){const c=o.conf; if(!c.depDate) c.depDate=c.date; if(!c.depTime) c.depTime='14:00'; if(!c.arrSlot) c.arrSlot='06:00 – 08:00'; if(!c.delDate) c.delDate=addDays(c.depDate,transit[o.dest]||1); if(!c.delSlot) c.delSlot='08:00 – 10:00';}
async function send(list){
  let bad=0; const good=[];
  list.forEach(o=>{ if(o.status==='sent'||o._sending) return; o._tried=true; if(Object.keys(validate(o)).length){bad++;return;} good.push(o); });
  if(!good.length){ render(); if(bad) toast(t('toastBlocked')(bad),true); return; }
  good.forEach(o=>o._sending=true); render();
  const res=await LIVE.submit(good);
  good.forEach(o=>o._sending=false);
  if(res.success){
    const at=new Date().toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(',','');
    good.forEach(o=>{o.rts=RtsV2Map.statusAfterSend(o); o.status='sent'; o.sentAt=at; selected.delete(o.id);});
    persist(); render(); toast(t('toastSent')(good.length));
    if(bad) setTimeout(()=>toast(t('toastBlocked')(bad),true),2700);
  } else { render(); toast(res.message,true); }
}

$('#listView').addEventListener('click',ev=>{
  const sd=ev.target.closest('.selday'); if(sd){orders.filter(o=>o.date===sd.dataset.day&&o.status!=='sent').forEach(o=>selected.add(o.id));render();return;}
  const row=ev.target.closest('.row'); if(!row) return; const o=byId(row.dataset.id); const a=ev.target.closest('[data-a]')?.dataset.a;
  if(ev.target.classList.contains('cb')){ev.target.checked?selected.add(o.id):selected.delete(o.id);render();return;}
  if(a==='toggle'){openRow=openRow===o.id?null:o.id;render();return;}
  if(a==='minus'||a==='plus'){o.conf.wagons=Math.max(0,o.conf.wagons+(a==='plus'?1:-1));touch(o);if(isUnder(o))openRow=o.id;render();return;}
  if(a==='ok'){o.conf.wagons=o.ordered;o.conf.date=o.date;if(o.profile)o.conf.profile=o.profile;if(o.type)o.conf.type=o.type;o.conf.depDate=o.conf.depDate&&o.conf.depDate!==o.date?o.date:o.conf.depDate;send([o]);return;}
  if(a==='reset'){o.conf=JSON.parse(JSON.stringify(o.base));o.status='open';o._tried=false;persist();render();return;}
  if(a==='close'){o._tried=true;openRow=null;persist();render();toast(t('toastDraft')(1));return;}
  if(a==='send'){send([o]);return;}
  if(!ev.target.closest('input,select,textarea,button')&&o.status!=='sent'&&ev.target.closest('.rmain')){selected.has(o.id)?selected.delete(o.id):selected.add(o.id);render();}
});
$('#listView').addEventListener('change',ev=>{
  const row=ev.target.closest('.row'); if(!row) return; const o=byId(row.dataset.id);
  if(ev.target.classList.contains('wg')){o.conf.wagons=Math.max(0,parseInt(ev.target.value||'0',10));touch(o);if(isUnder(o))openRow=o.id;render();return;}
  const f=ev.target.dataset.f; if(!f) return; o.conf[f]=ev.target.value; if(f==='depDate'&&o.conf.delDate&&o.conf.delDate<o.conf.depDate) o._tried=true; touch(o); render();
});
$('#weekView').addEventListener('click',ev=>{const b=ev.target.closest('[data-jump]'); if(!b) return; openRow=b.dataset.jump; setView('list'); setTimeout(()=>document.querySelector(`[data-id="${b.dataset.jump}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),30);});
$('#q').addEventListener('input',e=>{q=e.target.value;render();$('#q').focus();});
$('#fPlant').onchange=e=>{fPlant=e.target.value;render();}; $('#fDest').onchange=e=>{fDest=e.target.value;render();};
$('#resetF').onclick=()=>{fDay='all';fPlant='all';fDest='all';fStatus='all';q='';$('#q').value='';render();};
function setView(v){view=v;render();}
const openShown=()=>filtered().filter(o=>o.status!=='sent');
function ask(text,okLabel){ return new Promise(res=>{ const d=document.getElementById('askDlg'); document.getElementById('askText').textContent=text; document.getElementById('askOk').textContent=okLabel;
  document.getElementById('askNo').textContent=lang==='de'?'Abbrechen':'Cancel'; const done=v=>{d.close(); d.onclose=null; res(v);};
  document.getElementById('askOk').onclick=()=>done(true); document.getElementById('askNo').onclick=()=>done(false); d.onclose=()=>res(false); d.showModal(); }); }
async function confirmMany(list,label){ if(!list.length) return; const L=lang==='de';
  if(list.length>1&&!(await ask(L?`${list.length} Transporte ${label} mit den angezeigten Werten bestätigen? Unveränderte Transporte gelten als wie bestellt.`:`Confirm ${list.length} transports ${label} with the values shown? Unchanged transports count as ordered.`, L?`${list.length} bestätigen`:`Confirm ${list.length}`))) return;
  send(list); }
$('#sendShown').onclick=()=>confirmMany(openShown(),lang==='de'?'(alle angezeigten)':'(all shown)');
$('#lDE').onclick=()=>{lang='de';$('#lDE').setAttribute('aria-pressed','true');$('#lEN').setAttribute('aria-pressed','false');document.documentElement.lang='de';render();};
$('#lEN').onclick=()=>{lang='en';$('#lEN').setAttribute('aria-pressed','true');$('#lDE').setAttribute('aria-pressed','false');document.documentElement.lang='en';render();};
const isDark=()=>{const r=document.documentElement;return r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;};
function themeUi(){const d=isDark(); $('#themeIco').innerHTML=d?'<svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/></svg>':'<svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/></svg>'; $('#themeTxt').textContent=d?(lang==='de'?'Hell':'Light'):(lang==='de'?'Dunkel':'Dark');}
$('#themeBtn').onclick=()=>{document.documentElement.dataset.theme=isDark()?'light':'dark'; try{localStorage.setItem('rtsMaskTheme',document.documentElement.dataset.theme)}catch(e){} themeUi();};
try{const th=localStorage.getItem('rtsMaskTheme'); if(th) document.documentElement.dataset.theme=th;}catch(e){}

/* table view */
// paste order = visual order of the editable main fields
const TCOLS=[
 {k:'wagons',l:'fWagons',t:'num'},{k:'profile',l:'fProfile',t:'sel',o:()=>['G1','G2']},{k:'type',l:'fType',t:'sel',o:()=>['Offen','Geschlossen','Offen + Geschlossen']},{k:'arrSlot',l:'fArr',t:'sel',o:()=>SLOTS,blank:1},{k:'depDate',l:'fDepDate',t:'date',e:'dep'},{k:'depTime',l:'fDepTime',t:'time',e:'dep'},
 {k:'delDate',l:'fDelDate',t:'date',e:'del'},{k:'delSlot',l:'fDelSlot',t:'sel',o:()=>SLOTS,blank:1},
 // deviation line
 {k:'reason',l:'fReason',t:'sel',o:()=>REASONS,blank:1,e:'reason',dev:1},{k:'comment',l:'fComment',t:'text',e:'comment',dev:1}];
const MAIN=TCOLS.filter(c=>!c.dev);
let focusCell=null;
function ctl(o,k,extra=''){
  const col=TCOLS.find(c=>c.k===k), v=o.conf[k]??'', sent=o.status==='sent', e=o._tried?validate(o):{};
  const ordV={profile:o.profile,type:o.type}[k], devv=!!ordV&&v!==ordV; const miss=(k==='profile'||k==='type')&&!v;
  const chg=!sent&&String(v)!==String(o.base[k]??''), bad=col.e&&e[col.e]&&(col.e!=='dep'||!v)&&(col.e!=='del'||k==='delDate');
  const cls=`gi ${col.t==='time'?'tm':''} ${chg?'chg':''} ${devv?'devv':''} ${bad||(miss&&o._tried)?'bad':''} ${miss?'miss':''}`, a=`class="${cls}" data-id="${o.id}" data-k="${k}" ${sent?'disabled':''} title="${bad?e[col.e]:''}" ${extra}`;
  if(sent){const shown=col.t==='date'?(v?v.split('-').reverse().join('.'):'—'):(v||'—'); return `<span class="ro" title="${shown}">${shown}</span>`;}
  if(col.t==='sel'&&(k==='profile'||k==='type')) return `<select ${a}><option value="" ${v?'':'selected'}>${k==='profile'?(lang==='de'?'Profil *':'Profile *'):(lang==='de'?'Typ *':'Type *')}</option>${col.o().map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join('')}</select>`;
  if(col.t==='sel') return `<select ${a}>${col.blank?`<option value="">${k==='reason'?(lang==='de'?'Grund der Abweichung *':'Reason *'):(lang==='de'?'Slot wählen':'Choose slot')}</option>`:''}${col.o().map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join('')}</select>`;
  if(col.t==='date') return v?`<input type="date" value="${v}" ${a}>`:`<input type="text" data-ph="date" placeholder="${lang==='de'?'Datum':'Date'}" ${a}>`;
  if(col.t==='time') return `<input type="text" inputmode="numeric" maxlength="5" autocomplete="off" list="qtimes" placeholder="${lang==='de'?'hh:mm':'hh:mm'}" value="${v}" ${a}>`;
  return `<input type="text" value="${String(v).replace(/"/g,'&quot;')}" placeholder="${lang==='de'?'Kommentar *':'Comment *'}" ${a}>`;
}
const CG={arr:['arrSlot'],dep:['depDate','depTime'],del:['delDate','delSlot'],wag:['wagons','reason','comment'],prof:['profile'],type:['type']};
const PARTS={wag:[
  {id:'n',k:['wagons'],show:o=>`<b class="num">${o.conf.wagons}</b> ${lang==='de'?'Wagen':'wagons'}`},
  {id:'rc',k:['reason','comment'],show:o=>o.conf.reason?`${lang==='de'?'Grund':'Reason'}: <b>${_e(o.conf.reason)}</b>${o.conf.comment?(lang==='de'?' + Kommentar':' + comment'):''}`:''}]};
const hasV=v=>v!==''&&v!=null&&v!==false;
const _e=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
// ⇊ in the wagon cell: the menu lets the user tick which values to copy (amount, profile/type, reason)
function cpHead(o,g){const L=lang==='de', ps=(PARTS[g]||[]).map(p=>({id:p.id,h:p.show(o)})).filter(p=>p.h);
  if(ps.length<2) return `<div class="cph">${L?'Übernehmen':'Apply'}: ${ps.map(p=>p.h).join('')}</div>`;
  return `<div class="cph np">${L?'Übernehmen – was?':'Apply – what?'}</div><div class="cpparts">${ps.map(p=>`<label><input type="checkbox" value="${p.id}" checked>${p.h}</label>`).join('')}</div>`;}
function cpKeys(g,m){if(!PARTS[g]||!m.querySelector('.cpparts')) return CG[g]; return [...m.querySelectorAll('.cpparts input:checked')].flatMap(i=>PARTS[g].find(p=>p.id===i.value).k);}

const cpy=(o,g)=>o.status==='sent'||!CG[g].some(k=>hasV(o.conf[k]))?'':`<button class="cpy" data-cp="${g}" data-id="${o.id}" title="${lang==='de'?'Für andere Transporte übernehmen':'Apply to other transports'}" aria-label="${lang==='de'?'Übernehmen':'Apply'}">⇊</button>`;
const cpyI=(o,g)=>cpy(o,g).replace('class="cpy"','class="cpy inl"');
const dDiff=(a,b)=>Math.round((new Date(a+'T12:00:00')-new Date(b+'T12:00:00'))/864e5);
function copyTargets(src,scope){const open=orders.filter(o=>o.status!=='sent'&&o.id!==src.id);
  return scope==='all'?open.filter(o=>filtered().includes(o)):scope==='day'?open.filter(o=>o.date===src.date):scope==='route'?open.filter(o=>o.plant===src.plant&&o.dest===src.dest):open;}
function applyCopy(src,g,scope,keys=CG[g]){const l=copyTargets(src,scope);
  l.forEach(o=>{keys.forEach(k=>{let v=src.conf[k]; if(!hasV(v)) return;
    if(k.endsWith('Date')) v=addDays(o.date,dDiff(v,src.date));   // same distance to the transport day
    o.conf[k]=v;}); if(g==='dep'&&o.conf.delDate&&o.conf.delDate<o.conf.depDate) o.conf.delDate=o.conf.depDate; touch(o);});
  closeCp(); render(); toast(lang==='de'?`Für ${l.length} Transport${l.length===1?'':'e'} übernommen`:`Applied to ${l.length} transport${l.length===1?'':'s'}`);}
function closeCp(){const m=document.getElementById('cpMenu'); if(m) m.remove();}
function openCp(btn){closeCp(); const o=byId(btn.dataset.id), g=btn.dataset.cp, L=lang==='de', c=o.conf;
  const val=CG[g].map(k=>{const v=c[k]; if(!v) return ''; if(!k.endsWith('Date')) return v; const d=dDiff(v,o.date); return `${dayOf(v)[lang]} ${fmt(v)}`+(d?` <i>(${L?'Transporttag':'transport day'} ${d>0?'+':''}${d})</i>`:'');}).filter(Boolean).join(' · ');
  const n=sc=>copyTargets(o,sc).length, dd=dayOf(o.date)[lang];
  const opts=[['day',(L?'Alle offenen am ':'All open on ')+dd+' '+fmt(o.date)],['route',(L?'Alle offenen ':'All open ')+PLANTS[o.plant]+' → '+DESTS[o.dest]],['all',L?'Alle angezeigten offenen Transporte':'All open transports shown']].filter(([k])=>n(k)>0);
  const m=document.createElement('div'); m.id='cpMenu'; m.className='cpmenu'; m.setAttribute('role','menu');
  m.innerHTML=(PARTS[g]?cpHead(o,g):`<div class="cph">${L?'Übernehmen':'Apply'}: <b>${val}</b></div>`)+(opts.length?opts.map(([k,l])=>`<button role="menuitem" data-sc="${k}">${l}<span>${n(k)}</span></button>`).join(''):`<div class="cpe">${L?'Keine weiteren offenen Transporte':'No other open transports'}</div>`)
    +(CG[g].some(k=>k.endsWith('Date'))?`<div class="cpf">${L?'Datum wird relativ zum jeweiligen Transporttag übernommen.':'Dates keep the same distance to each transport day.'}</div>`:'');
  document.body.appendChild(m); const r=btn.getBoundingClientRect(), w=m.offsetWidth;
  m.style.top=(r.bottom+window.scrollY+6)+'px'; m.style.left=Math.max(12,Math.min(r.right-w,window.innerWidth-w-12)+window.scrollX)+'px';
  m.onclick=e=>{const b=e.target.closest('[data-sc]'); if(!b) return; const ks=cpKeys(g,m); if(!ks.length){toast(lang==='de'?'Bitte mindestens einen Wert auswählen':'Choose at least one value',true);return;} applyCopy(o,g,b.dataset.sc,ks);}; m.querySelector('button')?.focus();}
document.addEventListener('click',e=>{if(!e.target.closest('#cpMenu,.cpy')) closeCp();});
document.addEventListener('keydown',e=>{if(e.key==='Escape') closeCp();});
window.addEventListener('scroll',closeCp,true);
function renderTable(){
  const list=filtered();
  if(!list.length){$('#tableView').innerHTML=`<div class="empty">${t('empty')}</div>`;return;}
  const L=lang==='de';
  const head=`<colgroup><col style="width:20%"><col style="width:22%"><col style="width:11%"><col style="width:17%"><col style="width:18%"><col style="width:12%"></colgroup>
   <thead><tr class="h"><th>Transport</th><th>${L?'Wagen':'Wagons'}</th>
   <th class="grp">${L?'Wagen am Werk':'Wagons at plant'}</th><th>${L?'Abfahrt Werk':'Departure plant'}</th><th class="grp">${L?'Ankunft Senke':'Arrival destination'}</th><th></th></tr></thead>`;
  let lastDay='';
  const body=list.map(o=>{
    const e=o._tried?validate(o):{}, errs=Object.values(e), sent=o.status==='sent', dd=dayOf(o.date), dev=isDev(o), c=o.conf;
    let grp=''; if(o.date!==lastDay){lastDay=o.date; const os=list.filter(x=>x.date===o.date), op=os.filter(x=>x.status!=='sent').length;
      grp=`<tr class="dayrow"><td colspan="6"><span class="stub"><b class="num">${o.date.slice(8)}</b><span>${dd[lang]}</span></span><span class="meta">${os.length} ${L?'Transporte':'transports'}${op?` · ${op} ${L?'offen':'open'}`:` · ${L?'alle bestätigt':'all confirmed'} ✓`}</span>${op?`<button class="btn dayok" data-dayok="${o.date}">✓ ${L?'Tag bestätigen':'Confirm day'} (${op})</button>`:''}</td></tr>`;}
    const ptSame=c.profile===o.profile&&c.type===o.type&&c.profile&&c.type;
    const wag = sent
      ? `<span class="ordn ${c.wagons!==o.ordered?'w-dev':''}">${c.wagons}</span> <span class="pt">${c.profile} · ${c.type}</span>`
      : `<div class="wg ${c.wagons!==o.ordered?'dev':''}"><button data-ta="minus" data-id="${o.id}" aria-label="−">−</button><input type="number" inputmode="numeric" min="0" max="60" value="${c.wagons}" data-id="${o.id}" data-k="wagons"><button data-ta="plus" data-id="${o.id}" aria-label="+">+</button></div>${cpyI(o,'wag')}
         <div class="mini mini2"><span class="mf">${ctl(o,'profile')}${cpyI(o,'prof')}</span><span class="mf grow">${ctl(o,'type')}${cpyI(o,'type')}</span></div>`;
    const main=`<tr class="${sent?'sent':''}" data-row="${o.id}">
      <td><span class="rt" title="${o.plant} → ${o.dest}">${PLANTS[o.plant]} → ${DESTS[o.dest]}</span>
          <span class="sub2"><span class="wpid">${o.id}</span> ${pill(o)}${errs.length?`<span class="errb" title="${errs.join(' · ')}">!</span>`:''}</span></td>
      <td><div class="wcell">${wag}</div>${dev?`<span class="ordhint">${L?'bestellt':'ordered'} ${o.ordered}${o.profile?' · '+o.profile:''}${o.type?' · '+o.type:''}</span>`:''}</td>
      <td class="grp cp">${ctl(o,'arrSlot')}${cpy(o,'arr')}</td>
      <td class="cp"><div class="pair">${ctl(o,'depDate')}${ctl(o,'depTime')}</div>${cpy(o,'dep')}</td>
      <td class="grp cp"><div class="pair">${ctl(o,'delDate',`min="${c.depDate||c.date}"`)}${ctl(o,'delSlot')}</div>${cpy(o,'del')}</td>
      <td class="act">${sent?`<span class="sentinfo">${o.lockedOnOpen&&!o.sentAt?(L?'gesperrt':'locked'):'✓ '+(o.sentAt||'')}</span>`:`<button class="btn primary" data-ta="send" data-id="${o.id}" ${o._sending?'disabled':''}>${o._sending?(L?'Sendet …':'Sending …'):(L?'Senden':'Send')}</button>`}</td></tr>`;
    const devRow=(isUnder(o)&&!sent)?`<tr class="devrow"><td colspan="6"><div class="devline">
        <span class="devsum">⚠ ${devList(o).map(x=>`<span>${x}</span>`).join('')}</span>
        <div class="devf">${ctl(o,'reason')}</div><div class="devf grow">${ctl(o,'comment')}</div></div></td></tr>`:'';
    return grp+main+devRow;
  }).join('');
  $('#tableView').innerHTML=`<div class="grid" id="grid"><table>${head}<tbody>${body}</tbody></table></div>`;
}
function restoreFocus(){ if(view!=='table'||!focusCell) return; const el=document.querySelector(`#tableView [data-id="${focusCell.id}"][data-k="${focusCell.k}"]`); if(el) el.focus({preventScroll:true}); }
function setVal(o,k,raw){
  const c=o.conf; let v=String(raw??'').trim();
  if(k==='wagons'){const n=parseInt(v,10); if(isNaN(n)) return false; c.wagons=Math.max(0,n); return true;}
  if(['date','depDate','delDate'].includes(k)){ const m=v.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})?$/); if(m){const y=m[3]?(m[3].length===2?'20'+m[3]:m[3]):'2026'; v=`${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;} if(v&&!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false; c[k]=v; return true;}
  if(k==='depTime'){ if(!v){c[k]='';return true;}
    let h,mi; const d=v.replace(/\s/g,''); let m;
    if((m=d.match(/^(\d{1,2})[:.,h](\d{1,2})$/))){h=+m[1];mi=+m[2];}
    else if((m=d.match(/^(\d{3,4})$/))){h=+m[1].slice(0,-2);mi=+m[1].slice(-2);}
    else if((m=d.match(/^(\d{1,2})$/))){h=+m[1];mi=0;}
    else return false;
    if(h>23||mi>59) return false; c[k]=`${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}`; return true;}
  const col=TCOLS.find(x=>x.k===k);
  if(col&&col.t==='sel'){ if(!v){c[k]='';return true;} const opts=col.o(); const hit=opts.find(x=>x.toLowerCase()===v.toLowerCase())||opts.find(x=>x.toLowerCase().startsWith(v.toLowerCase()))||opts.find(x=>/^\d\d/.test(v)&&x.slice(0,2)===v.slice(0,2)); if(!hit) return false; c[k]=hit; return true;}
  c[k]=v; return true;
}
const tv=$('#tableView');
const later=()=>{clearTimeout(tv._r); tv._r=setTimeout(render,0);};
tv.addEventListener('focusin',e=>{const el=e.target.closest('[data-k]'); if(!el) return; focusCell={id:el.dataset.id,k:el.dataset.k};
  if(el.dataset.ph){ el.type=el.dataset.ph; if(el.dataset.ph==='time') el.step=900; try{el.showPicker&&el.showPicker()}catch(_){}} });
tv.addEventListener('input',e=>{const el=e.target; if(!el.classList||!el.classList.contains('tm')) return;
  const d=el.value.replace(/[^0-9]/g,''); if(/^\d{3,4}$/.test(d)&&!el.value.includes(':')) el.value=d.slice(0,-2).padStart(1,'0')+':'+d.slice(-2);});
tv.addEventListener('change',e=>{
  const el=e.target.closest('[data-k]'); if(!el) return; const o=byId(el.dataset.id);
  const oldDep=o.conf.depDate, autoDel=o.conf.delDate===addDays(oldDep||o.date,transit[o.dest]||1);
  if(setVal(o,el.dataset.k,el.value)) { touch(o); o._badTime=false; if(el.dataset.k==='depDate'&&o.conf.depDate&&autoDel) o.conf.delDate=addDays(o.conf.depDate,transit[o.dest]||1); } else if(el.dataset.k==='depTime'){ o._badTime=true; toast(lang==='de'?'Uhrzeit bitte als hh:mm eingeben, z. B. 14:30':'Please enter the time as hh:mm, e.g. 14:30',true); }
  later();   // after focus has moved (Tab), so the new cell keeps focus
});
tv.addEventListener('keydown',e=>{
  const el=e.target.closest('[data-k]'); if(!el||e.key!=='Enter') return; e.preventDefault();
  const ids=filtered().map(o=>o.id), i=ids.indexOf(el.dataset.id), nxt=ids[i+(e.shiftKey?-1:1)];
  if(nxt) focusCell={id:nxt,k:el.dataset.k};
  el.dispatchEvent(new Event('change',{bubbles:true})); later();
});
tv.addEventListener('paste',e=>{
  const el=e.target.closest('[data-k]'); if(!el) return; const txt=(e.clipboardData||window.clipboardData).getData('text');
  if(!/[\t\n]/.test(txt.trim())) return;              // single value: normal paste
  e.preventDefault();
  const rows=txt.replace(/\r/g,'').replace(/\n$/,'').split('\n').map(r=>r.split('\t'));
  const order=TCOLS.find(c=>c.k===el.dataset.k).dev?TCOLS.filter(c=>c.dev):MAIN;
  const ids=filtered().map(o=>o.id), r0=ids.indexOf(el.dataset.id), c0=order.findIndex(c=>c.k===el.dataset.k); let n=0;
  rows.forEach((cells,ri)=>{const o=byId(ids[r0+ri]); if(!o||o.status==='sent') return;
    cells.forEach((v,ci)=>{const col=order[c0+ci]; if(col&&setVal(o,col.k,v)) n++;}); touch(o);});
  render(); toast(t('tPasted')(n));
});
tv.addEventListener('click',e=>{
  const cb=e.target.closest('.cpy'); if(cb){e.stopPropagation(); document.getElementById('cpMenu')?closeCp():openCp(cb); return;}
  const dk=e.target.closest('[data-dayok]'); if(dk){const d=dk.dataset.dayok; confirmMany(openShown().filter(o=>o.date===d),`${lang==='de'?'am':'on'} ${dayOf(d)[lang]} ${fmt(d)}`);return;}
  const ta=e.target.closest('[data-ta]');
  if(ta){const o=byId(ta.dataset.id), a=ta.dataset.ta;
    if(a==='minus'||a==='plus'){o.conf.wagons=Math.max(0,o.conf.wagons+(a==='plus'?1:-1));touch(o);render();return;}
    if(a==='dev'){o._devOpen=!o._devOpen;render();return;}
    if(a==='pt'){o._pt=true;render();return;}
    if(a==='ok'){o.conf.wagons=o.ordered;o.conf.date=o.date;if(o.profile)o.conf.profile=o.profile;if(o.type)o.conf.type=o.type;o.conf.depDate=o.conf.depDate&&o.conf.depDate!==o.date?o.date:o.conf.depDate;}
    send([o]); return;}
  const b=e.target.closest('[data-fill]'); if(!b) return; const ids=filtered().map(o=>o.id).filter(id=>selected.has(id));
  if(ids.length<2){toast(t('tNeedSel'),true);return;}
  const k=b.dataset.fill, v=byId(ids[0]).conf[k]; ids.slice(1).forEach(id=>{const o=byId(id); o.conf[k]=v; touch(o);});
  render(); toast(t('tFilled')(t(TCOLS.find(c=>c.k===k).l),ids.length));
});
function exportCsv(list){
  const de=d=>d?d.split('-').reverse().join('.'):'';
  const head=['WP','Status','Tag','Werk','Senke','Bestellt',...TCOLS.map(c=>T.de[c.l])];
  const st={open:'Offen',draft:'Entwurf',ok:'Bestätigt',dev:'Mit Abweichung'};
  const rows=list.map(o=>[o.id,st[stateOf(o)],de(o.date),o.plant,o.dest,o.ordered,...TCOLS.map(c=>['date','depDate','delDate'].includes(c.k)?de(o.conf[c.k]):o.conf[c.k])]);
  const csv='﻿'+[head,...rows].map(r=>r.map(x=>`"${String(x??'').replace(/"/g,'""')}"`).join(';')).join('\r\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})); a.download='RTS_KW'+(LIVE.cw||'')+'.csv'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}


function countdown(){
  const dl=new Date('2026-10-08T09:30:00'), now=new Date(), ms=dl-now; const el=$('#countdown'); if(!el) return;
  if(ms<=0||ms>7*864e5){el.textContent='';return;} const h=Math.floor(ms/36e5), m=Math.floor(ms%36e5/6e4); el.textContent='· '+t('countdown')(`${h} h ${String(m).padStart(2,'0')} min`);
}
setInterval(countdown,30000);
(function(){const name=LIVE.supplier||'';
  $('#supName').textContent=name||'–'; $('#supIni').textContent=name.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?';
  const ds=orders.map(o=>o.date).filter(Boolean).sort(), f=d=>d.split('-').reverse().slice(0,2).join('.')+'.';
  $('#kwNo').textContent=LIVE.cw?'KW '+LIVE.cw:'–'; $('#kwRange').textContent=ds.length?(ds[0]===ds[ds.length-1]?f(ds[0]):f(ds[0])+' – '+f(ds[ds.length-1]))+ds[0].slice(0,4):'';
  document.title='RTS Waggonbestellung'+(name?' · '+name:'');})();
$('#qtimes').innerHTML=Array.from({length:96},(_,i)=>`<option value="${String(Math.floor(i/4)).padStart(2,'0')}:${String(i%4*15).padStart(2,'0')}">`).join('');
window.addEventListener('beforeunload',e=>{if(orders.some(o=>o.status==='draft')){e.preventDefault();e.returnValue='';}});
render();

}
