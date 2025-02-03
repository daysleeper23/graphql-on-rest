import { IssueTrackingAPI } from "./datasources/pm-api";

export type DataSourceContext = {
  dataSources: {
    issueTrackingAPI: IssueTrackingAPI;
  }
}