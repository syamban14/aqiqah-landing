import './style.css'
import { db, isConfigured } from './firebase.js';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { initPhotoBooth } from './photobooth.js';

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

    // --- Init Photo Booth ---
    initPhotoBooth();

    // --- Mobile Gallery Lightbox ---
    const isMobile = () => window.innerWidth < 768;
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const galleryImages = document.querySelectorAll('#gallery .grid img');
    let currentIndex = 0;

    const openLightbox = (index) => {
        if (!isMobile() || !lightbox) return;
        currentIndex = index;
        updateLightbox();
        lightbox.classList.remove('hidden');
        lightbox.classList.add('flex');
        document.body.classList.add('overflow-hidden');
    };

    const closeLightbox = () => {
        lightbox?.classList.add('hidden');
        lightbox?.classList.remove('flex');
        document.body.classList.remove('overflow-hidden');
    };

    const updateLightbox = () => {
        if (!lightboxImg || !galleryImages.length) return;
        lightboxImg.src = galleryImages[currentIndex].src;
        if (lightboxCounter) {
            lightboxCounter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
        }
    };

    galleryImages.forEach((img, index) => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => openLightbox(index));
    });

    lightboxClose?.addEventListener('click', closeLightbox);
    lightboxPrev?.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightbox();
    });
    lightboxNext?.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % galleryImages.length;
        updateLightbox();
    });

    // Swipe gesture support
    let touchStartX = 0;
    lightbox?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lightbox?.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                currentIndex = (currentIndex + 1) % galleryImages.length;
            } else {
                currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            }
            updateLightbox();
        }
    }, { passive: true });

    // --- Cover Screen Logic ---
    const coverScreen = document.getElementById('cover-screen');
    const coverBg = document.getElementById('cover-bg');
    const coverTop = document.getElementById('cover-top');
    const coverBottom = document.getElementById('cover-bottom');
    const coverContent = document.getElementById('cover-content');
    const btnOpenCover = document.getElementById('btn-open-cover');
    const bgm = document.getElementById('bgm');

    if (btnOpenCover && coverScreen && coverTop && coverBottom) {
        btnOpenCover.addEventListener('click', () => {
            // 1. Pudarkan teks dan tombol segera
            if(coverContent) {
                coverContent.style.opacity = '0';
                coverContent.style.transform = 'scale(0.9)';
                coverContent.style.pointerEvents = 'none';
            }
            
            // 2. Efek Buka Amplop 3D (Flap terbuka ke depan atas)
            setTimeout(() => {
                coverTop.style.transform = 'rotateX(150deg)'; 
                coverBottom.style.transform = 'translateY(100%)';
                
                // Setelah tutup amplop terbuka, pudarkan sisa cover screen
                if(coverBg) {
                    coverBg.style.opacity = '0';
                }
                setTimeout(() => {
                    coverScreen.style.opacity = '0';
                    coverScreen.style.pointerEvents = 'none';
                }, 600);
            }, 300);

            // Enable scrolling
            document.body.classList.remove('overflow-hidden');
            
            // Try to play background music
            if (bgm) {
                bgm.play().catch(err => console.log('BGM Autoplay prevented or file missing:', err));
            }
            
            // Cleanup DOM after animation finishes
            setTimeout(() => {
                coverScreen.remove();
            }, 2500);
        });
    }

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
