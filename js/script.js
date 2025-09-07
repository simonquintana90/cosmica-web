document.addEventListener('DOMContentLoaded', () => {
    
    // =================================================================
    // SCRIPT REESTRUCTURADO PARA MAYOR ESTABILIDAD
    // =================================================================

    /**
     * Función principal que inicializa todos los componentes de la página.
     */
    function main() {
        try {
            initEssentialUI();
        } catch (error) {
            console.error("Error al inicializar la UI esencial:", error);
        }

        try {
            initPageEnhancements();
        } catch (error) {
            console.error("Error al inicializar las mejoras de la página:", error);
        }
    }

    /**
     * Inicializa los componentes de UI críticos: menú, formulario y FAQ.
     */
    function initEssentialUI() {
        initMobileMenu();
        initContactModal();
        initPricingCounter();
        initFAQAccordion();
    }

    /**
     * Inicializa todas las animaciones, efectos visuales y la física del sticker.
     */
    function initPageEnhancements() {
        gsap.registerPlugin(ScrollTrigger);
        const lenis = initLenis();
        initCustomCursor();
        initStickerPhysics(); // Inicializar física del sticker
        initScrollAnimations();
        initTextAnimations();
        initCanvasBackgrounds();
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
                if (!link.classList.contains('main-cta-trigger') && document.body.classList.contains('mobile-menu-open')) {
                    toggleMenu(false);
                }
            });
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1023 && document.body.classList.contains('mobile-menu-open')) {
                menuTl.reverse();
            }
        });
    }

    function initContactModal() {
        const ctaTriggers = document.querySelectorAll('.main-cta-trigger');
        const formOverlay = document.querySelector('.form-modal-overlay');
        const closeBtn = document.querySelector('.form-close-btn');
        const form = document.getElementById('contact-form');
        const formStatus = document.getElementById('form-status');

        if (!ctaTriggers.length || !formOverlay || !closeBtn || !form) return;
        
        const openModal = () => {
            document.body.classList.add('form-modal-open');
            formOverlay.classList.add('active');
        };

        const closeModal = () => {
            document.body.classList.remove('form-modal-open');
            formOverlay.classList.remove('active');
        };

        ctaTriggers.forEach(trigger => trigger.addEventListener('click', e => { e.preventDefault(); openModal(); }));
        closeBtn.addEventListener('click', closeModal);
        formOverlay.addEventListener('click', e => { if (e.target === formOverlay) closeModal(); });

        form.addEventListener("submit", async function(event) {
            event.preventDefault();
            const submitButton = form.querySelector('.form-submit-btn');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = 'Enviando...';
            formStatus.textContent = '';
            formStatus.className = '';

            try {
                const response = await fetch(event.target.action, {
                    method: form.method,
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    formStatus.textContent = "¡Gracias! Tu mensaje ha sido enviado.";
                    formStatus.classList.add('success');
                    form.reset();
                    setTimeout(closeModal, 2500);
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                formStatus.textContent = "Oops! Hubo un problema al enviar.";
                formStatus.classList.add('error');
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
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
            const currentPriceText = priceAmountEl.textContent.replace(/\$|\./g, '').split('/')[0];
            const currentPrice = parseInt(currentPriceText) || basePrice;
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
            const answer = item.querySelector('.faq-answer');
            const icon = item.querySelector('.faq-icon');
            if (!question || !answer || !icon) return;

            gsap.set(answer, { maxHeight: 0 });
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
                    gsap.to(answer, { maxHeight: answer.scrollHeight, duration: 0.5, ease: 'power2.inOut' });
                    gsap.to(icon, { rotation: 45, duration: 0.4, ease: 'power2.inOut' });
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
    
    function initCustomCursor() {
        const cursorOutline = document.querySelector('.custom-cursor-outline');
        if (!cursorOutline) return;
        
        document.querySelectorAll('a, button, .faq-question').forEach(el => {
            el.addEventListener('mouseenter', () => cursorOutline.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover'));
        });
    }

    function initCanvasBackgrounds() {
        class Blob {
            constructor(x, y, r, color, canvasWidth, canvasHeight) { this.x = x; this.y = y; this.r = r; this.color = color; this.canvasWidth = canvasWidth; this.canvasHeight = canvasHeight; this.vx = (Math.random() - 0.5) * 0.4; this.vy = (Math.random() - 0.5) * 0.4; }
            update() { this.x += this.vx; this.y += this.vy; if (this.x < this.r * 0.8 || this.x > this.canvasWidth - this.r * 0.8) this.vx *= -1; if (this.y < this.r * 0.8 || this.y > this.canvasHeight - this.r * 0.8) this.vy *= -1; }
            draw(ctx) { ctx.beginPath(); ctx.fillStyle = this.color; ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill(); }
        }
        
        function setupCanvas(canvasSelector, createBlobsFn) {
            const canvas = document.querySelector(canvasSelector);
            if (!canvas) return null;
            const ctx = canvas.getContext('2d');
            let width, height, blobs;
            let animationFrameId;

            function init() {
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                // CORRECCIÓN: Se eliminó la condición 'offsetParent' que impedía la renderización en móviles.
                width = canvas.width = canvas.offsetWidth;
                height = canvas.height = canvas.offsetHeight;
                blobs = createBlobsFn(width, height);
                animate();
            }

            function animate() {
                if (!blobs) return;
                ctx.clearRect(0, 0, width, height);
                ctx.filter = 'blur(80px) saturate(1.2)';
                blobs.forEach(blob => { blob.update(); blob.draw(ctx); });
                animationFrameId = requestAnimationFrame(animate);
            }
            
            init();
            return init;
        }

        const initHero = setupCanvas('.hero-background-canvas', (w, h) => [ new Blob(w * 0.2, h * 0.3, w * 0.15, 'rgba(59, 130, 246, 0.6)', w, h), new Blob(w * 0.8, h * 0.7, w * 0.25, 'rgba(96, 165, 250, 0.6)', w, h), new Blob(w * 0.5, h * 0.5, w * 0.1, 'rgba(37, 99, 235, 0.6)', w, h) ]);
        const initGuarantee = setupCanvas('.guarantee-background-canvas', (w, h) => [ new Blob(w * 0.1, h * 0.5, w * 0.2, 'rgba(59, 130, 246, 0.6)', w, h), new Blob(w * 0.9, h * 0.5, w * 0.3, 'rgba(96, 165, 250, 0.6)', w, h) ]);
        
        window.addEventListener('resize', () => {
            if (typeof initHero === 'function') initHero();
            if (typeof initGuarantee === 'function') initGuarantee();
        });
    }

    function initStickerPhysics() {
        const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;
        const stickerElement = document.querySelector('.sticker');
        if (!stickerElement) return null;

        const engine = Engine.create();
        const world = engine.world;
        engine.gravity.y = 1;

        let ground, ceiling, leftWall, rightWall;
        let ceilingAdded = false;
        const stickerSize = 150;
        const randomX = Math.random() * (window.innerWidth - stickerSize) + (stickerSize / 2);

        const stickerBody = Bodies.rectangle(randomX, -100, stickerSize, stickerSize, { restitution: 0.7, friction: 0.3, frictionAir: 0.01, render: { visible: false } });
        Matter.Body.setVelocity(stickerBody, { x: (Math.random() - 0.5) * 15, y: 0 });
        Matter.Body.setAngularVelocity(stickerBody, (Math.random() - 0.5) * 0.2);
        Composite.add(world, stickerBody);

        function setupWalls() {
            const wallsToRemove = [leftWall, rightWall, ground, ceiling].filter(Boolean);
            if (wallsToRemove.length > 0) Composite.remove(world, wallsToRemove);

            const viewportWidth = window.innerWidth;
            const docHeight = document.documentElement.scrollHeight;
            const currentScroll = lenis ? lenis.scroll : 0;

            leftWall = Bodies.rectangle(-30, docHeight / 2, 60, docHeight, { isStatic: true });
            rightWall = Bodies.rectangle(viewportWidth + 30, docHeight / 2, 60, docHeight, { isStatic: true });
            ground = Bodies.rectangle(viewportWidth / 2, currentScroll + window.innerHeight + 30, viewportWidth, 60, { isStatic: true });
            ceiling = Bodies.rectangle(viewportWidth / 2, currentScroll - 30, viewportWidth, 60, { isStatic: true, isSensor: !ceilingAdded });
            
            Composite.add(world, [ground, ceiling, leftWall, rightWall]);
        }

        const mouse = Mouse.create(document.documentElement);
        const mouseConstraint = MouseConstraint.create(engine, { mouse: mouse, constraint: { stiffness: 0.02, damping: 0.1, render: { visible: false } } });
        Composite.add(world, mouseConstraint);

        const runner = Runner.create();
        Runner.run(runner, engine);

        setupWalls();
        setTimeout(() => {
            if (ceiling) {
                ceiling.isSensor = false;
                ceilingAdded = true;
            }
        }, 2500);
        
        window.addEventListener('resize', setupWalls);
        
        return { stickerBody, stickerElement, stickerSize, ground, ceiling };
    }


    function initScrollAnimations() {
        const nav = document.querySelector('.navbar');
        if (nav) {
            ScrollTrigger.create({ trigger: ".hero-section", start: "bottom top", onEnter: () => nav.classList.add("scrolled"), onLeaveBack: () => nav.classList.remove("scrolled") });
        }
        
        gsap.timeline({ scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: true } })
            .to(".hero-content", { scale: 0.8, opacity: 0, ease: "power1.in" }, 0);

        gsap.utils.toArray(".usp-card").forEach(card => {
            gsap.from(card, { scrollTrigger: { trigger: card, start: "top 85%" }, opacity: 0, scale: 0.95, y: 40, duration: 0.8, ease: "expo.out" });
        });

        const timelineTrack = document.querySelector('.services-timeline-track');
        if (timelineTrack) {
            const timelineScroll = gsap.to(timelineTrack, {
                x: () => -(timelineTrack.scrollWidth - window.innerWidth), ease: "none",
                scrollTrigger: { trigger: ".services-timeline-container", start: "top top", end: "bottom bottom", scrub: true, pin: ".services-timeline-sticky-wrapper", invalidateOnRefresh: true }
            });
            gsap.utils.toArray('.service-timeline-item').forEach(item => {
                ScrollTrigger.create({ trigger: item, containerAnimation: timelineScroll, start: "left 50%", end: "right 50%", onToggle: self => item.classList.toggle("is-active", self.isActive) });
            });
            gsap.to('.timeline-line-progress', { width: '100%', ease: 'none', scrollTrigger: { trigger: ".services-timeline-container", start: "top top", end: "bottom bottom", scrub: true } });
        }

        const marqueeRow = document.querySelector('.reviews-marquee-row');
        if (marqueeRow) {
            const reviews = [ { quote: "Fue más de lo que soñamos...", author: "Laura Romero" }, { quote: "Me encantó el servicio de Simón...", author: "Veronica Huertas" }, { quote: "Muy buen servicio al cliente y conocimiento.", author: "Jose Afanador" }, { quote: "Excelente servicio. Lo dejé todo en sus manos...", author: "Gabriel A." }, { quote: "Muy creativo, paciente buena asesoría...", author: "Michelle Verner" }, { quote: "Simón ofrece un servicio excelente!...", author: "Juan David Orozco" } ];
            reviews.forEach(review => {
                const card = document.createElement('div');
                card.className = 'review-card';
                card.innerHTML = `<p class="review-quote">"${review.quote}"</p><div class="review-author"><img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" class="google-logo"><span>${review.author}</span></div>`;
                marqueeRow.appendChild(card);
            });
            const reviewCards = gsap.utils.toArray('.review-card', marqueeRow);
            reviewCards.forEach(card => marqueeRow.appendChild(card.cloneNode(true)));
            const loop = gsap.to(marqueeRow, { xPercent: -50, ease: 'none', duration: 40, repeat: -1 });
            marqueeRow.addEventListener('mouseenter', () => gsap.to(loop, { timeScale: 0.2, duration: 0.5 }));
            marqueeRow.addEventListener('mouseleave', () => gsap.to(loop, { timeScale: 1, duration: 0.5 }));
        }

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
        gsap.timeline({ defaults: { ease: "power3.out", duration: 1.2 } })
            .fromTo('.navbar', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.2 })
            .from('.title-line span', { y: '110%', stagger: 0.15, duration: 1, ease: "expo.out" }, 0.5)
            .from('.hero-subtitle', { opacity: 0, y: 30 }, 0.9)
            .from('.hero-cta-button', { opacity: 0, y: 30, scale: 0.95 }, 1.1);

        const animatedElements = document.querySelectorAll('.animated-text-hover');
        const buttonTexts = { 'nav-login-button': 'Login', 'nav-cta-button': 'Crear una página web', 'hero-main-cta': 'Impulsa tu negocio', 'pricing-cta': 'Crear mi página web' };
        animatedElements.forEach(element => {
            let text = element.textContent.trim();
            let key = Array.from(element.classList).find(cls => buttonTexts[cls]);
            if (key) text = buttonTexts[key];
            if (text === '') return;
            element.innerHTML = '';
            text.split('').forEach((char, index) => {
                const wrapper = document.createElement('span');
                wrapper.className = 'letter-wrapper';
                wrapper.style.setProperty('--delay', `${index * 25}ms`);
                wrapper.innerHTML = (char === ' ') ? '&nbsp;' : `<span class="letter">${char}</span><span class="letter">${char}</span>`;
                element.appendChild(wrapper);
            });
        });
    }

    function startGlobalTicker(lenis) {
        const { stickerBody, stickerElement, stickerSize, ground, ceiling } = initStickerPhysics();
        const cursorDot = document.querySelector('.custom-cursor-dot');
        const cursorOutline = document.querySelector('.custom-cursor-outline');
        const cursorMoon = document.querySelector('.custom-cursor-moon');
        const moonTrails = gsap.utils.toArray(".custom-cursor-moon-trail");

        let mouseX = 0, mouseY = 0;
        window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

        const dotXTo = gsap.quickTo(cursorDot, "x", { duration: 0.2, ease: "power2" });
        const dotYTo = gsap.quickTo(cursorDot, "y", { duration: 0.2, ease: "power2" });
        const outlineXTo = gsap.quickTo(cursorOutline, "x", { duration: 0.6, ease: "power2" });
        const outlineYTo = gsap.quickTo(cursorOutline, "y", { duration: 0.6, ease: "power2" });
        const trailsXTo = moonTrails.map((trail, i) => gsap.quickTo(trail, "x", { duration: 0.2 + i * 0.08, ease: "power2.out" }));
        const trailsYTo = moonTrails.map((trail, i) => gsap.quickTo(trail, "y", { duration: 0.2 + i * 0.08, ease: "power2.out" }));
        let orbitRadius = 25;
        let currentScroll = 0;

        gsap.ticker.add((time) => {
            if (lenis) {
                lenis.raf(time * 1000);
                currentScroll = lenis.scroll;
            }
            
            if (stickerBody) {
                if (ground) Matter.Body.setPosition(ground, { x: window.innerWidth / 2, y: currentScroll + window.innerHeight + 30 });
                if (ceiling) Matter.Body.setPosition(ceiling, { x: window.innerWidth / 2, y: currentScroll - 30 });

                const pos = stickerBody.position;
                gsap.set(stickerElement, {
                    x: pos.x - (stickerSize / 2),
                    y: pos.y - (stickerSize / 2) - currentScroll,
                    rotation: stickerBody.angle * (180 / Math.PI)
                });
            }

            if (window.innerWidth >= 1024) {
                if(cursorDot) { dotXTo(mouseX); dotYTo(mouseY); }
                if(cursorOutline) { outlineXTo(mouseX); outlineYTo(mouseY); }
                
                if (cursorMoon && moonTrails.length) {
                    const angle = Math.sin(time * 1.5);
                    const moonX = mouseX + Math.cos(time * 1.5) * orbitRadius;
                    const moonY = mouseY + angle * orbitRadius;
                    const scale = 0.7 + (angle + 1) * 0.15;
                    const zIndex = angle < 0 ? 11999 : 12001;
                    gsap.set(cursorMoon, { x: moonX, y: moonY, scale: scale, zIndex: zIndex });

                    let prevX = moonX;
                    let prevY = moonY;

                    trailsXTo.forEach((t, i) => {
                        const currentTrail = moonTrails[i];
                        const currentX = gsap.getProperty(currentTrail, "x");
                        const currentY = gsap.getProperty(currentTrail, "y");
                        t(prevX);
                        trailsYTo[i](prevY);
                        gsap.set(currentTrail, { 
                            opacity: 1 - (i + 1) / (moonTrails.length + 1), 
                            scale: scale * (1 - (i+1)*0.1) 
                        });
                        prevX = currentX;
                        prevY = currentY;
                    });
                }
            }
        });
    }

    // --- EJECUCIÓN DE LA FUNCIÓN PRINCIPAL ---
    main();
});
