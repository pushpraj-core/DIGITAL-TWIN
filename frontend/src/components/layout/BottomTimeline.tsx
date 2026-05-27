import React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  ChevronUp,
  ChevronDown,
  Clock,
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useMissionStore } from '../../stores/missionStore';
import { formatTimestamp } from '../../utils/format';

const speedOptions = [0.5, 1, 2, 4];

export default function BottomTimeline() {
  const bottomPanelOpen = useUIStore((s) => s.bottomPanelOpen);
  const toggleBottomPanel = useUIStore((s) => s.toggleBottomPanel);
  const isReplaying = useUIStore((s) => s.isReplaying);
  const setIsReplaying = useUIStore((s) => s.setIsReplaying);
  const replaySpeed = useUIStore((s) => s.replaySpeed);
  const setReplaySpeed = useUIStore((s) => s.setReplaySpeed);
  const replayProgress = useUIStore((s) => s.replayProgress);
  const setReplayProgress = useUIStore((s) => s.setReplayProgress);
  const timeline = useMissionStore((s) => s.missionTimeline);

  const duration = timeline?.duration ?? 0;
  const events = timeline?.events ?? [];
  const currentTime = duration * replayProgress;

  return (
    <div
      className="border-t border-cyan-500/10"
      style={{ background: 'rgba(10, 14, 26, 0.95)' }}
    >
      {/* Collapse toggle bar */}
      <button
        onClick={toggleBottomPanel}
        className="w-full h-7 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
      >
        {bottomPanelOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronUp className="w-4 h-4" />
        )}
        <span className="text-[10px] font-mono uppercase tracking-wider">
          Mission Timeline
        </span>
        {bottomPanelOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronUp className="w-4 h-4" />
        )}
      </button>

      {/* Timeline content */}
      {bottomPanelOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-3"
        >
          {/* Controls row */}
          <div className="flex items-center gap-3 mb-2">
            {/* Play controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setReplayProgress(0)}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-700/40 transition-colors cursor-pointer"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsReplaying(!isReplaying)}
                className="w-8 h-8 rounded-md flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors cursor-pointer"
              >
                {isReplaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Current time */}
            <div className="flex items-center gap-1.5 min-w-[80px]">
              <Clock className="w-3 h-3 text-slate-600" />
              <span className="text-xs font-mono text-cyan-400 tabular-nums">
                {formatTimestamp(currentTime)}
              </span>
              <span className="text-[10px] text-slate-600 font-mono">
                / {formatTimestamp(duration)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="flex-1 relative h-6 flex items-center group cursor-pointer">
              <div className="absolute inset-x-0 h-1 rounded-full bg-slate-700/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500/50 to-cyan-400 transition-all duration-150"
                  style={{ width: `${replayProgress * 100}%` }}
                />
              </div>
              {/* Event markers */}
              {events.map((event, i) => {
                const pos = duration > 0 ? (event.timestamp / duration) * 100 : 0;
                const color =
                  event.type === 'threat'
                    ? 'bg-red-400'
                    : event.type === 'alert'
                    ? 'bg-amber-400'
                    : event.type === 'start' || event.type === 'end'
                    ? 'bg-emerald-400'
                    : 'bg-cyan-400';
                return (
                  <div
                    key={i}
                    className={`absolute w-1.5 h-3 rounded-sm ${color} opacity-60`}
                    style={{ left: `${pos}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
                    title={event.description}
                  />
                );
              })}
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={replayProgress}
                onChange={(e) => setReplayProgress(parseFloat(e.target.value))}
                className="absolute inset-x-0 w-full h-6 opacity-0 cursor-pointer"
              />
            </div>

            {/* Speed selector */}
            <div className="flex items-center gap-1">
              {speedOptions.map((sp) => (
                <button
                  key={sp}
                  onClick={() => setReplaySpeed(sp)}
                  className={`
                    px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer
                    ${
                      replaySpeed === sp
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'text-slate-600 hover:text-slate-400'
                    }
                  `}
                >
                  {sp}x
                </button>
              ))}
            </div>
          </div>

          {/* Event log */}
          <div className="max-h-20 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-xs text-slate-600 font-mono text-center py-2">
                No mission events. Plan a route to generate timeline.
              </p>
            ) : (
              <div className="space-y-0.5">
                {events.map((event, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2 py-0.5 rounded text-[11px] hover:bg-slate-700/20"
                  >
                    <span className="font-mono text-slate-600 tabular-nums w-16">
                      {formatTimestamp(event.timestamp)}
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        event.type === 'threat'
                          ? 'bg-red-400'
                          : event.type === 'alert'
                          ? 'bg-amber-400'
                          : 'bg-cyan-400'
                      }`}
                    />
                    <span className="text-slate-400 truncate">
                      {event.description}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
