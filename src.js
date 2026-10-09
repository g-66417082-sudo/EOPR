import { jsPDF } from 'jspdf';
import './style.css';

const subjects = ['Bahasa Melayu','Bahasa Inggeris','Bahasa Cina','Bahasa Tamil','Bahasa Jepun','Kesusasteraan Melayu Komunikatif','Matematik','Sains','Sejarah','Pendidikan Islam','Pendidikan Moral','Lain-lain'];
const days = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];
const app = document.querySelector('#app');
app.innerHTML = `
  <header class="hero"><div class="hero-inner"><img class="logo" src="/logo-sekolah.jpg" alt="Logo rasmi SMK(P) Jalan Ipoh"/><div><div class="eyebrow">SMK(P) JALAN IPOH · KUALA LUMPUR</div><h1>Sistem e-OPR <span>PdPR</span></h1><p>Laporan PdPR digital • PDF A4 potret • Dokumentasi bergambar</p></div></div></header>
  <main><div class="intro"><div><span class="pill">BORANG PELAPORAN</span><h2>Laporan Pelaksanaan PdPR</h2><p>Lengkapkan maklumat, lampirkan sehingga 4 gambar dan jana laporan PDF.</p></div><div class="stamp">01 <small>/ LAPORAN</small></div></div>
  <form id="reportForm"><section class="panel"><div class="section-title"><span class="step">1</span><div><h3>Maklumat PdPR</h3><p>Maklumat sesi pengajaran dan pembelajaran</p></div></div><div class="fields">
  <label>Hari <span>*</span><select id="hari" required><option value="">Pilih hari</option>${days.map(d=>`<option>${d}</option>`).join('')}</select></label>
  <label>Tarikh <span>*</span><input id="tarikh" type="date" required/></label>
  <label>Masa <span>*</span><input id="masa" placeholder="Contoh: 8.00 – 9.00 pagi" required maxlength="70"/></label>
  <label>Subjek <span>*</span><select id="subjek" required><option value="">Pilih subjek</option>${subjects.map(s=>`<option>${s}</option>`).join('')}</select></label>
  <label>Kelas <span>*</span><input id="kelas" placeholder="Contoh: 3 Amanah" required maxlength="100"/></label>
  <label>Kehadiran <span>*</span><input id="kehadiran" placeholder="Contoh: 25/30" required maxlength="40"/></label>
  <label class="full">Tajuk PdPR <span>*</span><input id="tajuk" placeholder="Tajuk pembelajaran" required maxlength="200"/></label>
  <label class="full">Link Google Meet <input id="meet" type="url" placeholder="https://meet.google.com/..." maxlength="600"/></label>
  <label class="full">Link Kuiz <input id="kuiz" type="url" placeholder="https://..." maxlength="600"/></label>
  </div></section>
  <section class="panel"><div class="section-title"><span class="step">2</span><div><h3>Dokumentasi Bergambar</h3><p>JPG, PNG atau WebP · maksimum 4 gambar · 5 MB setiap gambar</p></div></div>
  <label class="upload" for="gambar"><span class="upload-icon">＋</span><strong>Klik untuk pilih gambar</strong><small>Gambar dipaparkan di bawah sebelum PDF dijana</small></label><input id="gambar" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden/><div id="previews" class="previews"></div>
  </section><div id="message" role="status" aria-live="polite"></div><div class="actions"><button type="reset" class="secondary">Kosongkan borang</button><button type="submit" id="generate">↓ Jana & Muat Turun PDF</button></div></form>
  <p class="privacy">Privasi: Versi ini menjana PDF dalam pelayar. Maklumat dan gambar tidak dihantar ke pelayan atau disimpan secara automatik.</p></main><footer>© SMK(P) Jalan Ipoh · Sistem e-OPR PdPR</footer>`;

const form = document.querySelector('#reportForm');
const filesInput = document.querySelector('#gambar');
const previews = document.querySelector('#previews');
const message = document.querySelector('#message');
const generate = document.querySelector('#generate');
const $ = id => document.getElementById(id).value.trim();
let photos = [];

function setMessage(text, error = false) { message.textContent = text; message.className = error ? 'error' : 'success'; }
function readImage(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = reader.result; }; reader.onerror = reject; reader.readAsDataURL(file); }); }
function asJpeg(img) { const c = document.createElement('canvas'); const max = 1300; const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)); c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale); const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0,0,c.width,c.height); ctx.drawImage(img,0,0,c.width,c.height); return {data:c.toDataURL('image/jpeg',.82),width:c.width,height:c.height}; }
filesInput.addEventListener('change', async () => {
  setMessage(''); const files = [...filesInput.files];
  if(files.length > 4) { filesInput.value=''; photos=[]; previews.innerHTML=''; setMessage('Pilih maksimum 4 gambar sahaja.',true); return; }
  if(files.some(f => !['image/jpeg','image/png','image/webp'].includes(f.type) || f.size > 5*1024*1024)) { filesInput.value=''; photos=[]; previews.innerHTML=''; setMessage('Gunakan gambar JPG, PNG atau WebP dengan saiz tidak melebihi 5 MB setiap satu.',true); return; }
  try { photos = await Promise.all(files.map(async f => ({name:f.name, ...asJpeg(await readImage(f))}))); previews.innerHTML=''; photos.forEach((p,i)=>{ const div=document.createElement('div'); div.className='preview'; const img=document.createElement('img'); img.src=p.data; img.alt=`Gambar ${i+1}`; const cap=document.createElement('small'); cap.textContent=`Gambar ${i+1}`; div.append(img,cap); previews.append(div); }); } catch { setMessage('Tidak dapat membaca gambar. Cuba fail lain.',true); }
});
form.addEventListener('reset',()=>{photos=[];previews.innerHTML='';setMessage('');});

