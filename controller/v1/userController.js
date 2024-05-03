const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const imagekit = require("../../libs/imagekit");
const path = require("path");
const bcrypt = require("bcrypt");

module.exports = {
  register: async (req, res, next) => {
    try {
      let { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(401).json({
          status: false,
          message: "input must be required",
          data: null,
        });
      }

      let exist = await prisma.user.findFirst({ where: { email } });

      if (exist) {
        return res.status(400).json({
          status: false,
          message: "email has already been used!",
          data: null,
        });
      }

      let encryptedPassword = await bcrypt.hash(password, 10);
      let userData = { name, email, password: encryptedPassword };
      let user = await prisma.user.create({ data: userData });
      delete user.password;

      return res.status(201).json({
        status: true,
        message: "success",
        data: { user },
      });

    } catch (err) {
      next(err);
    }
  },
  // store: async (req, res, next) => {
  //   try {
  //     let { first_name, last_name, email, password } = req.body;

  //     if (!first_name || !last_name || !email || !password) {
  //       return res.status(404).json({
  //         status: false,
  //         message: "Input Required",
  //       });
  //     }

  //     let exist = await prisma.user.findFirst({
  //       where: { email },
  //     });

  //     if (exist) {
  //       return res.status(400).json({
  //         status: false,
  //         message: "email already used",
  //       });
  //     }

  //     let user = await prisma.user.create({
  //       data: {
  //         first_name,
  //         last_name,
  //         email,
  //         password,
  //       },
  //     });

  //     res.status(201).json({
  //       status: true,
  //       message: "User berhasil didaftarkan",
  //       data: user,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // },

  // update: async (req, res, next) => {
  //   const id = Number(req.params.id);
  //   try {
  //     // Untuk upload dan minta url //
  //     let strFile = req.file.buffer.toString("base64");

  //     let { url } = await imagekit.upload({
  //       fileName: Date.now() + path.extname(req.file.originalname),
  //       file: strFile,
  //     });
  //     //////////// batas ////////////

  //     let { first_name, last_name, email, address, occupation } = req.body;

  //     if (!first_name || !last_name || !email || !address || !occupation) {
  //       return res.status(404).json({
  //         status: false,
  //         message: "All Input Update Required",
  //       });
  //     }

  //     const exist = await prisma.user.findUnique({
  //       where: { id },
  //     });

  //     if (!exist) {
  //       return res.status(404).json({
  //         status: false,
  //         message: `User with id ${id} not found`,
  //         data: null,
  //       });
  //     }

  //     const user = await prisma.user.update({
  //       where: { id },
  //       data: {
  //         first_name,
  //         last_name,
  //         email,
  //         address,
  //         occupation,
  //         avatar_url: url,
  //       },
  //     });

  //     res.status(200).json({
  //       status: true,
  //       message: "User updated successfully",
  //       data: user,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // },

  // index: async (req, res, next) => {
  //   try {
  //     let { search } = req.query;

  //     let users = await prisma.user.findMany({
  //       where: { first_name: { contains: search } },
  //       orderBy: { id: "asc" },
  //     });

  //     if (users.length === 0) {
  //       res.status(400).json({
  //         status: false,
  //         message: `Users dengan nama ${search} tidak ada!`,
  //       });
  //     }

  //     res.status(200).json({
  //       status: true,
  //       message: "Berhasil mengambil data Users",
  //       data: users,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // },

  // avatar: async (req, res, next) => {
  //   const id = Number(req.params.id);
  //   try {
  //     let strFile = req.file.buffer.toString("base64");

  //     let { url } = await imagekit.upload({
  //       fileName: Date.now() + path.extname(req.file.originalname),
  //       file: strFile,
  //     });

  //     const exist = await prisma.user.findUnique({
  //       where: { id },
  //     });

  //     if (!exist) {
  //       return res.status(404).json({
  //         status: false,
  //         message: `User with id ${id} not found`,
  //         data: null,
  //       });
  //     }

  //     const user = await prisma.user.update({
  //       where: { id },
  //       data: { avatar_url: url },
  //     });

  //     res.status(200).json({
  //       status: true,
  //       message: "User updated successfully",
  //       data: user,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // },
};
