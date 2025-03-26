import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  Filler,
} from 'chart.js';
import './OperatorStats.css';
import Header from "./Header";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Filler);

const OperatorStats = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const [operatorData, setOperatorData] = useState(state?.operatorData || null);
  const [historicData, setHistoricData] = useState([]);
  // filteredData is for blocks (displayed in descending order)
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(144);

  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, value: '', time: '' });
  const [showGreen, setShowGreen] = useState(true);

  useEffect(() => {
    const fetchHistoricData = async () => {
      try {
        const endpoint = operatorData?.endpoint || id;
        const response = await fetch(
          `https://walrus-stats.brightlystake.com/api/operator-historic-stats?x=${endpoint}`
        );
        const data = await response.json();

        // Sort the data in descending order (reverse chronological order)
        const sortedDataDesc = data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        setHistoricData(sortedDataDesc);
        // For blocks, we take the latest 'timeRange' records (which are at the beginning)
        setFilteredData(sortedDataDesc.slice(0, timeRange));
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch historic data:', err);
        setError('Failed to fetch historic data');
        setLoading(false);
      }
    };

    fetchHistoricData();
  }, [id, operatorData, timeRange]);

  // Update filteredData when timeRange or historicData changes
  useEffect(() => {
    setFilteredData(historicData.slice(0, timeRange));
  }, [timeRange, historicData]);

  const handleMouseEnter = (e, value, timestamp) => {
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY - 10,
      value,
      time: timestamp,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, value: '', time: '' });
  };

  if (loading) return <div className="OperatorStats-loader">Loading...</div>;
  if (error) return <div className="OperatorStats-error-message">{error}</div>;

  // For the graph we want chronological order (oldest first)
  const graphDataChronological = [...filteredData].reverse();
  const ownedData = graphDataChronological.map((record) => record.owned);
  const shardReadyData = graphDataChronological.map((record) => record.shard_ready);
  const timestamps = graphDataChronological.map((record) => record.timestamp);

  const graphData = {
    labels: timestamps,
    datasets: [
      {
        label: 'Owned',
        data: ownedData,
        borderColor: 'rgba(0, 123, 255, 0.6)',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        fill: false,
      },
      {
        label: 'Shard Ready',
        data: shardReadyData,
        borderColor: 'rgba(40, 167, 69, 0.6)',
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
        fill: false,
      },
    ],
  };

  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const date = new Date(timestamps[index]);
            return `Time: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
          },
        },
      },
    },
    scales: {
      x: { display: false },
      y: { title: { display: true, text: 'Values' } },
    },
  };

  const getNodeStatusColor = (status) => {
    if (status === 'Active') return 'green';
    if (status === 'NA') return 'grey';
    return 'red';
  };

  const getEventPendingColor = (eventPendingValue) => {
    if (eventPendingValue === 'NA') return 'grey';
    if (eventPendingValue > 200) return 'red';
    if (eventPendingValue > 0) return 'yellow';
    return 'green';
  };

  return (
    <div className="OperatorStats-wrapper">
      <div className="OperatorStats-container">
        <Header />
        <h3 className="OperatorStats-title">
          Historic Stats for {operatorData?.endpoint}
        </h3>

        {/* Time Range + Toggle Controls */}
        <div className="OperatorStats-controls">
          <div className="OperatorStats-time-range-selector">
            <label htmlFor="timeRange">Select Time Range: </label>
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
            >
              <option value={144}>1 Day</option>
              <option value={288}>2 Days</option>
              <option value={720}>5 Days</option>
              <option value={4320}>1 Month</option>
            </select>
          </div>

          <div className="OperatorStats-toggle-green">
            <button onClick={() => setShowGreen((prev) => !prev)}>
              {showGreen ? 'Hide Green Boxes' : 'Show Green Boxes'}
            </button>
          </div>
        </div>

        {tooltip.visible && (
          <div
            className="OperatorStats-tooltip"
            style={{ top: `${tooltip.y}px`, left: `${tooltip.x}px` }}
          >
            <p>Value: {tooltip.value}</p>
            <p>Time: {tooltip.time}</p>
          </div>
        )}

        {/* Operator Status */}
        <div className="OperatorStats-section">
          <h2>Operator Status</h2>
          <div className="OperatorStats-blocks-scrollable">
            <div className="OperatorStats-blocks-container">
              {filteredData
                .filter((record) => {
                  const color = getNodeStatusColor(record.node_status);
                  if (!showGreen && color === 'green') return false;
                  return true;
                })
                .map((record, index) => {
                  const color = getNodeStatusColor(record.node_status);
                  return (
                    <div
                      key={index}
                      className={`OperatorStats-block ${color}`}
                      onMouseEnter={(e) =>
                        handleMouseEnter(e, record.node_status, record.timestamp)
                      }
                      onMouseLeave={handleMouseLeave}
                    ></div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Event Pending */}
        <div className="OperatorStats-section">
          <h2>Event Pending</h2>
          <div className="OperatorStats-blocks-scrollable">
            <div className="OperatorStats-blocks-container">
              {filteredData
                .filter((record) => {
                  const color = getEventPendingColor(record.event_pending);
                  if (!showGreen && color === 'green') return false;
                  return true;
                })
                .map((record, index) => {
                  const color = getEventPendingColor(record.event_pending);
                  return (
                    <div
                      key={index}
                      className={`OperatorStats-block ${color}`}
                      onMouseEnter={(e) =>
                        handleMouseEnter(e, record.event_pending, record.timestamp)
                      }
                      onMouseLeave={handleMouseLeave}
                    ></div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Shards - Owned/Ready */}
        <div className="OperatorStats-section">
          <h2>Shards - Owned/Ready</h2>
          <div className="OperatorStats-graph-container">
            <Line data={graphData} options={graphOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorStats;
