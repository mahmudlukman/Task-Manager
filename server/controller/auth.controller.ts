import User, { IUser } from "../model/User.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { NextFunction, Request, Response } from "express";
import { sendToken } from "../utils/jwt";
import { CreateUserParams } from "../@types";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// @desc    Register a new user
// @route   POST /api/v1/register
// @access  Public
export const registerUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        email,
        password,
        avatar,
        adminInviteToken,
      }: CreateUserParams = req.body;

      const isEmailExist = await User.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exist", 400));
      }

      // Determine user role: Admin if correct token is provided, otherwise Member
      let role = "member";
      if (
        adminInviteToken &&
        adminInviteToken == process.env.ADMIN_INVITE_TOKEN
      ) {
        role = "admin";
      }

      // Create user data object with required fields
      const userData: any = {
        name,
        email,
        password,
        role,
      };

      // Only handle avatar if it's provided
      if (avatar) {
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
        });

        // Add avatar details to user data
        userData.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      // Create the user with the prepared data
      const user: IUser = await User.create(userData);

      // Send JWT token in response
      sendToken(user, 201, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Login user
// @route   POST /api/v1/login
// @access  Public
export const loginUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
      }
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("Invalid credentials", 400));
      }

      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid credentials", 400));
      }

      const { isActive } = user;
      if (!isActive) {
        return next(new ErrorHandler("This account has been suspended! Try to contact the admin", 403));
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Logout user
// @route   POST /api/v1/logout
// @access  Public
export const logoutUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "", {
        maxAge: 1,
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      res
        .status(200)
        .json({ success: true, message: "Logged out successfully" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
