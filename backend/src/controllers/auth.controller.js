import User from "../models/user.model.js";
import { getAuth, clerkClient } from "@clerk/express";

export const register = (req, res) => {
  res.send("register");
};

export const login = (req, res) => {
  res.send("login");
};

export const getCurrent = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching current user", error });
  }
};

export const syncUser = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    const exisitingUser = await User.findOne({ clerkId: userId });

    if (exisitingUser) {
      return res
        .status(200)
        .json({ user: exisitingUser, message: "User already exists" });
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    const body = req.body || {};

    const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
    const usernameFromClerk =
      clerkUser?.username || (email ? email.split("@")[0] : undefined);

    const userData = {
      clerkId: userId,
      email,
      firstName: clerkUser?.firstName || body.firstName,
      lastName: clerkUser?.lastName || body.lastName,
      username: usernameFromClerk || body.username,
      age: body.age,
      sex: body.sex,
      height: body.height,
      currentWeight: body.currentWeight,
      targetWeight: body.targetWeight,
      activityLevel: body.activityLevel,
    };

    const missing = Object.entries({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      age: userData.age,
      sex: userData.sex,
      height: userData.height,
      currentWeight: userData.currentWeight,
      targetWeight: userData.targetWeight,
    })
      .filter(([, v]) => v === undefined || v === null)
      .map(([k]) => k);

    if (missing.length) {
      return res.status(400).json({
        message: "Missing required fields for user creation",
        missing,
      });
    }

    const newUser = await User.create(userData);

    return res
      .status(200)
      .json({ user: newUser, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error syncing user", error });
  }
};
