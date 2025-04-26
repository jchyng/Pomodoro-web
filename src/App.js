import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import PomodoroPage from "./pages/PomodoroPage";
import { sendGAPageView } from "./utils/analytics";

/* 
  useLocation은 Router Context에서 제공하는 Hook이므로,
  Router 내부에서 사용해야 한다.
  따라서 모든 Route Page에 컴포넌트를 넣는 방법 대신 
  null을 반환하는 컴포넌트를 Router 하위에 넣는 방법을 사용한다.
*/
//url path 변경에 따른 Google Analytics 이벤트 전송
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
