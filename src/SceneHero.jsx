import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './scene-hero.css';

gsap.registerPlugin(ScrollTrigger);

export default function SceneHero() {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        // Hero entrance timeline
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo('.scene-background', { scale: 1.06, opacity: 0.7 }, { scale: 1, opacity: 1, duration: 2.2, ease: 'power2.out' })
          .fromTo('.scene-desktop-nav > a:not(.scene-logo)', { y: -22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 }, 0.2)
          .fromTo('.scene-logo img', { scale: 0.65, opacity: 0, rotation: -8 }, { scale: 1, opacity: 1, rotation: 0, duration: 1, ease: 'back.out(1.6)' }, 0.25)
          .fromTo('.scene-mobile-bar', { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.2)
          .fromTo('.scene-copy h1', { y: 38, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 0.45)
          .fromTo('.scene-copy > p', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.65)
          .fromTo('.scene-actions', { y: 20, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)' }, 0.8)
          .fromTo('.scene-caption > span', { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.1, ease: 'power2.out' }, 0.95)
          .fromTo('.scene-caption', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8 }, 0.95);

        // Scroll parallax on background and hero text
        gsap.to('.scene-background', {
          yPercent: 18,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });

        gsap.to('.scene-copy', {
          yPercent: -20,
          opacity: 0.2,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top top',
            end: '75% top',
            scrub: true,
          },
        });

        // Fireflies floating animation
        const lights = gsap.utils.toArray('.scene-firefly').map((el, i) =>
          gsap.to(el, {
            y: -25 - (i % 4) * 12,
            x: i % 2 ? 14 : -14,
            opacity: 0.12,
            duration: 3 + (i % 5),
            delay: (i % 6) * 0.25,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          })
        );

        // Pause offscreen
        const observer = new IntersectionObserver(
          ([entry]) => lights.forEach((light) => (entry.isIntersecting ? light.resume() : light.pause())),
          { threshold: 0 }
        );
        if (ref.current) observer.observe(ref.current);

        // Interactive mouse parallax on fireflies & hero depth
        const heroEl = ref.current;
        const setFirefliesX = gsap.quickTo('.scene-fireflies', 'x', { duration: 0.6, ease: 'power2.out' });
        const setFirefliesY = gsap.quickTo('.scene-fireflies', 'y', { duration: 0.6, ease: 'power2.out' });

        const onMouseMove = (e) => {
          if (!heroEl) return;
          const rect = heroEl.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width - 0.5;
          const relY = (e.clientY - rect.top) / rect.height - 0.5;
          setFirefliesX(relX * 28);
          setFirefliesY(relY * 20);
        };

        const onMouseLeave = () => {
          setFirefliesX(0);
          setFirefliesY(0);
        };

        heroEl?.addEventListener('mousemove', onMouseMove);
        heroEl?.addEventListener('mouseleave', onMouseLeave);

        return () => {
          observer.disconnect();
          heroEl?.removeEventListener('mousemove', onMouseMove);
          heroEl?.removeEventListener('mouseleave', onMouseLeave);
        };
      }, ref);
      return () => context.revert();
    });
    return () => mm.revert();
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);

  return (
    <section className="scene-hero" id="home" ref={ref} aria-label="The Friends Club N3 — friendship and community">
      <img
        className="scene-background"
        src="/images/friendship-hero.webp"
        alt="An illustrated group of five young adult male friends in a lantern-lit garden"
        fetchPriority="high"
        width="1536"
        height="1024"
      />
      <div className="scene-shade" aria-hidden="true" />
      <header className="scene-header">
        <nav className="scene-desktop-nav" aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#work">Our Work</a>
          <a className="scene-logo" href="#home" aria-label="The Friends Club N3 home">
            <img src="/images/friends-club-logo.webp" alt="The Friends Club N3" width="84" height="84" />
          </a>
          <a href="#members">Members</a>
          <a href="#join">Join Us</a>
        </nav>
        <div className="scene-mobile-bar">
          <a href="#home" className="scene-logo" aria-label="The Friends Club N3 home">
            <img src="/images/friends-club-logo.webp" alt="The Friends Club N3" width="52" height="52" />
          </a>
          <span>
            THE FRIENDS CLUB N3<small>Est. 2006 · Nayapalli</small>
          </span>
          <button
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            aria-controls="scene-mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav id="scene-mobile-menu" className="scene-mobile-menu" aria-label="Mobile navigation">
            {[
              ['About', '#about'],
              ['Our Work', '#work'],
              ['Our Team', '#founders'],
              ['Members', '#members'],
              ['Gallery', '#gallery'],
              ['Join Us', '#join'],
            ].map(([title, url]) => (
              <a key={url} href={url} onClick={() => setOpen(false)}>
                {title}
                <ArrowUpRight size={15} />
              </a>
            ))}
          </nav>
        )}
      </header>
      <div className="scene-copy hero-copy">
        <h1>
          Where Friendship Grows,
          <br />
          <span>and Community Thrives</span>
        </h1>
        <p>
          Together since 2006. Serving our community,
          <br className="scene-break" /> celebrating our culture, and making a difference.
        </p>
        <div className="scene-actions">
          <a href="#work">Explore Our Work</a>
          <a href="#join">
            Join the Club <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
      <div className="scene-fireflies" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => i).map((i) => (
          <i
            key={i}
            className="scene-firefly"
            style={{
              left: `${3 + ((i * 29) % 94)}%`,
              top: `${16 + ((i * 17) % 77)}%`,
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
            }}
          />
        ))}
      </div>
      <div className="scene-caption">
        <span />The Friends Club N3 <b>·</b> Nayapalli, Bhubaneswar<span />
      </div>
    </section>
  );
}
