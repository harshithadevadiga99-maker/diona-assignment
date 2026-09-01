const DEFAULT={
 workerName:"Madeleine Willson",claimNo:"20042047",returnDate:"March 15, 2024",
 returnStatus:"returned",workingStatus:"Modified duties, reduced hours",otherWorking:"",
 returnComment:"Terrible. Testing Testing",expectedReturn:"",concerns:"",
 employerContact:"",employerDate:"",recovery:"recovered",recoveryComments:"",
 pain:5,treatment:"continuing",providerType:"",lastDate:"",lastProvider:"",
 nextDate:"",nextProvider:"",frequency:"",medicationStatus:"taking",medication:"",
 exerciseStatus:"not_doing",exercises:"",other:"No info Testing Testing",
 appId:"712041",submitted:"March 19, 2024 19:21",certify:true,privacy:true
};
let data=JSON.parse(localStorage.getItem("wcb-reference-data-v2")||"null")||structuredClone(DEFAULT);
let editing=false;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[c]));
const LINE=new Set(["returnDate","expectedReturn","employerContact","employerDate","providerType","lastDate","lastProvider","nextDate","nextProvider","frequency","medication"]);
const BOX=new Set(["returnComment","concerns","recoveryComments","exercises","other"]);
function t(key,x,y,w,h,size=11,cls=""){
 const kind=LINE.has(key)?" line-field":BOX.has(key)?" box-field":"";
 return `<span class="dynamic ${kind} ${cls}" data-key="${key}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;font-size:${size}px">${esc(data[key])}</span>`;
}
function c(key,value,x,y){return `<button class="cb ${data[key]===value?"on":""}" data-choice="${key}" data-value="${esc(value)}" style="left:${x}px;top:${y}px"></button>`}
function footer(){
 return `${t("appId",32,737,115,12,9,"black-dynamic")}${t("submitted",415,737,150,12,9,"black-dynamic")}`;
}
function page1(){return `<section class="page p1"><div class="layer">
${t("workerName",34.5,99.2,95,14,11.25)}${t("claimNo",421.5,61.1,51,13,11.25,"black-dynamic")}
${t("returnDate",460,169.2,80,15,11.25)}
${c("returnStatus","not_missed",40.8,174.1)}${c("returnStatus","not_returned",176.2,174.7)}${c("returnStatus","returned",309.6,174.7)}
${c("workingStatus","Full duties, regular hours",41.9,246.6)}${c("workingStatus","Full duties, reduced hours",176.9,246.6)}${c("workingStatus","Modified duties, regular hours",312.7,246.6)}${c("workingStatus","Modified duties, reduced hours",448.4,246.6)}${c("workingStatus","Other",41.7,282.8)}
${t("otherWorking",99,278.0,334,16,11)}
${t("returnComment",40.5,344.6,520,16,11.25)}
${t("expectedReturn",218,381.7,136,15,10.5)}
${t("concerns",41.5,438.8,535,54,11)}
${t("employerContact",234.6,514.3,136.5,15,9.5)}${t("employerDate",408.6,514.3,135.7,15,9.5)}
${c("recovery","not_recovered",43.1,600.3)}${c("recovery","recovered",313.8,600.3)}
${t("recoveryComments",40.8,670.8,535,50,11)}
${footer()}</div></section>`}
function page2(){
 let p="";const xs=[312.8,367.5,421.5,475.5,529.5];xs.forEach((x,i)=>p+=c("pain",i+1,x,34.5));xs.forEach((x,i)=>p+=c("pain",i+6,x,56.2));
 return `<section class="page p2"><div class="layer">${p}
${c("treatment","not_continuing",41.2,99.8)}${c("treatment","continuing",213.8,99.8)}
${t("providerType",385,104.5,187,14,9)}
${t("lastDate",213.8,161.5,136.4,14,9)}${t("lastProvider",387.8,161.5,135.7,14,9)}
${t("nextDate",213.8,218.5,136.4,14,9)}${t("nextProvider",387.8,218.5,135.7,14,9)}
${t("frequency",306.8,275.3,216.5,14,9)}
${c("medicationStatus","not_taking",41.2,356.2)}${c("medicationStatus","taking",216,356.2)}
${t("medication",389.2,381.5,183.5,14,9)}
${c("exerciseStatus","not_doing",41.2,462.8)}${c("exerciseStatus","doing",312,462.8)}
${t("exercises",39,532.7,535,53,11)}
${t("other",39,653,535,16,11.25)}
${footer()}</div></section>`}
function page3(){return `<section class="page p3"><div class="layer">
${c("certify",true,40.5,47.9)}${c("privacy",true,40.5,164.9)}${footer()}
</div></section>`}

