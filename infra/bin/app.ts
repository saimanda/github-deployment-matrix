#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/api-stack";
import { FrontendStack } from "../lib/frontend-stack";

const app = new cdk.App();

const apiStack = new ApiStack(app, "DeployDashboardApiStack", {
  description: "Deployment Dashboard - API, Lambda, DynamoDB",
});

new FrontendStack(app, "DeployDashboardFrontendStack", {
  description: "Deployment Dashboard - S3 + CloudFront",
  apiUrl: apiStack.apiUrl,
});
