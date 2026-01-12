// === INITIALISATION SUPABASE ===
const SUPABASE_URL = 'https://neensjugjhkvwcqslicr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lZW5zanVnamhrdndjcXNsaWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5Mjg1NzQsImV4cCI6MjA4MTUwNDU3NH0.eDEhhT8HzetCntUZ2LYkZhtoUjSjmFxPQqm03aAL8tU';
let supabaseClient = null;

// On n'initialise QUE si la librairie est chargée dans le HTML
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// 1. Fonction pour afficher les notifications (Style Big Tech)
function showNotification(message, type = 'success') {
    // Créer le container s'il n'existe pas
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // Créer l'élément de notification
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;

    const icon = type === 'success' ? '✅' : '❌';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Animation d'entrée avec GSAP
    gsap.fromTo(toast,
        { x: 100, opacity: 0, scale: 0.5 },
        { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
    );

    // Disparition automatique après 4 secondes
    setTimeout(() => {
        gsap.to(toast, {
            x: 100,
            opacity: 0,
            duration: 0.4,
            onComplete: () => toast.remove()
        });
    }, 4000);
}


document.addEventListener('DOMContentLoaded', () => {

    // ==============================================================
    // === GESTION DES LANGUES ===
    // ==============================================================
    const langSwitcher = document.querySelector('.lang-switcher');

    // Vérification de sécurité pour l'objet translations
    if (typeof translations === 'undefined') {
        console.warn("Attention : L'objet 'translations' n'est pas chargé.");
    }

    const setLanguage = (lang) => {
        // Si translations n'est pas défini, on arrête pour éviter le crash
        if (typeof translations === 'undefined') return;

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

        // ===  (Gestion des Meta Tags) ===
        document.querySelectorAll('[data-key-meta]').forEach(element => {
            const key = element.dataset.keyMeta;
            if (translations[lang] && translations[lang][key]) {
                element.setAttribute('content', translations[lang][key]);
            }
        });

        document.querySelectorAll('[data-key-placeholder]').forEach(element => {
            const key = element.dataset.keyPlaceholder;
            if (translations[lang] && translations[lang][key]) {
                element.placeholder = translations[lang][key];
            }
        });

        document.documentElement.lang = lang;
        document.documentElement.lang = lang;
        // On utilise un try-catch pour éviter le crash si les cookies/storage sont bloqués
        try {
            localStorage.setItem('language', lang);
        } catch (e) {
            console.warn("Impossible de sauvegarder la langue (Stockage bloqué par le navigateur)");
        }

        if (langSwitcher) {
            langSwitcher.querySelectorAll('a').forEach(a => {
                a.classList.remove('active');
                if (a.getAttribute('lang') === lang) {
                    a.classList.add('active');
                }
            });
        }
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

    // MODIFICATION : On met le français par défaut pour tout le monde (y compris Google),
    // sauf si l'utilisateur a déjà choisi une langue et qu'elle est enregistrée dans le localStorage.
    const initialLang = localStorage.getItem('language') || 'fr';
    setLanguage(initialLang);


    // ==============================================================
    // === MENU MOBILE ===
    // ==============================================================
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('header nav ul');
    const body = document.body;

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('nav-open');
            menuToggle.classList.toggle('open');
            body.classList.toggle('body-nav-open');
        });

        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('nav-open');
                menuToggle.classList.remove('open');
                body.classList.remove('body-nav-open');
            }
        });
    }

    // --- GESTION DU SOUS-MENU MOBILE ---
    const dropdownToggles = document.querySelectorAll('header nav .dropdown > a');

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const isMobileMenuOpen = navLinks.classList.contains('nav-open');

            if (isMobileMenuOpen) {
                e.preventDefault();
                e.stopPropagation(); // Important pour ne pas fermer le menu
                const parentLi = toggle.parentElement;
                parentLi.classList.toggle('submenu-open');
            }
        });
    });


    // ==============================================================
    // === NAVIGATION ACTIVE & SCROLL ===
    // ==============================================================
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

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });


    // ==============================================================
    // === INITIALISATION DU DIAPORAMA HERO (Page d'accueil) ===
    // ==============================================================
    if (document.querySelector('.home-hero')) {
        const AUTOPLAY_DELAY = 5000;
        const TRANSITION_SPEED = 1000;

        if (typeof Swiper !== 'undefined') {
            const swiper = new Swiper('.hero-slideshow', {
                loop: true,
                speed: TRANSITION_SPEED,
                observer: true,
                observeParents: true,
                effect: 'fade',
                fadeEffect: {
                    crossFade: true
                },
                autoplay: {
                    delay: AUTOPLAY_DELAY,
                    disableOnInteraction: false,
                    waitForTransition: false
                },
                pagination: {
                    el: '.hero-progress-pagination',
                    clickable: true,
                    renderBullet: function (index, className) {
                        return '<div class="' + className + '"><div class="progress-fill"></div></div>';
                    },
                },
            });

            window.homeHeroSwiper = swiper;

            const runBarAnimation = () => {
                const allFills = document.querySelectorAll('.hero-progress-pagination .progress-fill');
                const realIndex = swiper.realIndex;

                allFills.forEach((fill, index) => {
                    fill.style.transition = 'none';

                    if (index < realIndex) {
                        fill.style.transform = 'scaleX(1)';
                    } else if (index > realIndex) {
                        fill.style.transform = 'scaleX(0)';
                    } else {
                        // Animation active
                        fill.style.transform = 'scaleX(0)';
                        void fill.offsetWidth; // Reflow
                        fill.style.transition = `transform ${AUTOPLAY_DELAY}ms linear`;
                        fill.style.transform = 'scaleX(1)';
                    }
                });
            };

            swiper.on('slideChangeTransitionStart', runBarAnimation);

            // Premier lancement
            runBarAnimation();

            // --- CORRECTIF : GESTION DU CHANGEMENT D'ONGLET ---
            // Empêche le décalage quand on quitte/revient sur le navigateur
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    // L'utilisateur est parti : on met en pause pour éviter le désynchronisme
                    swiper.autoplay.stop();

                    // Optionnel : on fige visuellement la barre (reset)
                    const activeFill = document.querySelector('.hero-progress-pagination .swiper-pagination-bullet-active .progress-fill');
                    if (activeFill) {
                        activeFill.style.transition = 'none';
                        activeFill.style.transform = 'scaleX(0)';
                    }

                } else {
                    // L'utilisateur est revenu : on relance tout proprement
                    swiper.autoplay.start();
                    runBarAnimation();
                }
            });
            // --------------------------------------------------

        } else {
            console.warn("La librairie Swiper n'est pas chargée.");
        }
    }

    // ==============================================================
    // === SYSTÈME D'ANIMATION AVEC GSAP & SCROLLTRIGGER ===
    // ==============================================================

    // On vérifie que GSAP est chargé
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // --- ANIMATION DU LOGO AU SCROLL ---
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
        // === ANIMATIONS PAR PAGE (DÉTAILLÉES) ===
        // ==============================================================

        // --- 1. Page d'Accueil (index.html) ---
        if (document.querySelector('.home-hero')) {
            if (document.querySelector(".hero-title-main span")) {
                gsap.from(".hero-title-main span", {
                    duration: 1.2,
                    opacity: 0,
                    y: 40,
                    rotationX: -90,
                    ease: "power3.out",
                    stagger: 0.2,
                    delay: 0.2
                });
            }
            gsap.from(".home-hero p, .home-hero .hero-cta", {
                duration: 1,
                opacity: 0,
                y: 20,
                ease: "power2.out",
                stagger: 0.2,
                delay: 0.8
            });
        }

        // --- 2. Page Geschool ---
        if (document.querySelector('.geschool-hero')) {
            if (document.querySelector(".geschool-hero h1 span")) {
                gsap.from(".geschool-hero h1 span", {
                    duration: 1.2,
                    opacity: 0,
                    y: 40,
                    rotationX: -90,
                    ease: "power3.out",
                    stagger: 0.15,
                    delay: 0.2
                });
            }
            gsap.from(".geschool-hero .hero-text p, .geschool-hero .hero-buttons", {
                duration: 1,
                opacity: 0,
                y: 20,
                ease: "power2.out",
                stagger: 0.2,
                delay: 0.8
            });
        }

        // --- 3. Page Nextcloud ---
        if (document.querySelector('.nextcloud-hero')) {
            const nextcloudHeroTl = gsap.timeline();
            if (document.querySelector(".nextcloud-hero h1 span")) {
                nextcloudHeroTl.from(".nextcloud-hero h1 span", {
                    duration: 1.2,
                    opacity: 0,
                    y: 40,
                    rotationX: -90,
                    ease: "power3.out",
                    stagger: 0.2,
                    delay: 0.2
                });
            }
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

        // --- 4. Page À Propos (Version Corrigée & Stabilisée) ---

        // On attend que TOUTE la page (images, css) soit chargée pour calculer les positions
        window.addEventListener("load", () => {

            // On vérifie qu'on est bien sur la page À Propos
            if (document.querySelector('.about-hero')) {

                // Force ScrollTrigger à recalculer les positions exactes
                ScrollTrigger.refresh();

                // --- ANIMATION HERO ---
                const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

                // Titre
                if (document.querySelector(".about-hero h1 span")) {
                    // fromTo force le départ et l'arrivée : impossible de se tromper de position
                    heroTl.fromTo(".about-hero h1 span",
                        { y: 100, opacity: 0, skewY: 7 }, // DÉPART
                        { y: 0, opacity: 1, skewY: 0, duration: 1.2, stagger: 0.15 } // ARRIVÉE
                    );
                }

                // Sous-titre
                if (document.querySelector(".about-hero .hero-text p")) {
                    heroTl.fromTo(".about-hero .hero-text p",
                        { y: 30, opacity: 0, filter: "blur(5px)" },
                        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1 },
                        "-=0.8"
                    );
                }

                // --- ANIMATION TITRES DE SECTION ---
                const headers = gsap.utils.toArray('.section-header');
                headers.forEach(header => {
                    gsap.fromTo(header,
                        { y: 50, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            duration: 1,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: header,
                                start: "top 85%",
                                toggleActions: "play none none reverse"
                            }
                        }
                    );
                });

                // --- FONCTION GÉNÉRIQUE OPTIMISÉE (V2) ---
                const animateCards = (cardSelector, containerSelector) => {
                    const cards = document.querySelectorAll(cardSelector);
                    const container = document.querySelector(containerSelector);

                    if (cards.length > 0 && container) {
                        // Optimisation GPU : indique au navigateur ce qui va bouger
                        gsap.set(cards, { willChange: "transform, opacity" });

                        gsap.fromTo(cards,
                            {
                                // ÉTAT DE DÉPART (FROM)
                                autoAlpha: 0, // gère opacity + visibility
                                y: 50
                            },
                            {
                                // ÉTAT D'ARRIVÉE (TO)
                                autoAlpha: 1,
                                y: 0,
                                duration: 0.8,
                                stagger: 0.15, // Légèrement augmenté pour bien voir la cascade
                                ease: "power3.out",

                                scrollTrigger: {
                                    trigger: containerSelector,
                                    start: "top 85%",
                                    toggleActions: "play none none reverse",
                                },

                                // NETTOYAGE (Important pour le hover CSS)
                                onComplete: () => {
                                    // Une fois fini, on retire l'optimisation pour rendre la main au CSS
                                    // (si vous avez des effets de zoom au hover par exemple)
                                    gsap.set(cards, { clearProps: "willChange" });
                                }
                            }
                        );
                    }
                };

                // --- APPEL DES ANIMATIONS ---
                // Assurez-vous d'appeler ceci une fois le DOM prêt
                animateCards(".expertise-card", ".expertise-grid");
                animateCards(".value-card", ".values-grid");
                animateCards(".commitment-card", ".commitment-grid");


                // --- ANIMATION STORY ---
                if (document.querySelector('.story-image img')) {
                    gsap.fromTo(".story-image img",
                        { scale: 1.2, opacity: 0 },
                        {
                            scale: 1,
                            opacity: 1,
                            duration: 1.5,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: ".story-section",
                                start: "top 75%",
                            }
                        }
                    );
                }
                if (document.querySelector('.story-text')) {
                    gsap.fromTo(".story-text",
                        { x: 50, opacity: 0 },
                        {
                            x: 0,
                            opacity: 1,
                            duration: 1.2,
                            delay: 0.2,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: ".story-section",
                                start: "top 75%",
                            }
                        }
                    );
                }

                // --- ANIMATION CTA ---
                if (document.querySelector(".cta-section")) {
                    gsap.fromTo(".cta-section .container",
                        { scale: 0.8, opacity: 0 },
                        {
                            scale: 1,
                            opacity: 1,
                            duration: 1,
                            ease: "power2.out",
                            scrollTrigger: {
                                trigger: ".cta-section",
                                start: "top 90%",
                            }
                        }
                    );
                }
            }
        });
        // --- 5. Page Contact ---
        if (document.querySelector('.contact-hero')) {
            if (document.querySelector(".contact-hero h1 span")) {
                gsap.from(".contact-hero h1 span", {
                    duration: 1.2,
                    opacity: 0,
                    y: 40,
                    rotationX: -90,
                    ease: "power3.out",
                    stagger: 0.2,
                    delay: 0.2
                });
            }
            gsap.from(".contact-hero .hero-text p", {
                duration: 1,
                opacity: 0,
                y: 20,
                ease: "power2.out",
                delay: 0.8
            });
        }

        // --- 6. Page Portfolio (AJOUT) ---
        if (document.querySelector('.portfolio-hero')) {
            // Animation du titre (les spans "NOTRE" et "PORTFOLIO")
            if (document.querySelector(".portfolio-hero h1 span")) {
                gsap.from(".portfolio-hero h1 span", {
                    duration: 1.2,
                    opacity: 0,
                    y: 40,
                    rotationX: -90, // Petit effet de rotation 3D comme sur les autres pages
                    ease: "power3.out",
                    stagger: 0.2, // Décalage entre "NOTRE" et "PORTFOLIO"
                    delay: 0.2
                });
            }

            // Animation de la description
            gsap.from(".portfolio-hero .hero-text p", {
                duration: 1,
                opacity: 0,
                y: 20,
                ease: "power2.out",
                delay: 0.8 // Arrive un peu après le titre
            });
        }

        // ==============================================================
        // === FEATURES & BLOCS COMMUNS ===
        // ==============================================================
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

                    // Clip-path spécifique pour Geschool
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

        // --- Page d'accueil (services-section-vertical) ---
        const serviceBlocks = document.querySelectorAll('.service-block');

        if (serviceBlocks.length > 0) {
            serviceBlocks.forEach((block) => {
                const image = block.querySelector('.service-image');
                const text = block.querySelector('.service-text');

                if (image && text) {
                    // Création de la timeline
                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: block,
                            start: 'top 80%', // Commence quand le haut du bloc est à 80% de l'écran
                            end: 'top 30%',   // Finit quand il est à 30%
                            scrub: 1,         // Animation fluide liée au scroll
                        }
                    });

                    // 1. Apparition des éléments (Image et Texte)
                    tl.from(image, { xPercent: -15, opacity: 0, ease: 'power2.out' })
                        .from(text, { xPercent: 15, opacity: 0, ease: 'power2.out' }, "<");


                    // 2. GESTION DE L'ANIMATION DU FOND (C'est ici qu'on corrige)

                    // On récupère l'index (H2=0, Zaza=1, Geschool=2)
                    const index = Array.from(block.parentElement.children).indexOf(block);

                    // Est-ce le bloc Geschool (le numéro 2) ?
                    const isGeschool = (index === 2);

                    // Condition : On anime si c'est Zaza (impair) OU Geschool (2)
                    const shouldAnimate = (index % 2 !== 0) || isGeschool;

                    if (shouldAnimate) {
                        // REGLAGE FIN : 
                        // Si c'est Geschool, on remplit moins large (75%) pour compenser l'effet visuel
                        // Si c'est Zaza, on garde 85%
                        const endWidth = isGeschool ? '80%' : '100%';

                        // On calcule le polygone de fin dynamiquement
                        const endPolygonBefore = `polygon(0 0, ${endWidth} 0, ${parseInt(endWidth) - 20}% 100%, 0% 100%)`;
                        const endPolygonAfter = `polygon(${endWidth} 0, 100% 0, 100% 100%, ${parseInt(endWidth) - 20}% 100%)`;

                        tl.fromTo(block, {
                            // Position de départ (identique pour tous)
                            '--clip-before': 'polygon(0 0, 60% 0, 40% 100%, 0% 100%)',
                            '--clip-after': 'polygon(60% 0, 100% 0, 100% 100%, 40% 100%)'
                        }, {
                            // Position de fin (Ajustée selon le bloc)
                            '--clip-before': endPolygonBefore,
                            '--clip-after': endPolygonAfter,
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

        // --- 6. Page VTC (vtc-hero) ---
        if (document.querySelector('.vtc-hero')) {
            if (document.querySelector(".vtc-hero h1 span")) {
                gsap.from(".vtc-hero h1 span", {
                    duration: 1.2,
                    opacity: 0,
                    y: 40,
                    rotationX: -90,
                    ease: "power3.out",
                    stagger: 0.1,
                    delay: 0.2
                });
            }
            gsap.from(".vtc-hero .hero-text p, .vtc-hero .hero-buttons", {
                duration: 1,
                opacity: 0,
                y: 20,
                ease: "power2.out",
                stagger: 0.2,
                delay: 0.8
            });

            // === ANIMATION VOITURE ===
            const carContainer = document.createElement('div');
            carContainer.className = 'scroll-car-container';
            carContainer.innerHTML = `<img src="images/vtc-car.png" alt="Voiture animée au scroll">`;
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
                            // REMIS À SCALEY COMME AVANT
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
                    scrollTrigger: { trigger: howItWorksSection, start: "top 85%", toggleActions: "play none none none" },
                    y: 50, opacity: 0, duration: 0.8, ease: 'power3.out'
                });
                gsap.from(howItWorksSection.querySelectorAll('.step'), {
                    scrollTrigger: { trigger: howItWorksSection, start: "top 80%", toggleActions: "play none none none" },
                    y: 80,
                    opacity: 0,
                    stagger: 0.2,
                    duration: 0.9,
                    ease: 'back.out(1.7)'
                });
            }

            const pricingSection = document.querySelector('.pricing');
            if (pricingSection) {
                if (pricingSection.querySelector('h2')) {
                    gsap.from(pricingSection.querySelector('h2'), {
                        scrollTrigger: { trigger: pricingSection, start: "top 85%", toggleActions: "play none none none" },
                        opacity: 0, y: 30, duration: 0.6, ease: "power2.out"
                    });
                }
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

        // --- 7. Page Nextcloud (nextcloud-features) ---
        if (document.querySelector('.nextcloud-features')) {
            const featuresSection = document.querySelector('.nextcloud-features');
            if (featuresSection) {
                gsap.from(featuresSection.querySelector('h2'), {
                    scrollTrigger: { trigger: featuresSection, start: "top 85%", toggleActions: "play none none none" },
                    y: 50, opacity: 0, duration: 0.8, ease: 'power3.out'
                });
                gsap.from(featuresSection.querySelectorAll('.step'), {
                    scrollTrigger: { trigger: featuresSection, start: "top 80%", toggleActions: "play none none none" },
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

        // --- 8. Animation Page Contact ---
        const contactSection = document.querySelector('.contact-section');
        if (contactSection) {
            const formGroups = document.querySelectorAll('.contact-form .form-group');
            formGroups.forEach(group => {
                const input = group.querySelector('input, textarea');
                if (input) {
                    input.addEventListener('focus', () => group.classList.add('focus'));
                    input.addEventListener('blur', () => group.classList.remove('focus'));
                }
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

            // ==============================================================
            // === LOGIQUE D'ENVOI DU FORMULAIRE (SUPABASE) ===
            // ==============================================================

            // 2. Ta logique Supabase modifiée
            const contactForm = document.querySelector('.contact-form');
            if (contactForm) {
                contactForm.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    if (!supabaseClient) {
                        showNotification("Le service est indisponible pour le moment.", "error");
                        return;
                    }

                    const submitBtn = contactForm.querySelector('button[type="submit"]');
                    const originalBtnText = submitBtn.innerHTML;
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = "Envoi en cours...";

                    const formData = new FormData(contactForm);
                    const payload = {
                        name: formData.get('name'),
                        email: formData.get('email'),
                        subject: formData.get('subject'),
                        message: formData.get('message'),
                    };

                    try {
                        const { error } = await supabaseClient
                            .from('contact_messages')
                            .insert([payload]);

                        if (error) {
                            // REMPLACEMENT de alert()
                            showNotification("Erreur : " + error.message, "error");
                        } else {
                            // REMPLACEMENT de alert()
                            showNotification("Succès ! Votre message a été envoyé.", "success");
                            contactForm.reset();
                        }
                    } catch (err) {
                        console.error(err);
                        showNotification("Une erreur inattendue est survenue.", "error");
                    } finally {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }
                });
            }
        }



        // ==============================================================
        // === PARTICULES (CANVAS) ===
        // ==============================================================
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


        // ==============================================================
        // === Animation section benefits (CORRIGÉ & SÉCURISÉ) ===
        // ==============================================================

        // Sélection de la piste
        const track = document.getElementById("marqueeTrack");

        // ON VÉRIFIE QUE LA PISTE EXISTE AVANT DE LANCER QUOI QUE CE SOIT
        if (track) {
            // 1. DUPLICATION DU CONTENU
            track.innerHTML += track.innerHTML;

            // 2. ANIMATION GSAP
            const items = track.querySelectorAll('.marquee-item');
            // Vérification de sécurité pour éviter la division par zéro
            if (track.scrollWidth > 0) {
                const totalWidth = track.scrollWidth / 2;

                const animation = gsap.to(track, {
                    x: -totalWidth,
                    duration: 30,
                    ease: "none",
                    repeat: -1,
                    modifiers: {
                        x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
                    }
                });

                // 3. INTERACTION UTILISATEUR
                const marqueeContainer = document.querySelector('.marquee-container');

                if (marqueeContainer) {
                    marqueeContainer.addEventListener("mouseenter", () => {
                        animation.pause();
                    });

                    marqueeContainer.addEventListener("mouseleave", () => {
                        animation.play();
                    });
                }
            }
        }

        /* ================================================================ */
        /* === LOGIQUE DE LA PAGE PORTFOLIO (SYSTÈME DE FILTRES) === */
        /* ================================================================ */

        const container = document.getElementById('portfolio-container');

        // === 1. CHARGEMENT AUTOMATIQUE DES PROJETS ===
        if (container) {
            fetch('projects.json')
                .then(response => response.json())
                .then(projects => {
                    generateProjects(projects);
                    initializeFilters(); // On lance les filtres APRES le chargement
                    initializeModals();  // On lance les modales APRES le chargement

                    // Si vous utilisez un script de traduction, relancez-le ici si nécessaire
                    // ex: if(typeof translatePage === 'function') translatePage(); 
                })
                .catch(error => console.error('Erreur chargement projets:', error));
        }

        // Fonction pour créer le HTML
        function generateProjects(projects) {
            container.innerHTML = ''; // Vide le conteneur par sécurité

            projects.forEach(proj => {
                const isModal = proj.type === 'modal';

                // Création de la Div principale
                const card = document.createElement('div');
                card.className = `portfolio-item ${isModal ? 'trigger-modal' : ''}`;
                card.setAttribute('data-category', proj.category);

                // Gestion du clic (Lien vs Modale)
                if (!isModal) {
                    card.onclick = () => window.location.href = proj.link_url;
                } else {
                    // Ajout des data-attributes pour la modale
                    card.setAttribute('data-title', proj.modal_details.title);
                    card.setAttribute('data-client', proj.modal_details.client);
                    card.setAttribute('data-desc', proj.modal_details.full_desc);
                    card.setAttribute('data-tech', proj.modal_details.tech);
                    card.setAttribute('data-img', proj.image);
                }

                // Structure HTML interne
                card.innerHTML = `
                <div class="portfolio-img-box">
                    <img src="${proj.image}" alt="${proj.title_default}" loading="lazy">
                </div>
                <div class="portfolio-content">
                    <span class="portfolio-cat" data-key="${proj.cat_key}">${proj.cat_label}</span>
                    <h3 data-key="${proj.title_key}">${proj.title_default}</h3>
                    <p data-key="${proj.desc_key}">${proj.desc_default}</p>
                    
                    <div class="portfolio-footer">
                        <span class="btn-text">${isModal ? 'Voir le projet' : 'Découvrir'}</span>
                        <i class="fas fa-arrow-right arrow-icon"></i>
                    </div>
                </div>
            `;

                container.appendChild(card);
            });
        }

        // === 2. LOGIQUE DES FILTRES (Adaptée pour contenu dynamique) ===
        function initializeFilters() {
            const filterBtns = document.querySelectorAll('.filter-btn');
            const items = document.querySelectorAll('.portfolio-item');

            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Active class
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const filterValue = btn.getAttribute('data-filter');

                    items.forEach(item => {
                        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                            item.style.display = 'flex'; // Important: flex pour garder le layout
                            setTimeout(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'translateY(0)';
                            }, 50);
                        } else {
                            item.style.opacity = '0';
                            item.style.transform = 'translateY(20px)';
                            setTimeout(() => {
                                item.style.display = 'none';
                            }, 300);
                        }
                    });
                });
            });
        }

        // === 3. LOGIQUE DE LA MODALE (Adaptée pour contenu dynamique) ===
        function initializeModals() {
            const modal = document.getElementById('project-modal');
            const closeBtn = document.querySelector('.modal-close');
            // On sélectionne les éléments dynamiques
            const triggers = document.querySelectorAll('.trigger-modal');

            // Éléments internes de la modale
            const mImg = document.getElementById('modal-img');
            const mCat = document.getElementById('modal-cat');
            const mTitle = document.getElementById('modal-title');
            const mClient = document.getElementById('modal-client');
            const mDesc = document.getElementById('modal-desc');
            const mTechList = document.getElementById('modal-tech-list');

            const openModal = (item) => {
                mImg.src = item.getAttribute('data-img');
                // Mapping simple des catégories pour l'affichage modale
                const catMap = { 'web': 'Développement Web', 'infra': 'Infrastructure', 'logiciel': 'Logiciel' };
                const catKey = item.getAttribute('data-category');

                mCat.textContent = catMap[catKey] || 'Projet';
                mTitle.textContent = item.getAttribute('data-title');
                mClient.textContent = item.getAttribute('data-client');
                mDesc.textContent = item.getAttribute('data-desc');

                // Gestion des tags technos
                mTechList.innerHTML = '';
                const techs = item.getAttribute('data-tech').split(', ');
                techs.forEach(tech => {
                    const span = document.createElement('span');
                    span.classList.add('tech-tag');
                    span.textContent = tech;
                    mTechList.appendChild(span);
                });

                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            };

            const closeModal = () => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            };

            triggers.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    openModal(item);
                });
            });

            if (closeBtn) closeBtn.addEventListener('click', closeModal);
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) closeModal();
                });
            }
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal && modal.classList.contains('active')) closeModal();
            });
        }
    }

});



