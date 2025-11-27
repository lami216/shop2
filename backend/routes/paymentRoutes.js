import express from "express";

import { checkoutSuccess, createCheckoutSession } from "../controllers/payment.controller.js";
import { protect, requireStudent, requireTutor } from "../middleware/auth.middleware.js";
import {
  buildValidationError,
  ensurePositiveNumber,
  isValidEnum,
  isValidObjectId,
} from "../lib/validators.js";
import Payment from "../models/Payment.js";
import StudentProfile from "../models/StudentProfile.js";
import TutorProfile from "../models/TutorProfile.js";
import { updateTutorBadge } from "../services/tutorBadgeService.js";

const router = express.Router();

const updateTutorIncome = async (tutorId, amount) => {
  try {
    const profile = await TutorProfile.findOne({ userId: tutorId });

    if (!profile) return null;

    profile.incomeMonth = (profile.incomeMonth || 0) + amount;
    profile.incomeTotal = (profile.incomeTotal || 0) + amount;

    return await profile.save();
  } catch (error) {
    console.error("Failed to update tutor income", error.message);
    return null;
  }
};

const linkActiveLesson = async ({ studentId, tutorId, subjectId, period, paymentId }) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId: studentId });
    if (studentProfile) {
      studentProfile.activeLessons = studentProfile.activeLessons || [];
      studentProfile.activeLessons.push({
        subject: subjectId,
        tutor: tutorId,
        period,
        payment: paymentId,
      });
      await studentProfile.save();
    }

    const tutorProfile = await TutorProfile.findOne({ userId: tutorId });
    if (tutorProfile) {
      tutorProfile.activeLessons = tutorProfile.activeLessons || [];
      tutorProfile.activeLessons.push({
        student: studentId,
        subject: subjectId,
        period,
        payment: paymentId,
      });
      await tutorProfile.save();
    }

    // TODO: deduplicate lessons and keep enrollment history
  } catch (error) {
    console.error("Failed to link active lesson", error.message);
  }
};

router.post("/initiate", protect, requireTutor, async (req, res) => {
  try {
    const { studentId, subjectId, amount, period, notes } = req.body;

    if (!isValidObjectId(studentId) || !isValidObjectId(subjectId)) {
      return res.status(400).json(buildValidationError("Valid student and subject ids are required"));
    }

    if (!ensurePositiveNumber(Number(amount))) {
      return res.status(400).json(buildValidationError("Amount must be a positive number"));
    }

    if (!isValidEnum(period, ["monthly", "semester"])) {
      return res.status(400).json(buildValidationError("Invalid payment period"));
    }

    const payment = await Payment.create({
      student: studentId,
      tutor: req.user._id,
      subject: subjectId,
      amount,
      period,
      createdBy: req.user._id,
      notes,
      status: "awaiting_receipt",
      isConfirmed: false,
      // TODO: validate tutor teaches subject and student has access to it
      // TODO: add audit logging for initiation attempts
    });

    return res.status(201).json(payment);
  } catch (error) {
    console.error("Failed to initiate payment", error.message);
    return res.status(500).json({ message: "Could not create payment" });
  }
});

router.get("/my", protect, async (req, res) => {
  try {
    const { role, _id } = req.user;

    if (role === "student") {
      const payments = await Payment.find({ student: _id }).sort({ createdAt: -1 });
      return res.json(payments);
    }

    if (role === "tutor") {
      const payments = await Payment.find({ tutor: _id }).sort({ createdAt: -1 });
      return res.json(payments);
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (error) {
    console.error("Failed to fetch payments", error.message);
    return res.status(500).json({ message: "Could not fetch payments" });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json(buildValidationError("Invalid payment id"));
    }
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (
      (req.user.role === "student" && String(payment.student) !== String(req.user._id)) ||
      (req.user.role === "tutor" && String(payment.tutor) !== String(req.user._id))
    ) {
      return res.status(403).json({ message: "Not authorized to view this payment" });
    }

    return res.json(payment);
  } catch (error) {
    console.error("Failed to fetch payment", error.message);
    return res.status(500).json({ message: "Could not fetch payment" });
  }
});

router.put("/:id/receipt", protect, requireStudent, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json(buildValidationError("Invalid payment id"));
    }
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (String(payment.student) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to update this payment" });
    }

    const { receiptImage, note } = req.body;

    if (!receiptImage) {
      return res.status(400).json({ message: "Receipt reference is required" });
    }

    payment.receiptImage = receiptImage;
    payment.notes = note || payment.notes;

    if (payment.status === "awaiting_receipt" || payment.status === "pending") {
      payment.status = "awaiting_tutor_confirmation";
    }

    await payment.save();

    return res.json(payment);
  } catch (error) {
    console.error("Failed to upload receipt", error.message);
    return res.status(500).json({ message: "Could not update payment" });
  }
});

router.put("/:id/confirm", protect, requireTutor, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json(buildValidationError("Invalid payment id"));
    }
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (String(payment.tutor) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to confirm this payment" });
    }

    const { approved, message, rejectionReason } = req.body;

    if (approved === undefined && !rejectionReason) {
      return res
        .status(400)
        .json(buildValidationError("Approval decision or rejection reason is required"));
    }

    if (approved) {
      payment.status = "confirmed";
      payment.isConfirmed = true;
      payment.notes = message || payment.notes;
      payment.rejectionReason = undefined;
      payment.periodStart = payment.periodStart || new Date();
      // TODO: compute periodEnd based on subscription type and periodStart
    } else {
      payment.status = "rejected";
      payment.isConfirmed = false;
      payment.rejectionReason = rejectionReason || message;
    }

    await payment.save();

    if (approved) {
      await updateTutorIncome(payment.tutor, payment.amount || 0);
      // TODO: add structured logging around badge recalculation outcomes
      try {
        await updateTutorBadge(payment.tutor);
      } catch (error) {
        console.error("Badge update failed after payment confirmation", error?.message || error);
      }
      await linkActiveLesson({
        studentId: payment.student,
        tutorId: payment.tutor,
        subjectId: payment.subject,
        period: payment.period,
        paymentId: payment._id,
      });
    }

    return res.json(payment);
  } catch (error) {
    console.error("Failed to confirm payment", error.message);
    return res.status(500).json({ message: "Could not update payment" });
  }
});

// Legacy Stripe-disabled endpoints kept for compatibility
router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/checkout-success", protect, checkoutSuccess);

export default router;

