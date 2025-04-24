import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TimerPage from "./pages/TimerPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TimerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
