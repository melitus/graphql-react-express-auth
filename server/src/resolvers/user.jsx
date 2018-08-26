import jwt from 'jsonwebtoken';
import { combineResolvers } from 'graphql-resolvers';
import { AuthenticationError, UserInputError } from 'apollo-server';
const bcrypt = require('bcrypt');

import { isAuthenticated, isAdmin } from './authorization';

const createToken = async (user, secret, expiresIn) => {
  const { id, email, username, role } = user;
  return await jwt.sign({ id, email, username, role }, secret, {
    expiresIn,
  });
};

export default {
  Query: {
    getAllUsers : async (parent, args, { models }) =>{
       const users = await models.User.find().sort({ createdAt: "desc" });
       return users;
    },
      
    getUserById: async (parent, args, { models }) => {
      const user = await models.User.findById(args.id)
      return user
    },

    me: async (parent, args, { models, me }) => {
      if (!me) {
        return null;
      }
      return await models.User.findById(me.id);
    },
  },

  Mutation: {
    signUp: async ( parent,{ username, email, password },{ models, secret },) => {

      const userexist = await models.User.findOne({email, userName});
      if(userexist){
        throw new UserInputError('User already exits');
    }
      const user = await models.User.create({
        username,
        email,
        password,
      });

      return { token: createToken(user, secret, '30m') };
    },

    signIn: async (parent, { email, password },{ models, secret },) => {

      const user = await User.findOne({email});
      if(!user){
        throw new UserInputError( 'No user found with this login credentials.');
    }
      const isValid = await user.validatePassword(password);

      if (!isValid) {
        throw new AuthenticationError('Invalid password.');
      }
      return { token: createToken(user, secret, '30m') };
    },

  changePassword: async (root, {email, password}, {User}) => {

      const saltRounds = 10;

      return bcrypt.hash(password, saltRounds).then(async function(hash) {

          const user = await User.findOneAndUpdate({email}, {$set: {password: hash}}, {new: true});

          if(!user){
              throw new UserInputError('User Not Found');
          }
          return user;
      });
  },

  passwordReset: async (root, {email}, {User}) => {

      const saltRounds = 10;
      const generatedPassword = generator.generate({ length: 10, numbers: true });

      return bcrypt.hash(generatedPassword, saltRounds).then(async function(hash) {
          
          const user = await User.findOneAndUpdate({email}, {$set: {password: hash}}, {new: true});

          if(!user){
              throw new UserInputError('User Not Found');
          }else{

              const data = {
                  email,
                  generatedPassword
              }
              axios.post(`${webConfig.siteURL}/password-reset`, data)
              .then(function (response) {
                  // console.log('Email sent!');
              })
              .catch(function (error) {
                  // console.log(error);
              });
          }
          return user;
      })
    },

    updateUser: combineResolvers(
      isAuthenticated,
      async (parent, { username }, { models, me }) => {
        const user = await models.User.findById(me.id);
        return await user.update({ username });
      },
    ),

    deleteUser: combineResolvers(
      isAdmin,
      async (parent, { id }, { models }) =>
        await models.User.findByIdAndRemove({
          where: { id },
        }),
    ),
  },

  User: {
    messages: async (user, args, { models }) =>
      await models.Message.findAll({
        where: {
          userId: user.id,
        },
      }),
  },
};
