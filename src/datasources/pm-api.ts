import { RESTDataSource, AugmentedRequest } from "@apollo/datasource-rest";
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';

import { GetTasksResponse, SingleTaskResponse, TaskCreate } from "../types";

export class IssueTrackingAPI extends RESTDataSource {
  override baseURL = "https://fs19-pm-be-java.onrender.com/";
  private token: string;

  constructor(options: { token: string; cache: KeyValueCache }) {
    super(options);
    this.token = options.token;
  }

  override willSendRequest(_path: string, request: AugmentedRequest) {
    request.headers['authorization'] = this.token;
  }

  getTasksByCompanyAndWorkspace(companyId:string, workspaceId: string): Promise<GetTasksResponse> {
    return this.get<GetTasksResponse>(`/${companyId}/${workspaceId}/tasks`);
  }

  createTask(companyId: string, projectId: string, task: TaskCreate): Promise<SingleTaskResponse> {
    return this.post<SingleTaskResponse>(`/${companyId}/${projectId}/tasks`, { body: task });
  }
}