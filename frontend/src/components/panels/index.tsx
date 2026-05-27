import React from 'react';
import api from '../../services/api';

import { useMapStore } from '../../stores/mapStore';
import { useMissionStore } from '../../stores/missionStore';

export const UploadPanel = () => {
  const bounds = useMapStore((s) => s.bounds);
  const [isFetching, setIsFetching] = React.useState(false);
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
      <h2 className="text-xl font-bold mb-4 glow-text text-accent-cyan">Live Area Selection</h2>
      
      {!terrainData ? (
        <div className="border-2 border-dashed border-accent-cyan/50 rounded-lg p-6 text-center bg-bg-card/50">
          <p className="text-text-secondary mb-4 text-sm">Pan and zoom the map to your target area, then fetch live satellite, elevation, and weather data.</p>
          <button 
            onClick={fetchLiveArea}
            disabled={!bounds || isFetching}
            className={`px-4 py-2 w-full rounded transition-colors font-bold ${isFetching || !bounds ? 'bg-bg-secondary text-text-secondary cursor-not-allowed' : 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/30'}`}
          >
            {isFetching ? 'Downloading Satellite Data...' : 'Fetch Live Area'}
          </button>
          
          {errorMsg && (
            <div className="mt-4 p-2 bg-accent-red/20 border border-accent-red/50 text-accent-red text-xs rounded">
              {errorMsg}
            </div>
          )}
        </div>
      ) : (
        <div className="border border-accent-green/30 rounded-lg p-4 bg-accent-green/10">
          <div className="text-accent-green font-bold mb-2 flex items-center">
            <span className="mr-2">✓</span> Area Data Active
          </div>
          <p className="text-xs text-text-secondary mb-4">Satellite imagery, elevation, and weather models are loaded for this area.</p>
          <button 
            onClick={() => clearAll()}
            className="w-full py-2 bg-accent-red/20 text-accent-red border border-accent-red/30 rounded hover:bg-accent-red/30 text-sm font-bold"
          >
            Clear / Select New Area
          </button>
        </div>
      )}
      
      {bounds && (
        <div className="mt-4 text-xs text-text-secondary font-mono bg-bg-card p-3 rounded grid grid-cols-2 gap-2">
          <div><span className="text-accent-cyan">N:</span> {bounds.max_lat.toFixed(4)}</div>
          <div><span className="text-accent-cyan">S:</span> {bounds.min_lat.toFixed(4)}</div>
          <div><span className="text-accent-cyan">E:</span> {bounds.max_lng.toFixed(4)}</div>
          <div><span className="text-accent-cyan">W:</span> {bounds.min_lng.toFixed(4)}</div>
        </div>
      )}
    </div>
  );
};

export const TerrainPanel = () => (
  <div className="p-4 text-text-primary">
    <h2 className="text-xl font-bold mb-4 glow-text text-accent-green">Terrain Intelligence</h2>
    <div className="space-y-2">
      <div className="flex justify-between p-2 bg-bg-card rounded"><span className="text-accent-green">Safe</span><span>45%</span></div>
      <div className="flex justify-between p-2 bg-bg-card rounded"><span className="text-accent-amber">Urban</span><span>30%</span></div>
      <div className="flex justify-between p-2 bg-bg-card rounded"><span className="text-accent-red">Exposed</span><span>25%</span></div>
    </div>
  </div>
);

export const RiskPanel = () => {
  const terrainData = useMissionStore((s) => s.terrainData);
  const weather = terrainData?.weather;

  return (
    <div className="p-4 text-text-primary">
      <h2 className="text-xl font-bold mb-4 glow-text text-accent-red">Risk Analysis</h2>
      
      {weather && (
        <div className="mb-4 p-4 bg-bg-card rounded border border-accent-cyan/30">
          <h3 className="text-accent-cyan font-bold mb-2 text-sm">Live Environmental Conditions</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
             <div>Visibility: <span className="font-mono">{weather.visibility_m}m</span></div>
             <div>Precip: <span className="font-mono">{weather.precipitation}mm</span></div>
          </div>
        </div>
      )}

      <div className="p-4 bg-bg-card rounded text-center">
        <p className="text-text-secondary text-sm">Overall Area Risk</p>
        <p className="text-3xl font-bold text-accent-amber">DYNAMIC</p>
      </div>
    </div>
  );
};

