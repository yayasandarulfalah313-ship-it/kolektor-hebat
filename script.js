const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz4jH-bDmidV850GsPwNV1jaWNY0mIZiX1r0QGt-dc6rx7RDLy0aljDefgeOlmKO8VT/exec';

// Password Configuration
const PASSWORDS = {
  admin: 'admin2026',
  user: 'user2026'
};

// Fungsi utilitas untuk format Rupiah
function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - Kolektor Hebat initialized');
    
    // Check authentication
    const currentPage = window.location.pathname.split('/').pop();
    const isAuth = sessionStorage.getItem('isLoggedIn');
    const userRole = sessionStorage.getItem('userRole');
    
    // Skip auth check for login page
    if (currentPage !== 'login.html' && currentPage !== '' && currentPage !== 'index.html') {
        if (!isAuth) {
            window.location.href = 'login.html';
            return;
        }
        if (currentPage === 'admin.html' && userRole !== 'admin') {
            alert('Akses ditolak! Halaman ini khusus Admin.');
            window.location.href = 'index.html';
            return;
        }
    }

    // Get DOM elements with safe checking
    const form = document.getElementById('paymentForm');
    const adminForm = document.getElementById('adminForm');
    const tingkatSelect = document.getElementById('tingkat');
    const kelasSelect = document.getElementById('kelas');
    const santriSelect = document.getElementById('namaSantri');
    const kolektorInput = document.getElementById('kolektor');
    const swpsCheck = document.getElementById('swps');
    const cateringCheck = document.getElementById('catering');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const realisasiContainer = document.getElementById('realisasiContainer');

    // ============================================
    // LOGIKA TINGKAT -> KOLEKTOR & KELAS
    // ============================================
    if (tingkatSelect && kolektorInput && kelasSelect && santriSelect) {
        console.log('Tingkat select found, initializing...');
        
        tingkatSelect.addEventListener('change', function() {
            const tingkat = this.value;
            console.log('Tingkat changed to:', tingkat);
            
            // Update kolektor otomatis
            if (appData && appData.collectors && appData.collectors[tingkat]) {
                kolektorInput.value = appData.collectors[tingkat];
            } else {
                kolektorInput.value = '';
            }
            
            // Populate kelas
            populateKelas(tingkat);
        });
    }

    function populateKelas(tingkat) {
        if (!kelasSelect || !santriSelect) return;
        
        kelasSelect.innerHTML = '<option value="">-- Pilih Kelas --</option>';
        santriSelect.innerHTML = '<option value="">-- Pilih Santri --</option>';
        
        if (appData && appData.students && appData.students[tingkat]) {
            const kelasList = Object.keys(appData.students[tingkat]);
            console.log('Kelas found:', kelasList);
            
            kelasList.forEach(kelas => {
                const option = document.createElement('option');
                option.value = kelas;
                option.textContent = kelas;
                kelasSelect.appendChild(option);
            });
        }
    }

    // ============================================
    // LOGIKA KELAS -> SANTRI
    // ============================================
    if (kelasSelect && tingkatSelect && santriSelect) {
        kelasSelect.addEventListener('change', function() {
            const tingkat = tingkatSelect.value;
            const kelas = this.value;
            
            santriSelect.innerHTML = '<option value="">-- Pilih Santri --</option>';
            
            if (appData && appData.students && appData.students[tingkat] && appData.students[tingkat][kelas]) {
                appData.students[tingkat][kelas].forEach(santri => {
                    const option = document.createElement('option');
                    option.value = santri;
                    option.textContent = santri;
                    santriSelect.appendChild(option);
                });
            }
        });
    }

    // ============================================
    // LOGIKA KALKULASI PEMBAYARAN
    // ============================================
    if (form) {
        console.log('Payment form found');
        
        const hitungTunggakan = () => {
            let tagihan = 0;
            if (swpsCheck && swpsCheck.checked) tagihan += 300000;
            if (cateringCheck && cateringCheck.checked) tagihan += 150000;

            const tunggakanAwalInput = document.getElementById('tunggakanAwal');
            const jumlahDibayarInput = document.getElementById('jumlahDibayar');
            const tagihanBulanIniInput = document.getElementById('tagihanBulanIni');
            const totalTunggakanInput = document.getElementById('totalTunggakan');
            const sisaTunggakanInput = document.getElementById('sisaTunggakan');

            if (!tunggakanAwalInput || !jumlahDibayarInput) return;

            const tunggakanAwal = parseInt(tunggakanAwalInput.value) || 0;
            const totalTunggakan = tunggakanAwal + tagihan;
            
            if (tagihanBulanIniInput) tagihanBulanIniInput.value = formatRupiah(tagihan);
            if (totalTunggakanInput) totalTunggakanInput.value = formatRupiah(totalTunggakan);
            
            const jumlahDibayar = parseInt(jumlahDibayarInput.value) || 0;
            const sisa = totalTunggakan - jumlahDibayar;
            if (sisaTunggakanInput) sisaTunggakanInput.value = formatRupiah(sisa > 0 ? sisa : 0);
        };

        if (swpsCheck) swpsCheck.addEventListener('change', hitungTunggakan);
        if (cateringCheck) cateringCheck.addEventListener('change', hitungTunggakan);
        
        const tunggakanAwalInput = document.getElementById('tunggakanAwal');
        const jumlahDibayarInput = document.getElementById('jumlahDibayar');
        if (tunggakanAwalInput) tunggakanAwalInput.addEventListener('input', hitungTunggakan);
        if (jumlahDibayarInput) jumlahDibayarInput.addEventListener('input', hitungTunggakan);

        // ============================================
        // SUBMIT FORM PEMBAYARAN
        // ============================================
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = form.querySelector('.btn');
            const loader = document.getElementById('loader');
            
            if (btn) btn.disabled = true;
            if (loader) loader.style.display = 'block';

            const swpsChecked = swpsCheck ? swpsCheck.checked : false;
            const cateringChecked = cateringCheck ? cateringCheck.checked : false;
            const swpsAmount = swpsChecked ? 300000 : 0;
            const cateringAmount = cateringChecked ? 150000 : 0;
            const totalTagihan = swpsAmount + cateringAmount;

            const formData = {
                action: 'payment',
                tingkat: document.getElementById('tingkat').value,
                kelas: document.getElementById('kelas').value,
                namaSantri: document.getElementById('namaSantri').value,
                kolektor: document.getElementById('kolektor').value,
                tahunPelajaran: document.getElementById('tahunPelajaran').value,
                semester: document.getElementById('semester').value,
                bulan: document.getElementById('bulan').value,
                tanggalBayar: document.getElementById('tanggalBayar').value,
                swps: swpsChecked,
                swpsAmount: swpsAmount,
                catering: cateringChecked,
                cateringAmount: cateringAmount,
                totalTagihan: totalTagihan,
                tagihanBulanIni: document.getElementById('tagihanBulanIni').value,
                tunggakanAwal: document.getElementById('tunggakanAwal').value,
                jumlahDibayar: document.getElementById('jumlahDibayar').value,
                sisaTunggakan: document.getElementById('sisaTunggakan').value,
                keterangan: document.getElementById('keterangan').value
            };

            fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                form.reset();
                if (tingkatSelect) tingkatSelect.dispatchEvent(new Event('change'));
            })
            .catch(error => {
                alert('Terjadi kesalahan: ' + error);
            })
            .finally(() => {
                if (btn) btn.disabled = false;
                if (loader) loader.style.display = 'none';
            });
        });
    }

    // ============================================
    // SUBMIT FORM ADMIN
    // ============================================
    if (adminForm) {
        console.log('Admin form found');
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = adminForm.querySelector('.btn');
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'Menyimpan...';
            }

            const formData = {
                action: 'add_master',
                tingkat: document.getElementById('adm_tingkat').value,
                kelas: document.getElementById('adm_kelas').value,
                namaSantri: document.getElementById('adm_namaSantri').value,
                kolektor: document.getElementById('adm_kolektor').value,
                tahunPelajaran: document.getElementById('adm_tahunPelajaran').value,
                semester: document.getElementById('adm_semester').value,
                keterangan: document.getElementById('adm_keterangan').value
            };

            fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                adminForm.reset();
            })
            .catch(error => {
                alert('Terjadi kesalahan: ' + error);
            })
            .finally(() => {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Simpan Data Master';
                }
            });
        });
    }

    // ============================================
    // LOAD REALISASI LAPORAN
    // ============================================
    if (realisasiContainer) {
        console.log('Realisasi container found, loading data...');
        loadRealisasi();
    }

    function loadRealisasi() {
        fetch(SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success' && data.data && data.data.length > 0) {
                displayRealisasi(data.data);
            } else {
                realisasiContainer.innerHTML = '<p style="text-align:center; color: var(--merah);">Belum ada data realisasi.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading realisasi:', error);
            realisasiContainer.innerHTML = '<p style="text-align:center; color: var(--danger);">Gagal memuat data.</p>';
        });
    }

    function displayRealisasi(data) {
        let html = `
            <table class="realisasi-table">
                <thead>
                    <tr>
                        <th>Nama Kolektor</th>
                        <th>Tingkat</th>
                        <th>Total SWPS</th>
                        <th>Total Catering</th>
                        <th>Total Diterima</th>
                        <th>Jml Transaksi</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(row => {
            html += `
                <tr>
                    <td>${row['Nama Kolektor'] || '-'}</td>
                    <td>${row['Tingkat'] || '-'}</td>
                    <td>${row['Total SWPS Terkumpul'] || 'Rp 0'}</td>
                    <td>${row['Total Catering Terkumpul'] || 'Rp 0'}</td>
                    <td>${row['Total Pembayaran Diterima'] || 'Rp 0'}</td>
                    <td>${row['Jumlah Transaksi'] || 0}</td>
                </tr>
            `;
        });
        html += '</tbody></table>';
        realisasiContainer.innerHTML = html;
    }

    // ============================================
    // LOGIN FORM
    // ============================================
    if (loginForm) {
        console.log('Login form found');
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const role = document.getElementById('loginRole').value;
            const password = document.getElementById('loginPassword').value;
            const errorMsg = document.getElementById('errorMsg');

            if (PASSWORDS[role] === password) {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userRole', role);
                if (errorMsg) errorMsg.style.display = 'none';
                
                if (role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'index.html';
                }
            } else {
                if (errorMsg) {
                    errorMsg.textContent = 'Password salah! Silakan coba lagi.';
                    errorMsg.style.display = 'block';
                }
            }
        });
    }

    // ============================================
    // LOGOUT
    // ============================================
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('userRole');
            window.location.href = 'login.html';
        });
    }
    
    console.log('Initialization complete');
});
