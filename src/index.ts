// TODO
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from '@apollo/server/express4';
import { startStandaloneServer } from "@apollo/server/standalone";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { WebSocketServer } from 'ws';
const { useServer } = require('graphql-ws/use/ws');

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';

import { readFileSync } from "fs";
import path from "path";
import { gql } from "graphql-tag";

import { resolvers } from "./resolvers";
import { IssueTrackingAPI } from "./datasources/pm-api";

const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/subscriptions',
});

const typeDefs = gql(
  readFileSync(path.resolve(__dirname, "./schema.graphql"), {
    encoding: "utf-8",
  })
);
const schema = makeExecutableSchema({ typeDefs, resolvers });


const serverCleanup = useServer({ schema }, wsServer);

async function startApolloServer() {
  const server = new ApolloServer({ 
    schema,
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ]
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

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server)
  )

  console.log(`
    1. Server is running!
    2. Query at ${url}
  `);
}

startApolloServer();