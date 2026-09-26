// Ganti bagian form submission dengan kode ini:

if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = form.querySelector('.btn');
        const loader = document.getElementById('loader');
        btn.disabled = true;
        loader.style.display = 'block';

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
