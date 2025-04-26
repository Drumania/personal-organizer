import { useSwipeable } from "react-swipeable";
import { useNavigate, useLocation } from "react-router-dom";

export default function SwipeWrapper({ children, disableSwipe = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const pages = ["/", "/todos", "/calendar", "/shopping"];
  const currentIndex = pages.indexOf(location.pathname);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (disableSwipe) return;
      if (currentIndex < pages.length - 1) {
        navigate(pages[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      if (disableSwipe) return;
      if (currentIndex > 0) {
        navigate(pages[currentIndex - 1]);
      }
    },
    trackMouse: true,
  });

  return <div {...swipeHandlers}>{children}</div>;
}
