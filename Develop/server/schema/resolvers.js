const { AuthenticationError } = require("apollo-server-express");
const { User, Review } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select(
                    "__v -password"
                );
                return userData;
            }
            throw new AuthenticationError("Not logged in.");
        },
    },
    Mutation: {
        addUser: async (parent, args, context) => {
            try {
                const user = await User.create(args);
                const token = signToken(user);
                return { token, user };
            } catch (err) {
                console.log(err)
            }
        },
        login: async(parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('No user was found with this email')
            }
            const userPw = await user.isCorrectPassword(password);
            if(!userPw) {
                throw new AuthenticationError('Wrong password')
            }
            const token = signToken(user);

            return { token, user};
        },
        saveBook: async (parent, { bookToSave }, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    {_id: context.user._id},
                    {$push: { savedBooks: bookToSave }},
                    {new: true}
                );
                return updatedUser;
            } else {
                throw new AuthenticationError("Not logged in")
            }
        },
        deleteBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    {_id: context.user._id},
                    {$pull: { savedBooks: { bookId }}},
                    {new: true}
                );
                return updatedUser;
            } else {
                throw new AuthenticationError("Not logged in");
            }
        },
    },
};

module.exports = resolvers