import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';

const app = express();

app.use(cors());

// The GraphQL schema
const schema =`
  type Query {
    users: [User!]
    user(id: ID!): User
    me: User

  }

  type User {
    id: ID!
    username: String!
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    users: () => {
      return Object.values(users);
    },
    me: () => {
      return {
        username: 'santino melitus',
      };
    },
    user: () => {
      return{
        username: 'sunday aroh'
      }
    }
  },
};

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

server.applyMiddleware({ app, path: '/graphql' });

app.listen({ port: 8000 }, () => {
  console.log('Apollo Server on http://localhost:8000/graphql');
});