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
import './ShardHealth.css'; // Plain CSS, similar in approach to OperatorStats.css

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
    fetch('https://walrus.brightlystake.com/api/shard-health-v2')
      .then((res) => res.json())
      .then((data) => {
        // Sort by ascending timestamp
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
        return now - itemTime <= 24 * 60 * 60 * 1000;
      case '5D':
        return now - itemTime <= 5 * 24 * 60 * 60 * 1000;
      case '10D':
        return now - itemTime <= 10 * 24 * 60 * 60 * 1000;
      case '1M':
        return now - itemTime <= 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  });

  // X-axis labels (date only)
  const labels = filteredData.map((item) =>
    new Date(item.timestamp).toLocaleDateString()
  );

  // ------------------------------------------------
  // TOP CHART: Node States Over Time
  // ------------------------------------------------
  const activeCounts = filteredData.map((d) => d.active_count);
  const naCounts = filteredData.map((d) => d.na_count);
  const recoverMetadataCounts = filteredData.map((d) => d.recovermetadata_count);
  const recoveryCatchupCounts = filteredData.map((d) => d.recoverycatchup_count);
  const recoveryInProgressCounts = filteredData.map((d) => d.recoveryinprogress_count);
  const standbyCounts = filteredData.map((d) => d.standby_count);

  const nodeStatesChartData = {
    labels,
    datasets: [
      {
        label: 'Active',
        data: activeCounts,
        borderColor: 'rgba(40, 167, 69, 0.8)', // green-ish
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
        fill: false,
      },
      {
        label: 'NA',
        data: naCounts,
        borderColor: 'rgba(108, 117, 125, 0.8)', // grayish
        backgroundColor: 'rgba(108, 117, 125, 0.2)',
        fill: false,
      },
      {
        label: 'Recovering Metadata',
        data: recoverMetadataCounts,
        borderColor: 'rgba(255, 99, 132, 0.8)', // pinkish
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
      },
      {
        label: 'Recovery Catchup',
        data: recoveryCatchupCounts,
        borderColor: 'rgba(255, 159, 64, 0.8)', // orange
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        fill: false,
      },
      {
        label: 'Recovery In Progress',
        data: recoveryInProgressCounts,
        borderColor: 'rgba(54, 162, 235, 0.8)', // bluish
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: false,
      },
      {
        label: 'Standby',
        data: standbyCounts,
        borderColor: 'rgba(153, 102, 255, 0.8)', // purple
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: false,
      },
    ],
  };

  // ------------------------------------------------
  // BOTTOM CHART: Shard Health Over Time
  // ------------------------------------------------
  const redShards = filteredData.map((d) => d.redshards);
  const greenShards = filteredData.map((d) => d.greenshards);
  const yellowShards = filteredData.map((d) => d.yellowshards);
  const thresholdData = filteredData.map(() => 667);

  const shardChartData = {
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
        borderColor: 'rgba(40, 167, 69, 1)',
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

  // Common chart options (title changes below)
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // fill container
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
          text: 'Count',
        },
      },
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const idx = tooltipItems[0].dataIndex;
            const item = filteredData[idx];
            // Show full date/time in tooltip
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

  // Modify top chart title
  const nodeStatesOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: true,
        text: 'Node States Over Time',
      },
    },
  };

  // Modify bottom chart title
  const shardChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: true,
        text: 'Shard Health Over Time',
      },
    },
  };

  // Helper to highlight active button
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

        {/* Time-range buttons (control BOTH charts) */}
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

        {/* 1) Node States Chart (Top) */}
        <div className="ShardHealth-chart">
          <Line data={nodeStatesChartData} options={nodeStatesOptions} />
        </div>

        {/* 2) Shard Health Chart (Bottom) */}
        <div className="ShardHealth-chart">
          <Line data={shardChartData} options={shardChartOptions} />
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
            event_pending &lt; 2000).
          </p>
        </div>
      </div>
    </div>
  );
}

export default ShardHealth;