export const PathPlannerPanel = () => {
  const startPoint = useMapStore((s) => s.startPoint);
  const endPoint = useMapStore((s) => s.endPoint);
  const terrainData = useMissionStore((s) => s.terrainData);
  const setRoutes = useMissionStore((s) => s.setRoutes);
  const [isPlanning, setIsPlanning] = React.useState(false);
  const [noRouteFound, setNoRouteFound] = React.useState(false);

  const planRoute = async (missionType: string) => {
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
        terrain_id: terrainData.analysis.id,
        threats: useMissionStore.getState().threats
      });
      setRoutes(response.data.routes);
      if (response.data.routes.length === 0) {
        setNoRouteFound(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsPlanning(false);
    }
  };

  const clearPoints = () => {
    useMapStore.getState().setStartPoint(null);
    useMapStore.getState().setEndPoint(null);
    setRoutes([]);
    setNoRouteFound(false);
  };

  return (
    <div className="p-4 text-text-primary">
      <h2 className="text-xl font-bold mb-4 glow-text text-accent-cyan">Movement Planner</h2>
      
      {!terrainData && (
        <div className="mb-4 p-3 bg-accent-red/10 border border-accent-red/30 rounded text-accent-red text-sm">
          Please fetch Live Area first before planning routes.
        </div>
      )}
      
      {terrainData && (!startPoint || !endPoint) && (
        <div className="mb-4 p-3 bg-accent-amber/10 border border-accent-amber/30 rounded text-accent-amber text-sm">
          Please click on the map to place both a Start (S) and End (E) point.
        </div>
      )}

      {(startPoint || endPoint) && (
        <button 
          onClick={clearPoints}
          className="w-full py-2 mb-4 bg-accent-red/20 text-accent-red border border-accent-red/30 rounded hover:bg-accent-red/30 text-sm font-bold"
        >
          Clear Points
        </button>
      )}

      <div className="space-y-4">
        <button 
          disabled={!startPoint || !endPoint || !terrainData || isPlanning}
          onClick={() => planRoute('stealth')}
          className="w-full py-2 bg-bg-card hover:bg-accent-cyan/20 border border-accent-cyan/30 rounded text-left px-4 disabled:opacity-50">
          Stealth (Min Exposure)
        </button>
        <button 
          disabled={!startPoint || !endPoint || !terrainData || isPlanning}
          onClick={() => planRoute('fastest')}
          className="w-full py-2 bg-bg-card hover:bg-accent-amber/20 border border-accent-amber/30 rounded text-left px-4 disabled:opacity-50">
          Fastest (Min Distance)
        </button>
        <button 
          disabled={!startPoint || !endPoint || !terrainData || isPlanning}
          onClick={() => planRoute('safest')}
          className="w-full py-2 bg-bg-card hover:bg-accent-green/20 border border-accent-green/30 rounded text-left px-4 disabled:opacity-50">
          Safest (Min Risk)
        </button>
      </div>
      
      {isPlanning && <div className="mt-4 text-center text-accent-cyan text-sm animate-pulse">Calculating optimal routes...</div>}
      
      {noRouteFound && !isPlanning && (
        <div className="mt-4 p-3 bg-accent-red/20 border border-accent-red/50 text-accent-red text-sm rounded">
          <strong>No Path Found!</strong> The area between the Start and End points is entirely blocked by impassable terrain, buildings, or water. Try moving your markers.
        </div>
      )}
    </div>
  );
};

