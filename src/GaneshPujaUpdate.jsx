import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { photos } from './data';

export default function GaneshPujaUpdate({ onPhoto }) {
  return (
    <section className="community-section ganesh-section" id="ganesh-puja" aria-labelledby="ganesh-heading">
      <div className="container community-grid">
        <figure className="community-photo ganesh-photo" data-reveal>
          <button onClick={onPhoto} aria-label="View the Ganesh Puja invitation photograph">
            <img src={photos.ganesh} alt="The Friends Club N3 members presenting flowers during the Ganesh Puja invitation visit" loading="lazy" width="1080" height="905" />
            <span className="community-expand"><ArrowUpRight size={20} /></span>
          </button>
          <figcaption>THE FRIENDS CLUB N3 · GANESH PUJA 2026</figcaption>
        </figure>
        <article className="community-copy odia-copy" lang="or" data-reveal>
          <p className="eyebrow" lang="en">Culture & Community</p>
          <h2 id="ganesh-heading">୨୦୨୬ ଗଣେଶ ପୂଜା ଓ ସାଂସ୍କୃତିକ କାର୍ଯ୍ୟକ୍ରମକୁ ନିମନ୍ତ୍ରଣ</h2>
          <p>୨୦୨୬ ମସିହାରେ <span lang="en">THE FRIENDS CLUB N3</span> ପକ୍ଷରୁ ଆୟୋଜିତ ଶ୍ରୀ ଶ୍ରୀ ଗଣେଶ ପୂଜା ଓ ସାଂସ୍କୃତିକ କାର୍ଯ୍ୟକ୍ରମ ଅବସରରେ ୨୫ ନମ୍ବର ୱାର୍ଡର ମାନ୍ୟବର କର୍ପୋରେଟର ଶ୍ରୀମତୀ ମନସୀରାଣୀ ସୁନ୍ଦରାୟଙ୍କୁ ସାଦର ନିମନ୍ତ୍ରଣ କରାଯାଇଥିଲା।</p>
          <p>ଏହି ଅବସରରେ ତାଙ୍କ ସହ ଭାବ ବିନିମୟ ଓ ସୌହାର୍ଦ୍ଦ୍ୟପୂର୍ଣ୍ଣ ସାକ୍ଷାତ୍ କ୍ଲବ୍‌ର ସାମାଜିକ ଏକତା, ସଂସ୍କୃତି ଓ ପାରମ୍ପରିକ ଉତ୍ସବ ପ୍ରତି ଥିବା ପ୍ରତିବଦ୍ଧତାକୁ ପ୍ରତିଫଳିତ କରେ।</p>
          <p className="ganesh-address"><strong lang="en">THE FRIENDS CLUB N3</strong><br />ନୟାପଲ୍ଲୀ, ବେହେରା ବସ୍ତି/ସାହି, ଆଇଆରସି ଭିଲେଜ୍, ଭୁବନେଶ୍ୱର</p>
          <p className="community-commitment">🙏 ଜୟ ଶ୍ରୀ ଗଣେଶ! 🙏</p>
        </article>
      </div>
    </section>
  );
}
