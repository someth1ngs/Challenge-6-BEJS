const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const imageKit = require("../../libs/imagekit");

module.exports = {
  store: async (req, res, next) => {
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
        folder: "/challenge6/postsImage",
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
      delete post.post_id;

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

      Post.forEach((post) => {
        delete post.post_id;
        delete post.user_id;
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

  show: async (req, res, next) => {
    const id = Number(req.params.id);
    try {
      const Post = await prisma.post.findUnique({
        where: { id },
      });

      if (!Post) {
        return res.status(404).json({
          status: false,
          message: `Post with id ${id} not found`,
          data: null,
        });
      }

      res.status(200).json({
        status: true,
        message: "success",
        data: Post,
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    const id = Number(req.params.id);
    try {
      const { title, description } = req.body;

      if (!title && !description) {
        return res.status(400).json({
          status: false,
          message: "All Input Update Required",
          data: null,
        });
      }

      const exist = await prisma.post.findUnique({
        where: { id },
      });

      if (!exist) {
        return res.status(404).json({
          status: false,
          message: `Post with id ${id} not found`,
          data: null,
        });
      }

      const Post = await prisma.post.update({
        where: { id },
        data: {
          title,
          description,
        },
      });

      delete Post.post_id;
      delete Post.user_id;
      res.status(200).json({
        status: true,
        message: "Post updated successfully",
        data: Post,
      });
    } catch (error) {
      next(error);
    }
  },

  destroy: async (req, res, next) => {
    const id = Number(req.params.id);
    try {
      const exist = await prisma.post.findUnique({
        where: { id },
      });

      if (!exist) {
        return res.status(404).json({
          status: false,
          message: `Post Image with id ${id} not found`,
          data: null,
        });
      }

      imageKit.deleteFile(exist.post_id, async (error, result) => {
        if (error) {
          return res.status(500).json({
            status: false,
            message: "Failed to delete image from ImageKit",
          });
        } else {
          await prisma.post.delete({
            where: { id },
          });
          return res.status(200).json({
            status: true,
            message: "Post Image deleted successfully",
          });
        }
      });
    } catch (error) {
      next(error);
    }
  },
};
