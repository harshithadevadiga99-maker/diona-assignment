const DEFAULT = {
  workerName: 'Madeleine Willson', claimNo: '20042047', appId: '712041', submitted: 'March 28, 2024 20:43', privacy: true,
  prescription: [{drug:'Naproxen',prescriptionDate:'February 28, 2024',datePurchased:'February 29, 2024',provider:'Dr. Best',amount:'$20.00'}],
  otc: [{drug:'Advil',datePurchased:'March 28, 2024',amount:'$8.00',seller:'Shoppers Drug Mart',reason:'Pain'}],
  supplies: [{item:'Tensor',datePurchased:'February 28, 2024',prescribed:'Yes',provider:'Dr. Best',amount:'$10.00',seller:'Shoppers DrugMart'}],
  parking: [{address:'333 St Mary Ave, Winnipeg MB R3C4A5, Canada',date:'March 28, 2024',amount:'$10.00',meter:'yes',number:'12245'}],
  mileage: [{date:'March 28, 2024',provider:'HSC, 820 Sherbrook St, Winnipeg MB R3A 1R9, Canada',workplace:'WCB, 333 Broadway, Winnipeg MB R3C 4W3,Canada',km:'20 km'}],
  bus: [
    {date:'March 28, 2024',start:'',provider:'HSC Winnipeg Women’s Hospital, 665 William Ave, Winnipeg MB R3E 0Z2, Canada',type:'Bus',fare:'$3.00'},
    {date:'March 27, 2024',start:'25 Furby St, Winnipeg MB R3C2A2, Canada',provider:'440 Edmonton St, Winnipeg MB R3B 2M4, Canada',type:'Taxi',fare:'$15.00'}
  ]
};

let saved = null;
try { saved = JSON.parse(localStorage.getItem('medical-expense-data') || 'null'); } catch (_) {}
const data = saved || structuredClone(DEFAULT);
let editing = false;

const S = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sc = 0.72;
const PX = v => v * sc;
const get = (obj, path) => path.split('.').reduce((o,k) => o?.[k], obj);
const set = (obj, path, value) => { const a=path.split('.'), last=a.pop(); let o=obj; for(const k of a){ if(!o[k]) o[k]={}; o=o[k]; } o[last]=value; };
const eq = (a,b) => String(a ?? '') === String(b ?? '');

const sections = {
  prescription:{top:349,headBottom:408,bottom:463,cols:[72,299,491,688,1054,1204],rowH:55,fields:['drug','prescriptionDate','datePurchased','provider','amount'],labels:['Drug Name','Prescription Date','Date Purchased','Healthcare Provider Name','Paid Amount']},
  otc:{top:558,headBottom:613,bottom:668,cols:[72,299,482,604,864,1204],rowH:55,fields:['drug','datePurchased','amount','seller','reason'],labels:['Drug Name','Date Purchased','Paid Amount',"Seller's Name",'Reason for Purchasing']},
  supplies:{top:763,headBottom:832,bottom:887,cols:[72,286,399,505,763,885,1204],rowH:55,fields:['item','datePurchased','prescribed','provider','amount','seller'],labels:['Item Purchased','Date Purchased','Was this Prescribed?','Healthcare Provider Name','Paid Amount',"Seller's Name"]},
  parking:{top:977,headBottom:1032,bottom:1087,cols:[72,501,697,847,979,1204],rowH:55,fields:['address','date','amount','meter','number'],labels:['Address of Healthcare Provider/Medical Facility','Date','Paid Amount','Meter Used?','Meter Number']},
  mileage:{top:1254,headBottom:1309,bottom:1365,cols:[72,247,622,960,1204],rowH:55,fields:['date','provider','workplace','km'],labels:['Appointment Date','Address of Healthcare Provider/Medical Facility','Address of Workplace','Number of km (Round Trip)']}
};
const order = ['prescription','otc','supplies','parking','mileage'];
const busSpec = {top:172,headerBottom:242,bottom:352,rowH:55,cols:[72,229,557,944,1092,1202],fields:['date','start','provider','type','fare'],labels:['Appointment Date','Address of Starting Point','Address of Healthcare Provider/Medical Facility','Bus or Taxi (indicate one)','Total Fare Paid']};

