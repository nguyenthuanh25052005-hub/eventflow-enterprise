import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Building2,
  Headphones,
  Lightbulb,
  Mail,
  MapPin,
  Menu,
  Phone,
  Quote,
  Search,
  Send,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";

import heroBanner from "../../assets/public/hero-banner.jpg";
import conferenceImage from "../../assets/public/conference-room.jpg";
import festivalImage from "../../assets/public/festival.jpg";
import musicImage from "../../assets/public/musical-event.jpg";
import playgroundImage from "../../assets/public/playground-event.jpg";
import weddingImage from "../../assets/public/wedding.jpg";
import weddingOne from "../../assets/public/wedding-1.jpeg";
import weddingTwo from "../../assets/public/wedding-2.jpg";
import conferenceOne from "../../assets/public/conference-1.jpg";
import conferenceTwo from "../../assets/public/conference-2.jpg";
import conferenceThree from "../../assets/public/conference-3.jpg";
import weddingThree from "../../assets/public/wedding-3.jpg";

const events = [
  { category: "Conference", date: "26 Jun", title: "Vietnam Innovation Summit", location: "Da Nang", time: "08:30 – 17:30", image: conferenceImage },
  { category: "Festival", date: "04 Jul", title: "Summer Food & Culture Festival", location: "Ho Chi Minh City", time: "16:00 – 22:00", image: festivalImage },
  { category: "Music", date: "18 Aug", title: "Coastal Music Playground", location: "Da Nang", time: "18:30 – 23:00", image: musicImage },
];

const gallery = [
  { image: weddingOne, label: "Wedding celebration", title: "A timeless garden ceremony" },
  { image: conferenceOne, label: "Corporate event", title: "Ideas brought to the stage" },
  { image: festivalImage, label: "Festival", title: "A vibrant community night" },
  { image: weddingTwo, label: "Private event", title: "Details made personal" },
];

const projects = [
  { category: "Conference", title: "Future Commerce Forum", location: "Da Nang", image: conferenceOne, size: "650 guests" },
  { category: "Corporate", title: "NovaTech Annual Summit", location: "Ho Chi Minh City", image: conferenceTwo, size: "420 guests" },
  { category: "Conference", title: "Leadership & Innovation Day", location: "Hanoi", image: conferenceThree, size: "800 guests" },
  { category: "Wedding", title: "A Coastal Garden Wedding", location: "Da Nang", image: weddingOne, size: "280 guests" },
  { category: "Festival", title: "Summer Culture Festival", location: "Hoi An", image: festivalImage, size: "2,000 guests" },
  { category: "Wedding", title: "The Modern White Celebration", location: "Hue", image: weddingThree, size: "180 guests" },
];

const testimonials = [
  { quote: "EventFlow made a complex conference feel effortless. Communication was clear, the team anticipated every detail and delivery was excellent.", name: "Minh Anh Nguyen", role: "Marketing Director · NovaTech" },
  { quote: "From the first concept to the final guest departure, we felt completely supported. The experience was polished and deeply personal.", name: "Linh Tran", role: "People & Culture Lead · Horizon Group" },
  { quote: "The team responded quickly, understood our objectives and created an event that our partners are still talking about.", name: "Daniel Pham", role: "Commercial Manager · Vertex Asia" },
];

