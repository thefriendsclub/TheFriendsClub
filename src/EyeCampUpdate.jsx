import React from 'react';
import { MapPin } from 'lucide-react';

export default function EyeCampUpdate() {
  return (
    <section className="community-section eye-camp-section" id="eye-check-up" aria-labelledby="eye-camp-heading">
      <div className="container community-grid">
        <figure className="community-photo eye-camp-video" data-reveal>
          <video controls playsInline preload="metadata" aria-label="Free Eye Check-Up Camp — The Friends Club N3" aria-describedby="eye-camp-description">
            <source src="/videos/free-eye-check-up-camp.mp4" type="video/mp4" />
            Your browser does not support embedded video. <a href="/videos/free-eye-check-up-camp.mp4">Open the camp video</a>.
          </video>
          <figcaption>THE FRIENDS CLUB N3 · FREE EYE CHECK-UP CAMP</figcaption>
          <a className="text-button" href="/videos/free-eye-check-up-camp.mp4" target="_blank" rel="noreferrer">Open video in a new tab ↗</a>
        </figure>
        <article className="community-copy" data-reveal>
          <p className="eyebrow">Serving our community</p>
          <h2 id="eye-camp-heading">Free Eye Check-Up Camp – THE FRIENDS CLUB N3</h2>
          <p className="community-location"><MapPin size={15} aria-hidden="true" /> IRC Village, Nayapalli, Bhubaneswar</p>
          <p id="eye-camp-description">THE FRIENDS CLUB N3, IRC Village, Nayapalli, Bhubaneswar, organized a Free Eye Check-Up Camp to support underprivileged people and promote eye health awareness. The initiative also aimed to inspire youth to participate in social service and community welfare activities.</p>
          <p className="community-commitment">THE FRIENDS CLUB N3 – Serving Humanity, Inspiring Youth.</p>
        </article>
      </div>
    </section>
  );
}
