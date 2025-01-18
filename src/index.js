import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import OperatorsDashboard from './components/OperatorsDashboard';
import OperatorStats from "./components/OperatorStats";
import Blobs from "./components/Blobs";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <React.Fragment>
      <Routes>
        <Route path="/" element={<OperatorsDashboard/>} />
        <Route path="/operators-dashboard" element={<OperatorsDashboard/>} />
        <Route path="/operator-stats/:endpoint" element={<OperatorStats/>} />
        <Route path="/blobs" element={<Blobs/>} />
      </Routes>
    </React.Fragment>
  </Router>

);
