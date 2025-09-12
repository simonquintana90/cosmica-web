document.addEventListener('DOMContentLoaded', () => {
    
    /**
     * Función principal que inicializa todos los componentes de la página.
     */
    function main() {
        try {
            initEssentialUI();
            initPageEnhancements();
        } catch (error) {
            console.error("Error en la inicialización principal:", error);
        }
    }

    /**
     * Inicializa los componentes de UI críticos.
     */
    function initEssentialUI() {
        initMobileMenu();
        initPricingCounter();
        initFAQAccordion();
    }

    /**
     * Inicializa todas las animaciones y efectos visuales.
     */
    function initPageEnhancements() {
        gsap.registerPlugin(ScrollTrigger);
        const lenis = initLenis();
        initScrollAnimations();
        initTextAnimations();
        startGlobalTicker(lenis);
    }

    // --- FUNCIONES DE UI ESENCIAL ---

    function initMobileMenu() {
        const navToggleBtn = document.querySelector('.nav-toggle-button');
        const mobileMenu = document.querySelector('.mobile-nav-menu');
        const mobileMenuLinks = gsap.utils.toArray('.mobile-nav-menu a');
        const closeBtn = document.querySelector('.mobile-close-button');
        if (!navToggleBtn || !mobileMenu || !closeBtn) return;
        
        const menuTl = gsap.timeline({
            paused: true,
            reversed: true,
            onStart: () => document.body.classList.add('mobile-menu-open'),
            onReverseComplete: () => document.body.classList.remove('mobile-menu-open'),
        });

        menuTl.to(mobileMenu, { opacity: 1, pointerEvents: 'auto', duration: 0.5, ease: 'power3.inOut' })
              .fromTo([...mobileMenuLinks, closeBtn], { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.4, ease: 'power3.out' }, "-=0.3");

        const toggleMenu = (play) => play ? menuTl.play() : menuTl.reverse();

        navToggleBtn.addEventListener('click', () => toggleMenu(true));
        closeBtn.addEventListener('click', () => toggleMenu(false));
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (document.body.classList.contains('mobile-menu-open')) {
                    toggleMenu(false);
                }
            });
        });
    }

    function initPricingCounter() {
        const minusBtn = document.getElementById('minus-lp');
        const plusBtn = document.getElementById('plus-lp');
        const lpCountSpan = document.getElementById('lp-count');
        const priceAmountEl = document.querySelector('#main-price-amount');
        const landingPageFeatureEl = document.getElementById('landing-page-feature');
        if (!minusBtn || !plusBtn || !lpCountSpan || !priceAmountEl || !landingPageFeatureEl) return;

        let basePrice = 300000;
        let landingPagePrice = 100000;
        let lpCount = 0;

        function formatPrice(price) { return price.toLocaleString('es-CO'); }
        
        function updatePriceAndFeatures() {
            const currentPrice = parseInt(priceAmountEl.textContent.replace(/\D/g, '')) || basePrice;
            const targetPrice = basePrice + (lpCount * landingPagePrice);
            
            gsap.to({ val: currentPrice }, { 
                duration: 0.5, 
                val: targetPrice, 
                ease: 'power3.out', 
                onUpdate: function() { 
                    priceAmountEl.innerHTML = `$${formatPrice(Math.round(this.targets()[0].val))}<span>/mes</span>`; 
                } 
            });
            
            lpCountSpan.textContent = lpCount;
            
            if (lpCount > 0) {
                if (landingPageFeatureEl.style.display === 'none') {
                    landingPageFeatureEl.style.display = 'flex';
                    gsap.to(landingPageFeatureEl, { opacity: 1, duration: 0.5 });
                }
            } else {
                if (landingPageFeatureEl.style.display !== 'none') {
                    gsap.to(landingPageFeatureEl, { opacity: 0, duration: 0.5, onComplete: () => { landingPageFeatureEl.style.display = 'none'; }});
                }
            }
        }

        plusBtn.addEventListener('click', () => { lpCount++; updatePriceAndFeatures(); });
        minusBtn.addEventListener('click', () => { if (lpCount > 0) { lpCount--; updatePriceAndFeatures(); } });
    }

    function initFAQAccordion() {
        const faqItems = gsap.utils.toArray('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (!question) return;

            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                faqItems.forEach(otherItem => {
                    if (otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        gsap.to(otherItem.querySelector('.faq-answer'), { maxHeight: 0, duration: 0.4, ease: 'power2.inOut' });
                        gsap.to(otherItem.querySelector('.faq-icon'), { rotation: 0, duration: 0.4, ease: 'power2.inOut' });
                    }
                });

                if (!isActive) {
                    item.classList.add('active');
                    gsap.to(item.querySelector('.faq-answer'), { maxHeight: item.querySelector('.faq-answer').scrollHeight, duration: 0.5, ease: 'power2.inOut' });
                    gsap.to(item.querySelector('.faq-icon'), { rotation: 45, duration: 0.4, ease: 'power2.inOut' });
                }
            });
        });
    }

    // --- FUNCIONES DE MEJORAS VISUALES Y ANIMACIONES ---

    function initLenis() {
        if (typeof Lenis === 'undefined') return null;
        const lenis = new Lenis();
        return lenis;
    }
    
    function initScrollAnimations() {
        // Animaciones de entrada para secciones
        gsap.utils.toArray('.portal-feature-header, .usp-header, .how-it-works-header, .reviews-header, .pricing-header, .faq-header, .guarantee-content h2, .guarantee-content p, .final-cta-content h2, .final-cta-content p, .social-proof-section').forEach(el => {
            gsap.from(el, { scrollTrigger: { trigger: el, start: "top 85%" }, opacity: 0, y: 50, duration: 1, ease: "power3.out" });
        });
        
        // Animación para nueva sección del Portal
        gsap.from('.portal-feature-content', { scrollTrigger: { trigger: '.portal-feature-content', start: "top 85%" }, opacity: 0, x: -50, duration: 1, ease: "power3.out" });
        gsap.from('.portal-visual', { scrollTrigger: { trigger: '.portal-visual', start: "top 85%" }, opacity: 0, scale: 0.9, duration: 1.2, ease: "expo.out" });


        gsap.utils.toArray(".usp-card").forEach(card => {
            gsap.from(card, { scrollTrigger: { trigger: card, start: "top 85%" }, opacity: 0, scale: 0.95, y: 40, duration: 0.8, ease: "expo.out" });
        });
        
        // Animación para la nueva sección "Manifiesto"
        gsap.utils.toArray(".manifesto-step").forEach((step, index) => {
            gsap.from(step, {
                scrollTrigger: {
                    trigger: step,
                    start: "top 85%",
                },
                opacity: 0,
                y: 40,
                duration: 0.8,
                ease: "power3.out",
                delay: index * 0.15
            });
        });

        // Marquee de reseñas (LÓGICA SIMPLIFICADA)
        const marqueeRow = document.querySelector('.reviews-marquee-row');
        if (marqueeRow) {
            const reviews = [
                { quote: "Excelente servicio. Lo dejé todo en sus manos e incrementaron mis ventas.", author: "Gabriel A." },
                { quote: "Muy buen servicio al cliente y conocimiento.", author: "Jose Afanador" },
                { quote: "Fue más de lo que soñamos. La página para nuestra fundación quedó clara, funcional y profesional...", author: "Qué Buena Salud" },
                { quote: "Simón ofrece un servicio excelente; es responsable, amable y siempre está dispuesto a resolver cualquier...", author: "Juan David Orozco" },
                { quote: "Me encantó el servicio de Simón por sus ideas, su rapidez, paciencia y su gran talento para crear...", author: "Soy Tribu SAS" },
                { quote: "Muy creativo, paciente, buena asesoría y siempre dispuesto a entregar lo mejor. Recomendado 100%...", author: "Michelle Verner Gomez" }
            ];

            reviews.forEach(review => {
                const card = document.createElement('div');
                card.className = 'review-card';
                card.innerHTML = `
                    <p class="review-quote">"${review.quote}"</p>
                    <div class="review-author">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" class="google-logo">
                        <span>${review.author}</span>
                    </div>`;
                marqueeRow.appendChild(card);
            });

            const reviewCards = gsap.utils.toArray('.review-card', marqueeRow);
            reviewCards.forEach(card => marqueeRow.appendChild(card.cloneNode(true)));
            
            const loop = gsap.to(marqueeRow, { xPercent: -50, ease: 'none', duration: 40, repeat: -1 });
            marqueeRow.addEventListener('mouseenter', () => gsap.to(loop, { timeScale: 0.2, duration: 0.5 }));
            marqueeRow.addEventListener('mouseleave', () => gsap.to(loop, { timeScale: 1, duration: 0.5 }));
        }

        // Botón magnético
        const ctaSection = document.querySelector('.final-cta-section');
        const magneticBtn = document.querySelector('.magnetic-button');
        if (ctaSection && magneticBtn) {
            ctaSection.addEventListener('mousemove', (e) => {
                const rect = ctaSection.getBoundingClientRect();
                gsap.to(magneticBtn, { x: (e.clientX - rect.left - rect.width / 2) * 0.3, y: (e.clientY - rect.top - rect.height / 2) * 0.3, duration: 1, ease: 'power3.out' });
            });
            ctaSection.addEventListener('mouseleave', () => {
                gsap.to(magneticBtn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
            });
        }
    }
    
    function initTextAnimations() {
        const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        
        heroTimeline
            .from('.hero-title', { opacity: 0, y: 40, duration: 1.2 }, 0.2)
            .from('.hero-subtitle', { opacity: 0, y: 30, duration: 1 }, 0.5)
            .from('.hero-cta-button', { opacity: 0, y: 20, scale: 0.95, duration: 1 }, 0.8)
            .from('.hero-visual-placeholder', { opacity: 0, scale: 0.9, duration: 1.5, ease: 'expo.out' }, 0.4);
    }

    function startGlobalTicker(lenis) {
        gsap.ticker.add((time) => {
            if (lenis) lenis.raf(time * 1000);
        });
    }

    // --- EJECUCIÓN ---
    main();
});