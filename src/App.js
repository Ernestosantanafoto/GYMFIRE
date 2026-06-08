import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";
import { DEFAULT_PROTOCOL } from "./data/protocol";

const typeTag = { warmup: "INIT", superset: "SUPER", main: "PRINCIPAL", circuit: "CIRCUIT", core: "CORE_ABS" };

function Scanline() {
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 998, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)" }} />;
}

function generateSessionLog(day, completed, notes, elapsed, week) {
  const date = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  let log = `**Semana ${week} · ${date.charAt(0).toUpperCase() + date.slice(1)} — ${day.name}**\n`;
  log += `- Duración: ${fmt(elapsed)}\n`;
  day.blocks.forEach((block, bi) => {
    if (block.type === "warmup") return;
    log += `- ${block.name.replace(/MÓDULO \d+ — /, "").replace("PROTOCOLO ", "")}:\n`;
    block.exercises.forEach((ex, ei) => {
      const setLines = ex.sets.map((set, si) => {
        const key = `${bi}-${ei}-${si}`;
        const isDone = completed[key];
        const realW = notes[key];
        const w = realW ? `${realW}kg` : (set.weight ? `${set.weight}kg` : "");
        const r = typeof set.reps === "number" ? `${set.reps}r` : set.reps;
        return `${isDone ? "✓" : "—"} ${r}${w ? "×" + w : ""}`;
      }).join(" / ");
      log += `  - ${ex.name}: ${setLines}\n`;
    });
  });
  return log;
}

