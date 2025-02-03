// TODO
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { readFileSync } from "fs";
import path from "path";
import { gql } from "graphql-tag";

import { resolvers } from "./resolvers";
import { IssueTrackingAPI } from "./datasources/pm-api";

const typeDefs = gql(
  readFileSync(path.resolve(__dirname, "./schema.graphql"), {
    encoding: "utf-8",
  })
);

async function startApolloServer() {
  const server = new ApolloServer({ 
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => {
      const { cache } = server;

      // Extract token from Authorization header
      const token = req.headers.authorization || '';

      return {
        dataSources: {
          issueTrackingAPI: new IssueTrackingAPI({ token, cache }),
        }
      }
    }
  });

  console.log(`
    1. Server is running!
    2. Query at ${url}
  `);
}

startApolloServer();