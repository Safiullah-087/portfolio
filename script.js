
(function () {
    const textEl = document.querySelector(".typing-text");
    if (!textEl) return;

    const words = ["Content Creator", "Front-End Developer", "BS CS Student", "React Developer", "Problem Solver"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId = null;

    const TYPING_SPEED = 100;
    const DELETING_SPEED = 50;
    const PAUSE_END = 2000;
    const PAUSE_START = 500;

    function tick() {
        if (!textEl) return;

        const currentWord = words[wordIndex % words.length];

        if (isDeleting) {
            charIndex--;
        } else {
            charIndex++;
        }

        textEl.textContent = currentWord.substring(0, charIndex);

        let delay = isDeleting ? DELETING_SPEED : TYPING_SPEED;

        if (!isDeleting && charIndex === currentWord.length) {
            delay = PAUSE_END;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex++;
            delay = PAUSE_START;
        }

        timeoutId = setTimeout(tick, delay);
    }

    function start() {
        if (timeoutId) clearTimeout(timeoutId);
        tick();
    }

    function stop() {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    });
})();

/* ================== 2. Sidebar Active State on Scroll ================== */
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('.sidebar a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 200; // Trigger point adjustment
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');
        if (top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                if (id) {
                    let activeLink = document.querySelector('.sidebar a[href*="' + id + '"]');
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }
    });
};

/* ================== 3. Portfolio Filtering ================== */
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-box');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(btn => btn.classList.remove('active'));
        btn.classList.add('active');
        let filterValue = btn.getAttribute('data-filter');
        portfolioItems.forEach(item => {
            if (filterValue === 'all' || item.classList.contains(filterValue)) {
                item.classList.remove('hide');
            } else {
                item.classList.add('hide');
            }
        });
    });
});

/* ================== 4. AJAX Netlify Contact Form ================== */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        formData.append('form-name', this.getAttribute('name'));

        const msgBox = document.getElementById('form-msg');
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = "Sending...";
        submitBtn.disabled = true;

        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        })
            .then(res => {
                if (res.ok) {
                    msgBox.textContent = "Message sent successfully!";
                    msgBox.style.color = '#00d9ff';
                    this.reset();
                } else {
                    throw new Error("Submission failed");
                }
            })
            .catch(err => {
                msgBox.textContent = "Error: Could not connect to server.";
                msgBox.style.color = '#ff004f';
            })
            .finally(() => {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            });
    });
}

/* ================== 5. Light/Dark Theme Switcher ================== */
const themeToggleBtn = document.getElementById('theme-toggle');
function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggleBtn.setAttribute('data-title', 'Switch to Dark');
        }
    } else {
        document.body.classList.remove('light-mode');
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggleBtn.setAttribute('data-title', 'Switch to Light');
        }
    }
}

// Initial theme check on script execution (safely wrapped)
let savedTheme = 'dark';
try {
    savedTheme = localStorage.getItem('theme') || 'dark';
} catch (e) {
    console.warn("Storage access denied: defaulting to dark theme.");
}
applyTheme(savedTheme);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light-mode');
        const newTheme = isLight ? 'dark' : 'light';
        applyTheme(newTheme);
        try {
            localStorage.setItem('theme', newTheme);
        } catch (e) {
            console.warn("Could not save theme to LocalStorage:", e);
        }
    });
}

/* ================== 6. Scroll Reveal Animations & Skill Bar Fill ================== */
(function () {
    // Prepare skill bars: remember each target width, then reset to 0 without animating the reset
    const bars = document.querySelectorAll('.skill-bar .progress');
    bars.forEach(bar => {
        bar.dataset.targetWidth = bar.style.width;
        bar.style.transition = 'none';
        bar.style.width = '0';
    });
    if (bars.length) {
        void document.body.offsetWidth; // commit the 0-width instantly
        bars.forEach(bar => { bar.style.transition = ''; }); // restore CSS transition
    }

    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    function fillBars(scope) {
        scope.querySelectorAll('.skill-bar .progress').forEach(bar => {
            bar.style.width = bar.dataset.targetWidth || bar.style.width;
        });
    }

    if (!('IntersectionObserver' in window)) {
        // Fallback for very old browsers: reveal everything and fill bars immediately
        revealEls.forEach(el => el.classList.add('visible'));
        fillBars(document);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fillBars(entry.target); // animate skill bars inside this element (if any)
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealEls.forEach(el => observer.observe(el));
})();