function rounded(doc,x,y,w,h,r,fill) { doc.setFillColor(...fill); doc.roundedRect(x,y,w,h,r,r,'F'); }
function text(doc,t,x,y,opts={}) { doc.text(String(t),x,y,opts); }
function field(doc,label,value,y) {
  doc.setFillColor(245,248,253); doc.roundedRect(13,y,184,13,2,2,'F');
  doc.setTextColor(58,81,115); doc.setFont('helvetica','bold'); doc.setFontSize(9); text(doc,label,18,y+5.3);
  doc.setTextColor(23,39,66); doc.setFont('helvetica','normal'); doc.setFontSize(9);
  const val = doc.splitTextToSize(value || '—',126); text(doc,val.slice(0,2),67,y+5.2);
}
function imageContain(doc,p,x,y,w,h) {
  const ratio = Math.min(w/p.width,h/p.height); const dw=p.width*ratio, dh=p.height*ratio;
  doc.addImage(p.data,'JPEG',x+(w-dw)/2,y+(h-dh)/2,dw,dh);
}
async function createPDF() {
  const doc = new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
  const W=210, H=297;
  doc.setFillColor(17,56,104); doc.rect(0,0,W,47,'F');
  doc.setFillColor(27,126,191); doc.rect(0,44,W,3,'F');
  try { const logo = await readImageFromUrl('/logo-sekolah.jpg'); const p=asJpeg(logo); rounded(doc,13,8,30,30,3,[255,255,255]); imageContain(doc,p,15,10,26,26); } catch { /* keep PDF usable */ }
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(16); text(doc,'LAPORAN e-OPR PdPR',49,19);
  doc.setFontSize(10); text(doc,'SMK(P) JALAN IPOH',49,26); doc.setFont('helvetica','normal'); doc.setFontSize(8); text(doc,'KUALA LUMPUR  |  LAPORAN SATU MUKA SURAT',49,32);
  doc.setTextColor(17,56,104); doc.setFont('helvetica','bold'); doc.setFontSize(11); text(doc,'MAKLUMAT PELAKSANAAN',13,57);
  const rawDate=$('tarikh'); const [yy,mm,dd]=rawDate.split('-'); const date=rawDate?`${dd}/${mm}/${yy}`:'—';
  const vals=[['Hari',$('hari')],['Tarikh',date],['Masa',$('masa')],['Subjek',$('subjek')],['Kelas',$('kelas')],['Kehadiran',$('kehadiran')],['Tajuk PdPR',$('tajuk')]];
  let y=62; vals.forEach(([a,b])=>{field(doc,a,b,y);y+=15;});
  doc.setFontSize(10);doc.setFont('helvetica','bold');doc.setTextColor(17,56,104);text(doc,'PAUTAN AKTIVITI',13,174);
  doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(34,58,88);
  text(doc,'Google Meet:',14,181); text(doc,doc.splitTextToSize($('meet')||'Tiada pautan',158).slice(0,2),42,181);
  text(doc,'Kuiz:',14,191);text(doc,doc.splitTextToSize($('kuiz')||'Tiada pautan',158).slice(0,2),42,191);
  doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(17,56,104);text(doc,'DOKUMENTASI BERGAMBAR',13,205);
  const x0=13, gap=4, iw=90, ih=33, rowY=[210,247];
  for(let i=0;i<4;i++){const x=x0+(i%2)*(iw+gap), py=rowY[Math.floor(i/2)];doc.setFillColor(241,246,251);doc.roundedRect(x,py,iw,ih,2,2,'F');if(photos[i])imageContain(doc,photos[i],x+1,py+1,iw-2,ih-2);else{doc.setTextColor(146,161,179);doc.setFont('helvetica','normal');doc.setFontSize(9);text(doc,`Gambar ${i+1}`,x+iw/2,py+ih/2,{align:'center'});}}
  doc.setDrawColor(209,221,234);doc.line(13,285,197,285);doc.setFontSize(7);doc.setTextColor(96,113,134);text(doc,'Dokumentasi PdPR | SMK(P) Jalan Ipoh',13,290);text(doc,'1 / 1',197,290,{align:'right'});
  const name=[$('tarikh'),$('kelas'),$('subjek')].join('_').replace(/[^a-zA-Z0-9_-]/g,'-');doc.save(`eOPR_PdPR_${name}.pdf`);
}
function readImageFromUrl(url){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url;});}
form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;generate.disabled=true;generate.textContent='Sedang menjana PDF...';setMessage('');try{await createPDF();setMessage('PDF berjaya dijana dan dimuat turun.');}catch(err){console.error(err);setMessage('PDF gagal dijana. Sila cuba lagi.',true);}finally{generate.disabled=false;generate.textContent='↓ Jana & Muat Turun PDF';}});
