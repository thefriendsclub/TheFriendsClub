import React from 'react';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { photos } from './data';

export default function CommunityUpdate({ onPhoto }) {
  return (
    <section className="community-section" id="community" aria-labelledby="community-heading">
      <div className="container community-grid">
        <figure className="community-photo" data-reveal>
          <button onClick={onPhoto} aria-label="View the community meeting photograph">
            <img src={photos.community} alt="The Friends Club N3 members gathered for the community welfare discussion" loading="lazy" width="1080" height="882" />
            <span className="community-expand"><ArrowUpRight size={20} /></span>
          </button>
          <figcaption>THE FRIENDS CLUB N3, IRC VILLAGE, NAYAPALLI</figcaption>
        </figure>
        <article className="community-copy" data-reveal>
          <p className="eyebrow">Community in action</p>
          <h2 id="community-heading">Together for a<br />Better Community</h2>
          <p className="community-location"><MapPin size={15} aria-hidden="true" /> N3, IRC Village, Nayapalli · Bhubaneswar</p>
          <p>A constructive discussion was held with the Hon’ble Mayor of Bhubaneswar regarding local slum development and community welfare. The members of THE FRIENDS CLUB N3 also discussed plans to organise a Dengue Awareness Camp to promote public health, cleanliness, and preventive measures among local residents.</p>
          <p className="community-commitment">Our commitment is to work together for a cleaner, healthier, and better community. <span aria-label="Together for a greener community">🤝🌿</span></p>
          <span className="community-status">Dengue Awareness Camp · In planning</span>
        </article>
      </div>
    </section>
  );
}
