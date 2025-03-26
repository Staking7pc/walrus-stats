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
          "https://walrus-stats.brightlystake.com/api/shard-info"
        );
        const result = await response.json();
        const sortedData = result.sort(
          (a, b) => Number(a.shardid) - Number(b.shardid)
        );
        setData(sortedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const getColor = (owners) => {
    if (owners === 1) return "#99efe4";
    if (owners === 2) return "#FFF176";
    if (owners === 3) return "#81C784";
    if (owners === 4) return "#64B5F6";
    return "#BA68C8";
  };

  const formatDate = (datetime) => {
    return new Date(datetime).toLocaleDateString();
  };

  const handleSearch = (shardIdToFind) => {
    if (!shardIdToFind) {
      setSearchResult({ error: "Please enter a valid Shard ID!" });
      return;
    }

    const result = data.find((item) => String(item.shardid) === shardIdToFind);

    setSearchResult(result || { error: "Shard not found!" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBlockClick = (shardId) => {
    setSearchInput(shardId);
    handleSearch(shardId);
  };

  const blocks = Array.from({ length: 1000 }, (_, index) => {
    const item = data[index % data.length];
    const owners = item?.owners || 0;

    return (
      <div
        key={index}
        className="block"
        style={{ backgroundColor: getColor(owners) }}
        onMouseEnter={() => setHoverInfo(item)}
        onMouseLeave={() => setHoverInfo(null)}
        onClick={() => handleBlockClick(String(item.shardid))}
      >
        {item && <span className="block-text">{item.shardid}</span>}
      </div>
    );
  });

  const getShardsForNetwork = (networkAddress) => {
    return data
      .filter((item) => item.networkaddress === networkAddress)
      .map((item) => item.shardid);
  };

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

              <h3>Shards Held by This Operator</h3>
              <div className="operator-shards">
                {getShardsForNetwork(searchResult.networkaddress).map(
                  (shardId) => (
                    <span key={shardId} className="shard-badge">
                      {shardId}
                    </span>
                  )
                )}
              </div>

              <h3>Historic Operators Timeline</h3>
              <VerticalTimeline lineColor="#007bff" layout="1-column-left">
                {searchResult.network_address_intervals
                  .sort(
                    (a, b) => new Date(b.start_time) - new Date(a.start_time)
                  )
                  .map((interval, index) => (
                    <VerticalTimelineElement
                      key={index}
                      className="vertical-timeline-element"
                      contentStyle={{
                        background: "#f3f3f3",
                        boxShadow: "none",
                        border: "1px solid #d4d4d4",
                        borderRadius: "8px",
                        padding: "15px",
                      }}
                      contentArrowStyle={{ display: "none" }}
                      date={`${formatDate(interval.start_time)} - ${formatDate(
                        interval.end_time
                      )}`}
                      iconStyle={{
                        background: "#007bff",
                        color: "#fff",
                        width: "24px",
                        height: "24px",
                        marginLeft: "-12px",
                      }}
                      icon={<MdOutlineStorage />}
                    >
                      <h4 className="vertical-timeline-element-title">
                        Operator:
                      </h4>
                      <p className="vertical-timeline-element-subtitle">
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
                <strong>Time:</strong> {formatDate(interval.start_time)} -{" "}
                {formatDate(interval.end_time)} <br />
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
