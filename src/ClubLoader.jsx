import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './club-loader.css';

export default function ClubLoader() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem('club_seen_loader');
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!visible) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finish = () => {
      try {
        sessionStorage.setItem('club_seen_loader', '1');
      } catch {}
      setVisible(false);
    };

    const fallback = setTimeout(finish, 1100);
    const context = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: finish });
      if (reduced) {
        tl.to(ref.current, { opacity: 0, duration: 0.1, delay: 0.05 });
        return;
      }
      tl.from('.club-loader-logo', { scale: 0.88, opacity: 0, y: 8, duration: 0.35, ease: 'power2.out' })
        .from('.club-loader-name', { opacity: 0, y: 6, duration: 0.25 }, 0.1)
        .fromTo('.club-loader-progress span', { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power2.inOut' }, 0.15)
        .to(ref.current, { opacity: 0, duration: 0.35, ease: 'power2.inOut' }, 0.55);
    }, ref);

    return () => {
      clearTimeout(fallback);
      context.revert();
    };
  }, [visible]);

  if (!visible) return null;
  return (
    <div ref={ref} className="club-loader" aria-hidden="true">
      <img
        className="club-loader-logo"
        src="/images/friends-club-logo.webp"
        alt=""
        width="110"
        height="110"
        fetchPriority="high"
      />
      <div className="club-loader-name">
        THE FRIENDS CLUB N3<small>Friendship. Service. Community.</small>
      </div>
      <div className="club-loader-progress">
        <span />
      </div>
    </div>
  );
}
