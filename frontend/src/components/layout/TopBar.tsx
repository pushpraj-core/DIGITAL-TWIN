import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Hexagon,
  Wifi,
  WifiOff,
  Activity,
  MapPin,
} from 'lucide-react';
import { useMapStore } from '../../stores/mapStore';
import { useMissionStore } from '../../stores/missionStore';
import { formatCoordinates } from '../../utils/format';

export default function TopBar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [online, setOnline] = useState(navigator.onLine);
  const mousePosition = useMapStore((s) => s.mousePosition);
  const coordinateFormat = useMapStore((s) => s.coordinateFormat);
  const isAnalyzing = useMissionStore((s) => s.isAnalyzing);
  const isPlanning = useMissionStore((s) => s.isPlanning);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const systemStatus = online ? 'ONLINE' : 'OFFLINE';
  const analysisStatus = isAnalyzing
    ? 'ANALYZING'
    : isPlanning
    ? 'PLANNING'
    : 'STANDBY';

  return (
    <div
      className="h-12 flex items-center justify-between px-4 border-b border-cyan-500/10"
      style={{ background: 'rgba(10, 14, 26, 0.95)' }}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Hexagon className="w-5 h-5 text-cyan-400" />
        </motion.div>
        <span className="text-sm font-bold tracking-wider text-cyan-400 glow-text font-mono">
          TACTICAL DIGITAL TWIN
        </span>
        <span className="text-[10px] text-slate-600 font-mono">v1.0</span>
      </div>

      {/* Center: Status indicators */}
      <div className="flex items-center gap-6">
        {/* System status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full pulse-dot ${
              online ? 'status-online' : 'status-danger'
            }`}
          />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            SYS: {systemStatus}
          </span>
        </div>

        {/* Analysis status */}
        <div className="flex items-center gap-2">
          <Activity
            className={`w-3 h-3 ${
              isAnalyzing || isPlanning ? 'text-amber-400 animate-pulse' : 'text-slate-600'
            }`}
          />
          <span
            className={`text-[10px] font-mono uppercase tracking-wider ${
              isAnalyzing || isPlanning ? 'text-amber-400' : 'text-slate-500'
            }`}
          >
            {analysisStatus}
          </span>
        </div>

        {/* Coordinates */}
        {mousePosition && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-cyan-500/60" />
            <span className="text-[10px] font-mono text-cyan-400/80">
              {formatCoordinates(
                mousePosition.lat,
                mousePosition.lng,
                coordinateFormat
              )}
            </span>
          </div>
        )}
      </div>

      {/* Right: Connection + time */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          {online ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-red-400" />
          )}
          <span className="text-[10px] font-mono text-slate-500">
            {online ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-700" />

        <span className="text-xs font-mono text-slate-400 tabular-nums">
          {currentTime.toLocaleTimeString('en-US', { hour12: false })}
        </span>
        <span className="text-[10px] font-mono text-slate-600">
          {currentTime.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
