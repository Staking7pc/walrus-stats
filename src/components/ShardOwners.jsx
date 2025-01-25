import React, { useState, useEffect } from "react";
import "./ShardOwners.css";
import Header from "./Header";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { MdOutlineStorage } from "react-icons/md";

const ShardOwners = () => {
  const [data, setData] = useState([]);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://walrus.brightlystake.com/api/shard-info"
        );
        const result = await response.json();
        const sortedData = result.sort((a, b) => Number(a.shardid) - Number(b.shardid));
        setData(sortedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const getColor = (owners) => {
    if (owners === 1) return "#99efe4"; // Soft Pink
    if (owners === 2) return "#FFF176"; // Soft Yellow
    if (owners === 3) return "#81C784"; // Soft Green
    if (owners === 4) return "#64B5F6"; // Soft Blue
    return "#BA68C8"; // Soft Purple for 5+
  };

  const formatDate = (datetime) => {
    return new Date(datetime).toLocaleDateString(); // Converts to date-only format
  };

  const handleSearch = (shardIdToFind) => {
    if (!shardIdToFind) {
      setSearchResult({ error: "Please enter a valid Shard ID!" });
      return;
    }

    const result = data.find((item) => String(item.shardid) === shardIdToFind);

    setSearchResult(result || { error: "Shard not found!" });

    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBlockClick = (shardId) => {
    // Automatically update the search box and perform the search
    setSearchInput(shardId);
    handleSearch(shardId);
  };

  const blocks = Array.from({ length: 1000 }, (_, index) => {
    const item = data[index % data.length]; // Repeat data if less than 1000 entries
    const owners = item?.owners || 0;

    return (
      <div
        key={index}
        className="block"
        style={{ backgroundColor: getColor(owners) }}
        onMouseEnter={() => setHoverInfo(item)}
        onMouseLeave={() => setHoverInfo(null)}
        onClick={() => handleBlockClick(String(item.shardid))} // Click handler
      >
        {item && <span className="block-text">{item.shardid}</span>}
      </div>
    );
  });

  return (
    <div className="shard-owners-container">
      <Header />
      <h1>Shard Details</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Enter Shard ID"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button onClick={() => handleSearch(searchInput)}>Search</button>
      </div>

      {searchResult && (
        <div className="search-result">
          {searchResult.error ? (
            <p>{searchResult.error}</p>
          ) : (
            <>
              <h2>Shard Details</h2>
              <p>
                <strong>Shard ID:</strong> {searchResult.shardid}
              </p>
              <p>
                <strong>Current Operator:</strong> {searchResult.networkaddress}
              </p>
              <p>
                <strong>Operator's Shards:</strong> {searchResult.nshards}
              </p>
              <h3>Historic Operators Timeline</h3>
              <VerticalTimeline lineColor="#007bff">
                {searchResult.network_address_intervals.map((interval, index) => (
                  <VerticalTimelineElement
                    key={index}
                    date={`${formatDate(interval.start_time)} - ${formatDate(interval.end_time)}`}
                    iconStyle={{
                      background: "#007bff",
                      color: "#fff",
                      width: "30px",
                      height: "30px", // Adjusted icon size
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "16px", // Adjusted font size
                    }}
                    contentStyle={{
                      background: "white",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                      borderLeft: "3px solid #007bff",
                    }}
                    contentArrowStyle={{ borderRight: "7px solid #007bff" }}
                  >
                    <h4
                      className="vertical-timeline-element-title"
                      style={{ marginBottom: "10px", color: "#333", fontSize: "16px" }}
                    >
                      Operator:
                    </h4>
                    <p style={{ margin: 0, color: "#555", fontSize: "14px" }}>
                      {interval.networkaddress}
                    </p>
                  </VerticalTimelineElement>
                ))}
              </VerticalTimeline>
            </>
          )}
        </div>
      )}

      <div className="blocks-grid">{blocks}</div>

      {hoverInfo && (
        <div className="hover-info">
          <p>
            <strong>Shard ID:</strong> {hoverInfo.shardid}
          </p>
          <p>
            <strong>Network Address:</strong> {hoverInfo.networkaddress}
          </p>
          <h3>Historic Operators</h3>
          <ul>
            {hoverInfo.network_address_intervals.map((interval, index) => (
              <li key={index}>
                <strong>Time:</strong> {formatDate(interval.start_time)} - {formatDate(interval.end_time)} <br />
                <strong>Network Address:</strong> {interval.networkaddress}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ShardOwners;
