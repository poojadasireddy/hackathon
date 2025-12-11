import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity, Map as MapIcon, Menu, Bell, User, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useState, lazy, Suspense } from 'react';

// Lazy load components to prevent top-level crashes from breaking the shell
// Lazy load components to prevent top-level crashes from breaking the shell
const EmergencyRequestForm = lazy(() => import('./features/emergencyRequest/EmergencyRequestForm').then(module => ({ default: module.EmergencyRequestForm })));
// const BloodBankLocator = lazy(() => import('./features/bloodBanks/BloodBankLocator').then(module => ({ default: module.BloodBankLocator })));
import { BloodBankLocator } from './features/bloodBanks/BloodBankLocator';
import { UnifiedDashboard } from './features/dashboard/UnifiedDashboard';

function NavItem({ to, icon: Icon }: { to: string, icon: React.ElementType }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className="relative group flex flex-col items-center justify-center p-2 w-16 transition-all duration-300">
      <div className={clsx(
        "absolute inset-0 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100",
        isActive ? "opacity-100 bg-plasma-glow blur-md" : "bg-cyan-glow"
      )} />

      <div className={clsx(
        "relative z-10 p-2 rounded-xl transition-all duration-300 border border-transparent",
        isActive ? "bg-plasma border-plasma-glow text-white shadow-neon-red scale-110" : "text-gray-400 group-hover:text-cyan group-hover:border-cyan-glow"
      )}>
        <Icon className="w-6 h-6" />
      </div>
    </Link>
  );
}

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-cyan animate-pulse">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      <p className="text-sm tracking-widest uppercase">Initializing System...</p>
    </div>
  )
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen pb-24 md:pb-0 relative overflow-hidden">
        {/* Ambient Background Effects */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-plasma rounded-full blur-[150px] opacity-20 animate-pulse-slow" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan rounded-full blur-[150px] opacity-10 animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        {/* Top Header */}
        <header className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 rounded-2xl md:mx-6 md:mt-6 border-b-0">
          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-plasma blur-lg opacity-50 animate-pulse" />
                <Activity className="w-8 h-8 text-plasma relative z-10" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wider text-white text-glow">
                  HEMA<span className="text-plasma">BLOOD</span>
                </h1>
                <p className="text-[10px] tracking-[0.2em] text-cyan font-semibold uppercase">Emergency Response</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-gray-300 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-plasma rounded-full shadow-neon-red animate-pulse" />
              </button>
              <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-gray-300 hidden md:block">
                <User className="w-5 h-5" />
              </button>
              <button className="md:hidden p-2 text-gray-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 pt-28 px-4 md:px-6 max-w-7xl mx-auto space-y-8">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<UnifiedDashboard />} />
              <Route path="/old-request" element={<EmergencyRequestForm />} />
              <Route path="/locations" element={<BloodBankLocator />} />
            </Routes>
          </Suspense>
        </main>

        {/* Floating Bottom Nav (Mobile) */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 rounded-full flex items-center gap-8 md:hidden">
          <NavItem to="/" icon={Activity} />
          <NavItem to="/locations" icon={MapIcon} />
        </nav>
      </div>
    </Router>
  );
}

export default App;
