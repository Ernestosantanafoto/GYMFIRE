# GymTracker — Ernesto

App de seguimiento de entrenamientos. React + Supabase + Vercel.

---

## PASO 1 — Base de datos Supabase

1. Ve a **supabase.com → tu proyecto → SQL Editor**
2. Pega el contenido de `supabase_schema.sql` y ejecútalo
3. Verás las tablas `session_logs` y `protocols` creadas

---

## PASO 2 — Subir a GitHub

```bash
# En la carpeta del proyecto:
git init
git add .
git commit -m "Initial commit — GymTracker"

# Crea un repo nuevo en github.com (sin README)
# Luego conecta y sube:
git remote add origin https://github.com/TU_USUARIO/gym-tracker.git
git branch -M main
git push -u origin main
```

---

## PASO 3 — Deploy en Vercel

1. Ve a **vercel.com** → Log in with GitHub
2. **New Project** → importa el repo `gym-tracker`
3. En **Environment Variables** añade:
   - `REACT_APP_SUPABASE_URL` = `https://ygotdwvuhbztygxrokci.supabase.co`
   - `REACT_APP_SUPABASE_ANON_KEY` = `eyJhbGci...` (tu clave anon)
4. Deploy → Vercel te dará una URL tipo `gym-tracker-xxx.vercel.app`

> ⚠️ El archivo `.env` está en `.gitignore` — las claves NO se suben a GitHub.
> Las configuras directamente en Vercel como variables de entorno.

---

## PASO 4 — Añadir a pantalla inicio en iOS (Safari)

1. Abre la URL de Vercel en **Safari** en tu iPhone
2. Toca el botón **Compartir** (cuadrado con flecha)
3. **Añadir a pantalla de inicio**
4. Nombra la app: `GymTracker`
5. Ya tendrás el icono en tu pantalla como una app nativa

---

## Flujo semanal

1. Entrenas con la app → terminas la sesión → se guarda automáticamente en Supabase
2. Al acabar la semana → exportas el log JSON → me lo mandas a Claude
3. Claude genera el nuevo protocolo JSON para la semana siguiente
4. Importas el JSON en la app → nueva semana cargada
