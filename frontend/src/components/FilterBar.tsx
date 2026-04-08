import type { DeploymentFilters } from "../types";

interface FilterBarProps {
  filters: DeploymentFilters;
  onFilterChange: (filters: DeploymentFilters) => void;
  onRefresh: () => void;
  loading: boolean;
  repos: string[];
  environments: string[];
}

export default function FilterBar({ filters, onFilterChange, onRefresh, loading, repos, environments }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="env-filter">Environment</label>
        <select
          id="env-filter"
          value={filters.environment || ""}
          onChange={(e) => onFilterChange({ ...filters, environment: e.target.value || undefined })}
        >
          <option value="">All</option>
          {environments.map((env) => (
            <option key={env} value={env}>{env}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label htmlFor="repo-filter">Repository</label>
        <select
          id="repo-filter"
          value={filters.repoName || ""}
          onChange={(e) => onFilterChange({ ...filters, repoName: e.target.value || undefined })}
        >
          <option value="">All</option>
          {repos.map((repo) => (
            <option key={repo} value={repo}>{repo}</option>
          ))}
        </select>
      </div>
      <button className="refresh-btn" onClick={onRefresh} disabled={loading}>
        {loading ? (
          <span className="spinner" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        )}
        Refresh Data
      </button>
    </div>
  );
}
