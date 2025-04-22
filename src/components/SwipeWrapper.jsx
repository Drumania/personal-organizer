// src/components/SwipeWrapper.jsx
import { useSwipeable } from "react-swipeable";
import { useNavigate, useLocation } from "react-router-dom";

const routes = ["/", "/routines", "/todos", "/calendar", "/shopping"];

export default function SwipeWrapper({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentIndex = routes.indexOf(location.pathname);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < routes.length - 1) {
        navigate(routes[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        navigate(routes[currentIndex - 1]);
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
    trackMouse: true,
  });

  return (
    <div {...handlers} className="swipe-container">
      {children}
    </div>
  );
}
