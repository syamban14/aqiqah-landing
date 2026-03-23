import './style.css'

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
});
