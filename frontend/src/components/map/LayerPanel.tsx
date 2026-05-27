import React from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { useMapStore } from '../../stores/mapStore';
import Toggle from '../common/Toggle';
import Slider from '../common/Slider';

const layerIcons: Record<string, string> = {
  terrain: '🗺',
  heatmap: '🔥',
  routes: '🛤',
  threats: '⚠',
  visibility: '👁',
  grid: '▦',
};

export default function LayerPanel() {
  const layers = useMapStore((s) => s.layers);
  const toggleLayer = useMapStore((s) => s.toggleLayer);
  const setLayerOpacity = useMapStore((s) => s.setLayerOpacity);
  const [expanded, setExpanded] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-4 left-4 z-[1000]"
    >
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`
          w-9 h-9 rounded-lg flex items-center justify-center
          border transition-all cursor-pointer
          ${
            expanded
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
              : 'bg-slate-800/80 border-cyan-500/20 text-slate-400 hover:text-cyan-400'
          }
        `}
      >
        <Layers className="w-4 h-4" />
      </button>

      {/* Expanded panel */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mt-2 w-56 glass-card p-3 space-y-2"
        >
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Map Layers
          </h4>
          {layers.map((layer) => (
            <div key={layer.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">{layerIcons[layer.id] || '📍'}</span>
                <span className="text-xs text-slate-300 flex-1">{layer.name}</span>
                <Toggle
                  checked={layer.visible}
                  onChange={() => toggleLayer(layer.id)}
                  size="sm"
                />
              </div>
              {layer.visible && (
                <Slider
                  min={0}
                  max={1}
                  step={0.05}
                  value={layer.opacity}
                  onChange={(val) => setLayerOpacity(layer.id, val)}
                  label="Opacity"
                  formatValue={(v) => `${Math.round(v * 100)}%`}
                  className="pl-6"
                />
              )}
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
