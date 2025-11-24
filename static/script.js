document.addEventListener('DOMContentLoaded', () => {
    // Booking Form Submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = bookingForm.querySelector('button');
            const originalBtnText = submitBtn.innerText;

            submitBtn.innerText = 'Processing...';
            submitBtn.disabled = true;

            const formData = new FormData(bookingForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    alert('Registration successful! We look forward to seeing you.');
                    bookingForm.reset();
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (error) {
                alert('An unexpected error occurred. Please try again.');
                console.error(error);
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Admin Login Modal Logic
    const adminTrigger = document.getElementById('adminTrigger');
    const modal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');
    const loginForm = document.getElementById('loginForm');

    if (adminTrigger && modal) {
        adminTrigger.addEventListener('click', () => {
            modal.classList.add('active');
        });

        closeModal.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    window.location.href = '/admin';
                } else {
                    alert('Invalid password. Hint: admin123');
                }
            } catch (error) {
                console.error(error);
                alert('Login failed. Please try again.');
            }
        });
    }
    // Scroll Zoom Effect
    const heroContent = document.querySelector('.hero-content');
    const heroText = document.getElementById('hero-text');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;

        // Calculate progress (0 to 1) based on first screen height
        let progress = scrollPosition / windowHeight;

        if (progress < 0) progress = 0;

        // Scale effect
        // Start at 1, go up to 50 (huge) as we scroll
        const scale = 1 + (progress * 15);

        // Opacity effect
        // Fade out as we zoom in
        const opacity = Math.max(0, 1 - (progress * 1.5));

        // Blur effect
        const blur = progress * 20;

        if (heroContent) {
            heroContent.style.transform = `scale(${scale})`;
            heroContent.style.opacity = opacity;
            heroContent.style.filter = `blur(${blur}px)`;

            // Hide scroll indicator immediately on scroll
            if (scrollIndicator) {
                scrollIndicator.style.opacity = Math.max(0, 1 - (progress * 5));
            }
        }
    });
});
