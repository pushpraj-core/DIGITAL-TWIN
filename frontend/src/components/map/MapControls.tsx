import React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Minus,
  Locate,
  Grid3x3,
  Navigation,
} from 'lucide-react';
import { useMap } from 'react-leaflet';
import { useMapStore } from '../../stores/mapStore';
import { formatCoordinates } from '../../utils/format';
import Tooltip from '../common/Tooltip';

function ZoomControl() {
  const map = useMap();
  return (
    <>
      <Tooltip title="Zoom In" position="left" delay={500}>
        <button
          onClick={() => map.zoomIn()}
          className="w-8 h-8 rounded-md flex items-center justify-center bg-slate-800/80 border border-cyan-500/20 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </Tooltip>
      <Tooltip title="Zoom Out" position="left" delay={500}>
        <button
          onClick={() => map.zoomOut()}
          className="w-8 h-8 rounded-md flex items-center justify-center bg-slate-800/80 border border-cyan-500/20 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>
      </Tooltip>
    </>
  );
}

function RecenterButton() {
  const map = useMap();
  const center = useMapStore((s) => s.center);
  return (
    <Tooltip title="Recenter Map" description="Center on the active mission area." position="left" delay={500}>
      <button
        onClick={() => map.setView([center.lat, center.lng], 13)}
        className="w-8 h-8 rounded-md flex items-center justify-center bg-slate-800/80 border border-cyan-500/20 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all cursor-pointer"
      >
        <Locate className="w-4 h-4" />
      </button>
    </Tooltip>
  );
}

function GridToggle() {
  const toggleLayer = useMapStore((s) => s.toggleLayer);
  const layers = useMapStore((s) => s.layers);
  const gridVisible = layers.find((l) => l.id === 'grid')?.visible ?? false;

  return (
    <Tooltip title="Toggle Grid" description="Show/hide tactical map grid overlays." position="left" delay={500}>
      <button
        onClick={() => toggleLayer('grid')}
        className={`w-8 h-8 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
          gridVisible
            ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
            : 'bg-slate-800/80 border-cyan-500/20 text-slate-400 hover:text-cyan-400'
        }`}
      >
        <Grid3x3 className="w-4 h-4" />
      </button>
    </Tooltip>
  );
}

function CoordFormatToggle() {
  const coordinateFormat = useMapStore((s) => s.coordinateFormat);
  const setCoordinateFormat = useMapStore((s) => s.setCoordinateFormat);

  return (
    <Tooltip title={`Format: ${coordinateFormat.toUpperCase()}`} description="Switch between Decimal and DMS formats." position="left" delay={500}>
      <button
        onClick={() =>
          setCoordinateFormat(coordinateFormat === 'decimal' ? 'dms' : 'decimal')
        }
        className="w-8 h-8 rounded-md flex items-center justify-center bg-slate-800/80 border border-cyan-500/20 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all cursor-pointer"
      >
        <Navigation className="w-4 h-4" />
      </button>
    </Tooltip>
  );
}

// This wrapper exists so we can use useMap() inside MapContainer
export function MapControlsInner() {
  const mousePosition = useMapStore((s) => s.mousePosition);
  const coordinateFormat = useMapStore((s) => s.coordinateFormat);

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1.5">
      <ZoomControl />
      <div className="h-px bg-slate-700/40 mx-1" />
      <RecenterButton />
      <GridToggle />
      <CoordFormatToggle />

      {/* Mouse position */}
      {mousePosition && (
        <div className="mt-2 px-2 py-1 rounded bg-slate-900/80 border border-cyan-500/10 text-[10px] font-mono text-cyan-400/70 whitespace-nowrap">
          {formatCoordinates(mousePosition.lat, mousePosition.lng, coordinateFormat)}
        </div>
      )}
    </div>
  );
}

// Exported as standalone floating panel (renders outside MapContainer)
export default function MapControls() {
  const mousePosition = useMapStore((s) => s.mousePosition);
  const coordinateFormat = useMapStore((s) => s.coordinateFormat);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-4 right-4 z-[1000] flex flex-col gap-1.5"
    >
      {/* Mouse position display */}
      {mousePosition && (
        <div className="px-2 py-1 rounded bg-slate-900/80 border border-cyan-500/10 text-[10px] font-mono text-cyan-400/70 whitespace-nowrap text-center">
          {formatCoordinates(mousePosition.lat, mousePosition.lng, coordinateFormat)}
        </div>
      )}
    </motion.div>
  );
}
