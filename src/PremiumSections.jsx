import React, { useEffect, useRef } from 'react';
import Carousel from './Carousel';
import {
  ArrowUpRight, ArrowRight, UserRound, Play, HeartHandshake,
  Calendar, Image as ImageIcon, Users, ShieldCheck
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { photos, founders } from './data';
import './founders-banner.css';

gsap.registerPlugin(ScrollTrigger);

export const workItems = [
  {id:'rath-yatra',category:'Community service',title:'Rath Yatra Water Service',image:photos.rathYatra,description:'Serving devotees with drinking water and a spirit of togetherness.'},
  {id:'eye-check-up',category:'Health & wellbeing',title:'Free Eye Check-Up Camp',video:true,description:'Supporting eye health and inspiring young people to serve their community.'},
  {id:'community',category:'Community welfare',title:'A Better Neighbourhood',image:photos.community,description:'Working together for a cleaner, healthier Nayapalli.'},
  {id:'independence-day',category:'Celebrations',title:'Independence Day 2026',image:photos.independence,description:'Celebrating our nation with patriotism, unity, and pride.'},
  {id:'ganesh-puja',category:'Culture & tradition',title:'Ganesh Puja & Culture',image:photos.ganesh,description:'Bringing people together through our shared traditions.'},
];

export function PremiumHero(){return <section className="premium-hero" id="home"><div className="container"><div className="premium-hero-grid"><div className="hero-copy"><p className="eyebrow">Est. 2006 · Nayapalli, Bhubaneswar</p><h1><span>Good people.</span><span>Greater purpose.</span></h1><p className="premium-hero-description">Friendship at heart. Community in action.</p><div className="hero-actions"><a className="button button-gold" href="#work">Explore our work <ArrowUpRight size={18}/></a><a className="button" href="#join">Become a member <ArrowRight size={18}/></a></div></div><aside className="hero-principles" aria-label="Our values">{['Friendship','Service','Community'].map((value,i)=><div key={value}><span>0{i+1}</span>{value}</div>)}</aside></div><div className="hero-baseline"><span>Serving our community since 2006</span><a href="#about">Discover our story <span>↓</span></a></div></div></section>}

export function PremiumAbout(){return <section className="premium-about" id="about"><div className="container editorial-heading" data-reveal><div><p className="eyebrow">About us</p><h2>Built on friendship.<br/>Driven by service.</h2></div><div className="editorial-intro"><p>The Friends Club N3 is a community of friends from Nayapalli, Bhubaneswar, united by friendship and a shared commitment to serve our neighbourhood.</p><p>Established in 2006, we come together through social initiatives, health awareness, cultural celebrations, and community welfare. Because stronger communities begin with people who care.</p><a className="text-button" href="#members">Get to know our community <ArrowRight size={15}/></a></div></div></section>}

export function PremiumWork({onOpen}){
  const ref = useRef(null);
  useEffect(()=>{
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', ()=>{
      const context = gsap.context(()=>{
        gsap.fromTo('.work-card',
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 85%',
              once: true
            }
          }
        );
      }, ref);
      return () => context.revert();
    });
    return () => mm.revert();
  },[]);

  return <section className="premium-work" id="work" ref={ref}><div className="container"><div className="editorial-heading" data-reveal><div><p className="eyebrow">Community & celebrations</p><h2>Great Moments<br/>Shared Together</h2></div><p className="section-description">From serving at Rath Yatra to supporting health initiatives, we turn our values into action.</p></div><Carousel label="community stories" className="work-carousel">{workItems.map(item=><button className="work-card" key={item.id} onClick={()=>onOpen(item.id)}><div className="work-media">{item.video?<div className="video-poster"><HeartHandshake strokeWidth={.8} size={64}/><span>Community care</span><span className="play-badge"><Play size={19} fill="currentColor"/></span></div>:<img src={item.image} alt={item.title} loading="lazy"/>}<span className="work-category">{item.category}</span></div><div className="work-copy"><h3>{item.title}</h3><p>{item.description}</p><span className="work-link">{item.video?'Watch the story':'Read the story'} <ArrowUpRight size={16}/></span></div></button>)}</Carousel></div></section>
}

function PortraitPlaceholder({member=false}){return <div className={member?'member-portrait':'team-portrait'} aria-label="Community representative"><UserRound strokeWidth={.8}/></div>}

