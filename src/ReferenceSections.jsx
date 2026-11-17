import React, { useEffect, useRef } from 'react';
import { Heart, Sprout, Users, Handshake, CalendarDays, Images, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { photos } from './data';

gsap.registerPlugin(ScrollTrigger);

export function ReferenceStory() {
  const ref = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        // Story image subtle parallax
        gsap.fromTo(
          '.reference-story-photo img',
          { yPercent: -6, scale: 1.08 },
          {
            yPercent: 6,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        );

        // Story photo handwriting caption spring reveal
        gsap.from('.reference-story-photo figcaption', {
          opacity: 0,
          scale: 0.8,
          rotation: 0,
          duration: 0.9,
          ease: 'back.out(1.8)',
          scrollTrigger: {
            trigger: '.reference-story-photo',
            start: 'top 85%',
            once: true,
          },
        });

        // Values list items slide and icon spring pop
        gsap.fromTo('.reference-value',
          { x: 28, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.reference-values',
              start: 'top 85%',
              once: true,
            },
          }
        );

        gsap.fromTo('.reference-value > span',
          { scale: 0, rotation: -30 },
          {
            scale: 1,
            rotation: 0,
            duration: 0.65,
            stagger: 0.12,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: '.reference-values',
              start: 'top 85%',
              once: true,
            },
          }
        );
      }, ref);
      return () => context.revert();
    });
    return () => mm.revert();
  }, []);

  return (
    <section className="reference-story" id="about" ref={ref}>
      <div className="container reference-story-grid">
        <div data-reveal>
          <p className="eyebrow">About us</p>
          <h2>Our Story</h2>
          <p className="story-description">
            The Friends Club N3 was established in 2006 with a simple idea — to bring people together, build lasting
            friendships, and create meaningful experiences through service, culture, and community.
          </p>
          <a className="button" href="#work">
            Learn More <ArrowRight size={14} />
          </a>
        </div>
        <figure className="reference-story-photo">
          <img src={photos.rathYatra} alt="The Friends Club N3 members serving together" loading="lazy" />
          <figcaption>
            Same People.
            <br />
            Better Stories.
          </figcaption>
        </figure>
        <div className="reference-values">
          <h3>Our Values</h3>
          {[
            [Heart, 'Friendship', 'Real connections, always.'],
            [Sprout, 'Growth', 'Better people, better tomorrow.'],
            [Users, 'Community', 'Support, share, inspire.'],
            [Handshake, 'Togetherness', 'Because life is better together.'],
          ].map(([Icon, title, copy]) => (
            <div className="reference-value" key={title}>
              <span>
                <Icon size={21} strokeWidth={1} />
              </span>
              <div>
                <h4>{title}</h4>
                <p>{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ReferenceHighlights() {
  const ref = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.fromTo('.highlight-item',
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 88%',
              once: true,
              onEnter: () => {
                const counterEls = ref.current?.querySelectorAll('[data-counter]');
                counterEls?.forEach((el) => {
                  const target = parseInt(el.getAttribute('data-counter'), 10);
                  if (isNaN(target)) return;
                  const startVal = target === 2006 ? 1990 : 0;
                  const counterObj = { val: startVal };
                  gsap.to(counterObj, {
                    val: target,
                    duration: target === 2006 ? 1.6 : 1.2,
                    ease: 'power2.out',
                    onUpdate: () => {
                      el.textContent = Math.round(counterObj.val).toString();
                    },
                  });
                });
              }
            }
          }
        );

        gsap.fromTo('.highlight-item svg',
          { scale: 0.4, opacity: 0, rotation: -15 },
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 88%',
              once: true,
            }
          }
        );
      }, ref);
      return () => context.revert();
    });
    return () => mm.revert();
  }, []);

  const stats = [
    [CalendarDays, '2006', 'Established', 2006],
    [Images, '5', 'Community stories', 5],
    [Users, 'N3', 'Nayapalli', null],
    [Handshake, '1', 'Community', 1],
  ];

  return (
    <section className="reference-highlights" aria-label="Our club at a glance" ref={ref}>
      <div className="container">
        {stats.map(([Icon, value, label, numericTarget]) => (
          <div key={label} className="highlight-item">
            <Icon size={32} strokeWidth={1.2} />
            <span>
              <strong data-counter={numericTarget !== null ? numericTarget : undefined}>{value}</strong>
              <small>{label}</small>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
