import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUp, ArrowUpRight, Heart, Sprout, Users, Flower2, CalendarDays, Images, Handshake, MapPin, Clock3, Menu, X, Check, ChevronLeft, ChevronRight, Mail, Instagram, Facebook, Youtube } from 'lucide-react';
import { photos, founders, gallery } from './data';
import { api } from './api';
import DeveloperCredit from './DeveloperCredit';
import { PremiumHero, PremiumAbout, PremiumWork, PremiumTeam, PremiumMembers, workItems } from './PremiumSections';
import './styles.css';
import './premium.css';
import SceneHero from './SceneHero';
import ClubLoader from './ClubLoader';
import Carousel from './Carousel';
import './refined.css';
import { ReferenceStory } from './ReferenceSections';
import './reference.css';

const Admin = lazy(() => import('./Admin'));
const CommunityUpdate = lazy(() => import('./CommunityUpdate'));
const IndependenceCelebration = lazy(() => import('./IndependenceCelebration'));
const GaneshPujaUpdate = lazy(() => import('./GaneshPujaUpdate'));
const RathYatraUpdate = lazy(() => import('./RathYatraUpdate'));
const EyeCampUpdate = lazy(() => import('./EyeCampUpdate'));

gsap.registerPlugin(ScrollTrigger);

export function Brand() {
  return (
    <a className="brand" href="/" aria-label="The Friends Club home">
      <img className="club-logo" src="/images/friends-club-logo.webp" alt="The Friends Club emblem" width="48" height="48" />
      <span>
        THE FRIENDS CLUB N3<small>Est. 2006 · Nayapalli, Bhubaneswar</small>
      </span>
    </a>
  );
}

export function Button({ children, href, onClick, light = false, className = '', ...props }) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag href={href} onClick={onClick} className={`button ${light ? 'button-gold' : ''} ${className}`} {...props}>
      {children}
      <ArrowRight size={15} />
    </Tag>
  );
}

export function Modal({ children, onClose, title, wide = false }) {
  const ref = useRef();
  const backdropRef = useRef();

  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (backdropRef.current) {
        gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: 'power2.out' });
      }
      if (ref.current) {
        gsap.fromTo(
          ref.current,
          { opacity: 0, scale: 0.93, y: 18 },
          { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.3)' }
        );
      }
    }

    const key = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const items = ref.current?.querySelectorAll('button,a[href],input,select,textarea,[tabindex="0"]');
        if (!items || !items.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', key);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={`modal ${wide ? 'modal-wide' : ''}`}>
        <button className="close-button" onClick={onClose} aria-label="Close dialog">
          <X />
        </button>
        <Suspense fallback={<div className="modal-content"><p>Loading…</p></div>}>
          {children}
        </Suspense>
      </section>
    </div>
  );
}

