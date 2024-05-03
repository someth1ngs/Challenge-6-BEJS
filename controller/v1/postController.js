const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const imageKit = require("../../libs/imagekit");

module.exports = {
  post: async (req, res, next) => {
    try {
      let { title, description } = req.body;

      if (!req.file || !title || !description) {
        return res.status(400).json({
          status: false,
          message: "Input must be required",
          data: null,
        });
      }

      let strFile = req.file.buffer.toString("base64");

      let { url, fileId } = await imageKit.upload({
        fileName: Date.now() + path.extname(req.file.originalname),
        file: strFile,
        folder: "/challenge6/images",
      });

      const post = await prisma.post.create({
        data: {
          title,
          description,
          post_url: url,
          user_id: req.user.id,
          post_id: fileId,
        },
      });
      delete post.image_id;

      return res.status(201).json({
        status: true,
        message: "Post Successfully",
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  },

  index: async (req, res, next) => {
    try {
      const { search } = req.query;

      const Post = await prisma.post.findMany({
        where: { title: { contains: search, mode: "insensitive" } },
      });

      Post.forEach((image) => {
        delete image.image_id;
        delete image.user_id;
      });

      res.status(200).json({
        status: true,
        message: "success",
        data: Post,
      });
    } catch (error) {
      next(error);
    }
  },
};
