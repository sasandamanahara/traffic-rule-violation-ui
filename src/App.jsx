
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />

      </Routes>
    </Router>
  );
}
