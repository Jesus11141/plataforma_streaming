import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Channels from './pages/Channels';
import Radio from './pages/Radio';
import ChannelPlayer from './pages/ChannelPlayer';
import AdminPanel from './pages/admin/AdminPanel';
import AddChannel from './pages/admin/AddChannel';
import ImportM3U from './pages/admin/ImportM3U';
import './App.css';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App bg-stream-dark min-h-screen text-white font-sans">
        <Navbar />
        <div className="pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/channels" element={<Channels />} />
            <Route path="/radio" element={<Radio />} />
            <Route path="/player/channel/:id" element={<ChannelPlayer />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/add-channel" element={<AddChannel />} />
            <Route path="/admin/import-m3u" element={<ImportM3U />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;