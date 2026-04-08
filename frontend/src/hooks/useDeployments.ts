import { useState, useEffect, useCallback } from "react";
import type { Deployment, DeploymentFilters, LatestDeployments } from "../types";
import { fetchLatestDeployments, fetchDeploymentLog } from "../api/deployments";

// Fallback mock data for development/demo when API is not available
const MOCK_MATRIX: LatestDeployments = {
  "identity-service": {
    DEV: { repoName: "identity-service", environment: "DEV", version: "v1.4.2", deployer: "@jdoe", timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
    STAGING: { repoName: "identity-service", environment: "STAGING", version: "v1.4.1", deployer: "@asmith", timestamp: new Date(Date.now() - 86400000).toISOString() },
    PROD: { repoName: "identity-service", environment: "PROD", version: "v1.4.0", deployer: "@github-actions", timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
  },
  "paywall-gateway": {
    DEV: { repoName: "paywall-gateway", environment: "DEV", version: "v2.1.0", deployer: "@mchen", timestamp: new Date(Date.now() - 3600000).toISOString() },
    STAGING: { repoName: "paywall-gateway", environment: "STAGING", version: "v2.0.5", deployer: "@mchen", timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
    PROD: { repoName: "paywall-gateway", environment: "PROD", version: "v2.0.5", deployer: "@github-actions", timestamp: new Date(Date.now() - 5 * 86400000).toISOString() },
  },
  "user-profile-api": {
    DEV: { repoName: "user-profile-api", environment: "DEV", version: "v1.1.8", deployer: "@jdoe", timestamp: new Date(Date.now() - 5 * 3600000).toISOString() },
    STAGING: { repoName: "user-profile-api", environment: "STAGING", version: "v1.1.8", deployer: "@jdoe", timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), releaseNotes: "## Changes\n- Fixed user avatar upload\n- Added email verification retry" },
    PROD: { repoName: "user-profile-api", environment: "PROD", version: "v1.1.7", deployer: "@github-actions", timestamp: new Date(Date.now() - 7 * 86400000).toISOString() },
  },
  "auth-sync-worker": {
    DEV: { repoName: "auth-sync-worker", environment: "DEV", version: "v3.0.1", deployer: "@asmith", timestamp: new Date(Date.now() - 15 * 60000).toISOString(), releaseNotes: "## Changes\n- Hotfix: retry logic for token refresh\n- Updated dependency versions" },
    STAGING: { repoName: "auth-sync-worker", environment: "STAGING", version: "v3.0.0", deployer: "@asmith", timestamp: new Date(Date.now() - 4 * 3600000).toISOString() },
    PROD: { repoName: "auth-sync-worker", environment: "PROD", version: "v3.0.0", deployer: "@github-actions", timestamp: new Date(Date.now() - 86400000).toISOString() },
  },
};

const MOCK_REPOS = ["identity-service", "paywall-gateway", "user-profile-api", "auth-sync-worker"];
const MOCK_ENVIRONMENTS = ["DEV", "STAGING", "PROD"];

function getMockLog(filters?: DeploymentFilters): Deployment[] {
  const all: Deployment[] = [];
  for (const repo of Object.values(MOCK_MATRIX)) {
    for (const dep of Object.values(repo)) {
      all.push(dep);
    }
  }
  let filtered = all;
  if (filters?.environment) filtered = filtered.filter((d) => d.environment === filters.environment);
  if (filters?.repoName) filtered = filtered.filter((d) => d.repoName === filters.repoName);
  return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function useDeployments() {
  const [matrix, setMatrix] = useState<LatestDeployments>({});
  const [repos, setRepos] = useState<string[]>([]);
  const [environments, setEnvironments] = useState<string[]>([]);
  const [log, setLog] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DeploymentFilters>({});
  const [useMock, setUseMock] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [matrixData, logData] = await Promise.all([
        fetchLatestDeployments(),
        fetchDeploymentLog(filters),
      ]);
      setMatrix(matrixData.matrix);
      setRepos(matrixData.repos);
      setEnvironments(matrixData.environments);
      setLog(logData);
      setUseMock(false);
    } catch {
      // Fallback to mock data when API is unavailable
      setMatrix(MOCK_MATRIX);
      setRepos(MOCK_REPOS);
      setEnvironments(MOCK_ENVIRONMENTS);
      setLog(getMockLog(filters));
      setUseMock(true);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { matrix, repos, environments, log, loading, filters, setFilters, refresh, useMock };
}
