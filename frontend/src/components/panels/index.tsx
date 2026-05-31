import React from 'react';
import api from '../../services/api';

import { useMapStore } from '../../stores/mapStore';
import { useMissionStore } from '../../stores/missionStore';
import { useUIStore } from '../../stores/uiStore';
import { Map, Shield, Crosshair, Route, Eye, Globe, ChevronRight, Zap, AlertTriangle } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   SHARED: Empty State + Next-Step Banner
   ═══════════════════════════════════════════════════════════════ */

const EmptyState = ({ icon, title, description, actionLabel, onAction }: any) => (
  <div className="border border-dashed border-slate-700/50 rounded-lg p-6 text-center bg-bg-card/50 flex flex-col items-center">
    <div className="text-slate-500 mb-3">{icon}</div>
    <h3 className="text-slate-300 font-bold mb-2">{title}</h3>
    <p className="text-slate-500 text-xs mb-4">{description}</p>
    {actionLabel && (
      <button 
        onClick={onAction}
        className="px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-500/20 text-xs font-bold transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const NextStepBanner = ({ text, targetTab }: { text: string; targetTab: string }) => {
  const setActiveRightTab = useUIStore((s) => s.setActiveRightTab);
  return (
    <button
      onClick={() => setActiveRightTab(targetTab)}
      className="w-full mt-4 flex items-center gap-3 px-4 py-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-all group"
    >
      <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />
      <span className="text-xs text-cyan-400/80 text-left flex-1">{text}</span>
      <ChevronRight className="w-4 h-4 text-cyan-400/50 group-hover:text-cyan-400 transition-colors" />
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PANEL 1: UPLOAD / MISSION AREA
   ═══════════════════════════════════════════════════════════════ */

export const UploadPanel = () => {
  const bounds = useMapStore((s) => s.bounds);
  const autoSync = useMapStore((s) => s.autoSync);
  const setAutoSync = useMapStore((s) => s.setAutoSync);
  const isFetching = useMissionStore((s) => s.isFetchingTerrain);
  const setIsFetching = useMissionStore((s) => s.setIsFetchingTerrain);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  
  const setTerrainData = useMissionStore((s) => s.setTerrainData);
  const terrainData = useMissionStore((s) => s.terrainData);
  const clearAll = useMissionStore((s) => s.clearAll);

  const fetchLiveArea = async () => {
    if (!bounds) return;
    setIsFetching(true);
    setErrorMsg(null);
    try {
      const response = await api.post('/terrain/fetch_live', { bounds });
      setTerrainData(response.data);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.response?.data?.detail || "Failed to fetch live area. Try zooming in further.");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="p-4 text-text-primary">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-bold glow-text text-accent-cyan">Mission Area</h2>
      </div>
      <p className="text-xs text-text-secondary mb-4">Select and fetch the operational environment.</p>

      {!terrainData ? (
        <>
          <div className="border border-dashed border-cyan-500/30 rounded-xl p-8 text-center bg-cyan-500/5 flex flex-col items-center mb-4">
            <div className="p-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
              <Globe className="w-10 h-10 text-cyan-400" />
            </div>
            <h3 className="text-cyan-400 font-bold text-sm mb-2">Select an Area to Begin Mission Analysis</h3>
            <p className="text-slate-400 text-xs mb-6 max-w-[260px] leading-relaxed">
              Click anywhere on the map to define a tactical area. The system will automatically download satellite imagery, terrain, elevation, and weather data.
            </p>
            <button 
              onClick={fetchLiveArea}
              disabled={!bounds || isFetching}
              className="px-6 py-2.5 bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 rounded-lg hover:bg-cyan-500/25 text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,240,255,0.1)] hover:shadow-[0_0_25px_rgba(0,240,255,0.2)]"
            >
              {isFetching ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  Downloading Area...
                </span>
              ) : 'Fetch Mission Area'}
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-accent-red/10 border border-accent-red/30 rounded text-accent-red text-xs mb-4 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-bg-card border border-slate-700/50 rounded">
            <div>
              <h3 className="font-bold text-slate-300 text-xs">Auto-Sync Map</h3>
              <p className="text-[10px] text-text-secondary">Fetch data on map pan</p>
            </div>
            <button 
              onClick={() => setAutoSync(!autoSync)}
              className={`w-10 h-5 rounded-full transition-colors relative ${autoSync ? 'bg-accent-cyan' : 'bg-bg-secondary'}`}
            >
              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all ${autoSync ? 'left-[22px]' : 'left-[3px]'}`} />
            </button>
          </div>
        </>
      ) : (
        <div className="border border-accent-green/30 rounded-lg p-4 bg-accent-green/5 mb-4">
          <div className="text-accent-green font-bold mb-2 flex items-center text-sm">
            <span className="w-2 h-2 rounded-full bg-accent-green mr-2 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            Mission Area Active
          </div>
          <p className="text-xs text-text-secondary mb-3">Satellite imagery, terrain analysis, elevation, and weather data loaded.</p>
          
          {terrainData.segments && terrainData.segments.length > 0 && (
            <div className="mb-4 bg-bg-card/50 p-3 rounded border border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-bold">Terrain Composition</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(
                  terrainData.segments.reduce((acc, seg) => {
                    acc[seg.type] = (acc[seg.type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, count]) => (
                  <div key={type} className="text-[11px] px-2 py-1 bg-slate-800/80 rounded text-slate-300 border border-slate-700/50">
                    <span className="capitalize">{type}</span>: <span className="text-accent-cyan font-mono">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {terrainData.weather && (
            <div className="mb-4 bg-bg-card/50 p-3 rounded border border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-bold">Weather Conditions</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Visibility</span>
                  <span className="font-mono text-cyan-400">{(terrainData.weather.visibility_m / 1000).toFixed(1)}km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Precipitation</span>
                  <span className="font-mono text-cyan-400">{terrainData.weather.precipitation}mm</span>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={() => clearAll()}
            className="w-full py-2 bg-accent-red/10 text-accent-red border border-accent-red/20 rounded hover:bg-accent-red/20 text-xs font-bold transition-colors"
          >
            Clear &amp; Select New Area
          </button>

          <NextStepBanner text="Next: Review terrain intelligence and add threats" targetTab="terrain" />
        </div>
      )}
      
      {bounds && (
        <div className="mt-4 text-xs text-text-secondary font-mono bg-bg-card/50 p-3 rounded grid grid-cols-2 gap-2 border border-slate-700/30">
          <div><span className="text-accent-cyan">N:</span> {bounds.max_lat.toFixed(4)}</div>
          <div><span className="text-accent-cyan">S:</span> {bounds.min_lat.toFixed(4)}</div>
          <div><span className="text-accent-cyan">E:</span> {bounds.max_lng.toFixed(4)}</div>
          <div><span className="text-accent-cyan">W:</span> {bounds.min_lng.toFixed(4)}</div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PANEL 2: TERRAIN INTELLIGENCE (now uses real data)
   ═══════════════════════════════════════════════════════════════ */

export const TerrainPanel = () => {
  const terrainData = useMissionStore((s) => s.terrainData);
  const setActiveRightTab = useUIStore((s) => s.setActiveRightTab);

  if (!terrainData) {
    return (
      <div className="p-4 text-text-primary">
        <h2 className="text-lg font-bold mb-4 glow-text text-accent-green">Terrain Intelligence</h2>
        <EmptyState 
          icon={<Map className="w-8 h-8" />}
          title="No Terrain Data"
          description="Fetch a mission area first to view terrain analysis."
          actionLabel="Go to Mission Area"
          onAction={() => setActiveRightTab('upload')}
        />
      </div>
    );
  }

  // Calculate real terrain composition
  const segments = terrainData.segments || [];
  const typeCounts = segments.reduce((acc, seg) => {
    acc[seg.type] = (acc[seg.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const total = segments.length || 1;

  const terrainColors: Record<string, string> = {
    vegetation: 'bg-green-500',
    forest: 'bg-green-600',
    road: 'bg-slate-400',
    building: 'bg-red-500',
    water: 'bg-blue-500',
    open: 'bg-amber-400',
    obstacle: 'bg-orange-500',
    urban: 'bg-indigo-500',
    hill: 'bg-purple-500',
  };

  const terrainTextColors: Record<string, string> = {
    vegetation: 'text-green-400',
    forest: 'text-green-400',
    road: 'text-slate-300',
    building: 'text-red-400',
    water: 'text-blue-400',
    open: 'text-amber-400',
    obstacle: 'text-orange-400',
    urban: 'text-indigo-400',
    hill: 'text-purple-400',
  };

  return (
    <div className="p-4 text-text-primary">
      <h2 className="text-lg font-bold mb-1 glow-text text-accent-green">Terrain Intelligence</h2>
      <p className="text-xs text-text-secondary mb-4">Auto-analyzed from satellite imagery.</p>

      {/* Terrain breakdown bars */}
      <div className="space-y-2 mb-4">
        {Object.entries(typeCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([type, count]) => {
            const pct = Math.round((count / total) * 100);
            return (
              <div key={type}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs capitalize font-bold ${terrainTextColors[type] || 'text-slate-300'}`}>
                    {type.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{pct}% ({count})</span>
                </div>
                <div className="h-1.5 w-full bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${terrainColors[type] || 'bg-slate-500'}`}
                    style={{ width: `${pct}%`, transition: 'width 0.5s ease' }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      {/* Terrain classes */}
      {terrainData.terrain_classes && terrainData.terrain_classes.length > 0 && (
        <div className="bg-bg-card/50 p-3 rounded border border-slate-700/50 mb-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-bold">Detected Terrain Classes</div>
          <div className="flex flex-wrap gap-1.5">
            {terrainData.terrain_classes.map((cls: string) => (
              <span key={cls} className="text-[11px] px-2 py-1 bg-accent-green/10 border border-accent-green/20 text-accent-green rounded capitalize">
                {cls}
              </span>
            ))}
          </div>
        </div>
      )}

      <NextStepBanner text="Next: Add enemy threats to update risk analysis" targetTab="threats" />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PANEL 3: RISK ANALYSIS
   ═══════════════════════════════════════════════════════════════ */

export const RiskPanel = () => {
  const terrainData = useMissionStore((s) => s.terrainData);
  const riskHeatmap = useMissionStore((s) => s.riskHeatmap);
  const weather = terrainData?.weather;
  const setActiveRightTab = useUIStore((s) => s.setActiveRightTab);

  if (!terrainData) {
    return (
      <div className="p-4 text-text-primary">
        <h2 className="text-lg font-bold mb-4 glow-text text-accent-red">Risk Analysis</h2>
        <EmptyState 
          icon={<Shield className="w-8 h-8" />}
          title="No Terrain Data"
          description="Fetch a mission area first."
          actionLabel="Go to Mission Area"
          onAction={() => setActiveRightTab('upload')}
        />
      </div>
    );
  }

  const stats = riskHeatmap?.stats;

  return (
    <div className="p-4 text-text-primary">
      <h2 className="text-lg font-bold mb-1 glow-text text-accent-red">Risk Analysis</h2>
      <p className="text-xs text-text-secondary mb-4">Auto-generated from terrain, elevation, and threats.</p>
      
      {weather && (
        <div className="mb-4 p-3 bg-bg-card/50 rounded border border-slate-700/50">
          <h3 className="text-accent-cyan font-bold mb-2 text-xs uppercase tracking-wider">Live Environment</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
             <div className="flex justify-between">
               <span className="text-slate-400">Visibility</span>
               <span className="font-mono text-cyan-400">{(weather.visibility_m / 1000).toFixed(1)}km</span>
             </div>
             <div className="flex justify-between">
               <span className="text-slate-400">Precipitation</span>
               <span className="font-mono text-cyan-400">{weather.precipitation}mm</span>
             </div>
          </div>
        </div>
      )}

      {stats ? (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-bg-card/50 rounded border border-slate-700/50 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Mean Risk</p>
            <p className={`text-xl font-bold font-mono ${stats.mean_risk > 0.5 ? 'text-accent-red' : stats.mean_risk > 0.3 ? 'text-accent-amber' : 'text-accent-green'}`}>
              {(stats.mean_risk * 100).toFixed(0)}%
            </p>
          </div>
          <div className="p-3 bg-bg-card/50 rounded border border-slate-700/50 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Max Risk</p>
            <p className="text-xl font-bold text-accent-red font-mono">{(stats.max_risk * 100).toFixed(0)}%</p>
          </div>
          <div className="p-3 bg-bg-card/50 rounded border border-slate-700/50 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">High Risk</p>
            <p className="text-sm font-bold text-accent-red font-mono">{stats.high_risk_pct}%</p>
          </div>
          <div className="p-3 bg-bg-card/50 rounded border border-slate-700/50 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Low Risk</p>
            <p className="text-sm font-bold text-accent-green font-mono">{stats.low_risk_pct}%</p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-bg-card/50 rounded text-center border border-slate-700/50 mb-4">
          <p className="text-text-secondary text-sm animate-pulse">Calculating risk heatmap...</p>
        </div>
      )}

      <NextStepBanner text="Next: Add enemy threats to refine risk zones" targetTab="threats" />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PANEL 4: PATH PLANNER / MOVEMENT
   ═══════════════════════════════════════════════════════════════ */

export const PathPlannerPanel = () => {
  const startPoint = useMapStore((s) => s.startPoint);
  const endPoint = useMapStore((s) => s.endPoint);
  const terrainData = useMissionStore((s) => s.terrainData);
  const routes = useMissionStore((s) => s.routes);
  const setRoutes = useMissionStore((s) => s.setRoutes);
  const selectedRouteId = useMissionStore((s) => s.selectedRouteId);
  const setSelectedRouteId = useMissionStore((s) => s.setSelectedRouteId);
  const [isPlanning, setIsPlanning] = React.useState(false);
  const [noRouteFound, setNoRouteFound] = React.useState(false);

  const planRoute = React.useCallback(async (missionType: string) => {
    if (!startPoint || !endPoint || !terrainData) return;
    setIsPlanning(true);
    setNoRouteFound(false);
    try {
      const response = await api.post('/pathfinding/plan', {
        start_lat: startPoint.lat,
        start_lng: startPoint.lng,
        end_lat: endPoint.lat,
        end_lng: endPoint.lng,
        mission_type: missionType,
        terrain_id: terrainData.id,
        threats: useMissionStore.getState().threats
      });
      setRoutes(response.data.routes);
      if (response.data.routes.length === 0) {
        setNoRouteFound(true);
      } else {
        setSelectedRouteId(response.data.routes[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsPlanning(false);
    }
  }, [startPoint, endPoint, terrainData, setRoutes, setSelectedRouteId]);

  const clearPoints = () => {
    useMapStore.getState().setStartPoint(null);
    useMapStore.getState().setEndPoint(null);
    setRoutes([]);
    setNoRouteFound(false);
  };

  const setActiveRightTab = useUIStore((s) => s.setActiveRightTab);

  return (
    <div className="p-4 text-text-primary">
      <h2 className="text-lg font-bold mb-1 glow-text text-cyan-400">Movement Planner</h2>
      <p className="text-xs text-text-secondary mb-4">Plan optimal routes using terrain, risk, and threats.</p>
      
      {!terrainData && (
        <EmptyState 
          icon={<Map className="w-8 h-8" />}
          title="Terrain Required"
          description="Fetch a mission area first before planning routes."
          actionLabel="Go to Mission Area"
          onAction={() => setActiveRightTab('upload')}
        />
      )}
      
      {terrainData && (!startPoint || !endPoint) && (
        <div className="border border-dashed border-cyan-500/20 rounded-lg p-6 text-center bg-cyan-500/5 flex flex-col items-center">
          <Route className="w-8 h-8 text-cyan-400/50 mb-3" />
          <h3 className="text-slate-300 font-bold mb-2 text-sm">Place Start &amp; End Points</h3>
          <p className="text-slate-500 text-xs mb-4">Use the buttons below, then click on the map.</p>
          <div className="flex gap-2">
            <button 
              onClick={() => useUIStore.getState().setClickMode('start')}
              className={`px-4 py-2 text-xs font-bold rounded transition-all ${!startPoint ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/25' : 'bg-bg-secondary text-text-secondary border border-slate-700'}`}
            >
              {startPoint ? '✓ Start Set' : 'Set Start'}
            </button>
            <button 
              onClick={() => useUIStore.getState().setClickMode('end')}
              className={`px-4 py-2 text-xs font-bold rounded transition-all ${!endPoint ? 'bg-red-500/15 text-red-400 border border-red-500/40 hover:bg-red-500/25' : 'bg-bg-secondary text-text-secondary border border-slate-700'}`}
            >
              {endPoint ? '✓ End Set' : 'Set End'}
            </button>
          </div>
        </div>
      )}

      {(startPoint || endPoint) && (
        <button 
          onClick={clearPoints}
          className="w-full py-2 mb-4 bg-accent-red/10 text-accent-red border border-accent-red/20 rounded hover:bg-accent-red/20 text-xs font-bold transition-colors"
        >
          Clear Points
        </button>
      )}

      {/* Route mode buttons */}
      {terrainData && startPoint && endPoint && (
        <div className="space-y-2 mb-4">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Route Strategy</div>
          {[
            { type: 'stealth', label: 'Stealth', desc: 'Maximum concealment', color: 'border-purple-500/30 hover:bg-purple-500/10' },
            { type: 'fastest', label: 'Fastest', desc: 'Minimum distance', color: 'border-amber-500/30 hover:bg-amber-500/10' },
            { type: 'safest', label: 'Safest', desc: 'Minimum risk', color: 'border-green-500/30 hover:bg-green-500/10' },
          ].map(m => (
            <button 
              key={m.type}
              disabled={isPlanning}
              onClick={() => planRoute(m.type)}
              className={`w-full py-2.5 bg-bg-card border ${m.color} rounded text-left px-4 disabled:opacity-50 transition-all`}
            >
              <div className="text-sm font-bold text-text-primary">{m.label}</div>
              <div className="text-[10px] text-text-secondary">{m.desc}</div>
            </button>
          ))}
        </div>
      )}
      
      {isPlanning && <div className="mt-4 text-center text-accent-cyan text-sm animate-pulse">Calculating optimal routes...</div>}
      
      {noRouteFound && !isPlanning && (
        <div className="mt-4 p-3 bg-accent-red/10 border border-accent-red/30 text-accent-red text-xs rounded flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div><strong>No Path Found!</strong> The area is entirely blocked by impassable terrain. Try moving your markers.</div>
        </div>
      )}

      {/* Route results */}
      {routes.length > 0 && (
        <div className="mt-4 space-y-2.5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Route Results ({routes.length})</div>
          {routes.map(route => {
            const isActive = selectedRouteId === route.id;
            const riskColor = route.risk_score > 0.6 ? 'text-red-400' : route.risk_score > 0.3 ? 'text-amber-400' : 'text-emerald-400';
            const riskBg = route.risk_score > 0.6 ? 'bg-red-400' : route.risk_score > 0.3 ? 'bg-amber-400' : 'bg-emerald-400';
            const concealment = route.exposure_score !== undefined ? (1 - route.exposure_score) : null;
            const etaMins = Math.round(route.estimated_time / 60);
            const etaHrs = Math.floor(etaMins / 60);
            const etaRem = etaMins % 60;

            return (
              <button
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                  isActive
                    ? 'border-cyan-500/40 bg-cyan-500/5 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                    : 'border-slate-700/50 bg-bg-card/50 hover:border-slate-600'
                }`}
              >
                {/* Route header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: route.color, boxShadow: isActive ? `0 0 8px ${route.color}` : 'none' }} />
                  <span className="text-xs font-bold text-text-primary flex-1">{route.name}</span>
                  <span className={`text-[10px] font-mono font-bold ${riskColor}`}>
                    {(route.risk_score * 100).toFixed(0)}% risk
                  </span>
                </div>

                {/* Risk bar */}
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-2.5">
                  <div className={`h-full ${riskBg} rounded-full transition-all duration-500`} style={{ width: `${route.risk_score * 100}%` }} />
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                  <div className="p-1.5 bg-bg-secondary/50 rounded text-center">
                    <div className="text-slate-200 font-bold">{route.distance.toFixed(2)}km</div>
                    <div className="text-[8px] text-slate-500 uppercase">Distance</div>
                  </div>
                  <div className="p-1.5 bg-bg-secondary/50 rounded text-center">
                    <div className="text-slate-200 font-bold">{etaHrs > 0 ? `${etaHrs}h ${etaRem}m` : `${etaMins}min`}</div>
                    <div className="text-[8px] text-slate-500 uppercase">ETA</div>
                  </div>
                  <div className="p-1.5 bg-bg-secondary/50 rounded text-center">
                    <div className={`font-bold ${concealment !== null && concealment > 0.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {concealment !== null ? `${(concealment * 100).toFixed(0)}%` : '—'}
                    </div>
                    <div className="text-[8px] text-slate-500 uppercase">Concealment</div>
                  </div>
                </div>
              </button>
            );
          })}
          <NextStepBanner text="Next: Run observation analysis on your route" targetTab="observation" />
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PANEL 5: OBSERVATION (now independent from routes)
   ═══════════════════════════════════════════════════════════════ */

export const ObservationPanel = () => {
  const setClickMode = useUIStore((s) => s.setClickMode);
  const clickMode = useUIStore((s) => s.clickMode);
  const visibility = useMissionStore((s) => s.visibility);
  const terrainData = useMissionStore((s) => s.terrainData);
  const setActiveRightTab = useUIStore((s) => s.setActiveRightTab);

  // Observation parameters stored in local state
  const [obsRange, setObsRange] = React.useState(500);
  const [obsDirection, setObsDirection] = React.useState(0);
  const [obsFOV, setObsFOV] = React.useState(90);

  // Store observation params in window so TacticalMap's click handler can read them
  React.useEffect(() => {
    (window as any).__obsParams = { range: obsRange, direction: obsDirection, fov: obsFOV };
  }, [obsRange, obsDirection, obsFOV]);

  // Cardinal direction label
  const directionLabel = (deg: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
  };

  return (
    <div className="p-4 text-text-primary">
      <h2 className="text-lg font-bold mb-1 glow-text text-cyan-400">Observation Analysis</h2>
      <p className="text-xs text-text-secondary mb-4">Configure viewshed parameters and click any point.</p>
      
      {!terrainData ? (
        <EmptyState 
          icon={<Eye className="w-8 h-8" />}
          title="Terrain Required"
          description="Fetch a mission area first."
          actionLabel="Go to Mission Area"
          onAction={() => setActiveRightTab('upload')}
        />
      ) : (
        <>
          {/* Observation Parameters */}
          <div className="space-y-3 mb-4 p-3 bg-bg-card/50 rounded-lg border border-slate-700/50">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Viewshed Parameters</div>
            
            {/* Range Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-slate-400">Range</span>
                <span className="text-[10px] font-mono text-cyan-400">{obsRange}m</span>
              </div>
              <input
                type="range" min={200} max={1500} step={50}
                value={obsRange} onChange={e => setObsRange(Number(e.target.value))}
                className="w-full h-1 accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Direction Slider with compass */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-slate-400">Direction</span>
                <span className="text-[10px] font-mono text-cyan-400">{obsDirection}° ({directionLabel(obsDirection)})</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={0} max={359} step={5}
                  value={obsDirection} onChange={e => setObsDirection(Number(e.target.value))}
                  className="flex-1 h-1 accent-cyan-500 cursor-pointer"
                />
                {/* Mini compass */}
                <div className="w-8 h-8 rounded-full border border-cyan-500/30 bg-slate-800/60 flex items-center justify-center relative flex-shrink-0">
                  <div
                    className="w-0.5 h-3 bg-cyan-400 rounded-full absolute origin-bottom"
                    style={{ transform: `rotate(${obsDirection}deg)`, bottom: '50%' }}
                  />
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 absolute" />
                </div>
              </div>
            </div>

            {/* FOV Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-slate-400">Field of View</span>
                <span className="text-[10px] font-mono text-cyan-400">{obsFOV}°</span>
              </div>
              <input
                type="range" min={30} max={360} step={10}
                value={obsFOV} onChange={e => setObsFOV(Number(e.target.value))}
                className="w-full h-1 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          <button 
            onClick={() => setClickMode(clickMode === 'observer' ? 'none' : 'observer')}
            className={`w-full py-3 mb-4 rounded-lg font-bold text-sm transition-all ${
              clickMode === 'observer' 
                ? 'bg-cyan-500/15 border-2 border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.15)]' 
                : 'bg-bg-card border-2 border-slate-700/50 hover:border-cyan-500/30 text-text-primary'
            }`}
          >
            {clickMode === 'observer' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Click on map to analyze...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                Enable Vision Mode
              </span>
            )}
          </button>

          {visibility && (
            <div className="border border-cyan-500/20 bg-bg-card/50 rounded-lg p-4">
              <h3 className="font-bold text-cyan-400 mb-3 text-sm">Viewshed Results</h3>
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="text-text-secondary">Area Coverage</span>
                <span className="font-mono font-bold text-cyan-400">{visibility.coverage_pct}%</span>
              </div>
              <div className="h-2 w-full bg-bg-secondary rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500/50 to-cyan-400 rounded-full transition-all duration-500" 
                  style={{ width: `${visibility.coverage_pct}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="p-2 bg-bg-secondary rounded text-center">
                  <div className="text-cyan-400 font-bold">{visibility.visible_zones?.length || 0}</div>
                  <div className="text-[10px] text-slate-500">Visible Cells</div>
                </div>
                <div className="p-2 bg-bg-secondary rounded text-center">
                  <div className="text-slate-400 font-bold">{visibility.hidden_zones?.length || 0}</div>
                  <div className="text-[10px] text-slate-500">Hidden Cells</div>
                </div>
              </div>
              <p className="text-[10px] text-text-secondary leading-relaxed">
                Blue zones = direct Line-of-Sight. Dark zones = occluded by elevation or structures.
              </p>
            </div>
          )}

          {!visibility && (
            <div className="p-4 bg-bg-card/30 border border-dashed border-slate-700/50 rounded-lg text-center">
              <Eye className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No observation data yet. Enable Vision Mode and click a point.</p>
            </div>
          )}

          <NextStepBanner text="Next: Run What-If scenarios to stress-test the mission" targetTab="whatif" />
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PANEL 6: THREATS
   ═══════════════════════════════════════════════════════════════ */

import { MissionReplay } from '../mission/MissionReplay';
import { StrategyComparison } from '../mission/StrategyComparison';

export const ThreatPanel = () => {
  const activeThreat = useUIStore((s) => s.activeThreatType);
  const setActiveThreat = useUIStore((s) => s.setActiveThreatType);
  const setClickMode = useUIStore((s) => s.setClickMode);
  
  const threatsList = useMissionStore((s) => s.threats);
  const removeThreat = useMissionStore((s) => s.removeThreat);
  const updateThreat = useMissionStore((s) => s.updateThreat);
  const terrainData = useMissionStore((s) => s.terrainData);
  const setActiveRightTab = useUIStore((s) => s.setActiveRightTab);

  const threats = [
    { id: 'sniper', label: 'Sniper', emoji: '🎯', color: 'border-red-500/40 hover:bg-red-500/10' },
    { id: 'checkpoint', label: 'Checkpoint', emoji: '🛡', color: 'border-amber-500/40 hover:bg-amber-500/10' },
    { id: 'ied', label: 'IED', emoji: '💣', color: 'border-red-500/40 hover:bg-red-500/10' },
    { id: 'patrol', label: 'Patrol', emoji: '👥', color: 'border-amber-500/40 hover:bg-amber-500/10' },
    { id: 'enemy_outpost', label: 'Outpost', emoji: '🏴', color: 'border-red-600/40 hover:bg-red-600/10' },
    { id: 'hostile_zone', label: 'Hostile Zone', emoji: '⛔', color: 'border-red-700/40 hover:bg-red-700/10' },
  ];

  const handleDelete = (id: string) => {
    removeThreat(id);
  };

  const handleSelectThreat = (id: string) => {
    if (activeThreat === id) {
      setActiveThreat(null);
      setClickMode('none');
    } else {
      setActiveThreat(id);
      setClickMode('threat');
    }
  };

  return (
    <div className="p-4 text-text-primary flex flex-col h-full overflow-y-auto">
      <h2 className="text-lg font-bold mb-1 glow-text text-red-400">Threat Injection</h2>
      <p className="text-slate-400 text-xs mb-4">Place threats to dynamically update the risk model.</p>
      
      {!terrainData ? (
        <EmptyState 
          icon={<Map className="w-8 h-8" />}
          title="Terrain Required"
          description="Fetch a mission area first to place threats."
          actionLabel="Go to Mission Area"
          onAction={() => setActiveRightTab('upload')}
        />
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {threats.map(t => (
            <button 
              key={t.id}
              onClick={() => handleSelectThreat(t.id)}
              className={`p-2.5 bg-bg-card rounded-lg border-2 transition-all text-center ${
                activeThreat === t.id 
                  ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_12px_rgba(0,240,255,0.1)]' 
                  : `border-transparent ${t.color}`
              }`}
            >
              <div className="text-lg mb-1">{t.emoji}</div>
              <div className="text-[10px] font-bold text-slate-300">{t.label}</div>
            </button>
          ))}
        </div>
      )}

      {activeThreat && (
        <div className="mt-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex justify-between items-center">
          <p className="text-red-400 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            Click on map to place threat
          </p>
          <button onClick={() => { setActiveThreat(null); setClickMode('none'); }} className="text-text-secondary hover:text-text-primary text-sm">✕</button>
        </div>
      )}

      {threatsList.length > 0 && (
        <div className="mt-6 border-t border-slate-700/30 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-red-400 text-sm">Active Threats ({threatsList.length})</h3>
            <button
              onClick={() => threatsList.forEach(t => removeThreat(t.id))}
              className="text-[10px] text-slate-500 hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {threatsList.map(t => (
              <div key={t.id} className="p-3 bg-bg-card/50 border border-red-500/10 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-bold capitalize text-xs">{t.type.replace('_', ' ')}</div>
                    <div className="text-[10px] text-text-secondary font-mono">
                      [{t.position.lat.toFixed(4)}, {t.position.lng.toFixed(4)}]
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="px-2 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 text-[10px] font-bold transition-colors"
                  >
                    Remove
                  </button>
                </div>
                {/* Radius Slider */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider w-12">Radius</span>
                  <input
                    type="range"
                    min={50}
                    max={800}
                    step={25}
                    value={t.radius}
                    onChange={(e) => updateThreat(t.id, { radius: Number(e.target.value) })}
                    className="flex-1 h-1 accent-red-500 cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-red-400 w-10 text-right">{t.radius}m</span>
                </div>
              </div>
            ))}
          </div>
          <NextStepBanner text="Threats placed. Plan routes to avoid hostile zones." targetTab="routes" />
        </div>
      )}
      
      {terrainData && threatsList.length === 0 && !activeThreat && (
        <div className="mt-6 border-t border-slate-700/30 pt-4">
          <EmptyState 
            icon={<Shield className="w-6 h-6" />}
            title="No Threats Placed"
            description="Add enemy positions above to simulate hostile terrain."
          />
          <NextStepBanner text="Skip threats and plan routes directly" targetTab="routes" />
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PANEL 7: WHAT-IF SCENARIOS
   ═══════════════════════════════════════════════════════════════ */

export const WhatIfPanel = () => {
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const terrainData = useMissionStore((s) => s.terrainData);

  const runSimulation = async (type: string) => {
    setIsSimulating(true);
    setResult(null);
    try {
      const response = await api.post('/whatif/simulate', { 
        scenario_type: type,
        params: { terrain_id: terrainData?.id }
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSimulating(false);
    }
  };

  const scenarios = [
    { label: 'Route Blocked', type: 'Main Route Blocked', emoji: '🚧' },
    { label: 'Bad Weather', type: 'Weather Deterioration (Fog)', emoji: '🌫' },
    { label: 'New Threat', type: 'Unexpected Threat Encounter', emoji: '⚠️' },
    { label: 'Comms Jammed', type: 'Comms Jamming', emoji: '📡' },
  ];

  return (
    <div className="p-4 text-text-primary flex flex-col h-full overflow-y-auto">
      <h2 className="text-lg font-bold mb-1 glow-text text-accent-amber">What-If Scenarios</h2>
      <p className="text-text-secondary text-xs mb-4">Simulate unexpected events and measure impact.</p>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        {scenarios.map(s => (
          <button 
            key={s.type}
            onClick={() => runSimulation(s.type)}
            disabled={isSimulating}
            className="p-3 bg-bg-card/50 rounded-lg border border-slate-700/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-left disabled:opacity-50"
          >
            <div className="text-lg mb-1">{s.emoji}</div>
            <div className="text-xs font-bold text-slate-300">{s.label}</div>
          </button>
        ))}
      </div>

      {isSimulating && (
        <div className="text-center text-accent-amber animate-pulse mb-4 text-sm flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          Running scenario analysis...
        </div>
      )}

      {result && (
        <div className="border border-amber-500/20 rounded-lg p-4 bg-amber-500/5 mb-4">
          <h3 className="font-bold text-accent-amber mb-2 text-sm">Impact Assessment</h3>
          <div className="text-xs text-text-secondary mb-3 space-y-1">
            {result.changes.map((change: string, idx: number) => (
              <p key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">›</span>
                {change}
              </p>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-bg-primary/50 p-2 rounded text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Risk Change</div>
              <div className="text-accent-red font-bold font-mono">
                +{((result.after_metrics.avg_risk - result.before_metrics.avg_risk) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="bg-bg-primary/50 p-2 rounded text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Severity</div>
              <div className="text-accent-amber font-bold">
                {result.after_metrics.avg_risk > 0.6 ? 'CRITICAL' : result.after_metrics.avg_risk > 0.4 ? 'SEVERE' : 'MODERATE'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto border-t border-slate-700/30 pt-4">
        <MissionReplay />
      </div>
      <div className="mt-4">
        <StrategyComparison />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PANEL 8: AI ASSISTANT
   ═══════════════════════════════════════════════════════════════ */

export const AIAssistantPanel = () => {
  const [query, setQuery] = React.useState('');
  const [isThinking, setIsThinking] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [chatHistory, setChatHistory] = React.useState<Array<{role: string, content: string}>>([
    { role: 'system', content: 'Tactical AI online. How can I assist with your mission planning?' }
  ]);
  const terrainData = useMissionStore((s) => s.terrainData);
  const threats = useMissionStore((s) => s.threats);
  const routes = useMissionStore((s) => s.routes);

  // Auto-scroll
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking]);

  const handleSend = async () => {
    if (!query.trim()) return;
    
    const userMsg = query;
    setQuery('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsThinking(true);

    try {
      const response = await api.post('/assistant/query', {
        query: userMsg,
        context: {
          has_terrain: !!terrainData,
          active_threats: threats.length,
          planned_routes: routes.length
        }
      });
      
      setChatHistory(prev => [...prev, { role: 'system', content: response.data.response }]);
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, { role: 'system', content: 'Error communicating with AI Assistant.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const quickActions = ['Find safest route', 'Show high-risk zones', 'Compare routes', 'Tactical summary'];

  return (
    <div className="p-4 text-text-primary flex flex-col h-full">
      <h2 className="text-lg font-bold mb-1 glow-text text-accent-cyan">AI Tactical Assistant</h2>
      <p className="text-xs text-text-secondary mb-3">Mission-aware tactical intelligence.</p>

      {/* Context badge */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${terrainData ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-slate-700 text-slate-500'}`}>
          {terrainData ? '✓ Terrain' : '○ No Terrain'}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${threats.length > 0 ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-slate-700 text-slate-500'}`}>
          {threats.length > 0 ? `✓ ${threats.length} Threats` : '○ No Threats'}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${routes.length > 0 ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' : 'border-slate-700 text-slate-500'}`}>
          {routes.length > 0 ? `✓ ${routes.length} Routes` : '○ No Routes'}
        </span>
      </div>
      
      {/* Chat */}
      <div className="flex-1 border border-slate-700/50 rounded-lg p-3 mb-3 bg-bg-card/30 overflow-y-auto space-y-2 flex flex-col min-h-0">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`p-2.5 rounded-lg max-w-[85%] text-xs leading-relaxed ${
            msg.role === 'user' 
              ? 'bg-slate-800/80 ml-auto border border-slate-700/50 text-slate-200' 
              : 'bg-cyan-500/5 border border-cyan-500/20 mr-auto text-cyan-100'
          }`}>
            {msg.content}
          </div>
        ))}
        {isThinking && (
          <div className="p-2.5 rounded-lg max-w-[85%] bg-cyan-500/5 border border-cyan-500/20 mr-auto">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick actions */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {quickActions.map(action => (
          <button
            key={action}
            onClick={() => { setQuery(action); }}
            className="text-[10px] px-2.5 py-1 rounded-full border border-cyan-500/20 text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
          >
            {action}
          </button>
        ))}
      </div>
      
      {/* Input */}
      <div className="flex gap-2">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-bg-secondary border border-slate-700/50 rounded-lg p-2.5 text-text-primary text-xs outline-none focus:border-cyan-500/50 transition-colors" 
          placeholder="Ask the AI..." 
        />
        <button 
          onClick={handleSend}
          disabled={!query.trim() || isThinking}
          className="px-4 py-2.5 bg-cyan-500/15 text-cyan-400 font-bold rounded-lg disabled:opacity-30 hover:bg-cyan-500/25 transition-colors border border-cyan-500/30 text-xs"
        >
          Send
        </button>
      </div>
    </div>
  );
};
