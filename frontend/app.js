const API='http://localhost:8080/api';
const $=s=>document.querySelector(s);
let token=localStorage.getItem('apexcareToken')||'', user=JSON.parse(localStorage.getItem('apexcareUser')||'null'), page='dashboard';
let cache={patients:[],appointments:[],billing:[]}, authMode='login';
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function moneyPaise(n){return '₹'+(Number(n||0)/100).toLocaleString('en-IN',{maximumFractionDigits:2})}
function fmtDate(s){if(!s)return '—';return new Date(s+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
function initials(s='AC'){return s.trim().split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase()}
function toast(msg){let e=document.createElement('div');e.className='toast';e.textContent=msg;$('#toastRoot').append(e);setTimeout(()=>e.remove(),3200)}
async function api(path,options={}){let headers={'Content-Type':'application/json',...(options.headers||{})};if(token)headers.Authorization='Bearer '+token;let r=await fetch(API+path,{...options,headers});let text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}if(!r.ok){if(r.status===401&&path!='/auth/login'&&path!='/auth/register'){logout(false);throw new Error('Your session expired. Please sign in again.')}throw new Error(data?.error||data?.message||`Request failed (${r.status})`)}return data}
function showAuth(mode){authMode=mode;$('#loginTab').classList.toggle('selected',mode==='login');$('#registerTab').classList.toggle('selected',mode==='register');$('#nameField').hidden=mode!=='register';$('#nameField').querySelector('input').required=mode==='register';$('#authTitle').textContent=mode==='login'?'Welcome back':'Create your account';$('#authSubtitle').textContent=mode==='login'?'Sign in to your ApexCare workspace.':'Register to manage healthcare operations.';$('#authSubmit').innerHTML=mode==='login'?'Sign in securely <span>→</span>':'Create account <span>→</span>';$('#authError').textContent='';$('#authForm').querySelector('[name=password]').autocomplete=mode==='login'?'current-password':'new-password'}
async function submitAuth(e){e.preventDefault();let f=Object.fromEntries(new FormData(e.target));$('#authSubmit').disabled=true;$('#authError').textContent='';try{let data=await api('/auth/'+(authMode==='login'?'login':'register'),{method:'POST',body:JSON.stringify(f)});token=data.token;user={name:data.name,email:data.email};localStorage.setItem('apexcareToken',token);localStorage.setItem('apexcareUser',JSON.stringify(user));showApp();toast(authMode==='login'?'Signed in successfully':'Account created successfully')}catch(err){$('#authError').textContent=err.message}finally{$('#authSubmit').disabled=false}}
async function checkBackend(){let e=$('#authError');e.textContent='Checking API Gateway...';try{let r=await fetch(API+'/auth/health');if(r.ok){let d=await r.json();e.textContent='API connection: '+(d.status||'available')}else e.textContent='Gateway responded with '+r.status+'. Check that Docker services are running.'}catch{e.textContent='Cannot reach API Gateway. Start backend with docker compose up --build, then try again.'}}
function showApp(){if(!token||!user){$('#authScreen').hidden=false;$('#appScreen').hidden=true;return}$('#authScreen').hidden=true;$('#appScreen').hidden=false;$('#profileName').textContent=user.name||'Care Admin';$('#profileEmail').textContent=user.email||'';go('dashboard')}
function logout(showToast=true){token='';user=null;localStorage.removeItem('apexcareToken');localStorage.removeItem('apexcareUser');$('#authScreen').hidden=false;$('#appScreen').hidden=true;if(showToast)toast('You have signed out.')}
function go(p){page=p;document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===p));render()}
function setHeading(title,sub,action,fn){$('#crumb').textContent=title;$('#pageTitle').textContent=title;$('#pageSubtitle').textContent=sub;let b=$('#mainAction');b.textContent=action||'';b.onclick=fn||null;b.style.display=action?'':'none'}
function personCell(name,sub=''){return `<div class="person"><div class="person-avatar">${initials(esc(name||'?'))}</div><div><b>${esc(name||'Unknown')}</b><small>${esc(sub)}</small></div></div>`}
function badge(s){return `<span class="status ${esc((s||'').toUpperCase())}">${esc(s||'—')}</span>`}
function table(head,rows){return `<div class="table-wrap"><table><thead><tr>${head.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows||`<tr><td colspan="${head.length}" class="empty">No records found. Use the action above to add one.</td></tr>`}</tbody></table></div>`}
function panelHead(title,sub='',link='',fn=''){return `<div class="panel-head"><div><h2>${title}</h2><p>${sub}</p></div>${link?`<button class="text-link" onclick="${fn}">${link} →</button>`:''}</div>`}
function stat(label,value,icon,color,note){return `<div class="stat"><div class="stat-top">${label}<span class="stat-icon ${color}">${icon}</span></div><div class="stat-num">${value}</div><div class="stat-note">${note}</div></div>`}
async function loadAll(){let [patients,appointments,billing]=await Promise.all([api('/patients'),api('/appointments'),api('/billing')]);cache={patients,appointments,billing};}
async function refreshCurrent(){try{await loadAll();render();toast('Data refreshed from the services')}catch(e){toast(e.message)}}
async function render(){if(!token)return;try{await loadAll()}catch(e){$('#pageContent').innerHTML=`<div class="panel"><h2>Could not load service data</h2><p style="color:#7d8c83;font-size:12px">${esc(e.message)}</p><p style="color:#7d8c83;font-size:11px">Check that Docker services are running and that Eureka has registered the microservices.</p><button class="btn primary" onclick="refreshCurrent()">Retry connection ↻</button></div>`;return}({dashboard:dashboardPage,patients:patientsPage,appointments:appointmentsPage,billing:billingPage,reports:reportsPage}[page]||dashboardPage)()}
function dashboardPage(){setHeading('Operations overview','A clear view of your care operations.','＋ Add patient',()=>openPatientModal());let due=cache.billing.filter(x=>x.status!=='PAID').reduce((s,x)=>s+x.amountPaise,0);let today=new Date().toISOString().slice(0,10);let appts=cache.appointments.filter(a=>a.appointmentDate===today&&a.status!=='CANCELLED');let rows=cache.appointments.filter(a=>a.status!=='CANCELLED').slice(0,4).map((a,i)=>`<div class="schedule-row"><div class="time">${esc(a.appointmentTime)}</div><div class="timeline ${i%3===1?'blue':i%3===2?'orange':''}"></div><div><div class="appt-name">${esc(a.patientName)}</div><div class="appt-meta">${esc(a.doctorName)} · ${esc(a.department)}</div></div>${badge(a.status)}</div>`).join('');let max=Math.max(1,cache.patients.length,cache.appointments.length,5);let bars=[['Mon',2],['Tue',4],['Wed',3],['Thu',5],['Fri',4],['Sat',7],['Sun',5]].map((a,i)=>`<div class="bar-col"><div class="bar ${i===5?'current':''}" style="height:${a[1]/7*100}%"></div><div class="bar-label">${a[0]}</div></div>`).join('');$('#pageContent').innerHTML=`<div class="stats">${stat('Total patients',cache.patients.length,'♙','', 'Registered patient records')}${stat("Today's appointments",appts.length,'▣','green','Scheduled for today')}${stat('Open invoices',cache.billing.filter(x=>x.status!=='PAID').length,'＄','orange','Outstanding: '+moneyPaise(due))}${stat('Upcoming visits',cache.appointments.filter(a=>['SCHEDULED','CONFIRMED'].includes(a.status)).length,'♡','purple','Scheduled and confirmed')}</div><div class="content-grid"><div class="panel">${panelHead('Upcoming appointments','Latest non-cancelled consultations','View all',"go('appointments')")}<div>${rows||'<div class="empty">No appointments yet.</div>'}</div></div><div class="panel">${panelHead('Weekly activity','Illustrative visual, not a live analytics query')}<div class="bar-chart">${bars}</div><div class="legend"><i></i>Illustrative visit trend</div></div></div><div class="bottom-grid"><div class="panel">${panelHead('Quick actions','Common tasks')}<div class="quick-actions"><button class="quick" onclick="openPatientModal()"><span>♙＋</span><b>Register patient</b><small>Add patient details</small></button><button class="quick" onclick="openAppointmentModal()"><span>▣＋</span><b>Book appointment</b><small>Schedule a visit</small></button><button class="quick" onclick="openInvoiceModal()"><span>＄＋</span><b>Create invoice</b><small>Add a billing record</small></button></div></div><div class="panel">${panelHead('Needs attention','Current service records')}<div class="notice"><div class="notice-icon">＄</div><div><b>${cache.billing.filter(x=>x.status!=='PAID').length} invoice(s) awaiting payment</b><p>${moneyPaise(due)} outstanding balance</p></div><button class="text-link" onclick="go('billing')">Review</button></div><div class="notice"><div class="notice-icon">▣</div><div><b>${cache.appointments.filter(a=>a.status==='SCHEDULED').length} scheduled appointment(s)</b><p>Review upcoming visits and confirm bookings.</p></div><button class="text-link" onclick="go('appointments')">Review</button></div></div></div>`}
function patientsPage(){setHeading('Patient records','Manage patient profiles stored by Patient Service.','＋ Add patient',()=>openPatientModal());let rows=cache.patients.map(p=>`<tr><td>${personCell(p.name,'PT-'+p.id)}</td><td>${esc(p.age??'—')} · ${esc(p.gender||'—')}</td><td>${esc(p.phone||'—')}</td><td>${esc(p.conditionName||'—')}</td><td>${esc(p.bloodGroup||'—')}</td><td><div class="row-actions"><button class="small-btn" onclick="editPatient(${p.id})">Edit</button><button class="small-btn" onclick="deletePatient(${p.id})">Delete</button></div></td></tr>`).join('');$('#pageContent').innerHTML=`<div class="panel table-panel">${panelHead('All patients',`${cache.patients.length} records in database`)}<div class="panel-head"><input class="search" placeholder="Search patients..." oninput="filterTable(this,0)"><button class="btn secondary" onclick="exportCSV('patients')">↓ Export CSV</button></div>${table(['Patient','Age / gender','Phone','Condition','Blood group','Actions'],rows)}</div>`}
function appointmentsPage(){setHeading('Appointments','Schedule consultations and update appointment status.','＋ Book appointment',()=>openAppointmentModal());let rows=cache.appointments.map(a=>`<tr><td><b>AP-${a.id}</b></td><td>${personCell(a.patientName,'Patient ID: '+a.patientId+' · '+(a.reason||'Consultation'))}</td><td>${esc(a.doctorName)}<br><small>${esc(a.department)}</small></td><td>${fmtDate(a.appointmentDate)}<br><small>${esc(a.appointmentTime)}</small></td><td>${badge(a.status)}</td><td><div class="row-actions">${a.status==='SCHEDULED'?`<button class="small-btn" onclick="changeAppointment(${a.id},'CONFIRMED')">Confirm</button>`:''}${a.status!=='CANCELLED'?`<button class="small-btn" onclick="changeAppointment(${a.id},'CANCELLED')">Cancel</button>`:''}</div></td></tr>`).join('');$('#pageContent').innerHTML=`<div class="panel table-panel">${panelHead('Appointment schedule',`${cache.appointments.length} bookings`)}<div class="panel-head"><input class="search" placeholder="Search bookings..." oninput="filterTable(this,0)"><button class="btn secondary" onclick="exportCSV('appointments')">↓ Export CSV</button></div>${table(['Booking ID','Patient / reason','Doctor / department','Date / time','Status','Actions'],rows)}</div>`}
function billingPage(){setHeading('Billing & invoices','Track charges and payment status.','＋ Create invoice',()=>openInvoiceModal());let due=cache.billing.filter(i=>i.status!=='PAID').reduce((s,i)=>s+i.amountPaise,0),paid=cache.billing.filter(i=>i.status==='PAID').reduce((s,i)=>s+i.amountPaise,0);let rows=cache.billing.map(i=>`<tr><td><b>INV-${i.id}</b></td><td>${personCell(i.patientName,'Patient ID: '+i.patientId+' · '+i.serviceName)}</td><td>${fmtDate(i.invoiceDate)}</td><td><b>${moneyPaise(i.amountPaise)}</b></td><td>${badge(i.status)}</td><td><div class="row-actions">${i.status!=='PAID'?`<button class="small-btn" onclick="changeInvoice(${i.id},'PAID')">Mark paid</button>`:''}<button class="small-btn" onclick="deleteInvoice(${i.id})">Delete</button></div></td></tr>`).join('');$('#pageContent').innerHTML=`<div class="stats">${stat('Total invoices',cache.billing.length,'▤','','All billing records')}${stat('Payments received',moneyPaise(paid),'✓','green','Marked as paid')}${stat('Outstanding balance',moneyPaise(due),'＄','orange','Pending and overdue')}${stat('Payment records',cache.billing.filter(i=>i.status==='PAID').length,'♡','purple','Completed payments')}</div><div class="panel table-panel">${panelHead('Invoice ledger','Billing records from Billing Service')}<div class="panel-head"><input class="search" placeholder="Search invoices..." oninput="filterTable(this,0)"><button class="btn secondary" onclick="exportCSV('billing')">↓ Export CSV</button></div>${table(['Invoice ID','Patient / service','Issue date','Amount','Status','Actions'],rows)}</div>`}
function reportsPage(){setHeading('Reports & insights','Operational summary from connected microservices.','↓ Export patients',()=>exportCSV('patients'));let paid=cache.billing.filter(i=>i.status==='PAID').reduce((s,i)=>s+i.amountPaise,0),due=cache.billing.filter(i=>i.status!=='PAID').reduce((s,i)=>s+i.amountPaise,0);$('#pageContent').innerHTML=`<div class="report-grid"><div class="panel report-card"><h3>Patient directory</h3><div class="big">${cache.patients.length}</div><p>Patient Service records</p><button class="text-link" onclick="go('patients')">Open records →</button></div><div class="panel report-card"><h3>Appointment volume</h3><div class="big">${cache.appointments.length}</div><p>Bookings managed by Appointment Service</p><button class="text-link" onclick="go('appointments')">View appointments →</button></div><div class="panel report-card"><h3>Revenue received</h3><div class="big">${moneyPaise(paid)}</div><p>${moneyPaise(due)} outstanding</p><button class="text-link" onclick="go('billing')">View billing →</button></div></div><div class="panel" style="margin-top:16px">${panelHead('Service summary','Live totals from API responses')}${table(['Metric','Value'],[['Patients',cache.patients.length],['Appointments',cache.appointments.length],['Confirmed appointments',cache.appointments.filter(a=>a.status==='CONFIRMED').length],['Paid invoices',cache.billing.filter(i=>i.status==='PAID').length],['Outstanding balance',moneyPaise(due)]].map(r=>`<tr><td>${r[0]}</td><td><b>${r[1]}</b></td></tr>`).join(''))}</div>`}
function filterTable(input,col){let q=input.value.toLowerCase(),t=input.closest('.panel').querySelector('tbody');if(!t)return;t.querySelectorAll('tr').forEach(r=>r.style.display=r.cells[col]?.innerText.toLowerCase().includes(q)?'':'none')}
function modal(title,body){$('#modalRoot').innerHTML=`<div class="modal-backdrop" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="modal-head"><h2>${title}</h2><button class="close" onclick="closeModal()">×</button></div><div class="modal-body">${body}</div></div></div>`}
function closeModal(){$('#modalRoot').innerHTML=''}
function inputField(label,name,value='',type='text',required=true,wide=false){return `<div class="form-field ${wide?'wide':''}"><label>${label}${required?' *':''}</label><input name="${name}" type="${type}" value="${esc(value??'')}" ${required?'required':''}></div>`}
function selectField(label,name,opts,value=''){return `<div class="form-field"><label>${label} *</label><select name="${name}" required>${opts.map(o=>`<option value="${esc(o)}" ${o===value?'selected':''}>${esc(o)}</option>`).join('')}</select></div>`}
function formWrap(handler,content,submit){return `<form onsubmit="${handler}(event)"><div class="form-grid">${content}</div><div class="form-hint">Fields marked * are required. Use fictional patient data for this academic demo.</div><div class="modal-actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">${submit} →</button></div></form>`}
function openPatientModal(p={}){modal(p.id?'Edit patient':'Register patient',formWrap('savePatient',inputField('Full name','name',p.name||'')+inputField('Age','age',p.age??'','number')+selectField('Gender','gender',['Female','Male','Other'],p.gender||'Female')+inputField('Phone','phone',p.phone||'','tel',false)+inputField('Email','email',p.email||'','email',false)+selectField('Blood group','bloodGroup',['Unknown','A+','A-','B+','B-','AB+','AB-','O+','O-'],p.bloodGroup||'Unknown')+inputField('Primary condition','conditionName',p.conditionName||'','text',false,true)+`<input type="hidden" name="id" value="${p.id||''}">`,'Save patient'))}
async function editPatient(id){let p=cache.patients.find(x=>x.id===id);if(p)openPatientModal(p)}
async function savePatient(e){e.preventDefault();let f=Object.fromEntries(new FormData(e.target)),id=f.id;delete f.id;f.age=f.age?Number(f.age):null;try{await api('/patients'+(id?'/'+id:''),{method:id?'PUT':'POST',body:JSON.stringify(f)});closeModal();toast(id?'Patient updated':'Patient registered');await render()}catch(err){toast(err.message)}}
async function deletePatient(id){if(!confirm('Delete this patient record?'))return;try{await api('/patients/'+id,{method:'DELETE'});toast('Patient deleted');await render()}catch(e){toast(e.message)}}
function openAppointmentModal(){if(!cache.patients.length){toast('Register a patient first.');return}let patientOpts=cache.patients.map(p=>`<option value="${p.id}" data-name="${esc(p.name)}">${esc(p.name)} (ID ${p.id})</option>`).join('');modal('Book an appointment',`<form onsubmit="saveAppointment(event)"><div class="form-grid"><div class="form-field wide"><label>Patient *</label><select name="patientId" id="appointmentPatient" required>${patientOpts}</select></div>${inputField('Patient name','patientName',cache.patients[0].name)}${selectField('Doctor','doctorName',['Dr. Ananya Rao','Dr. Arjun Mehta','Dr. Meera Iyer'],'Dr. Ananya Rao')}${selectField('Department','department',['General Medicine','Cardiology','Dermatology','Endocrinology','Pediatrics'],'General Medicine')}${inputField('Date','appointmentDate',new Date().toISOString().slice(0,10),'date')}${selectField('Time','appointmentTime',['09:00 AM','10:00 AM','11:30 AM','01:00 PM','03:00 PM','05:30 PM'],'10:00 AM')}${inputField('Reason','reason','','text',false,true)}</div><div class="form-hint">Patient Service validates the patient ID before the appointment is saved.</div><div class="modal-actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Book appointment →</button></div></form>`);$('#appointmentPatient').addEventListener('change',e=>{let o=e.target.selectedOptions[0];document.querySelector('#modalRoot [name=patientName]').value=o.dataset.name})}
async function saveAppointment(e){e.preventDefault();let f=Object.fromEntries(new FormData(e.target));f.patientId=Number(f.patientId);f.status='SCHEDULED';try{await api('/appointments',{method:'POST',body:JSON.stringify(f)});closeModal();toast('Appointment booked');await render()}catch(err){toast(err.message)}}
async function changeAppointment(id,status){try{await api('/appointments/'+id+'/status',{method:'PATCH',body:JSON.stringify({status})});toast('Appointment status updated');await render()}catch(e){toast(e.message)}}
function openInvoiceModal(){if(!cache.patients.length){toast('Register a patient first.');return}let opts=cache.patients.map(p=>`<option value="${p.id}" data-name="${esc(p.name)}">${esc(p.name)} (ID ${p.id})</option>`).join('');modal('Create invoice',`<form onsubmit="saveInvoice(event)"><div class="form-grid"><div class="form-field wide"><label>Patient *</label><select name="patientId" id="invoicePatient">${opts}</select></div>${inputField('Patient name','patientName',cache.patients[0].name)}${selectField('Service','serviceName',['Consultation','Specialist consultation','Diagnostic tests','Consultation + tests','Medication'],'Consultation')}${inputField('Amount (₹)','amount','','number')}${selectField('Status','status',['PENDING','PAID','OVERDUE'],'PENDING')}</div><div class="form-hint">Amount is stored as paise in the billing database. No payment is processed.</div><div class="modal-actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancel</button><button class="btn primary">Create invoice →</button></div></form>`);$('#invoicePatient').addEventListener('change',e=>{document.querySelector('#modalRoot [name=patientName]').value=e.target.selectedOptions[0].dataset.name})}
async function saveInvoice(e){e.preventDefault();let f=Object.fromEntries(new FormData(e.target));f.patientId=Number(f.patientId);let rupees=Number(f.amount);if(!Number.isFinite(rupees)||rupees<=0){toast('Enter an amount greater than zero.');return}f.amountPaise=Math.round(rupees*100);delete f.amount;try{await api('/billing',{method:'POST',body:JSON.stringify(f)});closeModal();toast('Invoice created');await render()}catch(err){toast(err.message)}}
async function changeInvoice(id,status){try{await api('/billing/'+id+'/status',{method:'PATCH',body:JSON.stringify({status})});toast('Payment status updated');await render()}catch(e){toast(e.message)}}
async function deleteInvoice(id){if(!confirm('Delete this invoice?'))return;try{await api('/billing/'+id,{method:'DELETE'});toast('Invoice deleted');await render()}catch(e){toast(e.message)}}
function exportCSV(kind){let arr=cache[kind]||[];if(!arr.length){toast('There are no records to export.');return}let keys=Object.keys(arr[0]),csv=[keys.join(','),...arr.map(o=>keys.map(k=>'"'+String(o[k]??'').replace(/"/g,'""')+'"').join(','))].join('\r\n');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='apexcare-'+kind+'.csv';a.click();URL.revokeObjectURL(a.href)}
if(token&&user)showApp();else showAuth('login');

/* ApexCare AI Assistant */
(function () {
    const root = document.getElementById('aiAssistantRoot');
    if (!root) return;

    root.innerHTML = `
        <button class="ai-fab" id="aiFab" aria-label="Open AI Assistant">✦</button>
        <section class="ai-panel" id="aiPanel">
            <div class="ai-header">
                <div>
                    <h3>ApexCare AI Assistant</h3>
                    <p>Hospital services support</p>
                </div>
                <button class="ai-close" id="aiClose" aria-label="Close">×</button>
            </div>
            <div class="ai-messages" id="aiMessages"></div>
            <div class="ai-quick">
                <button type="button" data-question="How many patients?">Patient count</button>
                <button type="button" data-question="Appointments summary">Appointments</button>
                <button type="button" data-question="Billing summary">Billing</button>
                <button type="button" data-question="What can you do?">Help</button>
            </div>
            <form class="ai-form" id="aiForm">
                <input id="aiInput" placeholder="Ask me something..." autocomplete="off" required>
                <button type="submit">Send</button>
            </form>
        </section>
    `;

    const panel = document.getElementById('aiPanel');
    const messages = document.getElementById('aiMessages');
    const input = document.getElementById('aiInput');

    function addMessage(text, sender) {
        const item = document.createElement('div');
        item.className = 'ai-message ' + (sender === 'user' ? 'ai-user' : 'ai-bot');
        item.textContent = text;
        messages.appendChild(item);
        messages.scrollTop = messages.scrollHeight;
    }

    function reply(question) {
        const q = question.toLowerCase();
        const data = typeof cache !== 'undefined' ? cache : {};
        const patients = Array.isArray(data.patients) ? data.patients : [];
        const appointments = Array.isArray(data.appointments) ? data.appointments : [];
        const billing = Array.isArray(data.billing) ? data.billing : [];

        addMessage(question, 'user');

        let answer;

        if (q.includes('patient')) {
            answer = `There are ${patients.length} patient record(s) currently available in the loaded dashboard.`;
        } else if (q.includes('appointment')) {
            const scheduled = appointments.filter(a =>
                String(a.status || '').toUpperCase() === 'SCHEDULED'
            ).length;
            answer = `Loaded appointments: ${appointments.length}. Scheduled: ${scheduled}.`;
        } else if (q.includes('billing') || q.includes('invoice') || q.includes('payment')) {
            const pending = billing.filter(b =>
                ['PENDING', 'OVERDUE'].includes(String(b.status || '').toUpperCase())
            ).length;
            answer = `Loaded invoices: ${billing.length}. Pending or overdue: ${pending}. No payment is processed by this assistant.`;
        } else if (q.includes('help') || q.includes('what can you do')) {
            answer = 'I can give general hospital service information and summaries of loaded patient, appointment, and billing counts. Try the buttons below.';
        } else if (q.includes('service') || q.includes('hospital')) {
            answer = 'ApexCare supports patient registration, appointment booking, hospital department selection, invoice creation, and billing-status tracking.';
        } else if (q.includes('doctor') || q.includes('department')) {
            answer = 'Available demo departments include General Medicine, Cardiology, Dermatology, Endocrinology, and Pediatrics. Check the appointment form for the current options.';
        } else if (q.includes('hi') || q.includes('hello') || q.includes('hey')) {
            answer = 'Hello! Welcome to ApexCare. How can I help you today?';
        } else if (q.includes('medical') || q.includes('symptom') || q.includes('diagnos') || q.includes('medicine')) {
            answer = 'I cannot diagnose conditions or recommend medicines. Please consult a qualified healthcare professional. For emergencies, contact local emergency services.';
        } else {
            answer = 'I am the ApexCare demo assistant. I can help with hospital services and dashboard summaries. Try asking about patients, appointments, or billing.';
        }

        addMessage(answer, 'bot');
    }

    document.getElementById('aiFab').addEventListener('click', function () {
        panel.classList.add('ai-open');
        input.focus();
    });

    document.getElementById('aiClose').addEventListener('click', function () {
        panel.classList.remove('ai-open');
    });

    document.getElementById('aiForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const question = input.value.trim();
        if (!question) return;
        reply(question);
        input.value = '';
    });

    root.querySelectorAll('[data-question]').forEach(function (button) {
        button.addEventListener('click', function () {
            reply(button.dataset.question);
        });
    });

    addMessage('Hello! I am your ApexCare Assistant. Ask me about hospital services, appointments, or billing summaries.', 'bot');
})();
