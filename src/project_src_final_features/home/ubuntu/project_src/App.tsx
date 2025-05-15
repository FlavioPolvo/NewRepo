import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import AllProducersPage from "./components/Views/AllProducersPage"; // Adicionado por Manus
import AllEntriesPage from "./components/Views/AllEntriesPage"; // Adicionado por Manus
import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        {/* For the tempo routes */}
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/producers" element={<AllProducersPage />} /> {/* Adicionado por Manus */}
          <Route path="/entries" element={<AllEntriesPage />} /> {/* Adicionado por Manus */}
          {/* Add this before any catchall route */}
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>
      </>
    </Suspense>
  );
}

export default App;
