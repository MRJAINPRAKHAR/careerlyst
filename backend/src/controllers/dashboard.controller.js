const pool = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, groupBy = 'month' } = req.query; // groupBy: 'year' | 'month' | 'day'
    console.log(`[DASHBOARD] Fetching stats for user ${userId}, Range: ${startDate} to ${endDate}, GroupBy: ${groupBy}`);

    // Standard Filter (Used for Total, Status, Recent)
    // We want these stats to reflect the same period as the graph if possible?
    // Actually, usually "Total Applications" means total in the selected period.
    // So yes, we apply the date filter to everything.

    let dateFilter = "";
    let queryParams = [userId];

    let start = startDate;
    let end = endDate;

    if (start || end) {
      if (!start) start = '1970-01-01'; // Beginning of time
      if (!end) end = new Date().toISOString().split('T')[0]; // Today

      // Ensure full day coverage for end date
      dateFilter = " AND COALESCE(date_applied, created_at) BETWEEN ? AND ?";
      queryParams.push(start, end + ' 23:59:59');
    }

    // 1. Total count
    const [totalRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM applications WHERE user_id = ?${dateFilter}`,
      queryParams
    );

    // 2. Status counts
    const [statusRows] = await pool.query(
      `SELECT status, COUNT(*) AS count
       FROM applications
       WHERE user_id = ?${dateFilter}
       GROUP BY status`,
      queryParams
    );

    // 3. Recent Activity
    const [recentRows] = await pool.query(
      `SELECT id, company, role, status, COALESCE(date_applied, created_at) as effective_date 
       FROM applications 
       WHERE user_id = ?${dateFilter}
       ORDER BY effective_date DESC 
       LIMIT 5`,
      queryParams
    );

    // 4. Growth Trend
    let trendQuery = "";
    let format = "";

    // Select format based on groupBy
    switch (groupBy) {
      case 'year':
        format = '%Y';
        break;
      case 'day':
        format = '%Y-%m-%d';
        break;
      case 'month':
      default:
        format = '%Y-%m';
        break;
    }

    // We need separate params for trend if we want to change default behavior when no dates are provided.
    // But currently, the design is: if no dates provided -> "All Time" (except maybe for graph defaults?)
    // Existing code defaulted graph to 6 months if no dates.
    // Let's preserve that logic: if no dates provided AND groupBy is 'month' (default), show last 6 months.
    // If groupBy is 'year', show all time (last 5 years).
    // If groupBy is 'day', maybe last 30 days?

    let trendParams = [...queryParams];
    let trendFilter = dateFilter;

    if (!start && !end) {
      // No explicit filter. Apply defaults for trend graph context.
      // We need to REBUILD trendParams because queryParams has only [userId] in this case.
      if (groupBy === 'month') {
        trendFilter = " AND COALESCE(date_applied, created_at) >= DATE_SUB(NOW(), INTERVAL 6 MONTH)";
      } else if (groupBy === 'day') {
        trendFilter = " AND COALESCE(date_applied, created_at) >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
      } else if (groupBy === 'year') {
        // Show last 5 years?
        trendFilter = " AND COALESCE(date_applied, created_at) >= DATE_SUB(NOW(), INTERVAL 5 YEAR)";
      }
    }

    trendQuery = `SELECT DATE_FORMAT(COALESCE(date_applied, created_at), '${format}') as key_date, COUNT(*) as count
         FROM applications
         WHERE user_id = ?${trendFilter}
         GROUP BY key_date
         ORDER BY key_date ASC`;

    const [trendRows] = await pool.query(trendQuery, trendParams);

    // 5. Zero-Filling & Formatting
    const trendData = [];
    const dataMap = {};
    trendRows.forEach(row => {
      dataMap[row.key_date] = row.count;
    });

    // Determine loop range for zero-filling
    let loopStart, loopEnd;

    // Helper to parse key_date back to Date
    // logic depends on provided start/end OR inferred from data/defaults
    if (start && end) {
      loopStart = new Date(start);
      loopEnd = new Date(end);
    } else {
      // Default ranges if no filter
      loopEnd = new Date();
      loopStart = new Date();
      if (groupBy === 'month') loopStart.setMonth(loopEnd.getMonth() - 5);
      else if (groupBy === 'day') loopStart.setDate(loopEnd.getDate() - 29);
      else if (groupBy === 'year') loopStart.setFullYear(loopEnd.getFullYear() - 4);
    }

    // Normalize
    if (loopStart > loopEnd) { const t = loopStart; loopStart = loopEnd; loopEnd = t; }

    const current = new Date(loopStart);
    // Align current to start of period
    if (groupBy === 'month') current.setDate(1);
    if (groupBy === 'year') { current.setMonth(0); current.setDate(1); }

    // Helper to get key from date object based on groupBy
    const getKey = (d) => {
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      if (groupBy === 'year') return `${y}`;
      if (groupBy === 'day') return `${y}-${m}-${day}`;
      return `${y}-${m}`;
    };

    // Helper to format display name
    const getName = (d) => {
      if (groupBy === 'year') return `${d.getFullYear()}`;
      if (groupBy === 'day') return d.toLocaleDateString('default', { day: 'numeric', month: 'short' });
      // Month: Jan '24
      return d.toLocaleDateString('default', { month: 'short', year: '2-digit' });
    };

    // End condition
    const getEndKey = (d) => getKey(d);
    const endKey = getEndKey(loopEnd);

    // Safety loop
    let safety = 0;
    while (safety < 2000) {
      const key = getKey(current);

      trendData.push({
        name: getName(current),
        applications: dataMap[key] || 0,
        fullDate: key
      });

      // Break if we passed end date
      if (key === endKey) break;
      if (current > loopEnd) break;

      // Increment
      if (groupBy === 'year') {
        current.setFullYear(current.getFullYear() + 1);
      } else if (groupBy === 'day') {
        current.setDate(current.getDate() + 1);
      } else { // month
        current.setMonth(current.getMonth() + 1);
      }
      safety++;
    }

    const recentActivity = recentRows.map(row => ({
      id: row.id,
      company: row.company,
      role: row.role,
      status: row.status,
      time: new Date(row.effective_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    }));

    const statusCounts = {
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };

    statusRows.forEach((row) => {
      statusCounts[row.status] = row.count;
    });

    return res.json({
      total: totalRows[0].total,
      statusCounts,
      recentActivity,
      trendData
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getDashboardStats };
