import type { Deployment, LatestDeployments } from "../types";
import DeploymentMatrixCell from "./DeploymentMatrixCell";

interface DeploymentMatrixProps {
  matrix: LatestDeployments;
  repos: string[];
  environments: string[];
  onViewReleaseNotes: (d: Deployment) => void;
}

export default function DeploymentMatrix({ matrix, repos, environments, onViewReleaseNotes }: DeploymentMatrixProps) {
  return (
    <div className="matrix-container">
      <table className="matrix-table">
        <thead>
          <tr>
            <th className="matrix-corner"></th>
            {environments.map((env) => (
              <th key={env} className={`matrix-header matrix-header--${env.toLowerCase()}`}>
                {env}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {repos.map((repo) => (
            <tr key={repo}>
              <td className="matrix-repo">{repo}</td>
              {environments.map((env) => (
                <DeploymentMatrixCell
                  key={`${repo}-${env}`}
                  deployment={matrix[repo]?.[env]}
                  onViewReleaseNotes={onViewReleaseNotes}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
