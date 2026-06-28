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

export async function getCustomers(req, res, next) {
  try {
    const { search = '', category = '', kyc = '' } = req.query;
    // Cap page and limit to prevent DB abuse via pagination params
    const page  = Math.max(parseInt(req.query.page)  || 1,  1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 15, 1), 100);

    const query = {};

    if (search.trim()) {
      query.$or = [
        { 'profile.name': { $regex: search.trim(), $options: 'i' } },
        { customerId: { $regex: search.trim(), $options: 'i' } },
        { accountNumber: { $regex: search.trim(), $options: 'i' } },
        { 'kycDocuments.panNumber': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (category) query['profile.category'] = category;

    if (kyc === 'verified') {
      query['kycDocuments.panVerified'] = true;
      query['kycDocuments.aadhaarVerified'] = true;
    } else if (kyc === 'pending') {
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { 'kycDocuments.panVerified': false },
            { 'kycDocuments.aadhaarVerified': false },
          ],
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      OnboardingRecord.find(query)
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      OnboardingRecord.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        customers,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateKycStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject'

    const record = await OnboardingRecord.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Customer not found.' });
    }

    if (action === 'approve') {
      record.kycDocuments.panVerified = true;
      record.kycDocuments.aadhaarVerified = true;
      record.status = 'kyc_complete';
    } else if (action === 'reject') {
      record.kycDocuments.panVerified = false;
      record.kycDocuments.aadhaarVerified = false;
      record.status = 'pending';
    } else {
      return res.status(400).json({ success: false, error: 'Action must be approve or reject.' });
    }

    await record.save();
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
}
