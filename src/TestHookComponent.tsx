import { useBloodBanks } from './features/bloodBanks/useBloodBanks';

export function TestHookComponent() {
    const { banks, loading } = useBloodBanks(undefined, undefined);
    return (
        <div className="text-white p-20">
            <h1>Test Hook Component</h1>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Banks: {banks.length}</p>
        </div>
    );
}
