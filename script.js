// ====== GANTI API_URL DENGAN LINK WEBAPP APPS SCRIPT MU ======
const API_URL = "https://script.google.com/macros/s/AKfycbw7gPMd8juD3no4d6dRZqWGEj9TS1QEWrFIXb02i1EuE61M8QYKxeu-hPENjx-Z8LDP/exec"; // API WEB

// helper
function qs(id){return document.getElementById(id)}

// Kirim tugas (Admin)
async function kirimTugas(){
  const nama = qs('nama').value.trim();
  const desc = qs('desc').value.trim();
  const deadline = qs('deadline').value;
  const user = qs('user').value.trim();

  if(!nama || !desc || !deadline || !user){
    qs('status').innerText = 'Lengkapi semua field!';
    return;
  }
  qs('status').innerText = 'Mengirim...';

  try{
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({nama, desc, deadline, user})
    });
    const text = await res.text();
    if(res.ok){
      qs('status').innerText = 'Tugas berhasil dikirim!';
      clearForm();
      loadPreview();
    } else {
      qs('status').innerText = 'Gagal: ' + text;
    }
  } catch(err){
    qs('status').innerText = 'Error jaringan';
    console.error(err);
  }
}

// Clear form
function clearForm(){
  qs('nama').value=''; qs('desc').value=''; qs('deadline').value=''; qs('user').value='';
  qs('status').innerText='';
}

// Load preview untuk admin
async function loadPreview(){
  const container = qs('preview');
  container.innerHTML = 'Memuat...';
  try{
    const r = await fetch(API_URL + '?action=get');
    if(!r.ok) { container.innerText = 'Gagal memuat'; return; }
    const rows = await r.json();
    if(!rows || rows.length===0){ container.innerText = 'Belum ada tugas'; return; }

    // Tampilkan tabel sederhana
    let html = '<table class="table"><tbody>';
    for(let i=rows.length-1;i>=0;i--){
      const r0=rows[i];
      html += `<tr><td><strong>${escapeHtml(r0[0])}</strong><div style="color:${'#9aa0b4'}">${escapeHtml(r0[1])}</div></td>
               <td style="text-align:right">${escapeHtml(r0[3])}<br><small>${escapeHtml(r0[2])}</small></td></tr>`;
    }
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch(e){
    container.innerText = 'Error memuat tugas';
    console.error(e);
  }
}

// Load tasks for user page (filter by username)
async function loadTasks(){
  const list = qs('list');
  if(!list) return; // safety
  list.innerHTML = 'Memuat...';
  const filter = (qs('filterUser') && qs('filterUser').value.trim().toLowerCase()) || '';
  try{
    const r = await fetch(API_URL + '?action=get');
    if(!r.ok){ list.innerText='Gagal memuat'; return; }
    const rows = await r.json();
    if(!rows || rows.length===0){ list.innerText='Belum ada tugas'; return; }

    let html = '';
    for(let i=rows.length-1;i>=0;i--){
      const r0 = rows[i];
      const nama = r0[0]||''; const desc = r0[1]||''; const deadline=r0[2]||''; const user=r0[3]||'';
      if(filter && user.toLowerCase().indexOf(filter) === -1) continue;
      html += `<div class="task-card">
                <h4>${escapeHtml(nama)}</h4>
                <div class="task-meta">Untuk: <strong>${escapeHtml(user)}</strong> • Deadline: ${escapeHtml(deadline)}</div>
                <div>${escapeHtml(desc)}</div>
               </div>`;
    }
    list.innerHTML = html || 'Tidak ada tugas sesuai filter';
  } catch(e){
    list.innerText = 'Error memuat tugas';
    console.error(e);
  }
}

// small helper to avoid XSS
function escapeHtml(s){
  if(!s) return '';
  return s.toString().replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
