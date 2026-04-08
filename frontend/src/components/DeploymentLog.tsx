import type { Deployment } from "../types";
import { timeAgo } from "../utils/timeAgo";

interface DeploymentLogProps {
  deployments: Deployment[];
}

export default function DeploymentLog({ deployments }: DeploymentLogProps) {
  return (
    <div className="log-container">
      <h2 className="log-title">CHRONOLOGICAL DEPLOYMENT LOG</h2>
      <div className="log-list">
        {deployments.length === 0 ? (
          <p className="log-empty">No deployments recorded yet.</p>
        ) : (
          deployments.map((d, i) => (
            <div key={`${d.repoName}-${d.environment}-${d.timestamp}-${i}`} className="log-entry">
              <span className={`log-env-badge log-env-badge--${d.environment.toLowerCase()}`}>
                {d.environment}
              </span>
              <span className="log-text">
                {d.repoName} → {d.version} by {d.deployer}
              </span>
              <span className="log-time" title={new Date(d.timestamp).toLocaleString()}>
                ({timeAgo(d.timestamp)})
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
