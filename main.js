document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const scrollElements = document.querySelectorAll('.fade-in-scroll');
    scrollElements.forEach(el => observer.observe(el));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile Menu Toggle (Simple implementation)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            // In a real app, I'd toggle a class for better animation control
            // and handle the mobile layout in CSS properly for the 'flex' state toggle
        });
    }

    // Add glowing effect to mouse movement (Optional "WOW" factor)
    document.addEventListener('mousemove', (e) => {
        const glow = document.querySelector('.background-glow');
        if (glow) {
            // Subtle parallax or tracking
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            glow.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
        }
    });

    console.log("MALizU_IIX Portfolio Loaded Successfully!");
});