function App() {
  const [selectedWork, setSelectedWork] = useState(null);
  useEffect(() => {
    const sync = () => {
      const id = window.location.hash.slice(1);
      if (workItems.some((item) => item.id === id)) setSelectedWork(id);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const root = useRef();
  const topBtnRef = useRef();
  const [menu, setMenu] = useState(false),
    [events, setEvents] = useState([]),
    [eventError, setEventError] = useState(''),
    [selectedEvent, setSelectedEvent] = useState(null),
    [galleryOpen, setGalleryOpen] = useState(false),
    [filter, setFilter] = useState('All'),
    [photo, setPhoto] = useState(null),
    [info, setInfo] = useState(null),
    [submitted, setSubmitted] = useState(false),
    [busy, setBusy] = useState(false),
    [formError, setFormError] = useState(''),
    [newsletter, setNewsletter] = useState(''),
    [newsBusy, setNewsBusy] = useState(false);

  const fetchEvents = () => {
    setEventError('');
    api('/events')
      .then(setEvents)
      .catch(() => setEventError('Events couldn’t load. Please try again.'));
  };

  useEffect(fetchEvents, []);

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === '#events') setInfo('events');
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  // GSAP animations for site elements, scroll progress, back-to-top, and scroll reveals
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        // Page scroll progress line
        gsap.to('.scroll-progress-line', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.15,
          },
        });

        // Back to top floating button reveal
        if (topBtnRef.current) {
          ScrollTrigger.create({
            trigger: root.current,
            start: '400px top',
            end: 'bottom bottom',
            onToggle: (self) => {
              if (self.isActive) {
                gsap.to(topBtnRef.current, { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.35, overwrite: 'auto' });
              } else {
                gsap.to(topBtnRef.current, { opacity: 0, y: 16, pointerEvents: 'none', duration: 0.3, overwrite: 'auto' });
              }
            },
          });
        }

        // Section [data-reveal] elements stagger entrance
        gsap.utils.toArray('[data-reveal]').forEach((el) => {
          gsap.fromTo(el,
            { y: 32, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 92%',
                once: true,
              },
            }
          );
        });

        // Gallery mosaic tiles entrance
        gsap.fromTo('.gallery-carousel .gallery-tile',
          { scale: 0.9, opacity: 0, y: 25 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.gallery-carousel',
              start: 'top 88%',
              once: true,
            },
          }
        );

        // Membership application form fields cascade
        gsap.fromTo('.application-form .form-grid > label, .application-form .submit-button',
          { y: 22, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.06,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.application-form',
              start: 'top 86%',
              once: true,
            },
          }
        );

        // Footer columns cascade
        gsap.fromTo('.footer-grid > div',
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.site-footer',
              start: 'top 92%',
              once: true,
            },
          }
        );
      }, root);
      return () => context.revert();
    });
    return () => mm.revert();
  }, []);

  // Animate events cards when events are loaded
  useEffect(() => {
    if (!events.length) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.events-carousel .event-card',
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.events-carousel',
            start: 'top 88%',
            once: true,
          },
        }
      );
      ScrollTrigger.refresh();
    });
    return () => mm.revert();
  }, [events]);

  async function submitApplication(e) {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api('/applications', { method: 'POST', body: JSON.stringify({ ...data, consent: data.consent === 'on' }) });
      setSubmitted(true);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function subscribe(e) {
    e.preventDefault();
    setNewsBusy(true);
    try {
      await api('/newsletter', { method: 'POST', body: JSON.stringify({ email: new FormData(e.currentTarget).get('email') }) });
      setNewsletter('You’re on the list. Thank you for joining us!');
    } catch (err) {
      setNewsletter(err.message);
    } finally {
      setNewsBusy(false);
    }
  }

  const nav = [
    ['About', '#about'],
    ['Our Work', '#work'],
    ['Our Team', '#founders'],
    ['Members', '#members'],
    ['Gallery', '#gallery'],
  ];

  return (
    <div ref={root} className="premium-site">
      <div className="scroll-progress-line" aria-hidden="true" />
      <ClubLoader />
      <a className="skip-link" href="#about">
        Skip to content
      </a>

      <main>
        <SceneHero />
        <ReferenceStory />

        <PremiumTeam />
        <section className="reference-events" id="upcoming">
          <div className="container">
            <div data-reveal>
              <p className="eyebrow">Upcoming events</p>
              <h2>
                Great Moments
                <br />
                Are Always Ahead
              </h2>
              <p>From casual meetups to special celebrations, our events bring us closer.</p>
              <Button onClick={() => setInfo('events')}>View All Events</Button>
            </div>
            <Carousel label="upcoming events" className="events-carousel">
              {events.map((event) => (
                <EventCard key={event.id} event={event} onClick={() => setSelectedEvent(event)} />
              ))}
            </Carousel>
            {eventError && <p role="alert">{eventError}</p>}
            {!events.length && !eventError && (
              <p className="reference-empty">New gatherings will appear here. Explore our community stories below.</p>
            )}
          </div>
        </section>
        <PremiumWork onOpen={setSelectedWork} />
        <div id="members" className="reference-member-link">
          <a href="#join">
            Friends in service. Become a member <span>→</span>
          </a>
        </div>

        <section className="gallery-section" id="gallery">
          <div className="container gallery-grid">
            <div data-reveal>
              <p className="eyebrow gold">Our gallery</p>
              <h2>Moments That Matter</h2>
              <p>A collection of smiles, stories and special moments from our journey.</p>
              <Button onClick={() => setGalleryOpen(true)}>View Gallery</Button>
            </div>
            <Carousel label="gallery photos" className="gallery-carousel">
              {gallery.slice(0, 4).map((item, i) => (
                <button
                  key={item.title}
                  className={`gallery-tile tile-${i}`}
                  onClick={() => setPhoto(i)}
                  aria-label={`View ${item.title}`}
                >
                  <img src={item.src} alt={item.title} loading="lazy" />
                  <span>
                    <ArrowUpRight size={20} />
                  </span>
                </button>
              ))}
            </Carousel>
          </div>
        </section>
        <section className="join-section" id="join">
          <div className="join-intro">
            <div className="join-copy" data-reveal>
              <p className="eyebrow gold">Join the club</p>
              <h2>
                Be a Part of Something
                <br />
                Special
              </h2>
              <p>Be part of a community that cares, contributes, and creates positive change. We’d love to have you with us.</p>
              <Button onClick={() => setInfo('membership')}>Learn More</Button>
            </div>
          </div>
          <div className="application-wrap" data-reveal>
            {submitted ? (
              <div className="application-success" role="status">
                <span className="success-icon">
                  <Check />
                </span>
                <p className="eyebrow">A new chapter starts here</p>
                <h3>You’re one step closer.</h3>
                <p>Your membership application has been received. Our club team will review your details.</p>
                <button className="text-button" onClick={() => setSubmitted(false)}>
                  Submit another application <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              <form onSubmit={submitApplication} className="application-form">
                <h3>Membership Application</h3>
                <div className="form-grid">
                  <label>
                    Full Name <span>*</span>
                    <input name="name" autoComplete="name" maxLength={100} placeholder="Enter your name" required />
                  </label>
                  <label>
                    Email Address <span>*</span>
                    <input name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" required />
                  </label>
                  <label>
                    Phone Number <span>*</span>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength={30}
                      pattern="[+0-9\s\(\)\-]{7,30}"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </label>
                  <label className="reason-label">
                    Reason for Joining <span>*</span>
                    <textarea name="reason" maxLength={2000} placeholder="Tell us why you want to join…" required />
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" name="consent" required />
                    <span>
                      I agree to the <button type="button" onClick={() => setInfo('terms')}>terms and conditions</button>
                    </span>
                  </label>
                  <button className="submit-button" disabled={busy}>
                    {busy ? 'Submitting…' : 'Submit Application'}
                    <ArrowRight size={14} />
                  </button>
                </div>
                {formError && (
                  <p className="form-error" role="alert">
                    {formError}
                  </p>
                )}
              </form>
            )}
          </div>
        </section>
      </main>
      <footer id="contact" className="site-footer">
        <div className="container footer-grid">
          <div>
            <Brand />
            <p className="footer-motto">
              Good people. Great memories.
              <br />
              A place to belong.
            </p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            {[
              ['Home', '#home'],
              ['About', '#about'],
              ['Community', '#work'],
              ['Events', '#events'],
              ['Gallery', '#gallery'],
            ].map(([a, b]) => (
              <a
                href={b}
                key={a}
                onClick={(e) => {
                  if (b === '#events') {
                    e.preventDefault();
                    setInfo('events');
                  }
                }}
              >
                {a}
              </a>
            ))}
          </div>
          <div className="footer-links">
            <h4>Support</h4>
            <button onClick={() => setInfo('membership')}>Membership</button>
            <button onClick={() => setInfo('faq')}>FAQ</button>
            <button onClick={() => setInfo('contact')}>Contact</button>
            <button onClick={() => setInfo('terms')}>Terms & Privacy</button>
            <a href="/admin">Admin Panel</a>
          </div>
          <div className="footer-news">
            <h4>Stay Connected</h4>
            <p>Little updates. Lovely things ahead.</p>
            <form onSubmit={subscribe}>
              <label className="sr-only" htmlFor="newsletter">
                Your email address
              </label>
              <input id="newsletter" name="email" type="email" required placeholder="Your email address" />
              <button aria-label="Subscribe to newsletter" disabled={newsBusy}>
                <ArrowRight size={17} />
              </button>
            </form>
            {newsletter && <p role="status">{newsletter}</p>}
          </div>
          <div className="footer-signoff">
            <p>
              © {new Date().getFullYear()} The Friends Club.
              <br />
              All rights reserved.
            </p>
            <span>
              Good Friends
              <br />
              Better Tomorrows
            </span>
          </div>
        </div>
        <div className="container footer-bottom">
          <DeveloperCredit />
          <span>
            N3, IRC Village, Nayapalli · Bhubaneswar <span className="tiny-star">✳</span>
          </span>
        </div>
      </footer>

      {/* Floating Back-to-Top Button */}
      <button
        ref={topBtnRef}
        className="back-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <ArrowUp size={18} />
      </button>

      {selectedWork && (
        <Modal wide title={workItems.find((item) => item.id === selectedWork)?.title || 'Our work'} onClose={() => setSelectedWork(null)}>
          <div className="work-detail">
            {selectedWork === 'community' && (
              <CommunityUpdate
                onPhoto={() => {
                  setSelectedWork(null);
                  setPhoto(0);
                }}
              />
            )}
            {selectedWork === 'independence-day' && (
              <IndependenceCelebration
                onPhoto={() => {
                  setSelectedWork(null);
                  setPhoto(gallery.findIndex((item) => item.src === photos.independence));
                }}
              />
            )}
            {selectedWork === 'ganesh-puja' && (
              <GaneshPujaUpdate
                onPhoto={() => {
                  setSelectedWork(null);
                  setPhoto(gallery.findIndex((item) => item.src === photos.ganesh));
                }}
              />
            )}
            {selectedWork === 'rath-yatra' && (
              <RathYatraUpdate
                onPhoto={() => {
                  setSelectedWork(null);
                  setPhoto(gallery.findIndex((item) => item.src === photos.rathYatra));
                }}
              />
            )}
            {selectedWork === 'eye-check-up' && <EyeCampUpdate />}
          </div>
        </Modal>
      )}
      {selectedEvent && (
        <Modal title={selectedEvent.title} onClose={() => setSelectedEvent(null)}>
          <img className="modal-cover" src={selectedEvent.image} alt={selectedEvent.title} />
          <div className="modal-content">
            <p className="eyebrow">Make a memory with us</p>
            <h2>{selectedEvent.title}</h2>
            <p className="detail-line">
              <CalendarDays size={17} />
              {formatDate(selectedEvent.date)}
            </p>
            <p className="detail-line">
              <Clock3 size={17} />
              {selectedEvent.time}
            </p>
            <p className="detail-line">
              <MapPin size={17} />
              {selectedEvent.location}
            </p>
            <p>{selectedEvent.description}</p>
            <Button href="#join" light onClick={() => setSelectedEvent(null)}>
              Join the Club to Take Part
            </Button>
          </div>
        </Modal>
      )}
      {galleryOpen && (
        <Modal wide title="Our gallery" onClose={() => setGalleryOpen(false)}>
          <div className="modal-content">
            <p className="eyebrow">Our shared story</p>
            <h2>Moments That Matter</h2>
            <div className="filter-tabs">
              {['All', 'Community', 'Celebrations'].map((x) => (
                <button className={filter === x ? 'active' : ''} key={x} onClick={() => setFilter(x)}>
                  {x}
                </button>
              ))}
            </div>
            <div className="gallery-full">
              {gallery
                .filter((x) => filter === 'All' || x.category === filter)
                .map((item) => (
                  <button
                    onClick={() => {
                      setGalleryOpen(false);
                      setPhoto(gallery.indexOf(item));
                    }}
                    key={item.title}
                  >
                    <img src={item.src} alt={item.title} />
                    <span>{item.title}</span>
                  </button>
                ))}
            </div>
          </div>
        </Modal>
      )}
      {photo !== null && (
        <Modal wide title={gallery[photo].title} onClose={() => setPhoto(null)}>
          <img className="lightbox-image" src={gallery[photo].src} alt={gallery[photo].title} />
          <div className="lightbox-bar">
            <button aria-label="Previous image" onClick={() => setPhoto((photo + gallery.length - 1) % gallery.length)}>
              <ChevronLeft />
            </button>
            <div>
              <h3>{gallery[photo].title}</h3>
              <span>
                {photo + 1} / {gallery.length}
              </span>
            </div>
            <button aria-label="Next image" onClick={() => setPhoto((photo + 1) % gallery.length)}>
              <ChevronRight />
            </button>
          </div>
        </Modal>
      )}
      {info && (
        <Modal wide={info === 'events'} title={info} onClose={() => setInfo(null)}>
          <div className="modal-content info-content">
            {info === 'events' ? (
              <>
                <p className="eyebrow">Your next good memory</p>
                <h2>Club Events</h2>
                <div className="all-events">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => {
                        setInfo(null);
                        setSelectedEvent(event);
                      }}
                    />
                  ))}
                </div>
                {eventError ? (
                  <p role="alert">
                    {eventError}
                    <button className="text-button" onClick={fetchEvents}>
                      Try again
                    </button>
                  </p>
                ) : (
                  !events.length && <p>No events available right now. Please check back soon.</p>
                )}
              </>
            ) : (
              <Info type={info} />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
export const formatDate = (date) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
function EventCard({ event, onClick }) {
  const date = new Date(`${event.date}T12:00:00`);
  return (
    <button className="event-card" onClick={onClick}>
      <div className="event-image">
        <img src={event.image} alt={event.title} loading="lazy" />
        <span className="event-date">
          <strong>{date.getDate().toString().padStart(2, '0')}</strong>
          <small>{date.toLocaleDateString('en', { month: 'short' })}</small>
        </span>
      </div>
      <div className="event-content">
        <h3>{event.title}</h3>
        <p>
          <MapPin size={12} />
          {event.location}
        </p>
        <p>
          <Clock3 size={12} />
          {event.time}
        </p>
        <ArrowRight className="event-arrow" size={17} />
      </div>
    </button>
  );
}
function Info({ type }) {
  const content = {
    story: [
      'A friendship became a community.',
      'In 2006, The Friends Club began with a simple belief: life is better when we experience it together. Our community brings people together through service, cultural celebrations, and shared experiences.',
      'From a casual conversation to a weekend adventure, we make room for the things that bring us closer. Everyone brings their own story. Together, we create the next chapter.',
    ],
    founders: [
      'The people behind the purpose.',
      'Our club is built on friendship, service, and community. Co-founder names and portraits will be added once confirmed.',
      'We look forward to sharing the stories of the people behind The Friends Club N3.',
    ],
    membership: [
      'Find your people.',
      'Membership starts with a short application. Tell us a little about yourself and why you would like to join. The club team reviews every application and can contact you using the details you provide.',
      'Members come together for casual meetups, celebrations, and adventures. Participation details and any event costs are shared by the organisers before each event.',
    ],
    faq: [
      'A few things you might be wondering.',
      'How do I join? Complete the membership form. Your application is saved for the team to review. You can contact the club team about your application status.',
      'Do I need to know someone already? No. The club is about making new connections. What kinds of events are there? Meetups, celebrations, and outdoor trips. Look at the event cards for dates and details.',
    ],
    contact: [
      'Let’s make a connection.',
      'The Friends Club N3 is based in IRC Village, Nayapalli, Bhubaneswar, India. To introduce yourself to the organising team, complete the membership application and include your question in the “Reason for Joining” field.',
      'Already applied? Speak with your club organiser for an update. Official contact details will be added here by the club team.',
    ],
    terms: [
      'Membership & privacy',
      'By applying, you agree to treat fellow members with kindness and respect. Membership is subject to review by the club organisers. Event participation is optional; specific arrangements and any costs must be confirmed with the organisers.',
      'We store your name, email address, phone number, and application message to review your membership request. These details are available to authorised club administrators. Newsletter subscriptions store your email address. Contact the club organisers to request correction or deletion.',
    ],
  };
  const [title, ...paragraphs] = content[type] || content.story;
  return (
    <>
      <p className="eyebrow">The Friends Club</p>
      <h2>{title}</h2>
      {paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </>
  );
}
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {window.location.pathname.startsWith('/admin') ? (
      <Suspense
        fallback={
          <div className="admin-loading">
            <img className="club-logo" src="/images/friends-club-logo.webp" alt="The Friends Club emblem" width="48" height="48" />
            <p>Opening the clubhouse…</p>
          </div>
        }
      >
        <Admin />
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>
);


