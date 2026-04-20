import { useEffect, useState } from 'react';
import './ResourceHeatmap.css';

export default function ResourceHeatmap({ bookings }) {
  const [topResources, setTopResources] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    if (!bookings || bookings.length === 0) return;

    // 1. Most booked resources (top 5)
    const resourceCount = {};
    bookings.forEach(b => {
      const name = b.resourceName || `Resource ${b.resourceId}`;
      resourceCount[name] = (resourceCount[name] || 0) + 1;
    });
    const sorted = Object.entries(resourceCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    setTopResources(sorted);

    // 2. Bookings per hour (0-23)
    const hourCount = Array(24).fill(0);
    bookings.forEach(b => {
      if (b.startTime) {
        const hour = parseInt(b.startTime.split(':')[0]);
        if (!isNaN(hour)) hourCount[hour]++;
      }
    });
    const maxCount = Math.max(...hourCount, 1);
    const hourly = hourCount.map((count, hour) => ({ hour, count, percent: (count / maxCount) * 100 }));
    setHourlyData(hourly);
  }, [bookings]);

  if (!bookings || bookings.length === 0) {
    return <div className="heatmap-empty">📊 No booking data yet. Create bookings to see analytics.</div>;
  }

  return (
    <div className="heatmap-container">
      <h4>📊 Resource Utilization</h4>
      <div className="charts-row">
        {/* Most Booked Resources */}
        <div className="chart-box">
          <h5>🔥 Most Booked Resources</h5>
          {topResources.length === 0 ? (
            <p>No data</p>
          ) : (
            <div className="resource-bars">
              {topResources.map((res, idx) => (
                <div key={idx} className="resource-bar-item">
                  <span className="resource-name">{res.name}</span>
                  <div className="bar-bg">
                    <div className="bar-fill" style={{ width: `${(res.count / topResources[0].count) * 100}%` }}></div>
                  </div>
                  <span className="resource-count">{res.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bookings by Hour */}
        <div className="chart-box">
          <h5>⏰ Bookings by Hour</h5>
          <div className="hour-bars">
            {hourlyData.map((h) => (
              <div key={h.hour} className="hour-bar-item" title={`${h.hour}:00 → ${h.count} bookings`}>
                <div className="hour-label">{h.hour}</div>
                <div className="hour-bar-bg">
                  <div className="hour-bar-fill" style={{ height: `${h.percent}%`, minHeight: h.count > 0 ? '4px' : '0' }}></div>
                </div>
                <div className="hour-count">{h.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}