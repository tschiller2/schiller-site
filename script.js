const sections = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

sections.forEach((section) => observer.observe(section));

const yearNode = document.getElementById('year');
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

function trackCtaClick(label, href) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'cta_click', {
      event_category: 'engagement',
      event_label: label,
      destination: href
    });
    return;
  }

  if (typeof window.plausible === 'function') {
    window.plausible('cta_click', { props: { label, destination: href } });
    return;
  }

  console.info('[track] cta_click', { label, destination: href });
}

const trackedLinks = document.querySelectorAll('[data-track="cta"]');
trackedLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const label = link.getAttribute('data-track-label') || link.textContent.trim();
    const href = link.getAttribute('href') || '';
    trackCtaClick(label, href);
  });
});