function extraRows(k){ return Math.max(0,(data[k]?.length || 1)-1); }
function shifts(){ let n=0,before={}; for(const k of order){ before[k]=n; n += extraRows(k)*55; } return {before,total:n}; }
function busExtra(){ return Math.max(0,(data.bus?.length || 2)-2)*55; }
function changedSection(k){
  if((data[k]?.length || 1) !== 1) return true;
  const d=DEFAULT[k]?.[0] || {};
  return sections[k].fields.some(f=>!eq(data[k][0]?.[f],d[f]));
}
function changedBus(){ return JSON.stringify(data.bus)!==JSON.stringify(DEFAULT.bus); }

function mask(x,y,w,h){ return `<i class="mask" style="left:${PX(x)}px;top:${PX(y)}px;width:${PX(w)}px;height:${PX(h)}px"></i>`; }
function changedText(key,x,y,w,h,fs=16,opts=''){
  const v=get(data,key), dv=get(DEFAULT,key);
  if(eq(v,dv) && !editing) return '';
  return `${mask(x,y,w,h)}<span class="dynamic" data-key="${S(key)}" style="left:${PX(x)}px;top:${PX(y)}px;width:${PX(w)}px;height:${PX(h)}px;font-size:${PX(fs)}px;${opts}">${S(v)}</span>`;
}
function checkbox(key,x,y,shift=0){ return `<button class="cb ${data[key]?'on':''}" data-choice="${key}" style="left:${PX(x)}px;top:${PX(y+shift)}px" aria-label="Privacy Notice checkbox"></button>`; }

