import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PomodoroPage from "./pages/PomodoroPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PomodoroPage />} />
      </Routes>
    </Router>
  );
}

export default App;
