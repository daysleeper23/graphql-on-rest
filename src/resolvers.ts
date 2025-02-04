import { pubsub } from "./datasources/pm-pubsub";
import { Resolvers } from "./types";

export const resolvers: Resolvers = {
  Query: {
    tasksByCompanyAndWorkspace: async (_, { companyId, workspaceId }, { dataSources }) => {
      const tasks = await dataSources.issueTrackingAPI.getTasksByCompanyAndWorkspace(companyId, workspaceId);
      return Array.isArray(tasks.data) ? tasks.data : [];
    }
  },

  Mutation: {
    createTask: async (_, { companyId, projectId, task }, { dataSources }) => {
      const newTask = await dataSources.issueTrackingAPI.createTask(companyId, projectId, task);
      pubsub.publish('TASK_CREATED', { taskCreated: newTask.data });
      return newTask.data;
    }
  },

  Subscription: {
    taskCreated: {
      subscribe: () => pubsub.asyncIterableIterator(['TASK_CREATED'])
    }
  }
};