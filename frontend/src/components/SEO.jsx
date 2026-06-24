import { useEffect } from 'react';

const defaults = {
  title: 'Resumind - AI Resume Builder',
  description: 'Build professional resumes with AI-powered enhancement, multiple templates, and PDF export.',
  url: 'https://resumind.vercel.app',
  image: '/og-image.png',
};

export default function SEO({ title, description }) {
  useEffect(() => {
    document.title = title || defaults.title;
    setMeta('description', description || defaults.description);
    setMeta('og:title', title || defaults.title);
    setMeta('og:description', description || defaults.description);
    setMeta('og:url', defaults.url);
    setMeta('og:image', defaults.image);
    setMeta('og:type', 'website');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title || defaults.title);
    setMeta('twitter:description', description || defaults.description);
  }, [title, description]);

  return null;
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    if (name.startsWith('og:')) {
      el.setAttribute('property', name);
    } else {
      el.setAttribute('name', name);
    }
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}
