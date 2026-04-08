import type { Deployment } from "../types";

interface ReleaseNotesModalProps {
  deployment: Deployment | null;
  onClose: () => void;
}

export default function ReleaseNotesModal({ deployment, onClose }: ReleaseNotesModalProps) {
  if (!deployment) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {deployment.repoName} {deployment.version} — Release Notes
          </h3>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {deployment.releaseNotes ? (
            <pre className="modal-notes">{deployment.releaseNotes}</pre>
          ) : deployment.releaseNotesUrl ? (
            <p>
              View release notes:{" "}
              <a href={deployment.releaseNotesUrl} target="_blank" rel="noopener noreferrer">
                {deployment.releaseNotesUrl}
              </a>
            </p>
          ) : (
            <p>No release notes available.</p>
          )}
        </div>
        <div className="modal-footer">
          <span className="modal-meta">
            Deployed by {deployment.deployer} on{" "}
            {new Date(deployment.timestamp).toLocaleString()}
          </span>
          {deployment.commitSha && (
            <span className="modal-meta">Commit: {deployment.commitSha.substring(0, 7)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
