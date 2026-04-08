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

export interface DynamoDeploymentItem {
  pk: string;
  sk: string;
  gsi1pk: string;
  gsi1sk: string;
  repoName: string;
  environment: string;
  version: string;
  deployer: string;
  timestamp: string;
  commitSha?: string;
  releaseNotesUrl?: string;
  releaseNotes?: string;
  ttl: number;
}
