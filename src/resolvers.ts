// import { withFilter } from "graphql-subscriptions";
import { withFilter } from "graphql-subscriptions";
import { pubsub } from "./datasources/pm-pubsub";
import { CreatedTaskPayload, Resolvers } from "./types";

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
      pubsub.publish('TASK_CREATED', { 
        taskCreated: {
          companyId
        , workspaceId: newTask.data.workspaceId
        , task: newTask.data
        }
      });
      return newTask.data;
    }
  },

  Subscription: {
    taskCreated: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator(['TASK_CREATED']),
        (payload: CreatedTaskPayload, { companyId, workspaceId }, _) => {
          return payload.taskCreated.companyId === companyId && payload.taskCreated.workspaceId === workspaceId;
        }
      )
    }
  }
};