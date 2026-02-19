import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Authentication/SignIn/Login'
import Signup from './pages/Authentication/SignUp/Account'
import Dashboard from './pages/Dashboard'
import SchemeDetail from './pages/SchemeDetail'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'
import MySchemes from './pages/Translation/MySchemes'
import Documents from './pages/Translation/Documents'
import EligibilityResults from './pages/EligibilityResults'
import History from './pages/Translation/History'
import HelpSupport from './pages/Translation/HelpSupport'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scheme/:schemeId" element={<SchemeDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/my-schemes" element={<MySchemes />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/eligibility-results" element={<EligibilityResults />} />
        <Route path="/history" element={<History />} />
        <Route path="/help-support" element={<HelpSupport />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
