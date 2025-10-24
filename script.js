document.addEventListener('DOMContentLoaded', () => {

    // --- LANGUAGE SWITCHER ---
    const langSwitcher = document.querySelector('.lang-switcher');

    const setLanguage = (lang) => {
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.dataset.key;
            if (translations[lang] && translations[lang][key]) {
                element.innerHTML = translations[lang][key];
            }
        });

        document.querySelectorAll('[data-attr]').forEach(element => {
            const attr = element.dataset.attr;
            const keyForAttr = element.dataset.keyHref;
            if (keyForAttr) {
                if (translations[lang] && translations[lang][keyForAttr]) {
                    element.setAttribute(attr, translations[lang][keyForAttr]);
                }
            }
        });

        document.querySelectorAll('[data-key-placeholder]').forEach(element => {
            const key = element.dataset.keyPlaceholder;
            if (translations[lang] && translations[lang][key]) {
                element.placeholder = translations[lang][key];
            }
        });
        
        document.documentElement.lang = lang;
        localStorage.setItem('language', lang);
        
        langSwitcher.querySelectorAll('a').forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('lang') === lang) {
                a.classList.add('active');
            }
        });
    };

    if (langSwitcher) {
        langSwitcher.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = e.target.closest('a')?.getAttribute('lang');
            if (lang) {
                setLanguage(lang);
            }
        });
    }

    const initialLang = localStorage.getItem('language') || (navigator.language.split('-')[0] === 'fr' ? 'fr' : 'en');
    setLanguage(initialLang);

    // --- Mobile menu toggle ---
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('header nav ul');
    const body = document.body;

    if(menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('nav-open');
            menuToggle.classList.toggle('open');
            body.classList.toggle('body-nav-open');
        });

        navLinks.addEventListener('click', (e) => {
            // Cette condition est importante : elle ferme le menu si on clique sur un lien
            // mais PAS sur le lien qui ouvre le sous-menu (grâce au e.stopPropagation() plus bas)
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('nav-open');
                menuToggle.classList.remove('open');
                body.classList.remove('body-nav-open');
            }
        });
    }

    // --- NOUVEAU CODE : GESTION DU SOUS-MENU DANS LE MENU MOBILE ---
    // Ce bloc gère l'ouverture et la fermeture du sous-menu au clic.
    const dropdownToggles = document.querySelectorAll('header nav .dropdown > a');

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            // On vérifie si le menu mobile est ouvert pour n'appliquer cette logique qu'en mode mobile.
            const isMobileMenuOpen = navLinks.classList.contains('nav-open');
            
            if (isMobileMenuOpen) {
                e.preventDefault(); // Empêche le lien de naviguer.
                e.stopPropagation(); // TRÈS IMPORTANT: Empêche le clic de se propager au 'navLinks' et de fermer tout le menu.
                
                const parentLi = toggle.parentElement;
                parentLi.classList.toggle('submenu-open'); // Ajoute/retire la classe pour afficher/cacher le sous-menu via CSS.
            }
        });
    });
    // --- FIN DU NOUVEAU CODE ---


    // --- Active navigation link based on URL ---
    const allNavLinks = document.querySelectorAll('header nav ul li a');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    allNavLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop() || 'index.html';
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if(targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ==============================================================
    // === SYSTÈME D'ANIMATION AVEC GSAP & SCROLLTRIGGER ===
    // ==============================================================

    gsap.registerPlugin(ScrollTrigger);

    // ==============================================================
    // === ANIMATION DU LOGO AU SCROLL ===
    // ==============================================================
    
    const hideLogoText = gsap.to(".logo-text", {
        x: 30,
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
        paused: true
    });

    ScrollTrigger.create({
        start: "top -60",
        onEnter: () => hideLogoText.play(), 
        onLeaveBack: () => hideLogoText.reverse(), 
    });

    
    // ==============================================================
    // === ANIMATIONS DES TITRES DE HÉROS (SPÉCIFIQUES À CHAQUE PAGE) ===
    // ==============================================================

    // --- Page d'Accueil (index.html) ---
    if (document.querySelector('.home-hero')) {
        gsap.from(".hero-title-main span", {
            duration: 1.2,
            opacity: 0,
            y: 40,
            rotationX: -90,
            ease: "power3.out",
            stagger: 0.2,
            delay: 0.2
        });
        gsap.from(".home-hero p, .home-hero .hero-cta", {
            duration: 1,
            opacity: 0,
            y: 20,
            ease: "power2.out",
            stagger: 0.2,
            delay: 0.8
        });
    }

    // --- Page Geschool ---
    if (document.querySelector('.geschool-hero')) {
        gsap.from(".geschool-hero h1 span", {
            duration: 1.2,
            opacity: 0,
            y: 40,
            rotationX: -90,
            ease: "power3.out",
            stagger: 0.15,
            delay: 0.2
        });
        gsap.from(".geschool-hero .hero-text p, .geschool-hero .hero-buttons", {
            duration: 1,
            opacity: 0,
            y: 20,
            ease: "power2.out",
            stagger: 0.2,
            delay: 0.8
        });
    }

    // --- Page Nextcloud ---
    if (document.querySelector('.nextcloud-hero')) {
        const nextcloudHeroTl = gsap.timeline(); 

        nextcloudHeroTl.from(".nextcloud-hero h1 span", {
            duration: 1.2,
            opacity: 0,
            y: 40,
            rotationX: -90,
            ease: "power3.out",
            stagger: 0.2,
            delay: 0.2
        });

        nextcloudHeroTl.from(".nextcloud-hero .hero-text p", {
            duration: 1,
            opacity: 0,
            y: 20,
            ease: "power2.out"
        }, "-=0.8");

        nextcloudHeroTl.from(".nextcloud-hero .hero-buttons", {
            duration: 1,
            opacity: 0,
            y: 20,
            ease: "power2.out"
        }, "-=0.8");
    }
    
    // --- Page À Propos ---
    if (document.querySelector('.about-hero')) {
        // Animation du titre du Hero (fusionnée et améliorée)
        gsap.from(".about-hero h1 span", {
            duration: 1.2,
            opacity: 0,
            y: 40,
            rotationX: -90,
            ease: "power3.out",
            stagger: 0.2,
            delay: 0.2
        });
        gsap.from(".about-hero .hero-text p", { // Cible le paragraphe dans .hero-text
            duration: 1,
            opacity: 0,
            y: 20,
            ease: "power2.out",
            delay: 0.8
        });

        // --- Animations générales pour les sections qui apparaissent au scroll ---
        const sections = [
            '.story-content', 
            '.values-section .section-header', 
            '.commitment-section .section-header',
            '.cta-section .container'
        ];

        sections.forEach(selector => {
            gsap.from(selector, {
                scrollTrigger: {
                    trigger: selector,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                opacity: 0,
                y: 60,
                duration: 1.2,
                ease: "power3.out"
            });
        });

        // --- Animation spécifique pour les grilles (valeurs et engagement) avec décalage ---
        gsap.from(".value-card", {
            scrollTrigger: {
                trigger: ".values-grid",
                start: "top 80%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out"
        });

        gsap.from(".commitment-card", {
            scrollTrigger: {
                trigger: ".commitment-grid",
                start: "top 80%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out"
        });
    }

    // --- Page Contact ---
    if (document.querySelector('.contact-hero')) {
        gsap.from(".contact-hero h1 span", {
            duration: 1.2,
            opacity: 0,
            y: 40,
            rotationX: -90,
            ease: "power3.out",
            stagger: 0.2,
            delay: 0.2
        });
        gsap.from(".contact-hero .hero-text p", {
            duration: 1,
            opacity: 0,
            y: 20,
            ease: "power2.out",
            delay: 0.8
        });
    }

    // --- BOUCLE D'ANIMATION UNIFIÉE POUR TOUS LES BLOCS "FEATURE" ---
    const featureBlocks = document.querySelectorAll('.feature');
    if (featureBlocks.length > 0) {
        featureBlocks.forEach((feature) => {
            const image = feature.querySelector('.feature-image');
            const text = feature.querySelector('.feature-text');

            if (image && text) {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: feature,
                        start: 'top 85%',
                        end: 'bottom 75%',
                        scrub: 1.2,
                    }
                });

                const isImageFirst = image.compareDocumentPosition(text) & Node.DOCUMENT_POSITION_FOLLOWING;
                if (isImageFirst) {
                    tl.from(image, { xPercent: -30, opacity: 0, ease: 'power2.out' })
                      .from(text, { xPercent: 30, opacity: 0, ease: 'power2.out' }, "<");
                } else {
                    tl.from(text, { xPercent: -30, opacity: 0, ease: 'power2.out' })
                      .from(image, { xPercent: 30, opacity: 0, ease: 'power2.out' }, "<");
                }

                const isGeschoolFeature = feature.closest('#detailed-features');
                if (isGeschoolFeature) {
                    const parent = feature.parentElement;
                    const featureIndex = Array.from(parent.children).indexOf(feature);
                    const isEven = featureIndex % 2 !== 0;

                    if (isEven) {
                        tl.fromTo(feature, {
                            '--clip-before': 'polygon(0 0, 60% 0, 40% 100%, 0% 100%)',
                            '--clip-after': 'polygon(60% 0, 100% 0, 100% 100%, 40% 100%)'
                        }, {
                            '--clip-before': 'polygon(0 0, 85% 0, 65% 100%, 0% 100%)',
                            '--clip-after': 'polygon(85% 0, 100% 0, 100% 100%, 65% 100%)',
                            ease: 'none'
                        }, 0);
                    }
                }
            }
        });
    }

    // =================================================================
    // === ANIMATIONS SPÉCIFIQUES À CHAQUE PAGE (SUITE) ===
    // =================================================================
    
    // --- Page d'accueil (services-section-vertical) ---
    const serviceBlocks = document.querySelectorAll('.service-block');
    if (serviceBlocks.length > 0) {
        serviceBlocks.forEach((block) => {
            const image = block.querySelector('.service-image');
            const text = block.querySelector('.service-text');

            if (image && text) {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: block,
                        start: 'top 80%',
                        end: 'top 30%',
                        scrub: 1,
                    }
                });

                const isEven = Array.from(block.parentElement.children).indexOf(block) % 2 !== 0;

                tl.from(image, { xPercent: -15, opacity: 0, ease: 'power2.out' })
                  .from(text, { xPercent: 15, opacity: 0, ease: 'power2.out' }, "<");
                
                if (isEven) {
                    tl.fromTo(block, {
                        '--clip-before': 'polygon(0 0, 60% 0, 40% 100%, 0% 100%)',
                        '--clip-after': 'polygon(60% 0, 100% 0, 100% 100%, 40% 100%)'
                    }, {
                        '--clip-before': 'polygon(0 0, 85% 0, 65% 100%, 0% 100%)',
                        '--clip-after': 'polygon(85% 0, 100% 0, 100% 100%, 65% 100%)',
                        ease: 'none'
                    }, "<");
                }
            }
        });
    }

    // --- Page Geschool (benefits-grid) ---
    const benefitsGrid = document.querySelector('.benefits-grid');
    if (benefitsGrid) {
        gsap.from(".benefit-card", {
            scrollTrigger: {
                trigger: benefitsGrid,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            duration: 0.6,
            y: 60,
            opacity: 0,
            stagger: 0.15,
            ease: "power3.out",
        });

        const geschoolContactSection = document.querySelector('#contact.download');
        if (geschoolContactSection) {
            gsap.from(geschoolContactSection.querySelectorAll('.container > h2, .container > p, .container > div'), {
                scrollTrigger: {
                    trigger: geschoolContactSection,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                duration: 0.8,
                y: 50,
                opacity: 0,
                stagger: 0.2,
                ease: "power2.out",
            });
        }
    }

    // --- Page VTC (vtc-hero) ---
    if (document.querySelector('.vtc-hero')) {
        gsap.from(".vtc-hero h1 span", {
            duration: 1.2,
            opacity: 0,
            y: 40,
            rotationX: -90,
            ease: "power3.out",
            stagger: 0.1,
            delay: 0.2
        });
        gsap.from(".vtc-hero .hero-text p, .vtc-hero .hero-buttons", {
            duration: 1,
            opacity: 0,
            y: 20,
            ease: "power2.out",
            stagger: 0.2,
            delay: 0.8
        });

        const carContainer = document.createElement('div');
        carContainer.className = 'scroll-car-container';
        carContainer.innerHTML = `<img src="vtc-car.png" alt="Voiture animée au scroll">`;
        document.body.appendChild(carContainer);

        const carImage = carContainer.querySelector('img');
        carImage.onload = () => {
            gsap.to(carContainer, {
                scrollTrigger: {
                    trigger: document.body,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.8,
                    onUpdate: self => {
                        gsap.to(carImage, {
                            scaleY: self.direction === 1 ? -1 : 1,
                            duration: 0.3,
                            ease: 'power2.out'
                        });
                    }
                },
                y: window.innerHeight - carContainer.offsetHeight - 20,
                ease: 'none'
            });
        };
        if (carImage.complete) {
            carImage.onload();
        }

        const howItWorksSection = document.querySelector('.how-it-works');
        if (howItWorksSection) {
            gsap.from(howItWorksSection.querySelector('h2'), {
                scrollTrigger: { trigger: howItWorksSection, start: "top 85%", toggleActions: "play none none none"},
                y: 50, opacity: 0, duration: 0.8, ease: 'power3.out'
            });
            gsap.from(howItWorksSection.querySelectorAll('.step'), {
                scrollTrigger: { trigger: howItWorksSection, start: "top 80%", toggleActions: "play none none none"},
                y: 80,
                opacity: 0,
                stagger: 0.2,
                duration: 0.9,
                ease: 'back.out(1.7)'
            });
        }

        const pricingSection = document.querySelector('.pricing');
        if (pricingSection) {
            gsap.from(pricingSection.querySelector('h2'), {
                scrollTrigger: { trigger: pricingSection, start: "top 85%", toggleActions: "play none none none" },
                opacity: 0, y: 30, duration: 0.6, ease: "power2.out"
            });
            pricingSection.querySelectorAll('.tier').forEach((tier, index) => {
                gsap.from(tier, {
                    scrollTrigger: { trigger: tier, start: "top 90%", toggleActions: "play none none none" },
                    opacity: 0,
                    y: 60,
                    rotationZ: -10,
                    duration: 0.8,
                    delay: index * 0.15,
                    ease: "power3.out"
                });
            });
        }

        const downloadSection = document.querySelector('.download');
        if (downloadSection) {
             gsap.from(".download .container > *", {
                scrollTrigger: {
                    trigger: downloadSection,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                duration: 0.8,
                y: 40,
                opacity: 0,
                stagger: 0.2,
                ease: "power2.out",
            });
        }
    }

    // --- Page Nextcloud (nextcloud-features) ---
    if (document.querySelector('.nextcloud-features')) {
        const featuresSection = document.querySelector('.nextcloud-features');
        if (featuresSection) {
            gsap.from(featuresSection.querySelector('h2'), {
                scrollTrigger: { trigger: featuresSection, start: "top 85%", toggleActions: "play none none none"},
                y: 50, opacity: 0, duration: 0.8, ease: 'power3.out'
            });
            gsap.from(featuresSection.querySelectorAll('.step'), {
                scrollTrigger: { trigger: featuresSection, start: "top 80%", toggleActions: "play none none none"},
                y: 70,
                opacity: 0,
                scale: 0.9,
                stagger: 0.2,
                duration: 0.9,
                ease: 'back.out(1.7)'
            });
        }

        const pricingSectionNextcloud = document.querySelector('.nextcloud-pricing');
        if (pricingSectionNextcloud) {
             gsap.from(pricingSectionNextcloud.parentElement.querySelectorAll('h2, p'), {
                scrollTrigger: { trigger: pricingSectionNextcloud, start: "top 85%", toggleActions: "play none none none" },
                opacity: 0, y: 40, duration: 0.7, stagger: 0.1, ease: "power2.out"
            });
            pricingSectionNextcloud.querySelectorAll('.tier').forEach((tier, index) => {
                gsap.from(tier, {
                    scrollTrigger: { trigger: tier, start: "top 90%", toggleActions: "play none none none" },
                    opacity: 0,
                    y: 60,
                    rotationZ: -5,
                    duration: 0.8,
                    delay: index * 0.15,
                    ease: "power3.out"
                });
            });
        }
        
        const contactSectionNextcloud = document.querySelector('#contact.download');
         if (contactSectionNextcloud) {
             gsap.from(contactSectionNextcloud.querySelectorAll('.container > h2, .container > p, .container > div'), {
                scrollTrigger: {
                    trigger: contactSectionNextcloud,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                duration: 0.8,
                y: 50,
                opacity: 0,
                stagger: 0.2,
                ease: "power2.out",
            });
        }
    }

    // --- LOGIQUE POUR L'ARRIÈRE-PLAN DE PARTICULES (INCHANGÉE) ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particlesArray;

        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x; this.y = y; this.directionX = directionX; this.directionY = directionY; this.size = size; this.color = color;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            update() {
                if (this.x > canvas.width || this.x < 0) { this.directionX = -this.directionX; }
                if (this.y > canvas.height || this.y < 0) { this.directionY = -this.directionY; }
                this.x += this.directionX; this.y += this.directionY;
                this.draw();
            }
        }

        function initParticles() {
            particlesArray = [];
            let numberOfParticles = (canvas.height * canvas.width) / 9000;
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 1;
                let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * .4) - .2;
                let directionY = (Math.random() * .4) - .2;
                let color = 'rgba(255, 71, 87, 0.5)';
                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        function animateParticles() {
            requestAnimationFrame(animateParticles);
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
        }

        initParticles();
        animateParticles();

        window.addEventListener('resize', () => {
            canvas.width = innerWidth;
            canvas.height = innerHeight;
            initParticles();
        });
    }

      // ===================================================================
    // === ANIMATION JAVASCRIPT "CHORÉGRAPHIÉE" POUR LA PAGE CONTACT ===
    // ===================================================================

    const contactSection = document.querySelector('.contact-section');
    if (contactSection) {
        const formGroups = document.querySelectorAll('.contact-form .form-group');
        formGroups.forEach(group => {
            const input = group.querySelector('input, textarea');
            input.addEventListener('focus', () => group.classList.add('focus'));
            input.addEventListener('blur', () => group.classList.remove('focus'));
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '.contact-upper-block',
                start: "top 80%",
                toggleActions: "play none none none"
            }
        });

        tl.from('.contact-upper-block', {
            opacity: 0,
            scale: 0.97,
            duration: 0.8,
            ease: 'power3.out'
        });

        tl.from('.contact-info-panel > *', {
            opacity: 0,
            x: -40,
            stagger: 0.1,
            duration: 0.7,
            ease: 'power2.out'
        }, "-=0.5");

        tl.from('.contact-form-panel > *', {
            opacity: 0,
            y: 40,
            stagger: 0.1,
            duration: 0.7,
            ease: 'power2.out'
        }, "<"); 

        gsap.from('.contact-map-block', {
            scrollTrigger: {
                trigger: '.contact-map-block',
                start: "top 85%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 60,
            duration: 1,
            ease: 'power3.out'
        });
    }
});