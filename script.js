document.addEventListener('DOMContentLoaded', function() {

    // --- PRELOADER ---
    const preloader = document.querySelector('.preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('loaded');
        }, 500); // Min display time
        setTimeout(() => { // Remove from DOM after transition
            if (preloader) preloader.remove();
        }, 1500); 
    });

    // --- SMOOTH SCROLLING & ACTIVE NAV LINK ---
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('main section');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = document.querySelector('.site-header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
            // Close mobile menu if open
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                document.querySelector('.menu-toggle i').classList.replace('fa-times', 'fa-bars');
            }
        });
    });
    
    function updateActiveNavLink() {
        let currentSectionId = '';
        const headerHeight = document.querySelector('.site-header').offsetHeight;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 50; // Adjusted threshold
            if (window.pageYOffset >= sectionTop) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentSectionId) {
                link.classList.add('active');
            }
        });
    }

    // --- STICKY HEADER BEHAVIOR ---
    const header = document.querySelector('.site-header');
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        updateActiveNavLink(); // Update active link on scroll

        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide/show header on scroll down/up (optional sleek effect)
        if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) { // If scrolling down & past header
            header.style.top = `-${header.offsetHeight}px`;
        } else { // If scrolling up
            header.style.top = '0';
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
        
        // Scroll to top button
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        if (scrollToTopBtn) {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                scrollToTopBtn.style.display = 'flex'; // Use flex to keep icon centered
                 setTimeout(() => scrollToTopBtn.style.opacity = '1', 10);
            } else {
                scrollToTopBtn.style.opacity = '0';
                setTimeout(() => scrollToTopBtn.style.display = 'none', 300);
            }
        }
    });
    
    updateActiveNavLink(); // Initial call

    // --- INTERSECTION OBSERVER FOR SCROLL ANIMATIONS ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const staggerContainers = document.querySelectorAll('.stagger-children');

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');

                // Handle staggered children if the parent is a stagger container
                if (entry.target.classList.contains('stagger-children')) {
                    const children = entry.target.querySelectorAll('.stagger-item');
                    children.forEach((child, index) => {
                        // Check if child itself is an 'animate-on-scroll' to prevent double handling if not needed
                        // For this setup, we assume stagger-item is the animated unit.
                        child.style.transitionDelay = `${index * 0.12}s`; // Fine-tuned delay
                        child.classList.add('is-visible');
                    });
                }
                // Optional: Unobserve after first animation if you DON'T want re-trigger
                // observer.unobserve(entry.target); 
            } else {
                // Re-trigger animation: Remove 'is-visible' when element scrolls out of view
                entry.target.classList.remove('is-visible');
                if (entry.target.classList.contains('stagger-children')) {
                    const children = entry.target.querySelectorAll('.stagger-item');
                    children.forEach((child) => {
                        child.classList.remove('is-visible');
                        child.style.transitionDelay = `0s`; // Reset delay
                    });
                }
            }
        });
    };

    const animationObserver = new IntersectionObserver(observerCallback, {
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of element is visible
    });

    animatedElements.forEach(el => animationObserver.observe(el));
    staggerContainers.forEach(el => animationObserver.observe(el)); // Observe stagger parents too

    // --- HERO H1 CHARACTER ANIMATION ---
    const heroH1 = document.querySelector('.hero-section h1');
    if (heroH1 && heroH1.classList.contains('animate-on-scroll-parent')) {
        const chars = heroH1.querySelectorAll('.char-animate');
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    chars.forEach((char, index) => {
                        setTimeout(() => {
                            char.style.opacity = '1';
                            char.style.transform = 'translateY(0) rotate(0deg)';
                        }, index * 70); // Staggered delay for each character
                    });
                    heroObserver.unobserve(entry.target); // Animate once
                }
            });
        }, { threshold: 0.5 });
        heroObserver.observe(heroH1);
    }


    // --- TABS FUNCTIONALITY ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    window.openTab = function(event, tabName) { // Make global for HTML onclick
        tabContents.forEach(content => content.classList.remove('active'));
        tabLinks.forEach(link => link.classList.remove('active'));

        document.getElementById(tabName).classList.add('active');
        event.currentTarget.classList.add('active');
        
        // Re-observe elements within the newly active tab for animations
        const newlyVisibleAnimatedElements = document.getElementById(tabName).querySelectorAll('.animate-on-scroll, .stagger-children');
        newlyVisibleAnimatedElements.forEach(el => {
            animationObserver.unobserve(el); // Unobserve first to reset state
            animationObserver.observe(el);   // Then re-observe
        });
    }
    // Activate the first tab by default
    if (tabLinks.length > 0) {
        tabLinks[0].click(); // Programmatic click to trigger openTab and animation re-observation
    }

    // --- COPYRIGHT YEAR ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- MOBILE MENU TOGGLE ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });
    }
    
    // --- SCROLL TO TOP BUTTON ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

});