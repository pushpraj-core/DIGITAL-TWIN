import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Hexagon,
  Wifi,
  WifiOff,
  Activity,
  MapPin,
  HelpCircle,
  Shield,
  Crosshair,
  Route,
  Cloud,
} from 'lucide-react';
import { useMapStore } from '../../stores/mapStore';
import { useMissionStore } from '../../stores/missionStore';
import { useUIStore } from '../../stores/uiStore';
import { formatCoordinates } from '../../utils/format';

export default function TopBar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [online, setOnline] = useState(navigator.onLine);
  const mousePosition = useMapStore((s) => s.mousePosition);
  const coordinateFormat = useMapStore((s) => s.coordinateFormat);
  const isAnalyzing = useMissionStore((s) => s.isAnalyzing);
  const isPlanning = useMissionStore((s) => s.isPlanning);
  const isFetchingTerrain = useMissionStore((s) => s.isFetchingTerrain);
  const terrainData = useMissionStore((s) => s.terrainData);
  const threats = useMissionStore((s) => s.threats);
  const routes = useMissionStore((s) => s.routes);
  const riskHeatmap = useMissionStore((s) => s.riskHeatmap);
  
  const missionStage = useUIStore((s) => s.missionStage);
  const setShowOnboarding = useUIStore((s) => s.setShowOnboarding);
  const setOnboardingStep = useUIStore((s) => s.setOnboardingStep);

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
  const analysisStatus = isFetchingTerrain
    ? 'DOWNLOADING'
    : isAnalyzing
    ? 'ANALYZING'
    : isPlanning
    ? 'PLANNING'
    : terrainData
    ? 'ACTIVE'
    : 'STANDBY';

  // Compute global risk level from heatmap stats
  const riskLevel = riskHeatmap?.stats
    ? riskHeatmap.stats.mean_risk > 0.5
      ? 'HIGH'
      : riskHeatmap.stats.mean_risk > 0.3
      ? 'MEDIUM'
      : 'LOW'
    : null;
  
  const riskColor = riskLevel === 'HIGH' ? 'text-red-400' : riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div
      className="h-12 flex items-center justify-between px-4 border-b border-cyan-500/10"
      style={{ background: 'rgba(10, 14, 26, 0.95)' }}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Hexagon className="w-5 h-5 text-cyan-400" />
        </motion.div>
        <span className="text-sm font-bold tracking-wider text-cyan-400 glow-text font-mono">
          TACTICAL DIGITAL TWIN
        </span>
        <span className="text-[10px] text-slate-600 font-mono">v2.0</span>
      </div>

      {/* Center: Mission HUD Status Badges */}
      <div className="flex items-center gap-3 flex-1 justify-center">
        {/* System status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/50 border border-slate-700/50">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              online ? 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
            }`}
          />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            SYS: {systemStatus}
          </span>
        </div>

        {/* Analysis status */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
          analysisStatus === 'ACTIVE' 
            ? 'bg-emerald-500/5 border-emerald-500/20' 
            : analysisStatus === 'STANDBY' 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-amber-500/5 border-amber-500/20'
        }`}>
          <Activity
            className={`w-3 h-3 ${
              isAnalyzing || isPlanning || isFetchingTerrain 
                ? 'text-amber-400 animate-pulse' 
                : terrainData 
                ? 'text-emerald-400' 
                : 'text-slate-600'
            }`}
          />
          <span
            className={`text-[10px] font-mono uppercase tracking-wider ${
              isAnalyzing || isPlanning || isFetchingTerrain 
                ? 'text-amber-400' 
                : terrainData 
                ? 'text-emerald-400' 
                : 'text-slate-500'
            }`}
          >
            {analysisStatus}
          </span>
        </div>

        {/* Mission Intel Badges — only show when terrain is loaded */}
        {terrainData && (
          <>
            {/* Risk Level */}
            {riskLevel && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                riskLevel === 'HIGH' ? 'bg-red-500/5 border-red-500/20' : riskLevel === 'MEDIUM' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
              }`}>
                <Shield className={`w-3 h-3 ${riskColor}`} />
                <span className={`text-[10px] font-mono uppercase tracking-wider ${riskColor}`}>
                  RISK: {riskLevel}
                </span>
              </div>
            )}

            {/* Threats count */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
              threats.length > 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-800/50 border-slate-700/50'
            }`}>
              <Crosshair className={`w-3 h-3 ${threats.length > 0 ? 'text-red-400' : 'text-slate-600'}`} />
              <span className={`text-[10px] font-mono uppercase tracking-wider ${threats.length > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                THR: {threats.length}
              </span>
            </div>

            {/* Routes count */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
              routes.length > 0 ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-slate-800/50 border-slate-700/50'
            }`}>
              <Route className={`w-3 h-3 ${routes.length > 0 ? 'text-cyan-400' : 'text-slate-600'}`} />
              <span className={`text-[10px] font-mono uppercase tracking-wider ${routes.length > 0 ? 'text-cyan-400' : 'text-slate-500'}`}>
                RTE: {routes.length}
              </span>
            </div>

            {/* Weather */}
            {terrainData.weather && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/50 border border-slate-700/50">
                <Cloud className="w-3 h-3 text-cyan-400/60" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  VIS: {(terrainData.weather.visibility_m / 1000).toFixed(1)}km
                </span>
              </div>
            )}
          </>
        )}

        {/* Coordinates */}
        {mousePosition && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/50 border border-slate-700/50">
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
      <div className="flex items-center gap-4 flex-shrink-0">
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
        
        <button 
          onClick={() => { setOnboardingStep(0); setShowOnboarding(true); }}
          className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          title="Show Tutorial"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

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
