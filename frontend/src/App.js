import { useState, useEffect } from "react";
import { fetchHealthcare } from "./services/api";
import ScoreDisplay from "./components/ScoreDisplay";
import PlanDisplay from "./components/PlanDisplay";
import MapView from "./components/MapView";

function App() {
  const [loc, setLoc] = useState({ lat: null, lon: null });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // navigator.geolocation.getCurrentPosition(
    //   ({ coords }) => setLoc({ lat: coords.latitude, lon: coords.longitude }),
    //   () => setError("Unable to retrieve your location")
    // );
    setLoc({ lat: "34.073688", lon: "-118.457541" });
  }, []);

  const handleFetch = async () => {
    if (!loc.lat) return;
    setLoading(true);
    setError("");
    try {
      const resp = await fetchHealthcare(loc.lat, loc.lon);
      setData(resp);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-4">
      <header className="w-full max-w-xl mb-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Health Readiness Checker
        </h1>
      </header>

      <main className="w-full max-w-xl">
        <button
          onClick={handleFetch}
          disabled={loading || !!error}
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow"
        >
          {loading ? "Checking..." : "Check Readiness"}
        </button>
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

        {data && (
          <>
            <div className="mt-6">
              <ScoreDisplay score={data.score} />
            </div>
            <PlanDisplay plan={data.plan} />
            <MapView services={data.services} lat={loc.lat} lon={loc.lon} />
          </>
        )}
      </main>

      <footer className="mt-auto py-4 text-center text-sm text-gray-500">
        &copy; 2025 Health Readiness App
      </footer>
    </div>
  );
}

export default App;