export const ObservationPanel = () => {
  const setClickMode = useUIStore((s) => s.setClickMode);
  const clickMode = useUIStore((s) => s.clickMode);
  const visibility = useMissionStore((s) => s.visibility);
  const terrainData = useMissionStore((s) => s.terrainData);

  return (
    <div className="p-4 text-text-primary">
      <h2 className="text-xl font-bold mb-4 glow-text text-accent-cyan">Observation</h2>
      
      {!terrainData ? (
        <div className="mb-4 p-3 bg-accent-red/10 border border-accent-red/30 rounded text-accent-red text-sm">
          Please fetch Live Area first.
        </div>
      ) : (
        <>
          <p className="text-text-secondary text-sm mb-4">Run a 3D viewshed analysis to determine Line-of-Sight visibility across the elevation model.</p>
          
          <button 
            onClick={() => setClickMode(clickMode === 'observer' ? 'none' : 'observer')}
            className={`w-full py-3 mb-6 rounded font-bold transition-colors ${clickMode === 'observer' ? 'bg-bg-secondary border-2 border-accent-cyan text-accent-cyan animate-pulse' : 'bg-bg-card border-2 border-transparent hover:border-accent-cyan/50 text-text-primary'}`}
          >
            {clickMode === 'observer' ? 'Click on map to place Observer...' : 'Place Observer Point'}
          </button>

          {visibility && (
            <div className="border border-accent-cyan/30 bg-bg-card rounded p-4">
              <h3 className="font-bold text-accent-cyan mb-2">Viewshed Results</h3>
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="text-text-secondary">Area Coverage:</span>
                <span className="font-mono font-bold">{visibility.coverage_pct}%</span>
              </div>
              <div className="h-2 w-full bg-bg-secondary rounded overflow-hidden">
                <div 
                  className="h-full bg-accent-cyan" 
                  style={{ width: `${visibility.coverage_pct}%` }}
                />
              </div>
              <p className="text-xs text-text-secondary mt-4">
                Blue zones indicate direct Line-of-Sight. Dark zones are occluded by elevation or structures.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

import { MissionReplay } from '../mission/MissionReplay';
import { StrategyComparison } from '../mission/StrategyComparison';

export const ThreatPanel = () => {
  const activeThreat = useUIStore((s) => s.activeThreatType);
  const setActiveThreat = useUIStore((s) => s.setActiveThreatType);
  const setClickMode = useUIStore((s) => s.setClickMode);
  
  const threatsList = useMissionStore((s) => s.threats);
  const removeThreat = useMissionStore((s) => s.removeThreat);

  const threats = [
    { id: 'sniper', label: 'Sniper Position', color: 'border-accent-red' },
    { id: 'checkpoint', label: 'Enemy Checkpoint', color: 'border-accent-amber' },
    { id: 'ied', label: 'IED Suspected', color: 'border-accent-red' },
    { id: 'patrol', label: 'Patrol Route', color: 'border-accent-amber' }
  ];

  const handleDelete = (id: string) => {
    removeThreat(id);
    // In a real implementation we would also hit DELETE /threats/:id
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
      <h2 className="text-xl font-bold mb-4 glow-text text-accent-red">Threat Injection</h2>
      <p className="text-text-secondary text-sm mb-4">Select a threat type and click on the map to inject it into the simulation environment.</p>
      
      <div className="grid grid-cols-2 gap-3 mt-4">
        {threats.map(t => (
          <button 
            key={t.id}
            onClick={() => handleSelectThreat(t.id)}
            className={`p-3 bg-bg-card rounded border-2 transition-colors ${activeThreat === t.id ? t.color + ' bg-bg-secondary' : 'border-transparent hover:border-bg-secondary'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeThreat && (
        <div className="mt-6 p-4 bg-accent-red/10 border border-accent-red/30 rounded flex justify-between items-center">
          <p className="text-accent-red text-sm font-bold animate-pulse">Click on map to place threat</p>
          <button onClick={() => { setActiveThreat(null); setClickMode('none'); }} className="text-text-secondary hover:text-text-primary">✕</button>
        </div>
      )}

      {threatsList.length > 0 && (
        <div className="mt-8 border-t border-bg-secondary pt-4">
          <h3 className="font-bold text-accent-red mb-3">Active Threats on Map</h3>
          <div className="space-y-2">
            {threatsList.map(t => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-bg-card border border-accent-red/20 rounded">
                <div>
                  <div className="font-bold capitalize">{t.type.replace('_', ' ')}</div>
                  <div className="text-xs text-text-secondary font-mono">
                    [{t.position.lat.toFixed(4)}, {t.position.lng.toFixed(4)}]
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(t.id)}
                  className="px-3 py-1 bg-accent-red/20 text-accent-red rounded hover:bg-accent-red/40 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const WhatIfPanel = () => {
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const terrainData = useMissionStore((s) => s.terrainData);

  const [scenarioType, setScenarioType] = React.useState('Main Route Blocked');

  const runSimulation = async () => {
    setIsSimulating(true);
    setResult(null);
    try {
      const response = await api.post('/whatif/simulate', { 
        scenario_type: scenarioType,
        params: { terrain_id: terrainData?.analysis?.id }
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-4 text-text-primary flex flex-col h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 glow-text text-accent-amber">What-If Simulation</h2>
      
      <div className="mb-6">
        <label className="block text-sm text-text-secondary mb-2">Scenario Type</label>
        <select 
          className="w-full bg-bg-card border border-bg-secondary rounded p-2 text-text-primary"
          value={scenarioType}
          onChange={(e) => setScenarioType(e.target.value)}
        >
          <option>Main Route Blocked</option>
          <option>Weather Deterioration (Fog)</option>
          <option>Unexpected Threat Encounter</option>
          <option>Comms Jamming</option>
        </select>
      </div>

      <button 
        onClick={runSimulation}
        disabled={isSimulating}
        className={`w-full p-3 rounded font-bold transition-colors ${isSimulating ? 'bg-bg-secondary text-text-secondary' : 'bg-accent-amber/20 border border-accent-amber text-accent-amber hover:bg-accent-amber/30'}`}
      >
        {isSimulating ? 'Running Simulation...' : 'Run Scenario'}
      </button>

      {result && (
        <div className="mt-6 border border-accent-amber/30 rounded p-4 bg-bg-card">
          <h3 className="font-bold text-accent-amber mb-2">Simulation Results</h3>
          <div className="text-sm text-text-secondary mb-4 space-y-1">
            {result.changes.map((change: string, idx: number) => (
              <p key={idx}>• {change}</p>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-bg-primary p-2 rounded">
              <div className="text-text-secondary text-xs">Risk Change</div>
              <div className="text-accent-red font-bold">
                +{(result.after_metrics.avg_risk - result.before_metrics.avg_risk).toFixed(2)}
              </div>
            </div>
            <div className="bg-bg-primary p-2 rounded">
              <div className="text-text-secondary text-xs">Impact</div>
              <div className="text-accent-amber font-bold">Severe</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-bg-secondary pt-4">
        <MissionReplay />
      </div>
      <div className="mt-4">
        <StrategyComparison />
      </div>
    </div>
  );
};

export const AIAssistantPanel = () => {
  const [query, setQuery] = React.useState('');
  const [isThinking, setIsThinking] = React.useState(false);
  const [chatHistory, setChatHistory] = React.useState<Array<{role: string, content: string}>>([
    { role: 'system', content: 'How can I assist with your mission planning?' }
  ]);
  const terrainData = useMissionStore((s) => s.terrainData);
  const threats = useMissionStore((s) => s.threats);
  const routes = useMissionStore((s) => s.routes);

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
      
      // If there are actions, we could theoretically execute them here
      // e.g. if action.type === 'plan_route', trigger route planning
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, { role: 'system', content: 'Error communicating with AI Assistant.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="p-4 text-text-primary flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4 glow-text text-accent-cyan">AI Tactical Assistant</h2>
      
      <div className="flex-1 border border-bg-secondary rounded p-4 mb-4 bg-bg-card/50 overflow-y-auto space-y-3 flex flex-col">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`p-2 rounded max-w-[85%] ${msg.role === 'user' ? 'bg-bg-secondary ml-auto border border-text-secondary/20' : 'bg-accent-cyan/10 border border-accent-cyan/30 mr-auto text-accent-cyan'}`}>
            <p className="text-sm">{msg.content}</p>
          </div>
        ))}
        {isThinking && (
          <div className="p-2 rounded max-w-[85%] bg-accent-cyan/10 border border-accent-cyan/30 mr-auto text-accent-cyan">
            <p className="text-sm animate-pulse">Thinking...</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-bg-secondary border border-bg-card rounded p-2 text-text-primary outline-none focus:border-accent-cyan" 
          placeholder="Ask AI..." 
        />
        <button 
          onClick={handleSend}
          disabled={!query.trim() || isThinking}
          className="px-4 py-2 bg-accent-cyan text-bg-primary font-bold rounded disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};
