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

function isSchillerOutboundTarget(url) {
  return /https:\/\/(tj-s\.ca|learn\.tj-s\.ca)/i.test(url || '');
}

function buildTrackedUrl(href, label) {
  try {
    const url = new URL(href, window.location.origin);
    if (!isSchillerOutboundTarget(url.href)) {
      return href;
    }

    if (!url.searchParams.get('utm_source')) {
      url.searchParams.set('utm_source', 'schiller.ca');
    }
    if (!url.searchParams.get('utm_medium')) {
      url.searchParams.set('utm_medium', 'referral');
    }
    if (!url.searchParams.get('utm_campaign')) {
      url.searchParams.set('utm_campaign', 'schiller_hub');
    }
    if (!url.searchParams.get('utm_content')) {
      url.searchParams.set('utm_content', label || 'cta');
    }
    return url.toString();
  } catch {
    return href;
  }
}

function trackCtaClick(label, href, destination) {
  const payload = {
    event_category: 'engagement',
    event_label: label,
    destination,
    source_domain: 'schiller.ca',
    link_text: label,
    link_url: destination
  };

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'cta_click', payload);
    window.gtag('event', 'outbound_click', payload);
    return;
  }

  if (typeof window.plausible === 'function') {
    window.plausible('cta_click', { props: payload });
    return;
  }

  console.info('[track] cta_click', payload);
}

const trackedLinks = document.querySelectorAll('[data-track="cta"]');
trackedLinks.forEach((link) => {
  const label = link.getAttribute('data-track-label') || link.textContent.trim();
  const href = link.getAttribute('href') || '';
  const trackedHref = buildTrackedUrl(href, label);

  if (trackedHref !== href) {
    link.setAttribute('href', trackedHref);
  }

  link.addEventListener('click', () => {
    const destination = link.getAttribute('href') || trackedHref || href;
    trackCtaClick(label, href, destination);
  });
});
