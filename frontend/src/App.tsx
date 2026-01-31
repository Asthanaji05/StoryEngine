import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { Dashboard } from './features/stories/Dashboard';
import { StorySession } from './features/narration/StorySession';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Stories Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/story/:id" element={<StorySession />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
