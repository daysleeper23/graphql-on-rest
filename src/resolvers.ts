// import { withFilter } from "graphql-subscriptions";
import { withFilter } from "graphql-subscriptions";
import { pubsub } from "./datasources/pm-pubsub";
import { CreatedTaskPayload, Resolvers, UpdatedTaskPayload } from "./types";

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
    },

    updateTask: async (_, { companyId, projectId, taskId, task }, { dataSources }) => {
      const updatedTask = await dataSources.issueTrackingAPI.updateTask(companyId, projectId, taskId, task);
      pubsub.publish('TASK_UPDATED', {
        taskUpdated: {
          companyId
        , workspaceId: updatedTask.data.workspaceId
        , task: updatedTask.data
        }
      });
      return updatedTask.data;
    },
  },

  Subscription: {
    taskCreated: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator(['TASK_CREATED']),
        (payload: CreatedTaskPayload, { companyId, workspaceId }, _) => {
          return payload.taskCreated.companyId === companyId && payload.taskCreated.workspaceId === workspaceId;
        }
      )
    },

    taskUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator(['TASK_UPDATED']),
        (payload: UpdatedTaskPayload, { companyId, workspaceId }, _) => {
          return payload.taskUpdated.companyId === companyId && payload.taskUpdated.workspaceId === workspaceId;
        }
      )
    }
  }
};