import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.title = "Trak - Carbon Tracker for Sustainable Commuting";

// Add meta description for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Track and reduce your carbon footprint with Trak. Log commutes, join challenges, earn rewards, and make a positive impact on the environment.';
document.head.appendChild(metaDescription);

// Add Open Graph tags for better social sharing
const ogTags = [
  { property: 'og:title', content: 'Trak - Carbon Tracker for Sustainable Commuting' },
  { property: 'og:description', content: 'Track and reduce your carbon footprint with Trak. Log commutes, join challenges, earn rewards, and make a positive impact on the environment.' },
  { property: 'og:type', content: 'website' },
  { property: 'og:url', content: 'https://trak-carbon.app' }
];

ogTags.forEach(tag => {
  const metaTag = document.createElement('meta');
  metaTag.setAttribute('property', tag.property);
  metaTag.content = tag.content;
  document.head.appendChild(metaTag);
});

createRoot(document.getElementById("root")!).render(<App />);
