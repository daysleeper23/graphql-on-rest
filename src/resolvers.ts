import { Resolvers } from "./types";

export const resolvers: Resolvers = {
  Query: {
    tasksByCompanyAndWorkspace: async (_, { companyId, workspaceId }, { dataSources }) => {
      const tasks = await dataSources.issueTrackingAPI.getTasksByCompanyAndWorkspace(companyId, workspaceId);
      return Array.isArray(tasks.data) ? tasks.data : [];
    }
  },
};