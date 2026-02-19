import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThreeBackground } from './components/ThreeBackground'
import { useTheme } from './context/ThemeContext'
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
import AutoFillAgent from './pages/AutoFillAgent'

function App() {
  const { theme } = useTheme()

  return (
    <Router>
      <div className="relative min-h-screen">
        <div className="fixed inset-0 pointer-events-none -z-10">
          <ThreeBackground theme={theme} />
        </div>
        <div className="relative z-10">
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
            <Route path="/auto-fill" element={<AutoFillAgent />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
