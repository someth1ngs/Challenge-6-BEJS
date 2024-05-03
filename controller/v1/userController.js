const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const imagekit = require("../../libs/imagekit");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = process.env;

module.exports = {
  register: async (req, res, next) => {
    try {
      let { first_name, last_name, email, password } = req.body;

      if (!first_name || !last_name || !email || !password) {
        return res.status(404).json({
          status: false,
          message: "Input Required",
        });
      }

      let exist = await prisma.user.findFirst({
        where: { email },
      });

      if (exist) {
        return res.status(400).json({
          status: false,
          message: "email already used",
        });
      }

      let encryptedPassword = await bcrypt.hash(password, 10);

      let user = await prisma.user.create({
        data: {
          first_name,
          last_name,
          email,
          password: encryptedPassword,
        },
      });
      delete user.password;

      res.status(201).json({
        status: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  index: async (req, res, next) => {
    try {
      let { search } = req.query;

      let users = await prisma.user.findMany({
        where: { first_name: { contains: search } },
        orderBy: { id: "asc" },
      });

      if (users.length === 0) {
        res.status(400).json({
          status: false,
          message: `Users dengan nama ${search} tidak ada!`,
        });
      }

      res.status(200).json({
        status: true,
        message: "Berhasil mengambil data Users",
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    const id = Number(req.params.id);
    try {
      let { first_name, last_name, email, address, occupation, password } =
        req.body;

      if (!first_name || !last_name || !email || !address || !occupation) {
        return res.status(400).json({
          status: false,
          message: "All Input Update Required",
        });
      }

      let updateData = {
        first_name,
        last_name,
        email,
        address,
        occupation,
      };

      const exist = await prisma.user.findUnique({
        where: { id },
      });

      if (!exist) {
        return res.status(404).json({
          status: false,
          message: `User with id ${id} not found`,
          data: null,
        });
      }

      if (req.file) {
        let strFile = req.file.buffer.toString("base64");
        let { url } = await imagekit.upload({
          fileName: Date.now() + path.extname(req.file.originalname),
          file: strFile,
        });
        updateData.avatar_url = url;
      }

      if (password) {
        let encryptedPassword = await bcrypt.hash(password, 10);
        updateData.password = encryptedPassword;
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      });
      delete user.password;

      res.status(200).json({
        status: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      let { email, password } = req.body;

      let user = await prisma.user.findFirst({ where: { email } });
      if (!user || !email || !password) {
        return res.status(400).json({
          status: false,
          message: "Invalid email or password",
          data: null,
        });
      }

      let isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({
          status: false,
          message: "Invalid email or password",
          data: null,
        });
      }

      delete user.password;
      let token = jwt.sign(user, JWT_SECRET_KEY);

      return res.status(200).json({
        status: true,
        message: "OK",
        data: { ...user, token },
      });
    } catch (error) {
      next(error);
    }
  },

  auth: async (req, res, next) => {
    try {
      return res.status(200).json({
        status: true,
        message: "OK",
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  },
};
