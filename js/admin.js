const API_URL = 'https://tricky-zoos-say.loca.lt';
let attendeesData = [];

async function loadDashboard() {
    // جلب الإحصائيات
    const statsRes = await fetch(`${API_URL}/api/admin/stats`, { headers: { 'Bypass-Tunnel-Reminder': 'true' }});
    const stats = await statsRes.json();
    document.getElementById('statTotal').innerText = stats.total || 0;
    document.getElementById('statConfirmed').innerText = stats.confirmed || 0;
    document.getElementById('statPending').innerText = stats.pending || 0;

    // جلب المتدربين
    const res = await fetch(`${API_URL}/api/admin/attendees`, { headers: { 'Bypass-Tunnel-Reminder': 'true' }});
    attendeesData = await res.json();
    
    const tbody = document.getElementById('attendeesTableBody');
    tbody.innerHTML = '';

    if(attendeesData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">لم يسجل أحد بعد.</td></tr>';
        return;
    }

    attendeesData.forEach((a, index) => {
        let methodLabel = a.payment_method === 'instapay' ? 'إنستاباي' : (a.payment_method === 'wallet' ? 'محفظة' : 'نقدي بالقاعة');
        let receiptHtml = a.receipt_path ? `<a href="${API_URL}/${a.receipt_path}" target="_blank" style="color:var(--accent-color);"><i class="fa-solid fa-image"></i> عرض</a>` : '-';
        
        let badgeClass = a.status === 'مؤكد' ? 'badge confirmed' : 'badge pending';
        let confirmBtn = a.status !== 'مؤكد' ? `<button class="btn-primary btn-sm" onclick="confirmPayment(${a.id})"><i class="fa-solid fa-check"></i> تأكيد</button>` : '';
        
        let phoneForWa = a.phone.startsWith('0') ? '2' + a.phone : a.phone;
        let msg = encodeURIComponent(`مرحباً أ. ${a.name}، نؤكد على حضوركم ورشة عمل د. إسلام محمد القادمة. نلقاكم على خير.`);
        let waBtn = `<a href="https://wa.me/${phoneForWa}?text=${msg}" target="_blank" class="btn-wa"><i class="fa-brands fa-whatsapp"></i> مراسلة</a>`;

        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${a.name}</strong></td>
                <td>${a.phone}</td>
                <td>${methodLabel}</td>
                <td>${receiptHtml}</td>
                <td><span class="${badgeClass}">${a.status}</span></td>
                <td class="action-btns">${confirmBtn} ${waBtn}</td>
            </tr>
        `;
    });
}

async function confirmPayment(id) {
    if(!confirm('تأكيد الدفع/الحجز لهذا المتدرب؟')) return;
    await fetch(`${API_URL}/api/admin/attendees/${id}/status`, {
        method: 'PUT', 
        headers: {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true'
        }, 
        body: JSON.stringify({status: 'مؤكد'})
    });
    loadDashboard();
}

function exportToCSV() {
    let csvContent = "\uFEFFالاسم,رقم الواتساب,طريقة الدفع,الحالة\n";
    attendeesData.forEach(a => {
        let method = a.payment_method === 'instapay' ? 'إنستاباي' : (a.payment_method === 'wallet' ? 'محفظة' : 'نقدي بالقاعة');
        csvContent += `${a.name},${a.phone},${method},${a.status}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Workshop_Attendees.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.onload = loadDashboard;