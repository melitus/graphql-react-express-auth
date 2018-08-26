import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    me: User
    getUserById(id: ID!): User
    getAllUsers: [User!]
  }
  extend type Mutation {
    signUp(
      username: String!
      email: String!
      password: String!
    ): Token!
    signIn(login: String!, password: String!): Token!
    updateUser(username: String!): User!
    deleteUser(id: ID!): Boolean!
    changePassword(email: String!, password: String!): User
    passwordReset(email: String!): User
  }
  type Token {
    token: String!
  }
  type User {
    id: ID!
    username: String!
    email: String!
    role: String
    messages: [Message!]
  }
`;


// Note extend keyword is used to avoid large list of queries on the Query or Mutation Object.