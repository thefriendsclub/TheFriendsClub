import React, { useEffect, useRef } from 'react';
import Carousel from './Carousel';
import { ArrowUpRight, ArrowRight, UserRound, Play, HeartHandshake } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { photos, founders } from './data';

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

export function PremiumTeam(){
  const ref = useRef(null);
  useEffect(()=>{
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', ()=>{
      const context = gsap.context(()=>{
        gsap.fromTo('.team-card',
          { y: 35, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
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

  return (
    <section className="premium-team" id="founders" ref={ref}>
      <div className="container">
        <div className="editorial-heading" data-reveal>
          <div>
            <p className="eyebrow">Our founders</p>
            <h2>The Visionaries<br/>Behind The Friends Club</h2>
          </div>
          <p className="section-description">
            A shared belief in friendship, service, and community.
          </p>
        </div>
        <Carousel label="club founders" className="team-carousel">
          {founders.map((founder, i) => (
            <article className="team-card" key={founder.id || i}>
              <div className="team-portrait">
                {founder.image ? (
                  <img src={founder.image} alt={founder.name} loading="lazy" />
                ) : (
                  <PortraitPlaceholder />
                )}
              </div>
              <h3>{founder.name}</h3>
              <p>{founder.role || 'Co-founder'}</p>
            </article>
          ))}
        </Carousel>
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

