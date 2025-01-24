import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./OperatorsDashboard.css";
import Header from "./Header";

const OperatorsDashboard = () => {
  const [constants, setConstants] = useState({});
  const [data, setData] = useState([]);
  const [stakeInfo, setStakeInfo] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Fetch constants
  useEffect(() => {
    fetch("https://walrus.brightlystake.com/api/walrus-constants")
      .then((res) => res.json())
      .then((data) => setConstants(data))
      .catch((err) => console.error("Failed to fetch constants", err));
  }, []);

  // Fetch data
  useEffect(() => {
    fetch("https://walrus.brightlystake.com/api/get_latest_values")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Failed to fetch data", err));
  }, []);

  // // Fetch stake info
  // useEffect(() => {
  //   fetch("https://walrus.brightlystake.com/api/stake-info")
  //     .then((res) => res.json())
  //     .then((data) => setStakeInfo(data))
  //     .catch((err) => console.error("Failed to fetch stake info", err));
  // }, []);

  // Map stake information to the data rows
  const mapStakeToData = (endpoint) => {
    const matchingStake = stakeInfo.find(
      (stake) => stake.networkaddress === endpoint
    );
    if (matchingStake && matchingStake.stake) {
      // Convert stake to the formatted number
      return (matchingStake.stake / 10 ** 10).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return "N/A";
  };

  // Filter and sort data based on search
  const filteredData = data.filter((item) => {
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    );
  });

  // Extract timestamp from the first row (if data exists)
  const lastUpdatedTimestamp = data.length > 0 ? data[0].timestamp : "N/A";

  // Handle row click
  const handleRowClick = (row) => {
    navigate(`/operator-stats/${row.endpoint}`, {
      state: { operatorData: row },
    });
  };

  return (
    <div className="OperatorsDashboard-container">
      <Header />

      <div className="constants-container">
        {Object.entries(constants)
          .filter(([key]) => key !== "time" && key !== "id") // Filter out 'time' and 'id'
          .map(([key, value]) => (
            <div key={key} className="constant-box">
              <h4>{key.toUpperCase()}</h4>
              <p>{value}</p>
            </div>
          ))}
      </div>

      <h2 className="OperatorsDashboard-title">Walrus Operator Dashboard</h2>
      <p className="last-updated">Last updated on: {lastUpdatedTimestamp}</p>

      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-box"
      />

      <table className="data-table">
        <thead>
          <tr>
            {Object.keys(data[0] || {})
              .filter(
                (key) =>
                  key !== "id" && key !== "uptime_secs" && key !== "timestamp"
              )
              .map((key, index) => (
                <th key={index} className="table-header">
                  {key}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => {
            const hasNAValue = Object.values(row).some(
              (val) => String(val) === "NA"
            );
            const isNodeStatusInactive = row.node_status !== "Active";
            const isEventPending = row.event_pending > 0;
            const rowStyle = isNodeStatusInactive
              ? "row-red"
              : hasNAValue || isEventPending
              ? "row-light-yellow"
              : "";

            return (
              <tr
                key={row.id}
                className={`table-row ${rowStyle}`}
                onClick={() => handleRowClick(row)}
              >
                {Object.entries(row)
                  .filter(
                    ([key]) =>
                      key !== "id" &&
                      key !== "uptime_secs" &&
                      key !== "timestamp"
                  )
                  .map(([key, value]) => (
                    <td key={key} className="table-cell">
                      {value}
                    </td>
                  ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OperatorsDashboard;
