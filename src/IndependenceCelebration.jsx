import React from 'react';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { photos } from './data';

export default function IndependenceCelebration({ onPhoto }) {
  return (
    <section className="community-section independence-section" id="independence-day" aria-labelledby="independence-heading">
      <div className="container community-grid">
        <article className="community-copy" data-reveal>
          <p className="eyebrow">Celebrating our nation</p>
          <h2 id="independence-heading">Independence Day<br />Celebration – 2026</h2>
          <p className="community-location"><CalendarDays size={15} aria-hidden="true" /><time dateTime="2026-08-15">15th August 2026</time></p>
          <p>Organized by THE FRIENDS CLUB N3, Nayapalli, Bhubaneswar, on 15th August 2026 with patriotism, unity, and pride.</p>
          <p className="community-commitment">Jai Hind! Vande Mataram! <span role="img" aria-label="Indian flag">🇮🇳</span></p>
          <span className="community-status">Celebration highlights · Past event</span>
        </article>
        <figure className="community-photo independence-photo" data-reveal>
          <button onClick={onPhoto} aria-label="View the Independence Day celebration photograph">
            <img src={photos.independence} alt="The Friends Club N3 gathered beside the flagpole with tricolour balloons and floral decorations for Independence Day" loading="lazy" width="1080" height="1109" />
            <span className="community-expand"><ArrowUpRight size={20} /></span>
          </button>
          <figcaption>THE FRIENDS CLUB N3 · NAYAPALLI, BHUBANESWAR</figcaption>
        </figure>
      </div>
    </section>
  );
}
