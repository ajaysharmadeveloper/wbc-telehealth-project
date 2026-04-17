import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useFadeIn() {
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      const els = document.querySelectorAll('.fade-in:not(.visible)');
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add('visible');
          });
        },
        { threshold: 0.1 }
      );
      els.forEach((el) => obs.observe(el));
      return () => obs.disconnect();
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);
}
