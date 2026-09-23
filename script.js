// GANTI URL INI DENGAN URL DEPLOYMENT APPS SCRIPT ANDA
const SCRIPT_URL = 'GANTI_DENGAN_URL_APPS_SCRIPT_ANDA'; 

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('paymentForm');
    const adminForm = document.getElementById('adminForm');
    const tingkatSelect = document.getElementById('tingkat');
    const kelasSelect = document.getElementById('kelas');
    const santriSelect = document.getElementById('namaSantri');
    const jenisSelect = document.getElementById('jenisPembayaran');
    const kolektorInput = document.getElementById('kolektor');

    // Fungsi untuk memformat angka ke Rupiah
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    };

    // Update Kolektor & Kelas saat Tingkat berubah
    if (tingkatSelect) {
        tingkatSelect.addEventListener('change', function() {
            const tingkat = this.value;
            if (kolektorInput && appData.collectors[tingkat]) {
                kolektorInput.value = appData.collectors[tingkat];
            }
            populateKelas(tingkat);
        });
    }

    function populateKelas(tingkat) {
        kelasSelect.innerHTML = '<option value="">-- Pilih Kelas --</option>';
        santriSelect.innerHTML = '<option value="">-- Pilih Santri --</option>';
        if (appData.students[tingkat]) {
            Object.keys(appData.students[tingkat]).forEach(kelas => {
                const option = document.createElement('option');
                option.value = kelas;
                option.textContent = kelas;
                kelasSelect.appendChild(option);
            });
        }
    }

    // Update Santri saat Kelas berubah
    if (kelasSelect) {
        kelasSelect.addEventListener('change', function() {
            const tingkat = tingkatSelect.value;
            const kelas = this.value;
            santriSelect.innerHTML = '<option value="">-- Pilih Santri --</option>';
            if (appData.students[tingkat] && appData.students[tingkat][kelas]) {
                appData.students[tingkat][kelas].forEach(santri => {
                    const option = document.createElement('option');
                    option.value = santri;
                    option.textContent = santri;
                    santriSelect.appendChild(option);
                });
            }
        });
    }

    // Kalkulasi Otomatis Tunggakan
    if (jenisSelect) {
        const hitungTunggakan = () => {
            let tagihan = 0;
            if (jenisSelect.value === 'SWPS') tagihan = 300000;
            else if (jenisSelect.value === 'Catering') tagihan = 150000;
            else if (jenisSelect.value === 'SWPS + Catering') tagihan = 450000;

            const tunggakanAwal = parseInt(document.getElementById('tunggakanAwal').value) || 0;
            const totalTunggakan = tunggakanAwal + tagihan;
            
            document.getElementById('tagihanBulanIni').value = formatRupiah(tagihan);
            document.getElementById('totalTunggakan').value = formatRupiah(totalTunggakan);
            
            const jumlahDibayar = parseInt(document.getElementById('jumlahDibayar').value) || 0;
            const sisa = totalTunggakan - jumlahDibayar;
            document.getElementById('sisaTunggakan').value = formatRupiah(sisa > 0 ? sisa : 0);
        };

        jenisSelect.addEventListener('change', hitungTunggakan);
        document.getElementById('tunggakanAwal').addEventListener('input', hitungTunggakan);
        document.getElementById('jumlahDibayar').addEventListener('input', hitungTunggakan);
    }

    // Handle Submit Form Pembayaran (User)
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = form.querySelector('.btn');
            const loader = document.getElementById('loader');
            btn.disabled = true;
            loader.style.display = 'block';

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
                jenisPembayaran: document.getElementById('jenisPembayaran').value,
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
                // Reset dropdown dependent
                if(tingkatSelect) tingkatSelect.dispatchEvent(new Event('change'));
            })
            .catch(error => {
                alert('Terjadi kesalahan: ' + error);
            })
            .finally(() => {
                btn.disabled = false;
                loader.style.display = 'none';
            });
        });
    }

    // Handle Submit Form Admin
    if (adminForm) {
        adminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = adminForm.querySelector('.btn');
            btn.disabled = true;
            btn.textContent = 'Menyimpan...';

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
                btn.disabled = false;
                btn.textContent = 'Simpan Data Master';
            });
        });
    }
});
