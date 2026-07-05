import { Router } from "express";
import { NotificationModel } from "../models/Notification.js";
import { ah } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  ah(async (req, res) => {
    const items = await NotificationModel.find({ ownerId: req.user!.sub })
      .sort({ createdAt: -1 })
      .limit(50);
    const unread = await NotificationModel.countDocuments({ ownerId: req.user!.sub, readAt: null });
    res.json({ items, unread });
  }),
);

router.post(
  "/read-all",
  ah(async (req, res) => {
    await NotificationModel.updateMany(
      { ownerId: req.user!.sub, readAt: null },
      { readAt: new Date() },
    );
    res.json({ ok: true });
  }),
);

export default router;
