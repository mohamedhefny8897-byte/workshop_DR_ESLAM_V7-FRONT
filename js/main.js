document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) navbar.classList.add("scrolled");
        else navbar.classList.remove("scrolled");
    });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show-el");
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll(".hidden-el").forEach(el => observer.observe(el));
});

function togglePaymentInfo() {
    const method = document.getElementById('payMethod').value;
    const instructionsBox = document.getElementById('paymentInstructions');
    const receiptBox = document.getElementById('receiptUpload');
    const receiptInput = document.getElementById('receiptFile');

    instructionsBox.style.display = 'none';
    receiptBox.style.display = 'none';
    receiptInput.required = false;

    if (method === 'instapay') {
        instructionsBox.innerHTML = `<strong>توجيهات الدفع عبر إنستاباي:</strong><br>برجاء تحويل مبلغ 150 ج.م إلى حساب: <span style="color:var(--accent-color); font-weight:bold; font-size:1.1rem; letter-spacing:1px;">dr.islam@instapay</span><br>ثم قم برفع صورة الإيصال بالأسفل لتأكيد الحجز.`;
        instructionsBox.style.display = 'block';
        receiptBox.style.display = 'block';
        receiptInput.required = true;
    } else if (method === 'wallet') {
        instructionsBox.innerHTML = `<strong>توجيهات الدفع عبر المحفظة (فودافون كاش):</strong><br>برجاء تحويل مبلغ 150 ج.م إلى الرقم: <span style="color:var(--accent-color); font-weight:bold; font-size:1.1rem; letter-spacing:1px;">01012345678</span><br>ثم قم برفع سكرين شوت للرسالة بالأسفل.`;
        instructionsBox.style.display = 'block';
        receiptBox.style.display = 'block';
        receiptInput.required = true;
    } else if (method === 'cash') {
        instructionsBox.innerHTML = `<strong>تأكيد الدفع النقدي:</strong><br>سيتم سداد رسوم الحضور (150 ج.م) نقداً لمسؤول التنظيم عند باب القاعة يوم الورشة. برجاء الحضور مبكراً بنصف ساعة لتأكيد تسجيلك.`;
        instructionsBox.style.display = 'block';
    }
}

// الاتصال الحقيقي بالباك إند
async function submitRegistration(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التسجيل...';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('name', document.getElementById('regName').value);
    formData.append('phone', document.getElementById('regPhone').value);
    formData.append('method', document.getElementById('payMethod').value);
    
    const file = document.getElementById('receiptFile').files[0];
    if(file) formData.append('receipt', file);

    try {
        const res = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        
        if(data.success) {
            document.querySelector('.form-grid').style.display = 'none';
            document.getElementById('payMethod').parentElement.style.display = 'none';
            document.getElementById('paymentInstructions').style.display = 'none';
            document.getElementById('receiptUpload').style.display = 'none';
            btn.style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
        } else {
            alert(data.message);
            btn.innerHTML = 'تأكيد التسجيل';
            btn.disabled = false;
        }
    } catch (err) {
        alert("حدث خطأ في الاتصال بالسيرفر.");
        btn.innerHTML = 'تأكيد التسجيل';
        btn.disabled = false;
    }
}
