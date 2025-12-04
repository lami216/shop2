import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createOrGetConversation,
  sendMessage,
  getMyConversations,
  getMessages
} from "../controllers/message.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/start", createOrGetConversation);
router.post("/send", sendMessage);
router.get("/list", getMyConversations);
router.get("/:conversationId", getMessages);

export default router;
