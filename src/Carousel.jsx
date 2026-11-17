import React, { useEffect, useRef, useState, useId } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function Carousel({children, label, className=''}) {
  const track=useRef(null), id=useId();
  const [position,setPosition]=useState({start:true,end:false,overflow:false});
  useEffect(()=>{
    const el=track.current;
    const update=()=>setPosition({start:el.scrollLeft<4,end:el.scrollLeft+el.clientWidth>=el.scrollWidth-4,overflow:el.scrollWidth>el.clientWidth+4});
    const observer=new ResizeObserver(update);observer.observe(el);
    el.addEventListener('scroll',update,{passive:true});update();
    return()=>{observer.disconnect();el.removeEventListener('scroll',update);};
  },[]);
  function move(direction){const el=track.current;const card=el.firstElementChild;el.scrollBy({left:direction*(card.getBoundingClientRect().width+parseFloat(getComputedStyle(el).gap||0)),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  return <div className={`club-carousel ${className}`} role="region" aria-label={label} aria-roledescription="carousel">
    <div ref={track} id={id} className="carousel-track" tabIndex={0} onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}}}>{children}</div>
    {position.overflow&&<div className="carousel-controls"><span>More moments. One community.</span><div><button aria-label={`Previous ${label}`} aria-controls={id} disabled={position.start} onClick={()=>move(-1)}><ArrowLeft size={18}/></button><button aria-label={`Next ${label}`} aria-controls={id} disabled={position.end} onClick={()=>move(1)}><ArrowRight size={18}/></button></div></div>}
  </div>;
}