export function PremiumTeam() {
  const ref = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        // Smooth luxury entrance animation
        gsap.fromTo('.founders-left',
          { x: -24, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.05,
            ease: 'power3.out',
            scrollTrigger: { trigger: ref.current, start: 'top 84%', once: true }
          }
        );

        gsap.fromTo('.founders-center',
          { scale: 0.94, opacity: 0, y: 18 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1.15,
            delay: 0.12,
            ease: 'power3.out',
            scrollTrigger: { trigger: ref.current, start: 'top 84%', once: true }
          }
        );

        gsap.fromTo('.founders-right',
          { x: 24, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.05,
            delay: 0.22,
            ease: 'power3.out',
            scrollTrigger: { trigger: ref.current, start: 'top 84%', once: true }
          }
        );

        // Counter animations for bottom stats
        const counterEls = ref.current?.querySelectorAll('[data-counter]');
        counterEls?.forEach((el) => {
          const target = parseInt(el.getAttribute('data-counter'), 10);
          if (isNaN(target)) return;
          const startVal = target === 2006 ? 1990 : 0;
          const counterObj = { val: startVal };
          gsap.to(counterObj, {
            val: target,
            duration: target === 2006 ? 1.7 : 1.3,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.founders-stats-bar', start: 'top 94%', once: true },
            onUpdate: () => {
              el.textContent = Math.round(counterObj.val).toString();
            },
          });
        });
      }, ref);
      return () => context.revert();
    });
    return () => mm.revert();
  }, []);

  return (
    <section className="founders-section" id="founders" ref={ref} aria-label="Our founders and club at a glance">
      <div className="founders-banner">
        <div className="founders-wave-overlay" aria-hidden="true" />
        <svg className="founders-wave-svg" viewBox="0 0 1440 400" fill="none" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 1040 0 C 1180 120, 1300 240, 1500 270 L 1500 0 Z" fill="#041611" opacity="0.55" />
          <path d="M 1150 0 C 1240 160, 1360 260, 1500 300 L 1500 0 Z" fill="#020e0a" opacity="0.4" />
          <path d="M 980 0 C 1120 150, 1260 250, 1480 290" stroke="rgba(216, 175, 101, 0.14)" strokeWidth="1.2" />
          <path d="M 1080 0 C 1200 140, 1320 220, 1490 250" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
          <path d="M -50 400 C 120 320, 260 350, 390 400 Z" fill="#03140f" opacity="0.65" />
          <path d="M -20 290 C 90 260, 200 340, 310 400 L -50 400 Z" fill="#020f0b" opacity="0.45" />
        </svg>
        <div className="founders-grid">
          {/* Left Column: Heading & Description */}
          <div className="founders-left">
            <div className="founders-eyebrow-wrap">
              <span className="founders-eyebrow">OUR FOUNDERS</span>
              <span className="founders-gold-line" aria-hidden="true" />
            </div>
            <h2 className="founders-title">
              The Visionaries<br />
              Behind <span className="gold-text">The Friends Club</span>
            </h2>
            <p className="founders-subtext">
              A shared belief in friendship, service, and community.
            </p>
          </div>

          {/* Center Column: Portrait with curved organic backdrop */}
          <div className="founders-center">
            <div className="founders-portrait-wrapper">
              <div className="founders-portrait-backdrop" aria-hidden="true" />
              <img
                src="/images/co-founder.webp"
                alt="Co-founder of The Friends Club"
                className="founders-portrait-img"
                loading="lazy"
                width="245"
                height="295"
              />
            </div>
          </div>

          {/* Right Column: Co-founder Title */}
          <div className="founders-right">
            <span className="founders-right-line" aria-hidden="true" />
            <h3 className="founders-role-title">Co-founder</h3>
            <p className="founders-club-label">The Friends Club</p>
          </div>
        </div>
      </div>

      {/* Bottom Stats Strip */}
      <div className="founders-stats-bar">
        <div className="founders-stats-grid">
          <div className="founders-stat-item">
            <div className="stat-icon-wrap" aria-hidden="true">
              <Calendar size={28} strokeWidth={1.4} />
            </div>
            <div className="stat-text-wrap">
              <strong className="stat-value" data-counter="2006">2006</strong>
              <span className="stat-label">Established</span>
            </div>
          </div>

          <div className="stat-divider" aria-hidden="true" />

          <div className="founders-stat-item">
            <div className="stat-icon-wrap" aria-hidden="true">
              <ImageIcon size={28} strokeWidth={1.4} />
            </div>
            <div className="stat-text-wrap">
              <strong className="stat-value" data-counter="5">5</strong>
              <span className="stat-label">Community Stories</span>
            </div>
          </div>

          <div className="stat-divider" aria-hidden="true" />

          <div className="founders-stat-item">
            <div className="stat-icon-wrap" aria-hidden="true">
              <Users size={28} strokeWidth={1.4} />
            </div>
            <div className="stat-text-wrap">
              <strong className="stat-value">N+</strong>
              <span className="stat-label">Members</span>
            </div>
          </div>

          <div className="stat-divider" aria-hidden="true" />

          <div className="founders-stat-item">
            <div className="stat-icon-wrap" aria-hidden="true">
              <ShieldCheck size={28} strokeWidth={1.4} />
            </div>
            <div className="stat-text-wrap">
              <strong className="stat-value" data-counter="1">1</strong>
              <span className="stat-label">Community</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const memberPillars = [
  { role: 'Community Volunteers', label: 'Local Action & Service' },
  { role: 'Youth Coordinators', label: 'Sports & Skill Building' },
  { role: 'Health & Welfare', label: 'Camps & Assistance' },
  { role: 'Cultural Heritage', label: 'Festivals & Togetherness' }
];

export function PremiumMembers({onOpen}){return <section className="premium-members" id="members"><div className="container"><div className="editorial-heading" data-reveal><div><p className="eyebrow">Our members</p><h2>A community<br/>that shows up.</h2></div><p className="section-description">Our members are the strength of The Friends Club N3.<br/>Different backgrounds, one shared purpose — service.</p></div><div className="members-layout"><div className="members-list" data-reveal>{memberPillars.map((pillar,i)=><div className="member-card" key={i}><PortraitPlaceholder member/><h3>{pillar.role}</h3><p>{pillar.label}</p></div>)}</div><button className="members-group" onClick={onOpen} aria-label="View our club members at Rath Yatra" data-reveal><img src={photos.rathYatra} alt="The Friends Club N3 members volunteering at Rath Yatra" loading="lazy"/><span>Friends in service <ArrowUpRight size={18}/></span></button></div><a className="text-button members-join" href="#join">Become part of our community <ArrowRight size={16}/></a></div></section>}

