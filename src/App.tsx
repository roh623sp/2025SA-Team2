import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Quiz from './pages/Quiz';
import Workout from './pages/Workout';
import Tracker from './pages/Tracker';
import AIchatbot from './pages/AIchatbot';
import MealPlan from './pages/MealPlan';
import Admin from './pages/Admin';
import { withAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { Routes, Route } from 'react-router-dom';

function App() {
  const { signOut } = useAuthenticator();

  return (
    <main>
      <Navbar />
      <Routes>
        <Route path="" element={<Home />}></Route>
        <Route path="/" element={<Home />}></Route>
        <Route path="/Settings" element={<Settings />}></Route>
        <Route path="/Quiz" element={<Quiz />}></Route>
        <Route path="/Workout" element={<Workout />}></Route>
        <Route path="/Tracker" element={<Tracker />}></Route>
        <Route path="/AIchatbot" element={<AIchatbot />}></Route>
        <Route path="/MealPlan" element={<MealPlan />}></Route>
        <Route path="/Admin" element={<Admin />}></Route>
      </Routes>

      <button
        onClick={() => signOut()}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "black",
          color: "white",
          border: "none",
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: "bold",
          borderRadius: "25px",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
          zIndex: 1000,
        }}
      >
        Sign Out
      </button>
    </main>
  );
}

export default withAuthenticator(App);
