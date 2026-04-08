import type { Deployment, DeploymentFilters, MatrixResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function fetchLatestDeployments(): Promise<MatrixResponse> {
  const res = await fetch(`${API_URL}/deployments/latest`);
  if (!res.ok) throw new Error(`Failed to fetch latest deployments: ${res.statusText}`);
  return res.json();
}

export async function fetchDeploymentLog(filters?: DeploymentFilters): Promise<Deployment[]> {
  const params = new URLSearchParams();
  if (filters?.environment) params.set("environment", filters.environment);
  if (filters?.repoName) params.set("repoName", filters.repoName);
  if (filters?.limit) params.set("limit", String(filters.limit));

  const qs = params.toString();
  const res = await fetch(`${API_URL}/deployments${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(`Failed to fetch deployments: ${res.statusText}`);
  const data = await res.json();
  return data.deployments;
}