function shiftedSlices(page){
  if(page===1){
    const cuts=[0,sections.prescription.bottom,sections.otc.bottom,sections.supplies.bottom,sections.parking.bottom,sections.mileage.bottom,1650];
    let out='',cum=0;
    for(let i=0;i<cuts.length-1;i++){
      const y0=cuts[i], y1=cuts[i+1], k=order[i];
      out += `<div class="slice" style="left:0;top:${PX(y0+cum)}px;width:${PX(1275)}px;height:${PX(y1-y0)}px;background-image:url('assets/page-1.png');background-size:${PX(1275)}px ${PX(1650)}px;background-position:0 -${PX(y0)}px"></div>`;
      if(k) cum += extraRows(k)*55;
    }
    return out;
  }
  const extra=busExtra();
  return `<div class="slice" style="left:0;top:0;width:${PX(1275)}px;height:${PX(busSpec.bottom)}px;background-image:url('assets/page-2.png');background-size:${PX(1275)}px ${PX(1650)}px;background-position:0 0"></div>
          <div class="slice" style="left:0;top:${PX(busSpec.bottom+extra)}px;width:${PX(1275)}px;height:${PX(1650-busSpec.bottom)}px;background-image:url('assets/page-2.png');background-size:${PX(1275)}px ${PX(1650)}px;background-position:0 -${PX(busSpec.bottom)}px"></div>`;
}
function tableOverlay(k){
  if(!changedSection(k)) return '';
  const s=sections[k], sh=shifts().before[k], rows=data[k]||[];
  const x=s.cols[0], w=s.cols.at(-1)-x, headerH=s.headBottom-s.top, totalH=headerH+rows.length*s.rowH;
  let h=`<div class="table-overlay" style="left:${PX(x)}px;top:${PX(s.top+sh)}px;width:${PX(w)}px;height:${PX(totalH)}px">`;
  h += `<div class="trow thead" style="height:${PX(headerH)}px">${s.labels.map((l,i)=>`<div class="tcell header" style="width:${PX(s.cols[i+1]-s.cols[i])}px;height:${PX(headerH)}px">${S(l)}</div>`).join('')}</div>`;
  rows.forEach(r=>{
    h += `<div class="trow data-row" style="height:${PX(s.rowH)}px">`;
    s.fields.forEach((f,i)=>h += `<div class="tcell value" style="width:${PX(s.cols[i+1]-s.cols[i])}px"><span class="fit-text">${S(r[f]??'')}</span></div>`);
    h += '</div>';
  });
  return h+'</div>';
}
function p1(){
  const sh=shifts(), pageH=1188+PX(sh.total);
  let o=`<section class="page p1" style="height:${pageH}px"><div class="layer">${shiftedSlices(1)}`;
  for(const k of order){
    if(changedSection(k)){
      const s=sections[k], y=s.top+sh.before[k], w=s.cols.at(-1)-s.cols[0], h=(s.headBottom-s.top)+(data[k].length*s.rowH);
      o+=mask(s.cols[0]-1,y-1,w+2,h+2);
    }
  }
  o+=changedText('workerName',70,196,420,28,18,'display:flex;align-items:center;');
  o+=changedText('claimNo',770,121,205,30,18,'text-align:center;display:flex;align-items:center;justify-content:center;');
  for(const k of order) o+=tableOverlay(k);
  o+='</div></section>'; return o;
}
function p2(){
  const extra=busExtra(), pageH=1188+PX(extra);
  let o=`<section class="page p2" style="height:${pageH}px"><div class="layer">${shiftedSlices(2)}`;
  if(changedBus()){
    const x=busSpec.cols[0], y=busSpec.top, w=busSpec.cols.at(-1)-x, h=busSpec.headerBottom-busSpec.top+data.bus.length*busSpec.rowH;
    o+=mask(x-1,y-1,w+2,h+2);
    o+=`<div class="table-overlay bus-table" style="left:${PX(x)}px;top:${PX(y)}px;width:${PX(w)}px;height:${PX(h)}px">`;
    o+=`<div class="trow thead" style="height:${PX(70)}px">${busSpec.labels.map((l,i)=>`<div class="tcell header" style="width:${PX(busSpec.cols[i+1]-busSpec.cols[i])}px;height:${PX(70)}px">${S(l)}</div>`).join('')}</div>`;
    data.bus.forEach(r=>{o+=`<div class="trow data-row" style="height:${PX(busSpec.rowH)}px">`;busSpec.fields.forEach((f,i)=>o+=`<div class="tcell value" style="width:${PX(busSpec.cols[i+1]-busSpec.cols[i])}px"><span class="fit-text">${S(r[f]??'')}</span></div>`);o+='</div>';});
    o+='</div>';
  }
  const privacyY=429+extra;
  o+=checkbox('privacy',84,privacyY);
  o+='</div></section>'; return o;
}
function render(){ document.getElementById('report').innerHTML=p1()+p2(); bind(); if(editing)activateEditing(); fitTexts(); }
function save(){ localStorage.setItem('medical-expense-data',JSON.stringify(data)); }
function selectAll(el){const r=document.createRange();r.selectNodeContents(el);const s=window.getSelection();s.removeAllRanges();s.addRange(r);}
function bind(){
  document.querySelectorAll('.cb').forEach(b=>b.onclick=()=>{data[b.dataset.choice]=!data[b.dataset.choice];save();buildEditors();render();});
  document.querySelectorAll('.dynamic').forEach(el=>{el.onclick=()=>{if(!editing)return;el.contentEditable='true';selectAll(el);el.focus();};el.oninput=()=>{if(!editing)return;set(data,el.dataset.key,el.textContent);save();};});
}
function activateEditing(){ document.querySelectorAll('.dynamic').forEach(el=>{el.contentEditable='true';el.spellcheck=false;el.oninput=()=>{set(data,el.dataset.key,el.textContent);save();fitTexts();};}); }
const defs={
  prescription:[['drug','Drug Name'],['prescriptionDate','Prescription Date'],['datePurchased','Date Purchased'],['provider','Healthcare Provider Name'],['amount','Paid Amount']],
  otc:[['drug','Drug Name'],['datePurchased','Date Purchased'],['amount','Paid Amount'],['seller',"Seller's Name"],['reason','Reason for Purchasing']],
  supplies:[['item','Item Purchased'],['datePurchased','Date Purchased'],['prescribed','Was this Prescribed?'],['provider','Healthcare Provider Name'],['amount','Paid Amount'],['seller',"Seller's Name"]],
  parking:[['address','Address of Healthcare Provider/Medical Facility'],['date','Date'],['amount','Paid Amount'],['meter','Meter Used?'],['number','Meter Number']],
  mileage:[['date','Appointment Date'],['provider','Address of Healthcare Provider/Medical Facility'],['workplace','Address of Workplace'],['km','Number of km (Round Trip)']],
  bus:[['date','Appointment Date'],['start','Address of Starting Point'],['provider','Address of Healthcare Provider/Medical Facility'],['type','Bus or Taxi'],['fare','Total Fare Paid']]
};
function editorRows(k){
  const host=document.getElementById(k+'Editor'); if(!host)return; host.innerHTML='';
  data[k].forEach((row,i)=>{
    const box=document.createElement('div'); box.className='row-editor '+k;
    defs[k].forEach(([f,l])=>{const lab=document.createElement('label');lab.textContent=l;let inp;
      if(k==='bus'&&f==='type'){inp=document.createElement('select');['','Bus','Taxi'].forEach(v=>{const op=document.createElement('option');op.value=v;op.textContent=v||'Select';op.selected=v===row[f];inp.appendChild(op);});}
      else {inp=document.createElement('input');inp.value=row[f]??'';}
      inp.oninput=()=>{row[f]=inp.value;save();render();};lab.appendChild(inp);box.appendChild(lab);
    });
    const rm=document.createElement('button');rm.type='button';rm.className='remove';rm.textContent='×';rm.title='Remove row';rm.onclick=()=>{data[k].splice(i,1);if(!data[k].length)data[k].push({});save();buildEditors();render();};box.appendChild(rm);host.appendChild(box);
  });
}
function buildEditors(){
  ['prescription','otc','supplies','parking','mileage','bus'].forEach(editorRows);
  document.querySelectorAll('[data-field]').forEach(el=>{el.value=data[el.dataset.field]??'';el.oninput=()=>{data[el.dataset.field]=el.value;save();render();};});
  const p=document.querySelector('[data-bool="privacy"]'); if(p){p.checked=!!data.privacy;p.onchange=()=>{data.privacy=p.checked;save();render();};}
}
function fitTexts(){
  document.querySelectorAll('.fit-text').forEach(el=>{
    let size=14; el.style.fontSize=size+'px';
    for(let i=0;i<8 && (el.scrollHeight>el.clientHeight || el.scrollWidth>el.clientWidth);i++){size-=1;el.style.fontSize=Math.max(9,size)+'px';}
  });
}