export default function PublicHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [projectCategory, setProjectCategory] = useState("All");
  const [consultationSent, setConsultationSent] = useState(false);
  const filteredEvents = useMemo(() => events.filter((event) => {
    const matchesCategory = category === "All" || event.category === category;
    const haystack = `${event.title} ${event.location}`.toLowerCase();
    return matchesCategory && haystack.includes(query.trim().toLowerCase());
  }), [category, query]);
  const filteredProjects = projectCategory === "All" ? projects : projects.filter((project) => project.category === projectCategory);

  const closeMenu = () => setMenuOpen(false);
  return <main className="public-site">
    <header className="public-header">
      <a className="public-brand" href="#home" onClick={closeMenu}><span>EF</span><div><strong>EventFlow</strong><small>Events made effortless</small></div></a>
      <nav className={menuOpen ? "open" : ""} aria-label="Primary navigation">
        {[["#home", "Home"], ["#about", "About"], ["#projects", "Projects"], ["#services", "Services"], ["#gallery", "Gallery"], ["#contact", "Contact"]].map(([href, label]) => <a key={href} href={href} onClick={closeMenu}>{label}</a>)}
        <Link className="public-mobile-login" to="/login" onClick={closeMenu}>Customer login</Link>
      </nav>
      <div className="public-header-actions"><Link className="public-text-link" to="/login">Sign in</Link><Link className="public-button small" to="/register">Plan an event <ArrowRight size={16} /></Link></div>
      <button className="public-menu-button" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
    </header>

    <section id="home" className="public-hero" style={{ "--hero-image": `url(${heroBanner})` }}>
      <div className="public-hero-content"><span className="public-kicker light"><i /> Event planning, reimagined</span><h1>Make every moment <em>unforgettable.</em></h1><p>From intimate celebrations to large-scale conferences, EventFlow brings creative ideas, trusted people and flawless execution together.</p><div className="public-hero-actions"><Link className="public-button" to="/register">Start planning <ArrowRight size={17} /></Link><a className="public-outline-button" href="#events">Explore events</a></div><div className="public-trust-row"><span><strong>15+</strong> years of experience</span><span><strong>500+</strong> events delivered</span><span><strong>98%</strong> client satisfaction</span></div></div>
    </section>

    <section className="public-search-shell" aria-label="Find an event"><div className="public-search-tabs">{["All", "Conference", "Festival", "Music"].map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="public-search-row"><Search size={19} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search event name or location" /><a href="#events">View results <ArrowRight size={16} /></a></div></section>

    <section className="public-proof-strip" aria-label="EventFlow achievements"><div><strong>500+</strong><span>Events delivered</span></div><div><strong>150+</strong><span>Trusted partners</span></div><div><strong>15+</strong><span>Years of experience</span></div><div><strong>98%</strong><span>Client satisfaction</span></div></section>

    <section id="about" className="public-section public-about"><div className="public-section-copy"><span className="public-kicker">About EventFlow</span><h2>Your vision. Our expertise. One remarkable event.</h2><p>We combine strategy, design and operational precision to create experiences that feel effortless for you and extraordinary for every guest.</p><a className="public-inline-link" href="#services">Discover our approach <ArrowRight size={16} /></a></div><div className="public-feature-grid">{[[UsersRound, "A team that listens", "Your goals shape every decision we make."], [MapPin, "The right venue", "Spaces selected for atmosphere and flow."], [Lightbulb, "Original concepts", "Creative directions unique to your story."], [Headphones, "Always supported", "Clear communication from brief to wrap-up."]].map(([Icon, title, desc]) => <article key={title}><span><Icon size={21} /></span><h3>{title}</h3><p>{desc}</p></article>)}</div></section>

    <section id="projects" className="public-projects"><div className="public-section"><div className="public-section-heading"><div><span className="public-kicker">Selected work</span><h2>Ideas transformed into experiences</h2></div><p>Explore a sample of corporate, cultural and private events delivered with care.</p></div><div className="public-project-tabs">{["All", "Conference", "Corporate", "Festival", "Wedding"].map((item) => <button key={item} className={projectCategory === item ? "active" : ""} onClick={() => setProjectCategory(item)}>{item}</button>)}</div><div className="public-project-grid">{filteredProjects.map((project) => <article key={project.title}><img src={project.image} alt={project.title} /><div><span>{project.category}</span><h3>{project.title}</h3><p><MapPin size={13} />{project.location}<i /> <UsersRound size={13} />{project.size}</p></div></article>)}</div></div></section>

    <section id="events" className="public-section public-events"><div className="public-section-heading"><div><span className="public-kicker">Upcoming experiences</span><h2>Events worth looking forward to</h2></div><p>Discover what our team is bringing to life next.</p></div><div className="public-event-grid">{filteredEvents.length ? filteredEvents.map((event) => <article key={event.title} className="public-event-card"><img src={event.image} alt="" /><div className="public-event-shade" /><span className="public-event-date">{event.date}</span><div className="public-event-info"><small>{event.category}</small><h3>{event.title}</h3><p><Clock3 size={14} />{event.time}<i /><MapPin size={14} />{event.location}</p><Link to="/register">Plan something similar <ArrowRight size={15} /></Link></div></article>) : <div className="public-no-results">No showcase event matches this search. Try another category or location.</div>}</div></section>

    <section id="services" className="public-services"><div className="public-section public-services-inner"><div className="public-section-heading light"><div><span className="public-kicker light">What we create</span><h2>Events designed around people</h2></div><p>Flexible services, one dedicated team and an uncompromising eye for detail.</p></div><div className="public-service-grid">{[[weddingImage, "Weddings & celebrations", "Personal stories shaped into beautiful shared moments."], [conferenceImage, "Conferences & M.I.C.E", "Focused programs that keep ideas and people moving."], [playgroundImage, "Festivals & activations", "Bold, engaging experiences built for memorable energy."]].map(([image, title, desc], index) => <article key={title}><img src={image} alt="" /><span>0{index + 1}</span><div><h3>{title}</h3><p>{desc}</p><Link to="/register">Get started <ArrowRight size={15} /></Link></div></article>)}</div></div></section>

    <section id="gallery" className="public-section public-gallery"><div className="public-section-heading"><div><span className="public-kicker">Selected moments</span><h2>Made to be remembered</h2></div><p>A glimpse into stories, stages and celebrations brought to life by EventFlow.</p></div><div className="public-gallery-grid">{gallery.map((item, index) => <figure key={item.title} className={index === 1 ? "tall" : ""}><img src={item.image} alt={item.title} /><figcaption><span>{item.label}</span><strong>{item.title}</strong></figcaption></figure>)}</div></section>

    <section className="public-client-section"><div className="public-section"><div className="public-client-heading"><span className="public-kicker">Trusted by growing teams</span><p>Sample client identities for layout preview</p></div><div className="public-client-logos">{["NOVATECH", "HORIZON", "VERTEX", "NORTHSTAR", "FUSION", "ALTITUDE"].map((name) => <span key={name}><Building2 size={17} />{name}</span>)}</div><div className="public-testimonials"><div className="public-testimonial-intro"><Quote size={28} /><span className="public-kicker">Client stories</span><h2>What our clients remember most</h2><p>Great events are measured by how people feel before, during and long after the final moment.</p></div>{testimonials.map((item) => <blockquote key={item.name}><Quote size={21} /><p>“{item.quote}”</p><footer><strong>{item.name}</strong><span>{item.role}</span></footer></blockquote>)}</div></div></section>

    <section id="consultation" className="public-consultation"><div className="public-consultation-copy"><span className="public-kicker light">Quick consultation</span><h2>Tell us about your next event.</h2><p>Share a few details and our planning team will help shape your first steps.</p><div><span><Phone size={17} /><small>Call our team</small><strong>+84 236 388 8999</strong></span><span><Mail size={17} /><small>Email us</small><strong>hello@eventflow.vn</strong></span></div></div><form onSubmit={(e) => { e.preventDefault(); setConsultationSent(true); }}><div className="public-form-grid"><label>Full name<input required placeholder="Your name" /></label><label>Phone number<input required type="tel" placeholder="Your phone" /></label><label>Email address<input required type="email" placeholder="you@company.com" /></label><label>Event type<select defaultValue=""><option value="" disabled>Select event type</option><option>Conference & M.I.C.E</option><option>Corporate event</option><option>Wedding & private party</option><option>Festival & activation</option><option>Team building</option></select></label><label>Expected date<input type="date" /></label><label>Expected guests<input type="number" min="1" placeholder="e.g. 300" /></label><label className="wide">Tell us more<textarea rows="4" placeholder="Venue, goals, budget or any ideas you already have…" /></label></div>{consultationSent && <div className="public-form-success"><CheckCircle2 size={16} /> Thanks! This preview form is ready to connect to your consultation API.</div>}<button className="public-button" type="submit">Request consultation <Send size={15} /></button></form></section>

    <section className="public-cta"><Sparkles size={28} /><span className="public-kicker light">Your event workspace</span><h2>Ready to plan with us?</h2><p>Create an account to submit requests, review quotations and follow every event milestone from one place.</p><Link className="public-button" to="/register">Create your customer account <ArrowRight size={17} /></Link></section>

    <footer id="contact" className="public-footer"><div className="public-footer-brand"><span>EF</span><div><strong>EventFlow</strong><p>Thoughtful planning. Seamless delivery. Remarkable experiences.</p></div></div><div><small>EXPLORE</small><a href="#about">About</a><a href="#events">Events</a><a href="#services">Services</a></div><div><small>CUSTOMER</small><Link to="/register">Create account</Link><Link to="/login">Customer portal</Link></div><div><small>CONTACT</small><a href="mailto:hello@eventflow.vn">hello@eventflow.vn</a><a href="tel:+842363888999">+84 236 388 8999</a><span>Da Nang, Vietnam</span></div><p className="public-copyright">© 2026 EventFlow. All rights reserved.</p></footer>
  </main>;
}
