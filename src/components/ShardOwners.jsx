import React, { useState, useEffect } from "react";
import "./ShardOwners.css";
import Header from './Header';

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

  // Define color mappings with improved palette
  const getColor = (owners) => {
    if (owners === 1) return "#FFCDD2"; // Soft Pink
    if (owners === 2) return "#FFF176"; // Soft Yellow
    if (owners === 3) return "#81C784"; // Soft Green
    if (owners === 4) return "#64B5F6"; // Soft Blue
    return "#BA68C8"; // Soft Purple for 5+
  };

  const handleSearch = () => {
    const shardIdToFind = searchInput.trim();

    if (!shardIdToFind) {
      setSearchResult({ error: "Please enter a valid Shard ID!" });
      return;
    }

    const result = data.find((item) => String(item.shardid) === shardIdToFind);

    setSearchResult(result || { error: "Shard not found!" });
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
      >
        {item && <span className="block-text">{item.shardid}</span>}
      </div>
    );
  });

  return (
    <div className="shard-owners-container">
      <Header/>
      <h1>Shard Details</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Enter Shard ID"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {searchResult && (
        <div className="search-result">
          {searchResult.error ? (
            <p>{searchResult.error}</p>
          ) : (
            <>
              <h2>Shard Details</h2>
              <p><strong>Shard ID:</strong> {searchResult.shardid}</p>
              <p><strong>Current Operator:</strong> {searchResult.networkaddress}</p>
              <p><strong>Operator's Shards:</strong> {searchResult.nshards}</p>
              <h3>Historic Operators list</h3>
              <ul>
                {searchResult.network_address_intervals.map((interval, index) => (
                  <li key={index}>
                    <strong>Time:</strong> {interval.start_time} - {interval.end_time} <br />
                    <strong>Operator:</strong> {interval.networkaddress}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
{/* 
      <div className="legend">
        <span style={{ backgroundColor: "#FFCDD2" }}>1 Owner</span>
        <span style={{ backgroundColor: "#FFF176" }}>2 Owners</span>
        <span style={{ backgroundColor: "#81C784" }}>3 Owners</span>
        <span style={{ backgroundColor: "#64B5F6" }}>4 Owners</span>
        <span style={{ backgroundColor: "#BA68C8" }}>5+ Owners</span>
      </div> */}

      <div className="blocks-grid">{blocks}</div>

      {hoverInfo && (
        <div className="hover-info">
          <p><strong>Shard ID:</strong> {hoverInfo.shardid}</p>
          <p><strong>Network Address:</strong> {hoverInfo.networkaddress}</p>
          <h3>Historic Operators</h3>
          <ul>
            {hoverInfo.network_address_intervals.map((interval, index) => (
              <li key={index}>
                <strong>Time:</strong> {interval.start_time} - {interval.end_time} <br />
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
