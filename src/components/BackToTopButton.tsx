import { useEffect, useState } from 'react';

function ScrollButton() {
  // The back-to-top button is hidden at the beginning
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    });
  }, []);

  // This function will scroll the window to the top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // for smoothly scrolling
    });
  };
  return (
    showButton && (
      <button
        type='button'
        title='Scroll to Top'
        onClick={scrollToTop}
        id='back-to-top'
        className='fad fa-chevron-circle-up fa-4x '></button>
    )
  );
}

export default ScrollButton;
