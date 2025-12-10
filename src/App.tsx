import { EmergencyRequestForm } from './features/emergencyRequest/EmergencyRequestForm';
import { RelaySimulator } from './features/relay/RelaySimulator';
import { BloodBankLocator } from './features/bloodBanks/BloodBankLocator';
import { NotificationSetup } from './features/notifications/NotificationSetup';


function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-red-700 tracking-tight">
            LifeLine Connect
          </h1>
          <p className="text-gray-600 mt-2">
            Offline-First Emergency Blood Request System
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-8">
            <EmergencyRequestForm />
            <div className="border-t border-gray-200 pt-8">
              <RelaySimulator />
            </div>
          </div>

          <div className="space-y-6">
            <NotificationSetup />
            <BloodBankLocator />
          </div>
        </div>

        <footer className="text-center text-gray-400 text-sm mt-12">
          Hackathon Project &copy; 2025
        </footer>

      </div>
    </div>
  )
}

export default App
