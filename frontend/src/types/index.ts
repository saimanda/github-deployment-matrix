export interface Deployment {
  repoName: string;
  environment: "DEV" | "STAGING" | "PROD";
  version: string;
  deployer: string;
  timestamp: string;
  commitSha?: string;
  releaseNotesUrl?: string;
  releaseNotes?: string;
}

export interface LatestDeployments {
  [repoName: string]: {
    [environment: string]: Deployment;
  };
}

export interface DeploymentFilters {
  environment?: string;
  repoName?: string;
  limit?: number;
}

export interface MatrixResponse {
  matrix: LatestDeployments;
  repos: string[];
  environments: string[];
}
