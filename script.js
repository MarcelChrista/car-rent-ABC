document.addEventListener('DOMContentLoaded', function() {
    
    // Data mobil yang tersedia
    const mobilData = [
        { id: 'avanza', nama: 'Toyota Avanza', harga: 500000, gambar: 'https://www.toyota.astra.co.id//sites/default/files/2023-09/1-avanza-purplish-silver.png' },
        { id: 'innova', nama: 'Toyota Kijang Innova', harga: 700000, gambar: 'https://www.toyota.astra.co.id//sites/default/files/2020-10/1_innova-super-white-2_0.png' },
        { id: 'hrv', nama: 'Honda HRV', harga: 600000, gambar: 'https://asset.honda-indonesia.com/variants/images/0IB498ADYlsJPdP3eVb166LvEt3mLKkWgfbgiYuR.png' },
        { id: 'sigra', nama: 'Daihatsu Sigra', harga: 450000, gambar: 'https://daihatsupantura.com/wp-content/uploads/2024/03/New-Sigra-png-kecil.png' }
    ];

    // Mengambil elemen-elemen DOM yang dibutuhkan
    const daftarMobilContainer = document.getElementById('daftar-mobil');
    const hitungBtn = document.getElementById('hitung-total-btn');
    const simpanBtn = document.getElementById('simpan-pesanan-btn');
    const ringkasanWrapper = document.getElementById('ringkasan-wrapper');
    const ringkasanPesananContainer = document.getElementById('ringkasan-pesanan');
    const totalHargaElem = document.getElementById('total-harga-keseluruhan');
    const namaPelangganInput = document.getElementById('nama-pelanggan');
    const riwayatContainer = document.getElementById('riwayat-pemesanan');
    
    let currentBookingDetails = null;

    
    function renderDaftarMobil() {
        daftarMobilContainer.innerHTML = '';
        mobilData.forEach(mobil => {
            const carCard = document.createElement('div');
            carCard.className = 'car-card';
            // Menambahkan ID unik untuk setiap kartu
            carCard.id = `card-${mobil.id}`; 
            
            carCard.innerHTML = `
                <img src="${mobil.gambar}" alt="${mobil.nama}">
                <div class="car-card-content">
                    <h3>${mobil.nama}</h3>
                    <p class="price">Rp ${mobil.harga.toLocaleString('id-ID')} / hari</p>
                    
                    <button class="select-car-btn" data-id="${mobil.id}">Pilih Mobil</button>
                    
                    <div class="collapsible-content">
                        <div class="rental-details">
                            <div>
                                <label for="tanggal-${mobil.id}">Tgl Mulai:</label>
                                <input type="date" id="tanggal-${mobil.id}">
                            </div>
                            <div>
                                <label for="durasi-${mobil.id}">Durasi (hari):</label>
                                <input type="number" id="durasi-${mobil.id}" min="1" value="1">
                            </div>
                        </div>
                        <small class="error-message" id="error-${mobil.id}"></small>
                    </div>
                </div>
            `;
            daftarMobilContainer.appendChild(carCard);
        });
    }

    
    daftarMobilContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('select-car-btn')) {
            const carId = e.target.dataset.id;
            const carCard = document.getElementById(`card-${carId}`);
            const button = e.target;

            // Toggle status aktif pada kartu
            carCard.classList.toggle('active');

            if (carCard.classList.contains('active')) {
                // Saat kartu aktif/dipilih
                button.textContent = 'Batal Pilih';
                button.classList.add('btn-cancel');

                // Otomatis set tanggal ke hari ini dan cegah tanggal masa lalu
                const tanggalInput = document.getElementById(`tanggal-${carId}`);
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                const todayString = `${yyyy}-${mm}-${dd}`;
                tanggalInput.value = todayString;
                tanggalInput.min = todayString;
            } else {
                // Saat kartu tidak aktif/dibatalkan
                button.textContent = 'Pilih Mobil';
                button.classList.remove('btn-cancel');
            }
        }
    });

    function clearValidationErrors() {
        document.querySelectorAll('input.invalid').forEach(input => input.classList.remove('invalid'));
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        ringkasanWrapper.classList.add('hidden');
    }

    
    function validateForm() {
        clearValidationErrors();
        let isValid = true;

        // Validasi Nama Pelanggan
        const namaPelanggan = namaPelangganInput.value.trim();
        if (!namaPelanggan) {
            namaPelangganInput.classList.add('invalid');
            document.getElementById('nama-error').textContent = 'Nama pelanggan wajib diisi.';
            isValid = false;
        }

        // Validasi Pilihan Mobil
        const mobilTerpilihCards = document.querySelectorAll('.car-card.active');
        if (mobilTerpilihCards.length === 0) {
            alert('Anda harus memilih setidaknya satu mobil.');
            isValid = false;
        }

        // Validasi Detail setiap mobil yang dipilih
        mobilTerpilihCards.forEach(card => {
            const cardId = card.id.split('-')[1]; 
            const tanggalInput = document.getElementById(`tanggal-${cardId}`);
            const durasiInput = document.getElementById(`durasi-${cardId}`);
            const errorContainer = document.getElementById(`error-${cardId}`);
            let errorMessages = [];

            if (!durasiInput.value || parseInt(durasiInput.value) < 1) {
                durasiInput.classList.add('invalid');
                errorMessages.push('Durasi minimal 1 hari.');
            }
            if (!tanggalInput.value) {
                tanggalInput.classList.add('invalid');
                errorMessages.push('Tanggal mulai harus diisi.');
            }
            if (errorMessages.length > 0) {
                isValid = false;
                errorContainer.textContent = errorMessages.join(' ');
            }
        });

        return isValid;
    }

    hitungBtn.addEventListener('click', function() {
        if (!validateForm()) return;

        let totalHarga = 0;
        let ringkasanHTML = '<ul>';
        let pesananMobil = [];
        
        const mobilTerpilihCards = document.querySelectorAll('.car-card.active');

        mobilTerpilihCards.forEach(card => {
            const cardId = card.id.split('-')[1];
            // Cari data mobil yang sesuai dari array mobilData
            const mobilInfo = mobilData.find(m => m.id === cardId);

            const durasi = parseInt(document.getElementById(`durasi-${cardId}`).value);
            const tanggalMulai = document.getElementById(`tanggal-${cardId}`).value;
            const subtotal = mobilInfo.harga * durasi;
            totalHarga += subtotal;
            ringkasanHTML += `<li><strong>${mobilInfo.nama}</strong> (${durasi} hari): Rp ${subtotal.toLocaleString('id-ID')}</li>`;
            
            pesananMobil.push({
                nama: mobilInfo.nama,
                durasi: durasi,
                tanggalMulai: tanggalMulai,
                subtotal: subtotal
            });
        });

        ringkasanHTML += '</ul>';
        ringkasanPesananContainer.innerHTML = ringkasanHTML;
        totalHargaElem.textContent = `Total Keseluruhan: Rp ${totalHarga.toLocaleString('id-ID')}`;
        
        currentBookingDetails = {
            namaPelanggan: namaPelangganInput.value.trim(),
            mobil: pesananMobil,
            totalHarga: totalHarga,
            timestamp: new Date().toISOString()
        };

        ringkasanWrapper.classList.remove('hidden');
    });

    
    simpanBtn.addEventListener('click', function() {
        if (!currentBookingDetails) {
            alert('Silakan hitung total terlebih dahulu sebelum menyimpan.');
            return;
        }
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.push(currentBookingDetails);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        alert('Pemesanan berhasil disimpan!');
        currentBookingDetails = null;
        ringkasanWrapper.classList.add('hidden');
        renderRiwayatPemesanan();
    });

    function renderRiwayatPemesanan() {
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        riwayatContainer.innerHTML = '';
        if (bookings.length === 0) {
            riwayatContainer.innerHTML = '<p>Belum ada riwayat pemesanan.</p>';
            return;
        }
        bookings.forEach((booking, index) => {
            const bookingItem = document.createElement('div');
            bookingItem.className = 'booking-item';
            let mobilListHTML = '<ul>';
            booking.mobil.forEach(m => {
                mobilListHTML += `<li>${m.nama} (${m.durasi} hari)</li>`;
            });
            mobilListHTML += '</ul>';
            const waktuPesan = new Date(booking.timestamp);
            bookingItem.innerHTML = `
                <div class="timestamp">Dipesan pada: ${waktuPesan.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</div>
                <div class="customer-name">Pelanggan: ${booking.namaPelanggan}</div>
                ${mobilListHTML}
                <div class="total"><strong>Total: Rp ${booking.totalHarga.toLocaleString('id-ID')}</strong></div>
                <button class="hapus-btn" data-index="${index}">Hapus</button>
            `;
            riwayatContainer.appendChild(bookingItem);
        });
    }

    riwayatContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('hapus-btn')) {
            const index = e.target.getAttribute('data-index');
            if (confirm('Apakah Anda yakin ingin menghapus pemesanan ini?')) {
                let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
                bookings.splice(index, 1);
                localStorage.setItem('bookings', JSON.stringify(bookings));
                renderRiwayatPemesanan();
            }
        }
    });

    
    renderDaftarMobil();
    renderRiwayatPemesanan();
});