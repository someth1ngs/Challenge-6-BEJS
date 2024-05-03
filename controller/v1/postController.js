const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const imageKit = require("../libs/imagekit");

module.exports = {
    post: async (req, res, next) => {
        try {
            
        } catch (error) {
            next(error)
        }
    }
}