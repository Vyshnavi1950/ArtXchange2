/* frontend/myapp/src/pages/Home.jsx */
import "../styles/Home.css";
import { Link } from "react-router-dom";

export default function Home() {
  const creators = [
    { name: "Nandhini Vallabhaneni", skill: "Calligraphy",           image: "/creators/artist1.jpg" },
    { name: "Vyshnavi Yalamati",     skill: "Embroidery",           image: "/creators/artist2.jpg" },
    { name: "Teja Torati",           skill: "Watercolour painting", image: "/creators/artist3.jpg" },
    { name: "Sathvika Nalam",        skill: "Digital Art",          image: "/creators/artist4.jpg" },
    { name: "Rupa Yelisetti",        skill: "Acrylic Painting",     image: "/creators/artist5.jpg" },
  ];

  const skills = [
    { name: "Embroidery",  image: "/skills/embroidery.jpg" },
    { name: "Acrylic",     image: "/skills/acrylic.jpg" },
    { name: "Calligraphy", image: "/skills/calligraphy.jpg" },
    { name: "Digital Art", image: "/skills/digital-art.jpg" },
    { name: "Sketching",   image: "/skills/sketching.jpg" },
    { name: "Watercolor",  image: "/skills/watercolor.jpg" },
    { name: "Resin Art",   image: "/skills/resin.jpg" },
    { name: "Mandala Art", image: "/skills/mandala.jpg" },
  ];

  const faqs = [
    {
      q: "Is ArtXchange free to join?",
      a: "Yes! Signing up, exploring skills, and connecting with other artists are completely free."
    },
    {
      q: "What kinds of art skills can I learn or teach?",
      a: "Anything creative—embroidery, calligraphy, digital illustration, resin art, watercolor, mandala, and more."
    },
    {
      q: "How do matches work?",
      a: "Our matching engine pairs you with artists whose skills offered overlap with the skills you want to learn."
    },
    {
      q: "Do I need special software for video sessions?",
      a: "No. ArtXchange generates a secure video‑room link—just click it in your session schedule."
    },
    {
      q: "Can I sell my artwork on ArtXchange?",
      a: "While ArtXchange focuses on skill swaps, we’re adding a marketplace soon. Stay tuned!"
    }
  ];

  return (
    <div className="home-wrapper">
      {/* Floating bubbles */}
      <div className="bubble-background">
        {[...Array(20)].map((_, i) => <span key={i} className="bubble" />)}
      </div>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-overlay">
          <img src="/logo.png" alt="ArtXchange logo" className="hero-logo" />
          <h1 className="hero-title">Welcome to ArtXchange</h1>
          <p className="hero-subtitle">Where Creativity Meets Collaboration</p>
          <Link to="/explore" className="hero-button">Get Started</Link>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="home-container">
        {/* What is ArtXchange */}
        <section className="info-section">
          <h2 className="calligraphy-heading">What is ArtXchange?</h2>
          <p>
            ArtXchange is a platform where artists from across disciplines come
            together to share, learn, and exchange creative skills.
          </p>
        </section>

        {/* Skills */}
        <section className="skills-section">
          <h2 className="calligraphy-heading">Explore Skills on ArtXchange</h2>
          <div className="skills-grid">
            {skills.map((s) => (
              <div className="skill-card" key={s.name}>
                <img src={s.image} alt={s.name} />
                <p>{s.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured creators */}
        <section className="featured-artists">
          <h2 className="calligraphy-heading">Meet Our Creators</h2>
          <div className="artist-grid">
            {creators.map((c) => (
              <div className="artist-card" key={c.name}>
                <img src={c.image} alt={c.name} />
                <h3>{c.name}</h3>
                <p>{c.skill}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="faq-section">
          <h2 className="calligraphy-heading">FAQ's</h2>
          <div className="faq-list">
            {faqs.map(({ q, a }) => (
              <details key={q} className="faq-item">
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="home-footer">
          <p>📧 contact_artxchange@gmail.com&nbsp;|&nbsp;📞 +91‑9876543210</p>
          <p>© 2025 ArtXchange. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
