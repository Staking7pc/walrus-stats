import React from "react";
import "./Header.css";

export default function Header() {
  return (
    <header className="header-nav">
      <ul>
        {/* "Brand" or logo link on the far left */}
        <li className="brand">
          <a href="https://brightlystake.com">Brightlystake</a>
        </li>
        {/* Nav links (float-like behavior handled by flexbox) */}
        <li>
          <a className="active" href="/">
            Home
          </a>
        </li>
      </ul>
    </header>
  );
}
