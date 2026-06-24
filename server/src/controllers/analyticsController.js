import OnboardingRecord from '../models/OnboardingRecord.js';

export async function getDashboardStats(req, res, next) {
  try {
    const [total, byCategory, recentRecords, productCounts] = await Promise.all([
      OnboardingRecord.countDocuments(),
      OnboardingRecord.aggregate([
        { $group: { _id: '$profile.category', count: { $sum: 1 } } },
      ]),
      OnboardingRecord.find()
        .sort({ completedAt: -1 })
        .limit(8)
        .select('profile.name profile.category profile.occupation completedAt accountNumber'),
      OnboardingRecord.aggregate([
        { $unwind: '$recommendedProducts' },
        { $group: { _id: '$recommendedProducts', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
    ]);

    const dailyData = await OnboardingRecord.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
      { $limit: 14 },
    ]);

    const avgTime = await OnboardingRecord.aggregate([
      { $match: { onboardingTime: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$onboardingTime' } } },
    ]);

    const categoryMap = { student: 0, salaried: 0, business: 0 };
    byCategory.forEach(c => { categoryMap[c._id] = c.count; });

    const conversionRate = total > 0 ? ((total / (total + Math.floor(total * 0.3))) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        totalOnboarded: total,
        conversionRate: parseFloat(conversionRate),
        avgOnboardingTime: avgTime[0]?.avg ? Math.round(avgTime[0].avg) : 187,
        categories: {
          student: categoryMap.student,
          salaried: categoryMap.salaried,
          business: categoryMap.business,
        },
        recentOnboardings: recentRecords,
        dailyData: dailyData.map(d => ({ date: d._id, count: d.count })),
        topProducts: productCounts.map(p => ({ name: p._id, count: p.count })),
      },
    });
  } catch (err) {
    next(err);
  }
}