document.getElementById('edit').onclick=()=>{editing=!editing;document.getElementById('panel').classList.toggle('hidden',!editing);document.getElementById('edit').textContent=editing?'Finish Editing':'Edit PDF';if(editing)buildEditors();render();};
document.getElementById('close').onclick=()=>{editing=false;document.getElementById('panel').classList.add('hidden');document.getElementById('edit').textContent='Edit PDF';render();};
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{data[b.dataset.add].push({});save();buildEditors();render();});
document.getElementById('reset').onclick=()=>{if(confirm('Reset all dynamic data to the supplied reference PDF?')){Object.keys(DEFAULT).forEach(k=>data[k]=structuredClone(DEFAULT[k]));save();buildEditors();render();}};


/* ---------- Direct PDF generation: rasterize the complete reference + dynamic layers ---------- */
function escPdf(s){return String(s??'').replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)').replace(/\r?\n/g,' ');}
function pdfBytes(objects){
  const te=new TextEncoder(),chunks=[],off=[0];let pos=0;
  const put=b=>{chunks.push(b);pos+=b.length;};
  put(te.encode('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'));
  for(let i=1;i<objects.length;i++){
    off[i]=pos;const o=objects[i];
    if(o.stream){put(te.encode(`${i} 0 obj\n${o.header}\nstream\n`));put(o.bytes);put(te.encode('\nendstream\nendobj\n'));}
    else put(te.encode(`${i} 0 obj\n${o}\nendobj\n`));
  }
  const x=pos;put(te.encode(`xref\n0 ${objects.length}\n0000000000 65535 f \n`));
  for(let i=1;i<objects.length;i++)put(te.encode(`${String(off[i]).padStart(10,'0')} 00000 n \n`));
  put(te.encode(`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`));
  const out=new Uint8Array(chunks.reduce((n,b)=>n+b.length,0));let at=0;chunks.forEach(b=>{out.set(b,at);at+=b.length;});return out;
}
function loadImage(src){
  return new Promise((resolve,reject)=>{
    const im=new Image();
    const url=new URL(src, document.baseURI).href;
    im.onload=()=>resolve(im);
    im.onerror=()=>reject(new Error('Could not load reference image: '+url));
    im.src=url;
  });
}
function canvasForPage(page){
  const extra=page===1?shifts().total:busExtra();
  const c=document.createElement('canvas');c.width=1275;c.height=1650+extra;const ctx=c.getContext('2d');
  // The shifted slices intentionally leave temporary gaps where rows are inserted.
  // Paint the whole page white first so those gaps never become black in JPEG/PDF output.
  ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);
  return {c,ctx,extra};
}
function drawShiftedBackground(ctx,img,page){
  if(page===1){
    const cuts=[0,sections.prescription.bottom,sections.otc.bottom,sections.supplies.bottom,sections.parking.bottom,sections.mileage.bottom,1650];let cum=0;
    for(let i=0;i<cuts.length-1;i++){const y0=cuts[i],y1=cuts[i+1];ctx.drawImage(img,0,y0,1275,y1-y0,0,y0+cum,1275,y1-y0);const k=order[i];if(k)cum+=extraRows(k)*55;}
  }else{
    const extra=busExtra();ctx.drawImage(img,0,0,1275,busSpec.bottom,0,0,1275,busSpec.bottom);ctx.drawImage(img,0,busSpec.bottom,1275,1650-busSpec.bottom,0,busSpec.bottom+extra,1275,1650-busSpec.bottom);
  }
}
function fillRect(ctx,x,y,w,h){ctx.save();ctx.fillStyle='#fff';ctx.fillRect(x,y,w,h);ctx.restore();}
function wrapCanvasText(ctx,text,maxWidth,maxLines){
  const words=String(text??'').split(/\s+/).filter(Boolean),lines=[];let line='';
  for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;if(lines.length===maxLines)break;}else line=test;}
  if(line&&lines.length<maxLines)lines.push(line);return lines;
}
function drawCellText(ctx,text,x,y,w,h){
  if(text===undefined||text===null||text==='')return;
  let size=14;ctx.font=`${size}px Georgia`;const maxW=w-16,maxH=h-12;
  let lines=wrapCanvasText(ctx,text,maxW,3);
  while(lines.some(l=>ctx.measureText(l).width>maxW) && size>9){size--;ctx.font=`${size}px Georgia`;lines=wrapCanvasText(ctx,text,maxW,3);}
  const lineH=size*1.12,total=lines.length*lineH;let yy=y+(h-total)/2+size*0.82;
  ctx.fillStyle='#174e80';ctx.textBaseline='alphabetic';for(const l of lines){ctx.fillText(l,x+8,yy);yy+=lineH;}
}
function drawTableCanvas(ctx,k){
  if(!changedSection(k))return;
  const s=sections[k],sh=shifts().before[k],x=s.cols[0],y=s.top+sh,w=s.cols.at(-1)-x,hh=s.headBottom-s.top,rh=s.rowH,rows=data[k]||[];
  fillRect(ctx,x,y,w,hh+rows.length*rh);
  ctx.save();ctx.strokeStyle='#111';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,hh+rows.length*rh-1);
  for(let i=1;i<s.cols.length-1;i++){const xx=s.cols[i]+.5;ctx.beginPath();ctx.moveTo(xx,y);ctx.lineTo(xx,y+hh+rows.length*rh);ctx.stroke();}
  ctx.beginPath();ctx.moveTo(x,y+hh+.5);ctx.lineTo(x+w,y+hh+.5);ctx.stroke();
  rows.forEach((r,ri)=>{const yy=y+hh+ri*rh+.5;ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+w,yy);ctx.stroke();});
  ctx.fillStyle='#111';ctx.textBaseline='top';ctx.font='14px Georgia';
  s.labels.forEach((l,i)=>{const cx=s.cols[i],cw=s.cols[i+1]-s.cols[i];const lines=wrapCanvasText(ctx,l,cw-16,3);lines.forEach((ln,j)=>ctx.fillText(ln,cx+8,y+7+j*15));});
  rows.forEach((r,ri)=>s.fields.forEach((f,i)=>drawCellText(ctx,r[f],s.cols[i],y+hh+ri*rh,cw=s.cols[i+1]-s.cols[i],rh)));
  ctx.restore();
}
function drawBusCanvas(ctx){
  if(!changedBus())return;
  const s=busSpec,x=s.cols[0],y=s.top,w=s.cols.at(-1)-x,hh=70,rh=55,rows=data.bus||[];fillRect(ctx,x,y,w,hh+rows.length*rh);
  ctx.save();ctx.strokeStyle='#111';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,hh+rows.length*rh-1);
  for(let i=1;i<s.cols.length-1;i++){const xx=s.cols[i]+.5;ctx.beginPath();ctx.moveTo(xx,y);ctx.lineTo(xx,y+hh+rows.length*rh);ctx.stroke();}
  ctx.beginPath();ctx.moveTo(x,y+hh+.5);ctx.lineTo(x+w,y+hh+.5);ctx.stroke();
  rows.forEach((r,ri)=>{const yy=y+hh+ri*rh+.5;ctx.beginPath();ctx.moveTo(x,yy);ctx.lineTo(x+w,yy);ctx.stroke();});
  ctx.fillStyle='#111';ctx.font='14px Georgia';ctx.textBaseline='top';s.labels.forEach((l,i)=>wrapCanvasText(ctx,l,s.cols[i+1]-s.cols[i]-16,4).forEach((ln,j)=>ctx.fillText(ln,s.cols[i]+8,y+7+j*15)));
  rows.forEach((r,ri)=>s.fields.forEach((f,i)=>drawCellText(ctx,r[f],s.cols[i],y+hh+ri*rh,s.cols[i+1]-s.cols[i],rh)));ctx.restore();
}
function drawChangedTop(ctx){
  if(!eq(data.workerName,DEFAULT.workerName)){fillRect(ctx,68,194,424,32);ctx.fillStyle='#174e80';ctx.font='18px Georgia';ctx.textBaseline='middle';ctx.fillText(String(data.workerName||''),70,208);}
  if(!eq(data.claimNo,DEFAULT.claimNo)){fillRect(ctx,768,119,209,34);ctx.fillStyle='#174e80';ctx.font='18px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(data.claimNo||''),872,136);ctx.textAlign='left';}
}
function drawPrivacy(ctx){
  const y=429+busExtra();if(data.privacy===DEFAULT.privacy)return;
  fillRect(ctx,76,y-2,20,22);ctx.strokeStyle='#111';ctx.strokeRect(78,y,14,14);if(data.privacy){ctx.font='bold 13px Arial';ctx.fillStyle='#111';ctx.fillText('✓',79,y+12);}
}
function canvasJpeg(canvas){
  return new Promise((resolve,reject)=>{
    try{
      if(typeof canvas.toBlob==='function'){
        canvas.toBlob(b=>b?resolve(b):reject(new Error('Browser failed to encode the PDF page.')), 'image/jpeg', 0.96);
      }else{
        const dataUrl=canvas.toDataURL('image/jpeg',0.96);
        const raw=atob(dataUrl.split(',')[1]);
        const bytes=new Uint8Array(raw.length);
        for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
        resolve(new Blob([bytes],{type:'image/jpeg'}));
      }
    }catch(e){reject(e);}
  });
}
function blobBytes(blob){return new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(new Uint8Array(fr.result));fr.onerror=reject;fr.readAsArrayBuffer(blob);});}
async function generatePdf(){
  const btn=document.getElementById('savePdf'),old=btn.textContent;btn.disabled=true;btn.textContent='Generating PDF…';
  try{
    const imgs=await Promise.all([loadImage('assets/page-1.png'),loadImage('assets/page-2.png')]);
    const objects=[null,'<< /Type /Catalog /Pages 2 0 R >>',null],kids=[];
    for(let p=1;p<=2;p++){
      const {c,ctx,extra}=canvasForPage(p);drawShiftedBackground(ctx,imgs[p-1],p);if(p===1){drawChangedTop(ctx);for(const k of order)drawTableCanvas(ctx,k);}else{drawBusCanvas(ctx);drawPrivacy(ctx);}
      const blob=await canvasJpeg(c),ib=await blobBytes(blob),ii=objects.length;
      objects.push({stream:true,header:`<< /Type /XObject /Subtype /Image /Width ${c.width} /Height ${c.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${ib.length} >>`,bytes:ib});
      const ci=objects.length;objects.push(null);const pi=objects.length;objects.push(null);kids.push(pi);
      const pageH=(792+extra*.48).toFixed(2),content=new TextEncoder().encode(`q 612 0 0 ${pageH} 0 0 cm /Im${p} Do Q`);objects[ci]={stream:true,header:`<< /Length ${content.length} >>`,bytes:content};
      objects[pi]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 ${pageH}] /Resources << /XObject << /Im${p} ${ii} 0 R >> >> /Contents ${ci} 0 R >>`;
    }
    objects[2]=`<< /Type /Pages /Kids [${kids.map(i=>i+' 0 R').join(' ')}] /Count 2 >>`;
    const blob=new Blob([pdfBytes(objects)],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Medical_Travel_Expense_Request_${data.claimNo||'updated'}.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }catch(e){
    console.error('Save PDF failed:',e);
    alert('Could not generate the PDF. '+(e&&e.message?e.message:'Please check the browser console.'));
  }
  finally{btn.disabled=false;btn.textContent=old;}
}

document.getElementById('savePdf').onclick=generatePdf;
buildEditors();render();
