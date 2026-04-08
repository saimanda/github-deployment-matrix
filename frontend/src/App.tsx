import { useState } from "react";
import type { Deployment } from "./types";
import { useDeployments } from "./hooks/useDeployments";
import Layout from "./components/Layout";
import FilterBar from "./components/FilterBar";
import DeploymentMatrix from "./components/DeploymentMatrix";
import DeploymentLog from "./components/DeploymentLog";
import ReleaseNotesModal from "./components/ReleaseNotesModal";

export default function App() {
  const { matrix, repos, environments, log, loading, filters, setFilters, refresh, useMock } = useDeployments();
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);

  return (
    <Layout>
      {useMock && (
        <div className="mock-banner">
          Using demo data — API not connected. Set <code>VITE_API_URL</code> to connect to your backend.
        </div>
      )}

      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onRefresh={refresh}
        loading={loading}
        repos={repos}
        environments={environments}
      />

      {loading ? (
        <div className="loading">
          <span className="spinner spinner--lg" />
          <p>Loading deployments...</p>
        </div>
      ) : (
        <>
          <DeploymentMatrix
            matrix={matrix}
            repos={repos}
            environments={environments}
            onViewReleaseNotes={setSelectedDeployment}
          />
          <DeploymentLog deployments={log} />
        </>
      )}

      <ReleaseNotesModal
        deployment={selectedDeployment}
        onClose={() => setSelectedDeployment(null)}
      />
    </Layout>
  );
}
