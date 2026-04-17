/* ============================================
   GOLDEN BLADE — animations.js
   Scroll Storytelling Edition
   GSAP + ScrollTrigger
   ============================================ */

(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (reducedMotion) return;

  const init = () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      return setTimeout(init, 50);
    }

    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add('gsap-ready');

    // Easings de firma
    const E_OUT = 'power3.out';
    const E_EXPO = 'expo.out';
    const E_SMOOTH = 'power2.out';
    const E_INOUT = 'power3.inOut';
    const FAST = (value) => Number((value * 0.78).toFixed(3));

    gsap.defaults({ ease: E_OUT, duration: FAST(0.9) });


    /* ═══════════════════════════════════════════
       HELPERS
    ═══════════════════════════════════════════ */

    // Split text por caracteres (preserva <em> y <br>)
    const splitByChars = (el) => {
      if (!el || el.dataset.split === 'chars') {
        return Array.from(el.querySelectorAll('.split-char'));
      }
      const nodes = Array.from(el.childNodes);
      el.innerHTML = '';
      const chars = [];

      const processNode = (node, parent) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const tokens = node.textContent.split(/(\s+)/);
          tokens.forEach(token => {
            if (!token) return;
            if (/^\s+$/.test(token)) {
              parent.appendChild(document.createTextNode(token));
            } else {
              const word = document.createElement('span');
              word.className = 'split-word';
              for (const ch of token) {
                const span = document.createElement('span');
                span.className = 'split-char';
                span.textContent = ch;
                word.appendChild(span);
                chars.push(span);
              }
              parent.appendChild(word);
            }
          });
        } else if (node.nodeName === 'BR') {
          parent.appendChild(document.createElement('br'));
        } else {
          // Clonamos el elemento (ej: <em>) y recorremos sus hijos
          const clone = document.createElement(node.nodeName);
          if (node.className) clone.className = node.className;
          parent.appendChild(clone);
          Array.from(node.childNodes).forEach(child => processNode(child, clone));
        }
      };

      nodes.forEach(n => processNode(n, el));
      el.dataset.split = 'chars';
      return chars;
    };

    // Split text por palabras con wrapper (para efecto cortina)
    const splitByWords = (el) => {
      if (!el || el.dataset.split === 'words') {
        return Array.from(el.querySelectorAll('.split-word-inner'));
      }
      const html = el.innerHTML;
      const processed = html.replace(
        /([^\s<>]+)/g,
        '<span class="split-line"><span class="split-word-inner">$1</span></span>'
      );
      el.innerHTML = processed;
      el.dataset.split = 'words';
      return Array.from(el.querySelectorAll('.split-word-inner'));
    };


    /* ═══════════════════════════════════════════
       ESCENA 1 — HERO
       Cinematic opening: línea dorada se traza,
       texto aparece letra por letra, partículas
       flotan perpetuamente.
    ═══════════════════════════════════════════ */

    // ── Partículas del hero ──
    const heroParticlesContainer = document.querySelector('.hero-particles');
    if (heroParticlesContainer && !isMobile) {
      const particleCount = 18;
      const particles = [];

      for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('span');
        p.className = 'hero-particle';
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        heroParticlesContainer.appendChild(p);
        particles.push(p);
      }

      // Cada partícula flota independientemente — movimiento orgánico perpetuo
      particles.forEach((p, i) => {
        gsap.to(p, {
          opacity: gsap.utils.random(0.2, 0.7),
          duration: gsap.utils.random(1.2, 2.2),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: gsap.utils.random(0, 1.2),
        });
        gsap.to(p, {
          y: gsap.utils.random(-60, 60),
          x: gsap.utils.random(-30, 30),
          duration: gsap.utils.random(4.2, 8.5),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: gsap.utils.random(0, 1.8),
        });
      });
    }

    // ── Línea SVG que se traza ──
    const heroLine = document.querySelector('.hero-line-path');
    if (heroLine) {
      gsap.to(heroLine, {
        strokeDashoffset: 0,
        duration: FAST(2.5),
        ease: E_INOUT,
        delay: FAST(0.3),
      });
    }

    // ── Split text del H1 por caracteres ──
    const heroH1 = document.querySelector('.hero h1');
    const heroChars = splitByChars(heroH1);

    // ── Estado inicial controlado por GSAP ──
    gsap.set('.hero-eyebrow, .hero-sub, .hero-btns, .hero-trust, .hero-pills, .hero-scroll-indicator', {
      opacity: 0,
      y: 20,
    });
    gsap.set(heroChars, { yPercent: 140, opacity: 0, rotate: 8 });

    // ── Timeline principal del hero ──
    const heroTL = gsap.timeline({ delay: FAST(0.4) });

    heroTL
      // Eyebrow primero
      .to('.hero-eyebrow', {
        opacity: 1,
        y: 0,
        duration: FAST(0.8),
      })
      // H1 — letra por letra, con rotación sutil
      .to(heroChars, {
        yPercent: 0,
        opacity: 1,
        rotate: 0,
        duration: FAST(1.1),
        stagger: FAST(0.018),
        ease: E_EXPO,
      }, '-=0.5')
      // Subrayado dorado del <em>
      .to('.hero h1 em::after', { duration: FAST(0.01) }) // placeholder
      .fromTo('.hero h1 em', {
        '--_u': 0,
      }, {
        duration: FAST(0.8),
        ease: E_INOUT,
        onUpdate: function() {
          // Animamos el ::after via custom prop trick: usamos scale directo
        },
      }, '-=0.1')
      // Subtitle
      .to('.hero-sub', {
        opacity: 1,
        y: 0,
        duration: FAST(0.9),
      }, '-=0.7')
      // Botones con stagger
      .to('.hero-btns', { opacity: 1, duration: FAST(0.1) })
      .from('.hero-btns > *', {
        opacity: 0,
        y: 20,
        duration: FAST(0.7),
        stagger: FAST(0.1),
        ease: E_OUT,
      }, '<')
      // Trust line
      .to('.hero-trust', {
        opacity: 1,
        y: 0,
        duration: FAST(0.6),
      }, '-=0.4')
      // Pills — entran desde la derecha
      .to('.hero-pills', { opacity: 1, duration: FAST(0.1) })
      .from('.hero-pills .pill', {
        opacity: 0,
        x: 30,
        duration: FAST(0.6),
        stagger: FAST(0.08),
        ease: E_OUT,
      }, '<')
      // Scroll indicator
      .to('.hero-scroll-indicator', {
        opacity: 1,
        y: 0,
        duration: FAST(0.6),
      }, '-=0.3');

    // ── Subrayado del <em> (hecho aparte con selector directo) ──
    const heroEmLine = document.querySelector('.hero h1 em');
    if (heroEmLine) {
      // El ::after lo animamos con una clase que activa el scale
      gsap.to({}, {
        duration: FAST(1.2),
        delay: FAST(1.8),
        onComplete: () => {
          const styleEl = document.createElement('style');
          styleEl.textContent = `
            .hero h1 em::after {
              transform: scaleX(1) !important;
              transition: transform ${FAST(1)}s cubic-bezier(.7,0,.3,1);
            }
          `;
          document.head.appendChild(styleEl);
        },
      });
    }

    // ── Floating infinito del H1 (respiración sutil) ──
    heroTL.to(heroH1, {
      y: -8,
      duration: FAST(4),
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    }, '>');

    // ── Parallax del hero al scrollear (velocidades diferentes = profundidad real) ──
    gsap.to('.hero-content', {
      yPercent: 18,
      opacity: 0.5,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      },
    });

    gsap.to('.hero-pills', {
      yPercent: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
      },
    });

    gsap.to('.hero-line-svg', {
      yPercent: -25,
      scale: 1.15,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.9,
      },
    });

    gsap.to('.hero-particles', {
      yPercent: -35,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.1,
      },
    });


    /* ═══════════════════════════════════════════
       ESCENA 2 — WHY-US con PINNING
       La sección se "pega" al viewport y los 3 items
       se revelan uno por uno mientras scrolleás.
       Scroll storytelling real.
    ═══════════════════════════════════════════ */

    const whySection = document.querySelector('.why-us');
    const whyItems = gsap.utils.toArray('.why-item');
    const whyDividers = gsap.utils.toArray('.why-divider');

    if (whySection && whyItems.length && !isMobile) {
      // Estado inicial: items invisibles, divisores sin escala
      gsap.set(whyItems, { opacity: 0, y: 60, scale: 0.95 });
      gsap.set(whyDividers, { scaleY: 0, transformOrigin: 'top center' });
      gsap.set('.why-num', { opacity: 0, scale: 0.3 });

      const whyTL = gsap.timeline({
        scrollTrigger: {
          trigger: whySection,
          start: 'top top',
          end: '+=150%', // mantiene el pin 1.5x la altura del viewport
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      // Secuencia: cada item se revela + su número aparece con pop
      whyItems.forEach((item, i) => {
        const num = item.querySelector('.why-num');
        const position = i * 1.0;

        whyTL.to(item, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: FAST(1),
          ease: E_EXPO,
        }, position);

        whyTL.to(num, {
          opacity: 0.4,
          scale: 1,
          duration: FAST(0.8),
          ease: 'back.out(2)',
        }, position + 0.1);

        // Divisor se dibuja después del item
        if (whyDividers[i]) {
          whyTL.to(whyDividers[i], {
            scaleY: 1,
            duration: FAST(0.6),
            ease: E_INOUT,
          }, position + 0.3);
        }
      });

      // Pequeño "zoom out" al final para desempinar suavemente
      whyTL.to('.why-us-inner', {
        scale: 0.98,
        duration: FAST(0.5),
      }, '>-0.3');
    } else if (whySection) {
      // Mobile: fallback sin pinning, solo reveal escalonado
      gsap.from(whyItems, {
        opacity: 0,
        y: 40,
        duration: FAST(0.9),
        stagger: FAST(0.15),
        ease: E_OUT,
        scrollTrigger: {
          trigger: whySection,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }


    /* ═══════════════════════════════════════════
       ESCENA 3 — SECTION HEADERS
       Palabras suben + línea dorada se dibuja
    ═══════════════════════════════════════════ */
    gsap.utils.toArray('.section-header').forEach(header => {
      const eyebrow = header.querySelector('.section-eyebrow');
      const title = header.querySelector('h2');
      if (!title) return;

      const words = splitByWords(title);

      // Línea dorada
      const line = document.createElement('span');
      line.className = 'gsap-heading-line';
      title.appendChild(line);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      });

      if (eyebrow) {
        tl.from(eyebrow, { opacity: 0, y: 16, duration: FAST(0.7) });
      }

      tl.from(words, {
        yPercent: 110,
        rotate: 4,
        duration: FAST(1.0),
        stagger: FAST(0.05),
        ease: E_EXPO,
      }, '-=0.45');

      tl.to(line, {
        scaleX: 1,
        duration: FAST(0.9),
        ease: E_INOUT,
      }, '-=0.5');
    });


    /* ═══════════════════════════════════════════
       ESCENA 4 — SERVICES
       Cards entran desde bordes opuestos con 3D flip
       + precios con flash + badge con rebote
    ═══════════════════════════════════════════ */
    const serviceCards = gsap.utils.toArray('.service-card');

    serviceCards.forEach((card, i) => {
      // Alternamos: par desde izquierda, impar desde derecha
      const fromX = i % 2 === 0 ? -80 : 80;
      const fromRotY = i % 2 === 0 ? -25 : 25;

      gsap.from(card, {
        x: fromX,
        y: 40,
        rotateY: fromRotY,
        opacity: 0,
        duration: FAST(1.2),
        ease: E_EXPO,
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Precios con flash
    gsap.utils.toArray('.service-price').forEach((price) => {
      gsap.from(price, {
        scale: 0.5,
        opacity: 0,
        duration: FAST(0.8),
        ease: 'back.out(1.8)',
        scrollTrigger: {
          trigger: price,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Badge "El más pedido" con entrada especial
    const badge = document.querySelector('.service-badge');
    if (badge) {
      gsap.from(badge, {
        scale: 0,
        rotation: -15,
        duration: FAST(0.9),
        ease: 'back.out(2.5)',
        scrollTrigger: {
          trigger: badge,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });

      // Badge respira infinitamente una vez visible
      ScrollTrigger.create({
        trigger: badge,
        start: 'top 90%',
        onEnter: () => {
          gsap.to(badge, {
            y: -3,
            duration: FAST(1.8),
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: FAST(1),
          });
        },
        once: true,
      });
    }

    gsap.from('.services-cta', {
      opacity: 0,
      y: 20,
      duration: FAST(0.8),
      scrollTrigger: {
        trigger: '.services-cta',
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });


    /* ═══════════════════════════════════════════
       ESCENA 5 — ABOUT
       Split screen: texto sube + imagen se revela
       con clip-path diagonal + zoom scrub constante
    ═══════════════════════════════════════════ */
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
      const aboutTL = gsap.timeline({
        scrollTrigger: {
          trigger: aboutSection,
          start: 'top 72%',
          toggleActions: 'play none none none',
        },
      });

      aboutTL
        .from('.about-text > *', {
          opacity: 0,
          y: 28,
          duration: FAST(0.9),
          stagger: FAST(0.12),
          ease: E_OUT,
        })
        .fromTo('.about-img', {
          clipPath: 'polygon(0 100%, 0 100%, 0 100%, 0 100%)',
        }, {
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          duration: FAST(1.4),
          ease: E_EXPO,
        }, '-=0.9');

      // Zoom constante mientras scrolleás por la imagen (parallax real)
      gsap.to('.about-img img', {
        scale: 1.15,
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: aboutSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.9,
        },
      });
    }


    /* ═══════════════════════════════════════════
       ESCENA 6 — GALLERY
       Reveal alternado + 3D tilt al hover +
       parallax vertical en las imágenes
    ═══════════════════════════════════════════ */
    const galleryItems = gsap.utils.toArray('.gallery-item');

    galleryItems.forEach((item, i) => {
      // Reveal con clip-path y rotación sutil
      const fromClip = i % 2 === 0
        ? 'inset(100% 0 0 0)'
        : 'inset(0 0 100% 0)';

      gsap.fromTo(item, {
        clipPath: fromClip,
        scale: 0.92,
      }, {
        clipPath: 'inset(0% 0 0% 0)',
        scale: 1,
        duration: FAST(1.3),
        delay: i * FAST(0.1),
        ease: E_EXPO,
        scrollTrigger: {
          trigger: '.gallery-grid',
          start: 'top 78%',
          toggleActions: 'play none none none',
        },
      });

      // 3D tilt al mover el mouse (solo desktop)
      if (!isMobile) {
        const img = item.querySelector('img');
        let rafId;

        item.addEventListener('mousemove', (e) => {
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            const rect = item.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            gsap.to(item, {
              rotateY: x * 8,
              rotateX: -y * 8,
              transformPerspective: 900,
              duration: FAST(0.5),
              ease: 'power2.out',
            });
            gsap.to(img, {
              x: x * 12,
              y: y * 12,
              scale: 1.05,
              duration: FAST(0.6),
              ease: 'power2.out',
            });
          });
        });

        item.addEventListener('mouseleave', () => {
          gsap.to(item, {
            rotateY: 0,
            rotateX: 0,
            duration: FAST(0.8),
            ease: E_EXPO,
          });
          gsap.to(img, {
            x: 0, y: 0, scale: 1,
            duration: FAST(0.8),
            ease: E_EXPO,
          });
        });
      }

      // Parallax vertical sutil en cada imagen
      const img = item.querySelector('img');
      if (img) {
        gsap.fromTo(img, {
          yPercent: -8,
        }, {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.1,
          },
        });
      }
    });


    /* ═══════════════════════════════════════════
       ESCENA 7 — CTA FINAL
       Letra por letra + partículas doradas flotando
       + botón con glow respirante (via CSS)
    ═══════════════════════════════════════════ */
    const ctaSection = document.querySelector('.cta-section');
    const ctaH2 = ctaSection?.querySelector('h2');

    // Partículas doradas
    if (ctaSection && !isMobile) {
      const ctaParticles = document.createElement('div');
      ctaParticles.className = 'cta-particles';
      ctaSection.insertBefore(ctaParticles, ctaSection.firstChild);

      const count = 12;
      const particles = [];
      for (let i = 0; i < count; i++) {
        const p = document.createElement('span');
        p.className = 'cta-particle';
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        ctaParticles.appendChild(p);
        particles.push(p);
      }

      ScrollTrigger.create({
        trigger: ctaSection,
        start: 'top 80%',
        onEnter: () => {
          particles.forEach((p) => {
            gsap.to(p, {
              opacity: gsap.utils.random(0.3, 0.8),
              duration: gsap.utils.random(1.1, 2.1),
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              delay: gsap.utils.random(0, 1.2),
            });
            gsap.to(p, {
              y: gsap.utils.random(-80, 80),
              x: gsap.utils.random(-40, 40),
              duration: gsap.utils.random(3.8, 7.2),
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              delay: gsap.utils.random(0, 1.8),
            });
          });
        },
        once: true,
      });
    }

    if (ctaH2) {
      const ctaChars = splitByChars(ctaH2);
      gsap.set(ctaChars, { yPercent: 140, opacity: 0, rotate: 6 });

      const ctaTL = gsap.timeline({
        scrollTrigger: {
          trigger: ctaSection,
          start: 'top 72%',
          toggleActions: 'play none none none',
        },
      });

      ctaTL
        .from('.cta-eyebrow', { opacity: 0, y: 16, duration: FAST(0.7) })
        .to(ctaChars, {
          yPercent: 0,
          opacity: 1,
          rotate: 0,
          duration: FAST(1.0),
          stagger: FAST(0.022),
          ease: E_EXPO,
        }, '-=0.3')
        .from('.whatsapp-btn', {
          opacity: 0,
          y: 24,
          scale: 0.9,
          duration: FAST(0.9),
          ease: 'back.out(1.6)',
        }, '-=0.4')
        .from('.cta-sub', {
          opacity: 0,
          duration: FAST(0.6),
        }, '-=0.3')
        .from('.cta-info-item', {
          opacity: 0,
          y: 16,
          duration: FAST(0.7),
          stagger: FAST(0.1),
        }, '-=0.2');
    }


    /* ═══════════════════════════════════════════
       MICROINTERACCIONES
    ═══════════════════════════════════════════ */

    // Service cards: lift + el resto de la grid se opaca
    serviceCards.forEach(card => {
      const tl = gsap.to(card, {
        y: -8,
        scale: 1.02,
        duration: FAST(0.45),
        ease: E_SMOOTH,
        paused: true,
      });

      card.addEventListener('mouseenter', () => {
        tl.play();
        // Los hermanos se opacan sutilmente — focus visual
        serviceCards.forEach(c => {
          if (c !== card) {
            gsap.to(c, { opacity: 0.5, duration: FAST(0.4) });
          }
        });
      });

      card.addEventListener('mouseleave', () => {
        tl.reverse();
        serviceCards.forEach(c => {
          gsap.to(c, { opacity: 1, duration: FAST(0.4) });
        });
      });
    });

    // Magnetic buttons (solo desktop)
    if (!isMobile) {
      const magneticBtns = document.querySelectorAll('.btn-primary, .whatsapp-btn');
      magneticBtns.forEach(btn => {
        let rafId;
        btn.addEventListener('mousemove', (e) => {
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
            gsap.to(btn, { x, y, duration: FAST(0.4), ease: 'power2.out' });
          });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { x: 0, y: 0, duration: FAST(0.6), ease: E_EXPO });
        });
      });
    }

    // Nav CTA — scale sutil
    document.querySelectorAll('.nav-cta').forEach(btn => {
      const tl = gsap.to(btn, {
        scale: 1.05,
        duration: FAST(0.25),
        ease: E_SMOOTH,
        paused: true,
      });
      btn.addEventListener('mouseenter', () => tl.play());
      btn.addEventListener('mouseleave', () => tl.reverse());
    });

    // Nav links — underline ya lo hace CSS, agregamos lift del texto
    document.querySelectorAll('.nav-links a').forEach(link => {
      const tl = gsap.to(link, {
        y: -2,
        duration: FAST(0.3),
        ease: E_SMOOTH,
        paused: true,
      });
      link.addEventListener('mouseenter', () => tl.play());
      link.addEventListener('mouseleave', () => tl.reverse());
    });

    // Why-us items: número se ilumina al hover
    whyItems.forEach(item => {
      const num = item.querySelector('.why-num');
      if (!num) return;
      const tl = gsap.to(num, {
        opacity: 0.9,
        scale: 1.1,
        x: 4,
        duration: FAST(0.4),
        ease: E_SMOOTH,
        paused: true,
      });
      item.addEventListener('mouseenter', () => tl.play());
      item.addEventListener('mouseleave', () => tl.reverse());
    });

    // WhatsApp flotante — entrada rotando después de 2s
   gsap.fromTo('.wa-float', 
  { scale: 0, rotation: -180, opacity: 0 },
  { 
    scale: 1,
    rotation: 0,
    opacity: 1,
    duration: FAST(1),
    delay: FAST(1.2),
    ease: 'back.out(2)',
    clearProps: 'all'
  }
);


    /* ═══════════════════════════════════════════
       NAVBAR — responde al scroll
    ═══════════════════════════════════════════ */
    const nav = document.getElementById('navbar');
    if (nav) {
      nav.style.transition = `background ${FAST(0.3)}s, border-color ${FAST(0.3)}s, height ${FAST(0.3)}s`;
      ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        onUpdate: (self) => {
          if (self.scroll() > 80) {
            nav.style.background = 'rgba(8,8,8,0.98)';
            nav.style.borderBottomColor = 'rgba(201,151,43,0.25)';
            nav.style.height = '52px';
          } else {
            nav.style.background = 'rgba(8,8,8,0.95)';
            nav.style.borderBottomColor = 'rgba(201,151,43,0.13)';
            nav.style.height = '58px';
          }
        },
      });
    }


    /* ═══════════════════════════════════════════
       FOOTER
    ═══════════════════════════════════════════ */
    gsap.from('footer > *', {
      opacity: 0,
      y: 18,
      duration: FAST(0.8),
      stagger: FAST(0.12),
      scrollTrigger: {
        trigger: 'footer',
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });


    /* ═══════════════════════════════════════════
       REFRESH TRIGGERS
    ═══════════════════════════════════════════ */
    window.addEventListener('load', () => ScrollTrigger.refresh());

    // Al cambiar idioma, el texto se reescribe → hay que re-splittear
    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        setTimeout(() => {
          document.querySelectorAll('[data-split]').forEach(el => {
            el.removeAttribute('data-split');
          });
          ScrollTrigger.refresh();
        }, 200);
      });
    }

    // Refresh al cambiar tamaño de ventana
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();

