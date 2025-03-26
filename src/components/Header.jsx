import React, { useState, useEffect, useRef } from "react";
import "./Header.css";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);

  const currentHost = window.location.hostname;
  const isMainnet = currentHost === "walrus-stats.brightlystake.com";
  const isTestnet = currentHost === "walrus-stats-testnet.brightlystake.com";

  const handleNetworkSwitch = (target) => {
    const urls = {
      mainnet: "https://walrus-stats.brightlystake.com",
      testnet: "https://walrus-stats-testnet.brightlystake.com",
    };
    const current = isMainnet ? "mainnet" : "testnet";
    if (target === current) {
      setDropdownOpen(false);
      return;
    }

    // Optional: delay for dropdown to close before redirect
    setTimeout(() => {
      window.location.href = urls[target];
    }, 100);
  };

  useEffect(() => {
    const updateSize = () => {
      setIsMobile(window.innerWidth < 600);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header-nav">
      <ul>
        <li className="brand">
          <a href="https://brightlystake.com">Brightlystake</a>
        </li>
        <li><a className="active" href="/">Operators</a></li>
        <li><a className="active" href="/shard-owners">Shards</a></li>
        <li><a className="active" href="/shard-health">Health</a></li>
        <li className="network-dropdown" ref={dropdownRef}>
          <button className="network-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span className="dot" />
            {!isMobile && (isMainnet ? "Mainnet" : "Testnet")}
            <span className="arrow">{dropdownOpen ? "▲" : "▼"}</span>
          </button>
        </li>
      </ul>

      {/* Move dropdown OUTSIDE the scroll area */}
      {dropdownOpen && (
        <div className="dropdown-menu" ref={dropdownRef}>
          <div
            className={`dropdown-item ${isMainnet ? "active" : ""}`}
            onClick={() => handleNetworkSwitch("mainnet")}
          >
            <div>
              <strong>Mainnet</strong>
              <div className="subtext">
                {isMainnet ? "Current Network" : "Click to Switch"}
              </div>
            </div>
            {isMainnet && <span className="checkmark">✔</span>}
          </div>
          <div
            className={`dropdown-item ${isTestnet ? "active" : ""}`}
            onClick={() => handleNetworkSwitch("testnet")}
          >
            <div>
              <strong>Testnet</strong>
              <div className="subtext">
                {isTestnet ? "Current Network" : "Click to Switch"}
              </div>
            </div>
            {isTestnet && <span className="checkmark">✔</span>}
          </div>
        </div>
      )}
    </header>
  );
}