/* ---------------- Direct PDF generator ----------------
   No browser print dialog is used.
   The supplied reference page artwork is embedded as the page image,
   then current dynamic values and checkmarks are drawn on top.
*/
function pdfEscape(value){
  return String(value ?? "")
    .replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)")
    .replace(/\r?\n/g," ");
}
function pdfBytesFromBase64(b64){
  const raw=atob(b64);
  const out=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++) out[i]=raw.charCodeAt(i);
  return out;
}
function wrapPdfText(text,maxChars){
  const words=String(text??"").split(/\s+/).filter(Boolean);
  const lines=[]; let line="";
  for(const word of words){
    const test=line?line+" "+word:word;
    if(test.length>maxChars && line){lines.push(line);line=word;}
    else line=test;
  }
  if(line||!lines.length) lines.push(line);
  return lines;
}
function pdfText(cmds,text,x,top,size=11,font="/F1",maxChars=999){
  if(text===""||text==null) return;
  const lines=wrapPdfText(text,maxChars);
  const leading=size*1.18;
  for(let i=0;i<lines.length;i++){
    const baseline=792-top-size-i*leading;
    cmds.push(`BT ${font} ${size} Tf 0.122 0.286 0.486 rg 1 0 0 1 ${x.toFixed(2)} ${baseline.toFixed(2)} Tm (${pdfEscape(lines[i])}) Tj ET`);
  }
}
function pdfBlackText(cmds,text,x,top,size=9,maxChars=999){
  if(text===""||text==null)return;
  const lines=wrapPdfText(text,maxChars);
  const leading=size*1.18;
  for(let i=0;i<lines.length;i++){
    const baseline=792-top-size-i*leading;
    cmds.push(`BT /F2 ${size} Tf 0 0 0 rg 1 0 0 1 ${x.toFixed(2)} ${baseline.toFixed(2)} Tm (${pdfEscape(lines[i])}) Tj ET`);
  }
}
function pdfCheck(cmds,x,top,on){
  // 10x10 checkbox matching the on-screen overlay.
  const y=792-top-10;
  cmds.push(`0 0 0 RG 0.8 w ${x.toFixed(2)} ${y.toFixed(2)} 10 10 re S`);
  if(on){
    cmds.push(`0 0 0 RG 1.1 w ${ (x+2).toFixed(2)} ${(y+5).toFixed(2)} m ${(x+4.2).toFixed(2)} ${(y+2.6).toFixed(2)} l ${(x+8.2).toFixed(2)} ${(y+7.8).toFixed(2)} l S`);
  }
}
async function loadImageDataUrl(src){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>{
      const canvas=document.createElement("canvas");
      canvas.width=img.naturalWidth; canvas.height=img.naturalHeight;
      const ctx=canvas.getContext("2d",{alpha:false});
      ctx.drawImage(img,0,0);
      resolve(canvas.toDataURL("image/jpeg",0.96));
    };
    img.onerror=()=>reject(new Error("Could not load "+src));
    img.src=src;
  });
}
function buildPdf(objects){
  const chunks=[];
  const offsets=[0];
  let position=0;
  const push=s=>{
    const enc=new TextEncoder().encode(s);
    chunks.push(enc); position+=enc.length;
  };
  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  for(let i=1;i<objects.length;i++){
    offsets[i]=position;
    push(`${i} 0 obj\n${objects[i]}\nendobj\n`);
  }
  const xref=position;
  push(`xref\n0 ${objects.length}\n`);
  push("0000000000 65535 f \n");
  for(let i=1;i<objects.length;i++) push(`${String(offsets[i]).padStart(10,"0")} 00000 n \n`);
  push(`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  let total=chunks.reduce((n,b)=>n+b.length,0);
  const out=new Uint8Array(total); let off=0;
  for(const b of chunks){out.set(b,off);off+=b.length;}
  return out;
}
async function generateDirectPdf(){
  const btn=document.getElementById("savePdfBtn");
  const old=btn.textContent;
  btn.disabled=true; btn.textContent="Generating PDF…";
  try{
    const pageJpegs=await Promise.all([
      loadImageDataUrl("assets/page-1.png"),
      loadImageDataUrl("assets/page-2.png"),
      loadImageDataUrl("assets/page-3.png")
    ]);

    const objects=[null];
    // 1 catalog, 2 pages tree, 3-5 page objects, 6-8 image objects,
    // 9-11 content streams, 12 Times-Roman, 13 Helvetica.
    objects.push("<< /Type /Catalog /Pages 2 0 R >>");
    objects.push("<< /Type /Pages /Kids [3 0 R 4 0 R 5 0 R] /Count 3 >>");

    const imageObjIds=[6,7,8], pageObjIds=[3,4,5], contentObjIds=[9,10,11];
    for(let p=0;p<3;p++){
      objects[pageObjIds[p]]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /ProcSet [/PDF /Text /ImageC] /Font << /F1 12 0 R /F2 13 0 R >> /XObject << /Im${p+1} ${imageObjIds[p]} 0 R >> >> /Contents ${contentObjIds[p]} 0 R >>`;
    }

    // JPEG image objects. 918x1188 is exactly the Letter ratio.
    for(let p=0;p<3;p++){
      const b64=pageJpegs[p].split(",")[1];
      const bytes=pdfBytesFromBase64(b64);
      objects[imageObjIds[p]]={
        __stream:true,
        header:`<< /Type /XObject /Subtype /Image /Width 918 /Height 1188 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>`,
        bytes
      };
    }

    const contents=[];
    for(let p=0;p<3;p++){
      const cmds=[];
      cmds.push("q 612 0 0 792 0 0 cm /Im"+(p+1)+" Do Q");
      if(p===0){
        pdfText(cmds,data.workerName,34.5,99.2,11.25,"/F1",30);
        pdfBlackText(cmds,data.claimNo,421.5,61.1,11.25,30);
        pdfText(cmds,data.returnDate,460,169.2,11.25,"/F1",22);
        pdfText(cmds,data.returnComment,40.5,344.6,11.25,"/F1",65);
        pdfText(cmds,data.otherWorking,99,278,11,"/F1",55);
        pdfText(cmds,data.expectedReturn,218,381.7,10.5,"/F1",24);
        pdfText(cmds,data.concerns,41.5,438.8,11,"/F1",72);
        pdfText(cmds,data.employerContact,234.6,514.3,9.5,"/F1",25);
        pdfText(cmds,data.employerDate,408.6,514.3,9.5,"/F1",25);
        pdfText(cmds,data.recoveryComments,40.8,670.8,11,"/F1",72);
        pdfCheck(cmds,40.8,174.1,data.returnStatus==="not_missed");
        pdfCheck(cmds,176.2,174.7,data.returnStatus==="not_returned");
        pdfCheck(cmds,309.6,174.7,data.returnStatus==="returned");
        pdfCheck(cmds,41.9,246.6,data.workingStatus==="Full duties, regular hours");
        pdfCheck(cmds,176.9,246.6,data.workingStatus==="Full duties, reduced hours");
        pdfCheck(cmds,312.7,246.6,data.workingStatus==="Modified duties, regular hours");
        pdfCheck(cmds,448.4,246.6,data.workingStatus==="Modified duties, reduced hours");
        pdfCheck(cmds,41.7,282.8,data.workingStatus==="Other");
        pdfCheck(cmds,43.1,600.3,data.recovery==="not_recovered");
        pdfCheck(cmds,313.8,600.3,data.recovery==="recovered");
        pdfBlackText(cmds,data.appId,32,737,9,30);
        pdfBlackText(cmds,data.submitted,415,737,9,30);
      } else if(p===1){
        const xs=[312.8,367.5,421.5,475.5,529.5];
        xs.forEach((x,i)=>pdfCheck(cmds,x,34.5,Number(data.pain)===i+1));
        xs.forEach((x,i)=>pdfCheck(cmds,x,56.2,Number(data.pain)===i+6));
        pdfCheck(cmds,41.2,99.8,data.treatment==="not_continuing");
        pdfCheck(cmds,213.8,99.8,data.treatment==="continuing");
        pdfText(cmds,data.providerType,385,104.5,9,"/F1",30);
        pdfText(cmds,data.lastDate,213.8,161.5,9,"/F1",22);
        pdfText(cmds,data.lastProvider,387.8,161.5,9,"/F1",22);
        pdfText(cmds,data.nextDate,213.8,218.5,9,"/F1",22);
        pdfText(cmds,data.nextProvider,387.8,218.5,9,"/F1",22);
        pdfText(cmds,data.frequency,306.8,275.3,9,"/F1",32);
        pdfCheck(cmds,41.2,356.2,data.medicationStatus==="not_taking");
        pdfCheck(cmds,216,356.2,data.medicationStatus==="taking");
        pdfText(cmds,data.medication,389.2,381.5,9,"/F1",30);
        pdfCheck(cmds,41.2,462.8,data.exerciseStatus==="not_doing");
        pdfCheck(cmds,312,462.8,data.exerciseStatus==="doing");
        pdfText(cmds,data.exercises,39,532.7,11,"/F1",72);
        pdfText(cmds,data.other,39,653,11.25,"/F1",72);
        pdfBlackText(cmds,data.appId,32,737,9,30);
        pdfBlackText(cmds,data.submitted,415,737,9,30);
      } else {
        pdfCheck(cmds,40.5,47.9,!!data.certify);
        pdfCheck(cmds,40.5,164.9,!!data.privacy);
        pdfBlackText(cmds,data.appId,32,737,9,30);
        pdfBlackText(cmds,data.submitted,415,737,9,30);
      }
      contents.push(cmds.join("\n"));
    }

    for(let p=0;p<3;p++){
      const s=contents[p];
      objects[contentObjIds[p]]={__stream:true,header:`<< /Length ${new TextEncoder().encode(s).length} >>`,bytes:new TextEncoder().encode(s)};
    }
    objects[12]="<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>";
    objects[13]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";

    // Serialize objects containing binary streams without corrupting JPEG bytes.
    const chunks=[]; const offsets=[0]; let pos=0;
    const pushBytes=b=>{chunks.push(b);pos+=b.length};
    const te=new TextEncoder();
    pushBytes(te.encode("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"));
    for(let i=1;i<objects.length;i++){
      offsets[i]=pos;
      const obj=objects[i];
      if(obj && obj.__stream){
        pushBytes(te.encode(`${i} 0 obj\n${obj.header}\nstream\n`));
        pushBytes(obj.bytes);
        pushBytes(te.encode("\nendstream\nendobj\n"));
      }else{
        pushBytes(te.encode(`${i} 0 obj\n${obj}\nendobj\n`));
      }
    }
    const xref=pos;
    pushBytes(te.encode(`xref\n0 ${objects.length}\n0000000000 65535 f \n`));
    for(let i=1;i<objects.length;i++) pushBytes(te.encode(`${String(offsets[i]).padStart(10,"0")} 00000 n \n`));
    pushBytes(te.encode(`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`));
    const total=chunks.reduce((n,b)=>n+b.length,0), out=new Uint8Array(total);
    let at=0; for(const b of chunks){out.set(b,at);at+=b.length;}
    const blob=new Blob([out],{type:"application/pdf"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=`Worker_Progress_Report_${data.claimNo||"updated"}.pdf`;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  }catch(err){
    console.error(err);
    alert("Could not generate the PDF. Please make sure the project is opened through the local server so the page images can be loaded.");
  }finally{
    btn.disabled=false; btn.textContent=old;
  }
}

function save(){localStorage.setItem("wcb-reference-data-v2",JSON.stringify(data))}
function render(){document.getElementById("report").innerHTML=page1()+page2()+page3();bind();if(editing)enableDirect();updateButtons()}
function bind(){document.querySelectorAll(".cb").forEach(b=>b.onclick=()=>{
 const k=b.dataset.choice;
 if(k==="certify"||k==="privacy") data[k]=!data[k];
 else data[k]=k==="pain"?Number(b.dataset.value):b.dataset.value;
 save();render();
})}
function enableDirect(){document.querySelectorAll(".dynamic").forEach(el=>{el.classList.add("editable");el.contentEditable="true";el.spellcheck=false;el.oninput=()=>{const k=el.dataset.key;data[k]=k==="pain"?Math.max(1,Math.min(10,Number(el.textContent)||1)):el.textContent;save();const input=document.querySelector(`[data-field="${k}"]`);if(input)input.value=data[k]}})}
function fillPanel(){document.querySelectorAll("[data-field]").forEach(el=>{el.value=data[el.dataset.field]??"";el.oninput=()=>{const k=el.dataset.field;data[k]=k==="pain"?Math.max(1,Math.min(10,Number(el.value)||1)):el.value;save();render()}});document.querySelectorAll(".choice-groups [data-choice]").forEach(b=>b.onclick=()=>{const k=b.dataset.choice;if(k==="certify"||k==="privacy")data[k]=!data[k];else data[k]=k==="pain"?Number(b.dataset.value):b.dataset.value;save();render()})}
function updateButtons(){document.querySelectorAll(".choice-groups [data-choice]").forEach(b=>{const k=b.dataset.choice;const selected=(k==="certify"||k==="privacy")?!!data[k]:data[k]===b.dataset.value;b.classList.toggle("selected",selected)})}
document.getElementById("editBtn").onclick=()=>{editing=!editing;document.getElementById("editor").classList.toggle("hidden",!editing);document.getElementById("editBtn").textContent=editing?"Finish Editing":"Edit PDF";if(editing){fillPanel();enableDirect()}};
document.getElementById("closeBtn").onclick=()=>{editing=false;document.getElementById("editor").classList.add("hidden");document.getElementById("editBtn").textContent="Edit PDF";render()};
document.getElementById("resetBtn").onclick=()=>{if(confirm("Reset all data to the supplied reference PDF?")){data=structuredClone(DEFAULT);save();render();if(editing)fillPanel()}};
document.getElementById("savePdfBtn").onclick=generateDirectPdf;render();
