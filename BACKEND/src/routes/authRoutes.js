import express from "express";
import { signup , login , logout } from "../controllers/authController.js";
import {protectRoute} from "../middleware/authMiddleware.js";
import { onboard } from "../controllers/authController.js";


const router = express.Router();

// create user route
router.post("/signup", signup);

// login route
router.post("/login", login);

// logout route
router.post("/logout", logout);

// onboarding route
router.post("/onboarding", protectRoute , onboard);


// check user is authenticated
router.get("/me", protectRoute, (req, res) => {
    res.status(200).json({ message: "User data", success: true, user: req.user  });
});

export default router;