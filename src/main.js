import './style.css'
import { db, isConfigured } from './firebase.js';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    const isMobile = link.classList.contains('flex-col');
                    
                    if (href === `#${currentId}`) {
                        if (isMobile) {
                            link.classList.remove('text-primary/70');
                            link.classList.add('text-primary', 'font-bold');
                        } else {
                            link.classList.remove('text-primary/70', 'border-transparent');
                            link.classList.add('text-primary', 'font-semibold', 'border-primary');
                        }
                    } else {
                        if (isMobile) {
                            link.classList.add('text-primary/70');
                            link.classList.remove('text-primary', 'font-bold');
                        } else {
                            link.classList.add('text-primary/70', 'border-transparent');
                            link.classList.remove('text-primary', 'font-semibold', 'border-primary');
                        }
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // --- Firebase Guestbook Logic ---
    const ucapanForm = document.getElementById('ucapan-form');
    const namaInput = document.getElementById('nama-input');
    const pesanInput = document.getElementById('pesan-input');
    const wishesContainer = document.getElementById('wishes-container');

    const renderWish = (nama, pesan) => {
        const div = document.createElement('div');
        div.className = "bg-surface-container-lowest/50 p-6 rounded-lg border-l-4 border-primary-container mb-6 animate-fade-in";
        div.innerHTML = `
            <p class="italic text-on-surface mb-2">"${pesan}"</p>
            <span class="text-sm font-bold text-primary">— ${nama}</span>
        `;
        return div;
    };

    if (ucapanForm) {
        ucapanForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nama = namaInput.value;
            const pesan = pesanInput.value;
            const submitBtn = ucapanForm.querySelector('button[type="submit"]');

            if (!nama || !pesan) return;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Mengirim...';

            if (isConfigured) {
                try {
                    await addDoc(collection(db, 'ucapan'), {
                        nama: nama,
                        pesan: pesan,
                        timestamp: serverTimestamp()
                    });
                    ucapanForm.reset();
                } catch (error) {
                    console.error("Gagal mengirim ucapan:", error);
                    alert("Gagal mengirim ucapan. Pastikan konfigurasi Firebase dan Firestore (Rules) sudah benar.");
                }
            } else {
                // Simulasi jika Firebase belum disetup
                alert("Konfigurasi Firebase belum diganti! Menyimpan ucapan secara lokal.");
                wishesContainer.prepend(renderWish(nama, pesan));
                ucapanForm.reset();
            }

            submitBtn.disabled = false;
            submitBtn.textContent = 'Kirim Ucapan';
        });
    }

    if (isConfigured && wishesContainer) {
        const q = query(collection(db, 'ucapan'), orderBy('timestamp', 'desc'));
        onSnapshot(q, (snapshot) => {
            // Bersihkan dummy lama
            const currentWishes = Array.from(wishesContainer.children).filter(child => child.tagName !== 'BUTTON');
            currentWishes.forEach(child => child.remove());
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                wishesContainer.prepend(renderWish(data.nama, data.pesan));
            });
        });
    }
});
