import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import OperatorsDashboard from './components/OperatorsDashboard';
import OperatorStats from "./components/OperatorStats";
import ShardOwners from "./components/ShardOwners";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import BlobSearch from './components/BlobSearch';
import ShardHealth from './components/ShardHealth';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <React.Fragment>
      <Routes>
        <Route path="/" element={<OperatorsDashboard/>} />
        <Route path="/operators-dashboard" element={<OperatorsDashboard/>} />
        <Route path="/operator-stats/:endpoint" element={<OperatorStats/>} />
        <Route path="/shard-owners" element={<ShardOwners/>} />
        <Route path="/blob-search" element={<BlobSearch/>} />
        <Route path="/shard-health" element={<ShardHealth/>} />
      </Routes>
    </React.Fragment>
  </Router>

);
