import { Router } from "express";
import axios from "axios";

const router = Router();

router.post("/send", async (req, res) => {
  try {
    const { message } = req.body;
    const webhookUrl = process.env.TEAMS_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).json({ error: "Teams Webhook URL missing" });
    }

    await axios.post(webhookUrl, { text: message || "Test message from backend!" });

    res.json({ success: true, message: "Message sent to Teams" });
  } catch (error) {
    console.error("[TEAMS ROUTE] Webhook error:", error);
    res.status(500).json({ error: "Failed to send Teams message" });
  }
});

export default router;
