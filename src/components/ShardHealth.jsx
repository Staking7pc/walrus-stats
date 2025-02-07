// ShardHealth.jsx

import React, { useEffect, useState } from "react";
import Header from "./Header";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

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
  const [selectedRange, setSelectedRange] = useState("1D");

  // Fetch data once on mount
  useEffect(() => {
    fetch("https://walrus.brightlystake.com/api/shard-health")
      .then((res) => res.json())
      .then((data) => {
        // Sort by ascending timestamp
        data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setShardData(data);
      })
      .catch((err) => console.error("Error fetching shard data:", err));
  }, []);

  // Filter data based on selected range
  const now = new Date();
  const filteredData = shardData.filter((item) => {
    const itemTime = new Date(item.timestamp);
    switch (selectedRange) {
      case "1D":
        return now - itemTime <= 24 * 60 * 60 * 1000;
      case "5D":
        return now - itemTime <= 5 * 24 * 60 * 60 * 1000;
      case "10D":
        return now - itemTime <= 10 * 24 * 60 * 60 * 1000;
      case "1M":
        return now - itemTime <= 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  });

  // X-axis labels as short dates
  const labels = filteredData.map((item) =>
    new Date(item.timestamp).toLocaleDateString()
  );

  // Shard values
  const redShards = filteredData.map((d) => d.redshards);
  const greenShards = filteredData.map((d) => d.greenshards);
  const yellowShards = filteredData.map((d) => d.yellowshards);

  // Threshold line at y=667
  const thresholdData = filteredData.map(() => 667);

  // Prepare chart datasets
  const chartData = {
    labels,
    datasets: [
      {
        label: "Red Shards",
        data: redShards,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true
      },
      {
        label: "Green Shards",
        data: greenShards,
        borderColor: "rgba(34,197,94,1)",
        backgroundColor: "rgba(34,197,94,0.2)",
        fill: true
      },
      {
        label: "Yellow Shards",
        data: yellowShards,
        borderColor: "rgba(255,206,86,1)",
        backgroundColor: "rgba(255,206,86,0.2)",
        fill: true
      },
      {
        label: "Threshold",
        data: thresholdData,
        borderColor: "rgba(0,0,0,0.6)",
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0,
        tension: 0
      }
    ]
  };

  // Chart display options
  const chartOptions = {
    responsive: true,
    // Let the chart resize to its container's height
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 5
        }
      },
      y: {
        grid: { display: false },
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Shards"
        }
      }
    },
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Shard Health Over Time" },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const idx = tooltipItems[0].dataIndex;
            const item = filteredData[idx];
            // Show full date/time on hover
            return new Date(item.timestamp).toLocaleString();
          },
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y || 0;
            return `${label}: ${value}`;
          }
        }
      }
    }
  };

  return (
    <div className="w-full bg-base-100">
      <Header />

      {/* 
        Constrain width to match the rest of the application (e.g. max-w-5xl).
        "mx-auto" centers it, "p-4" gives padding.
      */}
      <div className="max-w-5xl mx-auto p-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Shard Health</h2>

        {/* Time-range button group */}
        <div className="btn-group mb-6">
          <button
            className={`btn btn-sm ${
              selectedRange === "1D" ? "btn-active" : ""
            }`}
            onClick={() => setSelectedRange("1D")}
          >
            1 Day
          </button>
          <button
            className={`btn btn-sm ${
              selectedRange === "5D" ? "btn-active" : ""
            }`}
            onClick={() => setSelectedRange("5D")}
          >
            5 Day
          </button>
          <button
            className={`btn btn-sm ${
              selectedRange === "10D" ? "btn-active" : ""
            }`}
            onClick={() => setSelectedRange("10D")}
          >
            10 Day
          </button>
          <button
            className={`btn btn-sm ${
              selectedRange === "1M" ? "btn-active" : ""
            }`}
            onClick={() => setSelectedRange("1M")}
          >
            1 Month
          </button>
        </div>

        {/* Chart container with a fixed height so it doesn't expand full screen */}
        <div className="w-full" style={{ height: "400px"}}>
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Explanation Section */}
        <div className="mt-8 p-4 bg-base-200 rounded text-center w-full">
          <h3 className="text-lg font-semibold mb-2">Shard Color Logic</h3>
          <p className="mb-2">
            <strong className="text-red-600">Red Shards</strong>: Indicates a
            critical state where the shard is non-responsive or needs immediate
            attention.
          </p>
          <p className="mb-2">
            <strong className="text-yellow-600">Amber (Yellow) Shards</strong>:
            Suggests a warning or partially degraded state. The shard may be
            slow or at risk.
          </p>
          <p className="mb-2">
            <strong className="text-green-600">Green Shards</strong>: All good!
            The shard is healthy, fully operational, and no immediate issues
            detected.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ShardHealth;
