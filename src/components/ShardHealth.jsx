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

  useEffect(() => {
    fetch("https://walrus.brightlystake.com/api/shard-health")
      .then((res) => res.json())
      .then((data) => {
        data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setShardData(data);
      })
      .catch((err) => console.error("Error fetching shard data:", err));
  }, []);

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

  // We'll still use an index-based label for the x-axis,
  // but hide it from display and use the real date in the tooltip.
  const labels = filteredData.map((_, i) => i + 1);

  const redShards = filteredData.map((d) => d.redshards);
  const greenShards = filteredData.map((d) => d.greenshards);
  const yellowShards = filteredData.map((d) => d.yellowshards);

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
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        grid: { display: false },
        ticks: { display: false }
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
      title: {
        display: true,
        text: "Shard Health Over Time"
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            // we only need the first item to get the data index
            const index = tooltipItems[0].dataIndex;
            const item = filteredData[index];
            // Return a friendly date string
            return new Date(item.timestamp).toLocaleString();
          },
          label: (context) => {
            // e.g. "Red Shards: 94"
            const label = context.dataset.label || "";
            const value = context.parsed.y || 0;
            return `${label}: ${value}`;
          }
        }
      }
    }
  };

  return (
    <div className="w-full bg-base-100 min-h-screen">
      <Header />

      <div className="max-w-5xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Shard Health</h2>
          <div className="btn-group">
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
        </div>

        <div style={{ width: "75%", margin: "0 auto" }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default ShardHealth;
