import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { photos } from './data';

export default function RathYatraUpdate({ onPhoto }) {
  return (
    <section className="community-section rath-yatra-section" id="rath-yatra" aria-labelledby="rath-yatra-heading">
      <div className="container community-grid">
        <article className="community-copy odia-copy" lang="or" data-reveal>
          <p className="eyebrow" lang="en">Service to our community</p>
          <h2 id="rath-yatra-heading">୨୦୨୬ ରଥଯାତ୍ରା ଅବସରରେ ଜଳ ବଣ୍ଟନ ସେବା</h2>
          <p>୨୦୨୬ ମସିହା ପବିତ୍ର ରଥଯାତ୍ରା ଅବସରରେ <span lang="en">THE FRIENDS CLUB N3</span> ର ସଦସ୍ୟମାନଙ୍କ ପକ୍ଷରୁ ଭୁବନେଶ୍ୱର ନୟାପଲ୍ଲୀ ସ୍ଥିତ ଇସ୍କନ୍ ମନ୍ଦିର ନିକଟରେ ଶ୍ରଦ୍ଧାଳୁ ଓ ଭକ୍ତମାନଙ୍କ ପାଇଁ ପାନୀୟ ଜଳ ବଣ୍ଟନ ସେବା ଆୟୋଜନ କରାଯାଇଥିଲା।</p>
          <p>ଏହି ସେବା କାର୍ଯ୍ୟର ମୁଖ୍ୟ ଉଦ୍ଦେଶ୍ୟ ଥିଲା ରଥଯାତ୍ରାରେ ଯୋଗଦେଇଥିବା ଭକ୍ତମାନଙ୍କୁ ପାନୀୟ ଜଳ ଯୋଗାଇବା ଏବଂ ସମାଜସେବାର ମହତ୍ ଭାବନାକୁ ଆଗକୁ ବଢ଼ାଇବା। ଏହି ପଦକ୍ଷେପ ମାଧ୍ୟମରେ କ୍ଲବ୍‌ର ସଦସ୍ୟମାନେ ସେବା, ସହଯୋଗ, ଭାଇଚାରା ଓ ସାମାଜିକ ଦାୟିତ୍ୱବୋଧର ଉଦାହରଣ ସୃଷ୍ଟି କରିଥିଲେ।</p>
          <p className="community-commitment">ଜୟ ଜଗନ୍ନାଥ! 🙏🚩</p>
          <p className="ganesh-address"><strong lang="en">THE FRIENDS CLUB N3</strong><br />ନୟାପଲ୍ଲୀ, ଭୁବନେଶ୍ୱର, ଓଡ଼ିଶା</p>
        </article>
        <figure className="community-photo rath-yatra-photo" data-reveal>
          <button onClick={onPhoto} aria-label="View the Rath Yatra water-distribution service photograph">
            <img src={photos.rathYatra} alt="The Friends Club N3 volunteers at their Rath Yatra drinking-water service stall" loading="lazy" width="1080" height="1088" />
            <span className="community-expand"><ArrowUpRight size={20} /></span>
          </button>
          <figcaption>THE FRIENDS CLUB N3 · RATH YATRA 2026</figcaption>
        </figure>
      </div>
    </section>
  );
}