export default function App() {
  const [protocol, setProtocol] = useState(DEFAULT_PROTOCOL);
  const [screen, setScreen] = useState("home");
  const [activeDay, setActiveDay] = useState(null);
  const [pendingDay, setPendingDay] = useState(null);
  const [completed, setCompleted] = useState({});
  const [notes, setNotes] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [restTimer, setRestTimer] = useState(null);
  const [restCount, setRestCount] = useState(0);
  const [sessionLog, setSessionLog] = useState("");
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const [completedDays, setCompletedDays] = useState([]);
  const [lastExportData, setLastExportData] = useState(null);
  const [dbStatus, setDbStatus] = useState("idle"); // idle | saving | saved | error
  const [recentLogs, setRecentLogs] = useState([]);
  const timerRef = useRef(null);
  const restRef = useRef(null);
  const importRef = useRef(null);

  // Load latest protocol and recent logs from Supabase on mount
  useEffect(() => {
    loadLatestProtocol();
    loadRecentLogs();
  }, []);

  const loadLatestProtocol = async () => {
    const { data, error } = await supabase
      .from("protocols")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (!error && data) {
      setProtocol(data.protocol_data);
    }
  };

  const loadRecentLogs = async () => {
    const { data, error } = await supabase
      .from("session_logs")
      .select("id, day_name, week, duration, completed_sets, created_at")
      .order("created_at", { ascending: false })
      .limit(8);
    if (!error && data) setRecentLogs(data);
  };

  const saveSessionToSupabase = async (exportData, logText) => {
    setDbStatus("saving");
    const { error } = await supabase.from("session_logs").insert({
      week: exportData.meta.week,
      day_id: exportData.meta.dayId,
      day_name: exportData.meta.dayName,
      duration: exportData.meta.duration,
      completed_sets: exportData.meta.completedSets,
      total_sets: exportData.meta.totalSets,
      log_text: logText,
      exercises_data: exportData.exercises,
      session_date: new Date().toISOString(),
    });
    if (error) {
      setDbStatus("error");
      console.error("Supabase error:", error);
    } else {
      setDbStatus("saved");
      loadRecentLogs();
      setTimeout(() => setDbStatus("idle"), 3000);
    }
  };

  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (screen === "session") {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [screen]);

  const startRest = (secs) => {
    if (restRef.current) clearInterval(restRef.current);
    setRestCount(secs);
    setRestTimer(secs);
    restRef.current = setInterval(() => {
      setRestCount(c => {
        if (c <= 1) { clearInterval(restRef.current); setRestTimer(null); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const totalSets = (day) => day.blocks.reduce((a, b) => a + b.exercises.reduce((c, e) => c + e.sets.length, 0), 0);
  const doneSets = () => Object.values(completed).filter(Boolean).length;

  const toggleSet = (key) => {
    if (!completed[key]) startRest(90);
    setCompleted(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectDay = (day) => { setPendingDay(day); setScreen("confirm"); };
  const handleStart = () => { setActiveDay(pendingDay); setCompleted({}); setNotes({}); setElapsed(0); setScreen("session"); };
  const handleExit = () => {
    clearInterval(timerRef.current); clearInterval(restRef.current);
    setRestTimer(null); setScreen("home"); setActiveDay(null); setPendingDay(null);
  };

  const handleFinish = () => {
    clearInterval(timerRef.current); clearInterval(restRef.current); setRestTimer(null);
    const log = generateSessionLog(activeDay, completed, notes, elapsed, protocol.week);
    setSessionLog(log);
    const exportData = {
      meta: { week: protocol.week, date: new Date().toISOString(), dayId: activeDay.id, dayName: activeDay.name, duration: elapsed, completedSets: doneSets(), totalSets: totalSets(activeDay) },
      exercises: [],
    };
    activeDay.blocks.forEach((block, bi) => {
      if (block.type === "warmup") return;
      block.exercises.forEach((ex, ei) => {
        exportData.exercises.push({
          block: block.name, name: ex.name,
          sets: ex.sets.map((set, si) => {
            const key = `${bi}-${ei}-${si}`;
            return { setNum: si + 1, targetReps: set.reps, targetWeight: set.weight, realWeight: notes[key] ? parseFloat(notes[key]) : null, completed: !!completed[key] };
          }),
        });
      });
    });
    setLastExportData(exportData);
    if (!completedDays.includes(activeDay.id)) setCompletedDays(prev => [...prev, activeDay.id]);
    saveSessionToSupabase(exportData, log);
    setScreen("log");
  };

  const handleExportLog = (data) => {
    const exportData = data || lastExportData;
    if (!exportData) return;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `entreno_s${exportData.meta.week}_dia${exportData.meta.dayId}_${exportData.meta.date.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportError(""); setImportSuccess(false);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.week || !data.days || !Array.isArray(data.days)) {
          setImportError("⚠ ARCHIVO INVÁLIDO — Estructura incorrecta"); return;
        }
        setProtocol(data);
        setCompletedDays([]);
        // Save new protocol to Supabase
        await supabase.from("protocols").insert({ week: data.week, protocol_data: data });
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } catch { setImportError("⚠ ERROR — No se pudo leer el archivo JSON"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCopyLog = () => {
    navigator.clipboard.writeText(sessionLog).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const btnBase = { fontFamily: "'Courier New', monospace", cursor: "pointer", fontWeight: 900, letterSpacing: 3, fontSize: 11, padding: "14px 0", border: "1px solid", transition: "all 0.2s", width: "100%" };
  const DAYS = protocol.days;

  // ── HOME ─────────────────────────────────────────────────────
  if (screen === "home") {
    return (
      <div style={{ minHeight: "100vh", background: "#020408", fontFamily: "'Courier New', monospace", color: "#fff", paddingBottom: 48, backgroundImage: "radial-gradient(ellipse at 20% 20%, #001a2c 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #0d001a 0%, transparent 60%)" }}>
        <Scanline />

        {/* Header */}
        <div style={{ padding: "40px 20px 16px", position: "relative" }}>
          <div style={{ fontSize: 9, letterSpacing: 6, color: "#00FFD1", marginBottom: 4 }}>SISTEMA DE ENTRENAMIENTO · ERNESTO</div>
          <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.1, letterSpacing: -1, textShadow: "0 0 30px #00FFD155" }}>
            SEMANA <span style={{ color: "#00FFD1", textShadow: "0 0 20px #00FFD1" }}>{protocol.week}</span>
          </div>
          <div style={{ fontSize: 9, color: "#ffffff33", marginTop: 4, letterSpacing: 2 }}>{completedDays.length}/4 PROTOCOLOS ESTA SEMANA</div>
          <div style={{ position: "absolute", top: 40, right: 20, fontSize: 9, color: "#ffffff22", letterSpacing: 2, textAlign: "right" }}>
            {new Date().toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "2-digit" }).toUpperCase()}<br />
            <span style={{ color: pulse ? "#00FFD1" : "#00FFD144" }}>● ONLINE</span>
          </div>
        </div>

        {/* Week progress bar */}
        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ height: 2, background: "#ffffff08" }}>
            <div style={{ height: "100%", width: `${(completedDays.length / 4) * 100}%`, background: "linear-gradient(90deg, #00FFD188, #00FFD1)", boxShadow: "0 0 8px #00FFD1", transition: "width 0.5s" }} />
          </div>
        </div>

        {/* Day cards */}
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {DAYS.map((day) => {
            const isDone = completedDays.includes(day.id);
            return (
              <button key={day.id} onClick={() => handleSelectDay(day)} style={{ background: "transparent", border: `1px solid ${isDone ? day.color + "66" : day.color + "44"}`, borderLeft: `3px solid ${isDone ? day.color : day.color + "77"}`, borderRadius: 2, padding: 0, color: "#fff", textAlign: "left", cursor: "pointer", overflow: "hidden", position: "relative", opacity: isDone ? 0.55 : 1 }}>
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${isDone ? day.color + "14" : day.glow} 0%, transparent 60%)`, pointerEvents: "none" }} />
                <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 42, height: 42, flexShrink: 0, border: `1px solid ${day.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {isDone ? "✓" : day.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, letterSpacing: 4, color: day.color, marginBottom: 3 }}>PROTOCOLO {day.id}</div>
                    <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 1 }}>{day.name}</div>
                    <div style={{ fontSize: 9, color: "#ffffff44", marginTop: 2, letterSpacing: 2 }}>{isDone ? "COMPLETADO" : `${day.blocks.filter(b => b.type !== "warmup").length} MÓDULOS · ${totalSets(day)} SERIES`}</div>
                  </div>
                  <div style={{ fontSize: 16, color: isDone ? day.color : day.color + "77" }}>{isDone ? "●" : "▶"}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Recent logs */}
        {recentLogs.length > 0 && (
          <div style={{ margin: "24px 16px 0" }}>
            <div style={{ fontSize: 8, letterSpacing: 4, color: "#ffffff22", marginBottom: 8 }}>ÚLTIMAS SESIONES</div>
            {recentLogs.slice(0, 4).map((log) => (
              <div key={log.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #ffffff06", fontSize: 9 }}>
                <span style={{ color: "#ffffff55" }}>S{log.week} · {log.day_name}</span>
                <span style={{ color: "#ffffff33", letterSpacing: 1 }}>{fmt(log.duration)} · {log.completed_sets} series</span>
              </div>
            ))}
          </div>
        )}

        {/* Alert */}
        <div style={{ margin: "20px 16px 0", border: "1px solid #FF000033", borderLeft: "3px solid #FF4444", padding: "10px 14px", fontSize: 9, color: "#FF444466", letterSpacing: 1.5, lineHeight: 2 }}>
          ⚠ HOMBRO IZQ — HISTORIAL LUXACIÓN × 2<br />
          ↑ SUBIR 2-3KG DONDE RPE &lt; 8 CADA SEMANA
        </div>

        {/* Divider */}
        <div style={{ margin: "24px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 1, background: "#ffffff08" }} />
          <div style={{ fontSize: 8, letterSpacing: 4, color: "#ffffff22" }}>GESTIÓN</div>
          <div style={{ flex: 1, height: 1, background: "#ffffff08" }} />
        </div>

        {/* Import + Export */}
        <div style={{ padding: "12px 16px 40px", display: "flex", flexDirection: "column", gap: 10 }}>
          <input ref={importRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
          <button onClick={() => importRef.current.click()} style={{ ...btnBase, padding: "13px 0", background: "transparent", borderColor: "#00FFD133", color: "#00FFD188", fontSize: 10 }}>
            ⬆ IMPORTAR PROTOCOLO SEMANAL
          </button>
          <button onClick={() => handleExportLog(null)} disabled={!lastExportData} style={{ ...btnBase, padding: "13px 0", background: "transparent", borderColor: lastExportData ? "#ffffff33" : "#ffffff0a", color: lastExportData ? "#ffffff88" : "#ffffff22", fontSize: 10, cursor: lastExportData ? "pointer" : "default" }}>
            ⬇ EXPORTAR ÚLTIMO LOG{lastExportData ? ` · S${lastExportData.meta.week} DÍA ${lastExportData.meta.dayId}` : ""}
          </button>
          {importError && <div style={{ fontSize: 9, color: "#FF4444", letterSpacing: 1 }}>{importError}</div>}
          {importSuccess && <div style={{ fontSize: 9, color: "#00FFD1", letterSpacing: 1 }}>✓ PROTOCOLO SEMANA {protocol.week} CARGADO</div>}
          {dbStatus === "saving" && <div style={{ fontSize: 9, color: "#FFD600", letterSpacing: 1 }}>● GUARDANDO EN BASE DE DATOS...</div>}
          {dbStatus === "saved" && <div style={{ fontSize: 9, color: "#00FFD1", letterSpacing: 1 }}>✓ SESIÓN GUARDADA EN BASE DE DATOS</div>}
          {dbStatus === "error" && <div style={{ fontSize: 9, color: "#FF4444", letterSpacing: 1 }}>⚠ ERROR AL GUARDAR — REVISA CONEXIÓN</div>}
        </div>
      </div>
    );
  }

  // ── CONFIRM ──────────────────────────────────────────────────
  if (screen === "confirm" && pendingDay) {
    const day = pendingDay;
    return (
      <div style={{ minHeight: "100vh", background: "#020408", fontFamily: "'Courier New', monospace", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", backgroundImage: `radial-gradient(ellipse at 50% 40%, ${day.glow} 0%, transparent 60%)` }}>
        <Scanline />
        <div style={{ fontSize: 9, letterSpacing: 6, color: day.color, marginBottom: 16, textShadow: `0 0 10px ${day.color}` }}>SEMANA {protocol.week} · PROTOCOLO {day.id}</div>
        <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1, textAlign: "center", marginBottom: 6, lineHeight: 1.1 }}>{day.emoji}<br />{day.name}</div>
        <div style={{ fontSize: 10, color: "#ffffff33", letterSpacing: 3, marginBottom: 48 }}>{totalSets(day)} SERIES · ~60 MIN</div>
        <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={handleStart} style={{ ...btnBase, background: day.color, borderColor: day.color, color: "#000", boxShadow: `0 0 30px ${day.color}55` }}>▶ INICIAR PROTOCOLO</button>
          <button onClick={handleExit} style={{ ...btnBase, background: "transparent", borderColor: "#ffffff22", color: "#ffffff44" }}>← VOLVER</button>
        </div>
      </div>
    );
  }

  // ── SESSION ──────────────────────────────────────────────────
  if (screen === "session" && activeDay) {
    const day = activeDay;
    const done = doneSets();
    const total = totalSets(day);
    const pct = Math.round((done / total) * 100);
    return (
      <div style={{ minHeight: "100vh", background: "#020408", fontFamily: "'Courier New', monospace", color: "#fff", paddingBottom: 120, backgroundImage: `radial-gradient(ellipse at 50% 0%, ${day.glow} 0%, transparent 50%)` }}>
        <Scanline />

        {restTimer !== null && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "#000000f0", display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0 16px", borderBottom: `2px solid ${day.color}`, backdropFilter: "blur(4px)" }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: day.color, marginBottom: 4 }}>DESCANSO</div>
            <div style={{ fontSize: 44, fontWeight: 900, color: restCount <= 30 ? "#FF4444" : day.color, textShadow: `0 0 20px ${restCount <= 30 ? "#FF4444" : day.color}`, fontVariantNumeric: "tabular-nums" }}>{fmt(restCount)}</div>
            <button onClick={() => { clearInterval(restRef.current); setRestTimer(null); }} style={{ marginTop: 6, fontSize: 9, letterSpacing: 3, color: "#ffffff44", background: "transparent", border: "1px solid #ffffff22", padding: "4px 18px", cursor: "pointer", fontFamily: "inherit" }}>SALTAR</button>
          </div>
        )}

        <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#020408f0", borderBottom: `1px solid ${day.color}44`, padding: "14px 16px 10px", backdropFilter: "blur(8px)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 8, letterSpacing: 4, color: day.color, marginBottom: 3 }}>S{protocol.week} · PROTOCOLO {day.id}</div>
              <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: 1 }}>{day.name}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: day.color, textShadow: `0 0 12px ${day.color}`, fontVariantNumeric: "tabular-nums", letterSpacing: 2 }}>{fmt(elapsed)}</div>
              <div style={{ fontSize: 9, color: "#ffffff33", letterSpacing: 2 }}>{done}/{total}</div>
            </div>
          </div>
          <div style={{ height: 2, background: "#ffffff0a" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${day.color}88, ${day.color})`, boxShadow: `0 0 8px ${day.color}`, transition: "width 0.4s" }} />
          </div>
          <div style={{ fontSize: 8, color: `${day.color}77`, letterSpacing: 3, marginTop: 4 }}>{pct}% COMPLETADO</div>
        </div>

        <div style={{ padding: "16px 14px 0" }}>
          {day.blocks.map((block, bi) => (
            <div key={bi} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, paddingBottom: 6, borderBottom: `1px solid ${day.color}1a` }}>
                <div style={{ fontSize: 7, letterSpacing: 2, padding: "2px 6px", background: `${day.color}18`, border: `1px solid ${day.color}44`, color: day.color }}>{typeTag[block.type] || "MOD"}</div>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 2, color: "#ffffff77" }}>{block.name}</div>
              </div>
              {block.note && <div style={{ fontSize: 8, color: "#ffffff2a", marginBottom: 7, letterSpacing: 1.5 }}>{block.note}</div>}
              {block.exercises.map((ex, ei) => (
                <div key={ei} style={{ background: "#ffffff04", border: "1px solid #ffffff08", borderLeft: `2px solid ${day.color}33`, marginBottom: 8 }}>
                  <div style={{ padding: "8px 12px 6px", borderBottom: "1px solid #ffffff06", fontSize: 11, fontWeight: 700, color: ex.name.includes("⚠️") ? "#FFD600" : "#ffffffbb" }}>{ex.name}</div>
                  {ex.sets.map((set, si) => {
                    const key = `${bi}-${ei}-${si}`;
                    const isDone = completed[key];
                    return (
                      <div key={si} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderBottom: si < ex.sets.length - 1 ? "1px solid #ffffff05" : "none", background: isDone ? `${day.color}07` : "transparent" }}>
                        <button onClick={() => toggleSet(key)} style={{ width: 28, height: 28, flexShrink: 0, background: isDone ? day.color : "transparent", border: `1px solid ${isDone ? day.color : "#ffffff1a"}`, color: isDone ? "#000" : "#ffffff33", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontFamily: "inherit", boxShadow: isDone ? `0 0 10px ${day.color}` : "none", transition: "all 0.15s" }}>
                          {isDone ? "✓" : ""}
                        </button>
                        <div style={{ fontSize: 8, color: "#ffffff1a", width: 14 }}>S{si + 1}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: isDone ? "#ffffff2a" : "#ffffffaa", minWidth: 52, textDecoration: isDone ? "line-through" : "none" }}>
                          {set.reps}{typeof set.reps === "number" ? "r" : ""}
                        </div>
                        {set.weight !== null && (
                          <div style={{ fontSize: 9, color: day.color, border: `1px solid ${day.color}33`, padding: "2px 6px", opacity: isDone ? 0.35 : 1 }}>{set.weight}kg</div>
                        )}
                        {set.weight !== null && (
                          <input type="number" inputMode="decimal" placeholder="real" value={notes[key] || ""} onChange={(e) => setNotes(prev => ({ ...prev, [key]: e.target.value }))}
                            style={{ width: 50, padding: "4px 6px", background: "#ffffff07", border: `1px solid ${notes[key] ? day.color + "77" : "#ffffff0f"}`, color: notes[key] ? day.color : "#ffffff33", fontSize: 12, fontFamily: "inherit", textAlign: "center", outline: "none", borderRadius: 2 }} />
                        )}
                        {set.note && <div style={{ fontSize: 8, color: "#FFD60077" }}>{set.note}</div>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 8, letterSpacing: 3, color: "#ffffff18", marginBottom: 7 }}>DESCANSO MANUAL</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[60, 90, 120].map(s => (
                <button key={s} onClick={() => startRest(s)} style={{ flex: 1, padding: "10px 0", background: "transparent", border: `1px solid ${day.color}2a`, color: day.color, fontSize: 10, fontFamily: "inherit", letterSpacing: 2, cursor: "pointer" }}>{s}s</button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={handleFinish} style={{ ...btnBase, background: pct === 100 ? day.color : "#ffffff0a", borderColor: pct === 100 ? day.color : "#ffffff18", color: pct === 100 ? "#000" : "#fff", boxShadow: pct === 100 ? `0 0 30px ${day.color}55` : "none" }}>
              {pct === 100 ? "✓ COMPLETADO — VER LOG" : "■ TERMINAR Y VER LOG"}
            </button>
            <button onClick={handleExit} style={{ ...btnBase, background: "transparent", borderColor: "#FF444422", color: "#FF444455", padding: "10px 0" }}>
              ✕ SALIR SIN GUARDAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LOG ──────────────────────────────────────────────────────
  if (screen === "log") {
    const day = activeDay;
    return (
      <div style={{ minHeight: "100vh", background: "#020408", fontFamily: "'Courier New', monospace", color: "#fff", paddingBottom: 60, backgroundImage: `radial-gradient(ellipse at 50% 20%, ${day.glow} 0%, transparent 50%)` }}>
        <Scanline />
        <div style={{ padding: "32px 20px 16px" }}>
          <div style={{ fontSize: 9, letterSpacing: 6, color: day.color, marginBottom: 6, textShadow: `0 0 10px ${day.color}` }}>SESIÓN REGISTRADA</div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>LOG · S{protocol.week} · DÍA {day.id}</div>
          <div style={{ fontSize: 9, color: "#ffffff33", marginTop: 4, letterSpacing: 2 }}>{fmt(elapsed)} MIN · {doneSets()} SERIES</div>
          {dbStatus === "saving" && <div style={{ fontSize: 9, color: "#FFD600", marginTop: 6, letterSpacing: 1 }}>● GUARDANDO EN BASE DE DATOS...</div>}
          {dbStatus === "saved" && <div style={{ fontSize: 9, color: "#00FFD1", marginTop: 6, letterSpacing: 1 }}>✓ GUARDADO EN BASE DE DATOS</div>}
        </div>

        <div style={{ margin: "0 16px 16px", background: "#ffffff04", border: `1px solid ${day.color}2a`, borderLeft: `3px solid ${day.color}`, padding: "14px" }}>
          <pre style={{ fontSize: 10, lineHeight: 1.9, color: "#ffffffcc", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, fontFamily: "'Courier New', monospace" }}>
            {sessionLog}
          </pre>
        </div>

        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => handleExportLog(null)} style={{ ...btnBase, background: "transparent", borderColor: day.color, color: day.color, boxShadow: `0 0 10px ${day.color}22` }}>
            ⬇ EXPORTAR LOG (.json)
          </button>
          <button onClick={handleCopyLog} style={{ ...btnBase, background: copied ? day.color : "transparent", borderColor: copied ? day.color : "#ffffff22", color: copied ? "#000" : "#ffffff55" }}>
            {copied ? "✓ COPIADO" : "⎘ COPIAR TEXTO"}
          </button>
          <button onClick={() => { setScreen("home"); setActiveDay(null); }} style={{ ...btnBase, background: "transparent", borderColor: "#ffffff18", color: "#ffffff33", padding: "10px 0" }}>
            ← VOLVER AL INICIO
          </button>
        </div>
      </div>
    );
  }

  return null;
}
