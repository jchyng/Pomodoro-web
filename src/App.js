import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import PomodoroPage from "./pages/PomodoroPage";
import { sendGAPageView } from "./utils/analytics";

// 라우트 변경 추적을 위한 컴포넌트
const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    sendGAPageView(location.pathname);
  }, [location]);

  return null;
};

function App() {
  return (
    <Router>
      <RouteTracker />
      <Routes>
        <Route path="/" element={<PomodoroPage />} />
      </Routes>
    </Router>
  );
}

export default App;
