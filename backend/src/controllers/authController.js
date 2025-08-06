import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const {email, password , fullName} = req.body;
    // Basic validation
    if (!email || !password || !fullName) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({
          message: "Password must be at least 6 characters long",
          success: false,
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Invalid email address", success: false });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists, please use a different email",
        success: false,
      });
    }

    // Generate random avatar
    const avatarIndex = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${avatarIndex}`;

    // Create new user
    const newUser = await User.create({
      email,
      password,
      fullName,
      profilePicture: randomAvatar,
    });

    // Update user in stream service
    try {
      await upsertStreamUser({
      id: newUser._id.toString(),
      name: newUser.fullName,
      image: newUser.profilePicture || "",
    })
    console.log('Stream user created successfully for user:', newUser.fullName);
    } catch (error) {
      console.log('Error creating Stream user:', error);
    }

    // JWT token generation
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("jwt", token, {
      secure: process.env.NODE_ENV !== "development", // Secure only in production
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Final response
    res.status(201).json({
      message: "User created successfully",
      newUser,
      success: true,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    console.log("Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
       .status(401)
       .json({ message: "Invalid email or password", success: false });
    }
    // Compare password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res
       .status(401)
       .json({ message: "Invalid email or password", success: false });
    }

    // JWT token generation
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("jwt", token, {
      secure: process.env.NODE_ENV!== "development", // Secure only in production
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Final response
    res.status(200).json({ message: "Logged in successfully", success: true , user});
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};


export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully", success: true });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};


export const onboard = async (req, res) => {
  try {
    const userId  = req.user._id;

    const {fullName, bio, location, nativeLanguage , learningLanguage} = req.body;

    if (!fullName ||!bio ||!location ||!nativeLanguage ||!learningLanguage) {
      return res
       .status(400)
       .json({ 
        message: "All fields are required",
        success: false,
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !location && "location",
         !nativeLanguage && "nativeLanguage",
         !learningLanguage && "learningLanguage",
        ].filter(Boolean),
       });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      ...req.body,
      isOnboarded: true
    }, { new: true });

    if (!updatedUser) {
      return res
       .status(404)
       .json({ message: "User not found", success: false });
    }

    try {
      await upsertStreamUser({
      id: updatedUser._id.toString(),
      name: updatedUser.fullName,
      image: updatedUser.profilePicture || "",
      
    })
    console.log('Stream user created successfully for user:', updatedUser.fullName);
    } catch (error) {
      console.error("Error upserting Stream user:", error);
      
    }
    res.status(200).json({ message: "Onboarded successfully", success: true , updatedUser});

  } catch (error) {
    console.error("Onboard Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
}