// ==============================================================
// === FONCTIONS GLOBALES (HORS DOMContentLoaded) ===
// ==============================================================

function openQuoteModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('quoteModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // --- AJOUT : Mettre le Swiper en pause ---
        if (window.homeHeroSwiper && window.homeHeroSwiper.autoplay) {
            window.homeHeroSwiper.autoplay.stop();
        }
    } else {
        console.error("Erreur: La modale avec l'ID 'quoteModal' est introuvable.");
    }
}

function closeQuoteModal() {
    const modal = document.getElementById('quoteModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // --- AJOUT : Relancer le Swiper ---
        if (window.homeHeroSwiper && window.homeHeroSwiper.autoplay) {
            window.homeHeroSwiper.autoplay.start();
        }
    }
}

// ==============================================================
// === LOGIQUE D'ENVOI DU FORMULAIRE DE DEVIS (MODALE) ===
// ==============================================================
const quoteForm = document.querySelector('.quote-form');

if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Sécurité : Vérifier Supabase
        if (!supabaseClient) {
            showNotification("Le service est indisponible.", "error");
            return;
        }

        // 2. Bouton en cours
        const submitBtn = quoteForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Envoi en cours...";

        // 3. Récupérer les données
        const formData = new FormData(quoteForm);
        const payload = {
            client_type: formData.get('client_type'),
            fullname: formData.get('fullname'),
            company: formData.get('company'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            service: formData.get('service'),
            message: formData.get('message')
        };

        try {
            // 4. Envoi à Supabase
            const { error } = await supabaseClient
                .from('quote_requests')
                .insert([payload]);

            if (error) throw error;

            // 5. Succès
            showNotification("Demande envoyée ! Notre équipe vous contactera sous 24h.", "success");
            quoteForm.reset();

            // Fermer la modale après 2 secondes
            setTimeout(() => {
                if (typeof closeQuoteModal === 'function') closeQuoteModal();
            }, 2000);

        } catch (err) {
            console.error("Erreur Devis:", err.message);
            showNotification("Erreur lors de l'envoi. Veuillez réessayer.", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}