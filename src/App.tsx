import { EmergencyRequestForm } from './features/emergencyRequest/EmergencyRequestForm';
// import { RelaySimulator } from './features/relay/RelaySimulator';
// import { BloodBankLocator } from './features/bloodBanks/BloodBankLocator';
// import { NotificationSetup } from './features/notifications/NotificationSetup';

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

        <div className="md:col-span-2 space-y-8">
          <EmergencyRequestForm />
        </div>
      </div>
    </div>
  )
}

export default App
