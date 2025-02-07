import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

import Header from './Header';
import './ShardHealth.css'; // <-- Our own CSS, similar approach to OperatorStats.css

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ShardHealth() {
  const [shardData, setShardData] = useState([]);
  const [selectedRange, setSelectedRange] = useState('1D');

  // Fetch data once
  useEffect(() => {
    fetch('https://walrus.brightlystake.com/api/shard-health')
      .then((res) => res.json())
      .then((data) => {
        data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setShardData(data);
      })
      .catch((err) => console.error('Error fetching shard data:', err));
  }, []);

  // Filter data based on selected range
  const now = new Date();
  const filteredData = shardData.filter((item) => {
    const itemTime = new Date(item.timestamp);
    switch (selectedRange) {
      case '1D':
        // Last 24 hours
        return now - itemTime <= 24 * 60 * 60 * 1000;
      case '5D':
        // Last 5 days
        return now - itemTime <= 5 * 24 * 60 * 60 * 1000;
      case '10D':
        // Last 10 days
        return now - itemTime <= 10 * 24 * 60 * 60 * 1000;
      case '1M':
        // Last 30 days
        return now - itemTime <= 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  });

  // X-axis labels (date only)
  const labels = filteredData.map((item) =>
    new Date(item.timestamp).toLocaleDateString()
  );

  // Shard data arrays
  const redShards = filteredData.map((d) => d.redshards);
  const greenShards = filteredData.map((d) => d.greenshards);
  const yellowShards = filteredData.map((d) => d.yellowshards);

  // Threshold line at 667
  const thresholdData = filteredData.map(() => 667);

  // Chart.js data
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Red Shards',
        data: redShards,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
      {
        label: 'Green Shards',
        data: greenShards,
        borderColor: 'rgba(40, 167, 69, 0.8)',
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
        fill: true,
      },
      {
        label: 'Yellow Shards',
        data: yellowShards,
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        fill: true,
      },
      {
        label: 'Threshold',
        data: thresholdData,
        borderColor: 'rgba(0,0,0,0.6)',
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0,
        tension: 0,
      },
    ],
  };

  // Chart.js options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Let it fill the container
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 5,
        },
      },
      y: {
        grid: { display: false },
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Shards',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Shard Health Over Time',
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            // Show full date/time in tooltip
            const idx = tooltipItems[0].dataIndex;
            const item = filteredData[idx];
            return new Date(item.timestamp).toLocaleString();
          },
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  // Helper to mark active button
  const getButtonClass = (range) => {
    return selectedRange === range
      ? 'ShardHealth-button ShardHealth-button-active'
      : 'ShardHealth-button';
  };

  return (
    <div className="ShardHealth-wrapper">
      <Header />

      <div className="ShardHealth-container">
        <h2 className="ShardHealth-title">Shard Health</h2>

        {/* Time-range buttons */}
        <div className="ShardHealth-timeRange">
          <button className={getButtonClass('1D')} onClick={() => setSelectedRange('1D')}>
            1 Day
          </button>
          <button className={getButtonClass('5D')} onClick={() => setSelectedRange('5D')}>
            5 Day
          </button>
          <button className={getButtonClass('10D')} onClick={() => setSelectedRange('10D')}>
            10 Day
          </button>
          <button className={getButtonClass('1M')} onClick={() => setSelectedRange('1M')}>
            1 Month
          </button>
        </div>

        {/* Chart container (fixed height for consistent layout) */}
        <div className="ShardHealth-chart">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Explanation Section */}
        <div className="ShardHealth-explanation">
          <h3 className="ShardHealth-explanation-title">Shard Color Logic</h3>
          <p>
            <strong style={{ color: 'red' }}>Red Shards</strong>: Critical! Shard
            is non-responsive or needs immediate attention.
          </p>
          <p>
            <strong style={{ color: 'orange' }}>Amber (Yellow) Shards</strong>:
            Warning! Possibly degraded state. Condition: node_status = "Active"
            AND event_pending over 2000.
          </p>
          <p>
            <strong style={{ color: 'green' }}>Green Shards</strong>: All good!
            The shard is healthy, fully operational (node_status = "Active" AND
            event_pending Less than 2000).
          </p>
        </div>
      </div>
    </div>
  );
}

export default ShardHealth;
