import { validateEmail } from "../../helpers/validation.js";
import User from "../../Model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotEnv from "dotenv";

dotEnv.config();

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });

    res.status(200).json({
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const getUser = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(404).json({
        message: "Id is required",
      });
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    res.status(200).json({
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        message: "A valid Email is required",
      });
    }
    if (!password || password.trim().length === 0) {
      return res.status(400).json({
        message: "Password is required",
      });
    }
    if (!confirmPassword || confirmPassword.trim().length === 0) {
      return res.status(400).json({
        message: "Confirm Password is required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Password does not match",
      });
    }
    const lowerLaceEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      where: {
        email: lowerLaceEmail,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exist",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: lowerLaceEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { email } = req.body;
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        message: "Id is required",
      });
    }
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        message: "A valid Email is required",
      });
    }

    const emailLowerCase = email.toLowerCase().trim();

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    user.update({
      email: emailLowerCase,
    });
    await user.save();
    await user.reload();

    res.status(200).json({
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        message: "Id is required",
      });
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        message: "user not found!",
      });
    }
    await user.destroy();

    res.status(200).json({
      message: "user deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        message: "A valid Email is required",
      });
    }
    if (!password || password.trim().length === 0) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    const user = await User.findOne({
      where: {
        email: email.toLowerCase().trim(),
      },
    });
    if (!user) {
      return res.status(400).json({
        message: "invalid credentials",
      });
    }
    const isEqual = await bcrypt.compare(password, user.dataValues.password);
    if (!isEqual) {
      return res.status(400).json({
        message: "invalid credentials",
      });
    }
    const token = jwt.sign(
      {
        userId: user.dataValues.id,
        email: user.dataValues.email,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "2d",
      }
    );

    res.status(200).json({
      data: {
        token,
        userId: user.dataValues.id,
        email: user.dataValues.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

export { getUser, getUsers, createUser, updateUser, deleteUser, loginUser };
