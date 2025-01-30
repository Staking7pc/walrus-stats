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
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(144);

  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, value: '', time: '' });

  useEffect(() => {
    const fetchHistoricData = async () => {
      try {
        const endpoint = operatorData?.endpoint || id;
        const response = await fetch(
          `https://walrus.brightlystake.com/api/operator-historic-stats?x=${endpoint}`
        );
        const data = await response.json();
        const reversedData = data.reverse();
        setHistoricData(reversedData);
        setFilteredData(reversedData.slice(-timeRange));
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch historic data:', err);
        setError('Failed to fetch historic data');
        setLoading(false);
      }
    };

    fetchHistoricData();
  }, [id, operatorData, timeRange]);

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

  const ownedData = filteredData.map((record) => record.owned);
  const shardReadyData = filteredData.map((record) => record.shard_ready);
  const timestamps = filteredData.map((record) => record.timestamp);

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

  return (
    <div className="OperatorStats-wrapper">
      <div className="OperatorStats-container">
        <Header/>
        <h3 className="OperatorStats-title">Historic Stats for {operatorData?.endpoint}</h3>

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
              {filteredData.map((record, index) => (
                <div
                  key={index}
                  className={`OperatorStats-block ${
                    record.node_status === 'Active' ? 'green' :
                      record.node_status === 'NA' ? 'grey' : 'red'
                  }`}
                  onMouseEnter={(e) => handleMouseEnter(e, record.node_status, record.timestamp)}
                  onMouseLeave={handleMouseLeave}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Event Pending */}
        <div className="OperatorStats-section">
          <h2>Event Pending</h2>
          <div className="OperatorStats-blocks-scrollable">
            <div className="OperatorStats-blocks-container">
              {filteredData.map((record, index) => {
                let color = 'green';
                if (record.event_pending === 'NA') color = 'grey';
                else if (record.event_pending > 200) color = 'red';
                else if (record.event_pending > 0) color = 'yellow';

                return (
                  <div
                    key={index}
                    className={`OperatorStats-block ${color}`}
                    onMouseEnter={(e) => handleMouseEnter(e, record.event_pending, record.timestamp)}
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
