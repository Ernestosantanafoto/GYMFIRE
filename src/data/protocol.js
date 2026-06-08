export const DEFAULT_PROTOCOL = {
  week: 1,
  days: [
    {
      id: "A", name: "PECHO + TRÍCEPS", emoji: "🏋️", color: "#00FFD1", glow: "#00FFD133",
      blocks: [
        { name: "INICIALIZACIÓN", type: "warmup", exercises: [
          { name: "Cinta 8km/h", sets: [{ reps: "5min", weight: null }] },
          { name: "Movilidad hombro + banda", sets: [{ reps: "3×10r", weight: null }] },
        ]},
        { name: "MÓDULO 01 — FUERZA BASE", type: "superset", note: "SUPERSERIE × 4 · PIRÁMIDE 15-12-10-8", exercises: [
          { name: "Press horizontal máquina", sets: [{ reps: 15, weight: 17 }, { reps: 12, weight: 23 }, { reps: 10, weight: 29 }, { reps: 8, weight: 35 }] },
          { name: "Tríceps polea alta (V)", sets: [{ reps: 15, weight: 17 }, { reps: 12, weight: 23 }, { reps: 10, weight: 29 }, { reps: 8, weight: 35 }] },
        ]},
        { name: "MÓDULO 02 — VOLUMEN PECHO", type: "superset", note: "SUPERSERIE × 3 · 10-8-8", exercises: [
          { name: "Press inclinado Multipower", sets: [{ reps: 10, weight: 30 }, { reps: 8, weight: 40 }, { reps: 8, weight: 40 }] },
          { name: "Aperturas mancuernas plano", sets: [{ reps: 10, weight: 10 }, { reps: 8, weight: 12.5 }, { reps: 8, weight: 12.5 }] },
        ]},
        { name: "MÓDULO 03 — AISLAMIENTO", type: "superset", note: "SUPERSERIE × 3 · 12-10-8", exercises: [
          { name: "Extensión tríceps trasnuca", sets: [{ reps: 12, weight: 10 }, { reps: 10, weight: 12.5 }, { reps: 8, weight: 15 }] },
          { name: "Flexiones al fallo (pausa)", sets: [{ reps: "FALLO", weight: null }, { reps: "FALLO", weight: null }, { reps: "FALLO", weight: null }] },
        ]},
        { name: "PROTOCOLO CORE", type: "core", note: "3 RONDAS · SIN DESCANSO", exercises: [
          { name: "Plancha", sets: [{ reps: "30s", weight: null }, { reps: "30s", weight: null }, { reps: "30s", weight: null }] },
          { name: "Escalador", sets: [{ reps: 20, weight: null }, { reps: 20, weight: null }, { reps: 20, weight: null }] },
          { name: "Rueda abdominal", sets: [{ reps: 10, weight: null }, { reps: 10, weight: null }, { reps: 10, weight: null }] },
        ]},
      ],
    },
    {
      id: "B", name: "ESPALDA + BÍCEPS", emoji: "💪", color: "#00C8FF", glow: "#00C8FF33",
      blocks: [
        { name: "INICIALIZACIÓN", type: "warmup", exercises: [
          { name: "Cinta 8km/h", sets: [{ reps: "5min", weight: null }] },
          { name: "Dominadas escapulares", sets: [{ reps: 10, weight: null }] },
        ]},
        { name: "MÓDULO 01 — TRACCIÓN VERTICAL", type: "superset", note: "SUPERSERIE × 3 · 12-10-8", exercises: [
          { name: "Polea alta agarre ancho", sets: [{ reps: 12, weight: 35 }, { reps: 10, weight: 41 }, { reps: 8, weight: 47 }] },
          { name: "Curl bíceps barra Z", sets: [{ reps: 12, weight: 10 }, { reps: 10, weight: 12.5 }, { reps: 8, weight: 15 }] },
        ]},
        { name: "MÓDULO 02 — TRACCIÓN HORIZONTAL", type: "superset", note: "SUPERSERIE × 3 · 10-8-8", exercises: [
          { name: "Easy Pull / Remo máquina", sets: [{ reps: 10, weight: 47 }, { reps: 8, weight: 53 }, { reps: 8, weight: 59 }] },
          { name: "Curl predicador polea baja", sets: [{ reps: 10, weight: 17 }, { reps: 8, weight: 17 }, { reps: 8, weight: 17 }] },
        ]},
        { name: "MÓDULO 03 — AISLAMIENTO BÍCEPS", type: "superset", note: "3 SERIES · 10-8-6", exercises: [
          { name: "Curl martillo mancuernas", sets: [{ reps: 10, weight: 10 }, { reps: 8, weight: 12.5 }, { reps: 6, weight: 15 }] },
          { name: "Chin-ups (banda si hace falta)", sets: [{ reps: "FALLO", weight: null }, { reps: "FALLO", weight: null }, { reps: "FALLO", weight: null }] },
        ]},
        { name: "PROTOCOLO CORE", type: "core", note: "3 RONDAS", exercises: [
          { name: "Pallof press polea (10+10)", sets: [{ reps: "10+10", weight: null }, { reps: "10+10", weight: null }, { reps: "10+10", weight: null }] },
          { name: "Rueda abdominal", sets: [{ reps: 10, weight: null }, { reps: 10, weight: null }, { reps: 10, weight: null }] },
          { name: "Plancha lateral", sets: [{ reps: "20s/lado", weight: null }, { reps: "20s/lado", weight: null }, { reps: "20s/lado", weight: null }] },
        ]},
      ],
    },
    {
      id: "C", name: "HOMBROS + BRAZOS", emoji: "🎯", color: "#FF00AA", glow: "#FF00AA33",
      blocks: [
        { name: "INICIALIZACIÓN", type: "warmup", exercises: [
          { name: "Activación banda hombro completa", sets: [{ reps: "3×10r", weight: null }] },
          { name: "Activación cadera suelo", sets: [{ reps: "5×10r", weight: null }] },
        ]},
        { name: "MÓDULO 01 — HOMBRO FUERZA", type: "superset", note: "SUPERSERIE × 3 · 12-10-8 ⚠️ TÉCNICA LIMPIA", exercises: [
          { name: "Press hombro máquina Technogym", sets: [{ reps: 12, weight: 17 }, { reps: 10, weight: 23 }, { reps: 8, weight: 29 }] },
          { name: "Face pull polea ⚠️ HOMBRO IZQ", sets: [{ reps: 12, weight: 17 }, { reps: 10, weight: 17 }, { reps: 8, weight: 23 }] },
        ]},
        { name: "MÓDULO 02 — HOMBRO VOLUMEN", type: "superset", note: "SUPERSERIE × 3 × 12 REPS · PESO CONTROLADO", exercises: [
          { name: "Elevaciones laterales mancuernas", sets: [{ reps: 12, weight: 5 }, { reps: 12, weight: 7.5 }, { reps: 12, weight: 7.5 }] },
          { name: "Elevaciones frontales alternas", sets: [{ reps: 12, weight: 5 }, { reps: 12, weight: 7.5 }, { reps: 12, weight: 7.5 }] },
        ]},
        { name: "MÓDULO 03 — BRAZOS", type: "superset", note: "3 SERIES · 10-8-6", exercises: [
          { name: "Curl bíceps polea tumbado", sets: [{ reps: 10, weight: 23 }, { reps: 8, weight: 29 }, { reps: 6, weight: 35 }] },
          { name: "Extensión tríceps polea cuerda", sets: [{ reps: 10, weight: 23 }, { reps: 8, weight: 29 }, { reps: 6, weight: 35 }] },
        ]},
        { name: "MÓDULO 04 — BOMBA FINAL", type: "superset", note: "2 SERIES AL FALLO", exercises: [
          { name: "Curl martillo 10kg al fallo", sets: [{ reps: "FALLO", weight: 10 }, { reps: "FALLO", weight: 10 }] },
          { name: "Fondos tríceps (banda roja)", sets: [{ reps: "FALLO", weight: null }, { reps: "FALLO", weight: null }] },
        ]},
        { name: "PROTOCOLO CORE", type: "core", note: "3 RONDAS", exercises: [
          { name: "Crunch con polea", sets: [{ reps: 15, weight: null }, { reps: 15, weight: null }, { reps: 15, weight: null }] },
          { name: "Plancha toque hombro (10+10)", sets: [{ reps: "10+10", weight: null }, { reps: "10+10", weight: null }, { reps: "10+10", weight: null }] },
          { name: "Remo máquina", sets: [{ reps: 20, weight: null }, { reps: 20, weight: null }, { reps: 20, weight: null }] },
        ]},
      ],
    },
    {
      id: "D", name: "PIERNA + FUNCIONAL", emoji: "🔥", color: "#FFD600", glow: "#FFD60033",
      blocks: [
        { name: "INICIALIZACIÓN", type: "warmup", exercises: [
          { name: "Cinta 8-10km/h", sets: [{ reps: "8min", weight: null }] },
          { name: "Movilidad cadera + sentadillas", sets: [{ reps: "×10", weight: null }] },
        ]},
        { name: "MÓDULO 01 — FUERZA PIERNA", type: "main", note: "ENTRE SERIES: 10 PATADAS DE PSOAS/PIERNA", exercises: [
          { name: "Sentadilla Multipower", sets: [{ reps: 14, weight: 50 }, { reps: 8, weight: 65 }, { reps: 8, weight: 75 }, { reps: 6, weight: 75, note: "3s ISO ABAJO" }] },
        ]},
        { name: "MÓDULO 02 — MÁQUINAS PIERNA", type: "superset", note: "SUPERSERIE × 3 · 12-10-8", exercises: [
          { name: "Extensión cuádriceps", sets: [{ reps: 12, weight: 47 }, { reps: 10, weight: 53 }, { reps: 8, weight: 59 }] },
          { name: "Curl femoral", sets: [{ reps: 12, weight: 41 }, { reps: 10, weight: 47 }, { reps: 8, weight: 53 }] },
        ]},
        { name: "MÓDULO 03 — FUNCIONAL", type: "circuit", note: "3 RONDAS", exercises: [
          { name: "Zancadas mancuernas 10kg", sets: [{ reps: "10/pierna", weight: 10 }, { reps: "10/pierna", weight: 10 }, { reps: "10/pierna", weight: 10 }] },
          { name: "Saltos al cajón / Squat jump", sets: [{ reps: 8, weight: null }, { reps: 8, weight: null }, { reps: 8, weight: null }] },
          { name: "Thrusters mancuernas", sets: [{ reps: 10, weight: 10 }, { reps: 10, weight: 10 }, { reps: 10, weight: 10 }] },
        ]},
        { name: "PROTOCOLO CORE", type: "core", note: "3 RONDAS", exercises: [
          { name: "Plancha", sets: [{ reps: "30s", weight: null }, { reps: "30s", weight: null }, { reps: "30s", weight: null }] },
          { name: "Pallof press (10+10)", sets: [{ reps: "10+10", weight: null }, { reps: "10+10", weight: null }, { reps: "10+10", weight: null }] },
          { name: "Rueda abdominal", sets: [{ reps: 10, weight: null }, { reps: 10, weight: null }, { reps: 10, weight: null }] },
        ]},
      ],
    },
  ]
};
