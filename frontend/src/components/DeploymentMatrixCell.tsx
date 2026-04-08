import type { Deployment } from "../types";
import { timeAgo } from "../utils/timeAgo";

interface DeploymentMatrixCellProps {
  deployment?: Deployment;
  onViewReleaseNotes: (d: Deployment) => void;
}

export default function DeploymentMatrixCell({ deployment, onViewReleaseNotes }: DeploymentMatrixCellProps) {
  if (!deployment) {
    return (
      <td className="matrix-cell matrix-cell--empty">
        <span className="cell-empty">No deploys</span>
      </td>
    );
  }

  const hasNotes = !!(deployment.releaseNotes || deployment.releaseNotesUrl);
  const envClass = `matrix-cell matrix-cell--${deployment.environment.toLowerCase()}`;

  return (
    <td className={envClass}>
      <div className="cell-content">
        <div className="cell-version-row">
          <span className="cell-version">{deployment.version}</span>
          {hasNotes && (
            <button
              className="cell-notes-btn"
              onClick={() => onViewReleaseNotes(deployment)}
              title="View release notes"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}
        </div>
        <span className="cell-deployer">{deployment.deployer}</span>
        <span className="cell-time">{timeAgo(deployment.timestamp)}</span>
      </div>
    </td>
  );
}
