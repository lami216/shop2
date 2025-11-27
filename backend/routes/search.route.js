import express from "express";

const router = express.Router();

// POST /api/search/match
// يستقبل بيانات البحث، حالياً نتجاهل المحتوى ونرجع استجابة تجريبية
router.post("/match", (req, res) => {
  // TODO: لاحقاً نضيف منطق المطابقة الفعلي (الطلاب، المواد، المدن، الخ)

  return res.json({
    matches: [],
    message: "Search API is working, but no real matching logic yet.",
  });
});

export default router;
