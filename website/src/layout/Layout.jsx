import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useFadeIn } from '../hooks/useFadeIn';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const [transitionKey, setTransitionKey] = useState(pathname);
  const firstRender = useRef(true);

  useFadeIn();

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setTransitionKey(pathname);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main key={transitionKey} className="route-fade">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
