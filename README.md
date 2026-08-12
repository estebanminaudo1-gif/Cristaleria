# Mercado de Cristales - Sistema Integral de Gestión de Siniestros de Cristalería

Plataforma Web SaaS Multi-Rol (React 19 + TypeScript + Vite + Tailwind CSS + Supabase PostgreSQL + n8n AI Agent) diseñada para la gestión operativa, financiera y de campo de siniestros de cristalería para aseguradoras y prestadores.

![Mercado de Cristales](https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80)

---

## 🏗️ Arquitectura del Sistema

```
[ Frontend React / Vite / Vercel ] (Passwordless OTP / Magic Link)
     │
     ├───► [ Supabase Auth + PostgreSQL (Profiles, RLS, Storage Buckets) ]
     │
     └───► [ Webhook Chat n8n ] ───► [ Agente IA n8n (System Prompt Rioplatense) ]
                                             │
                                             └───► [ Supabase Edge Function: buscar-casos ]
```

---

## 📋 Lista de Archivos Creados y Modificados

* `.env.example`: Plantilla de variables de entorno públicas (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ENABLE_DEMO_MODE=false`, `VITE_N8N_CHAT_WEBHOOK_URL`).
* `src/lib/supabase.ts`: Inicialización del cliente Supabase habilitando `persistSession`, `autoRefreshToken` y `detectSessionInUrl: true`.
* `src/views/LoginView.tsx`: Pantalla de inicio de sesión Passwordless por correo (Magic Link con `shouldCreateUser: false` y respuesta neutral).
* `src/context/SiniestrosContext.tsx`: Contexto global con verificación estricta del perfil `public.profiles` (`id, nombre, email, role`), expulsión automática de no autorizados (`signOut`) y derivación de rol sin valores duros por defecto.
* `src/App.tsx`: Pantalla de carga mientras se restaura la sesión desde el Magic Link, y restricción de acceso si el usuario no tiene perfil en `public.profiles`.
* `src/components/Header.tsx`: Botón Salir (`signOut()`) y deshabilitación del selector visual de roles en producción.
* `src/services/casosService.ts`: Capa de servicio para operaciones CRUD de siniestros y transiciones de estado.
* `src/services/prestadoresService.ts`: Servicio de gestión y consulta de prestadores.
* `src/services/documentosService.ts`: Subida segura a Supabase Storage con URLs firmadas (24h).
* `src/services/chatService.ts`: Cliente de comunicación con n8n transmitiendo la sesión JWT del usuario autenticado.
* `supabase/migrations/20260808_initial_schema.sql`: Migración PostgreSQL con esquemas y tablas principales.
* `supabase/migrations/20260808_rls_policies.sql`: Políticas de Row Level Security.
* `supabase/migrations/20260808_secure_rpc_and_storage.sql`: Funciones PL/pgSQL RPC `SECURITY DEFINER` y políticas de Storage.
* `supabase/functions/buscar-casos/index.ts`: Edge Function segura para n8n con autenticación fail-closed.

---

## 🛠️ Guía de Configuración Paso a Paso

### 1. Configuración de URL en Supabase Auth

En tu proyecto de Supabase Dashboard:

1. Ve a **Authentication ➔ URL Configuration**.
2. En **Site URL**, ingresa:
   ```text
   https://cristaleria-gilt.vercel.app
   ```
3. En **Redirect URLs**, agrega:
   ```text
   https://cristaleria-gilt.vercel.app/**
   http://localhost:5173/**
   http://localhost:5174/**
   ```

---

### 2. Creación y Autorización de Usuarios

Para habilitar a una persona a ingresar a la aplicación:

1. Ve a **Authentication ➔ Users** en Supabase Dashboard.
2. Haz clic en **"Add User" ➔ "Create User"** (o en **"Invite User"**).
3. Ingresa el correo autorizado (ej. `correo-autorizado@ejemplo.com`) y crea el usuario.
4. Copia el **UUID** asignado al nuevo usuario.
5. Abre el **SQL Editor** en Supabase y ejecuta la siguiente consulta SQL reemplazando el UUID y los datos:

```sql
INSERT INTO public.profiles (
  id,
  email,
  nombre,
  role
)
VALUES (
  'UUID-DEL-USUARIO',
  'correo-autorizado@ejemplo.com',
  'Nombre del Usuario',
  'OPERATOR'
)
ON CONFLICT (id)
DO UPDATE SET
  email = EXCLUDED.email,
  nombre = EXCLUDED.nombre,
  role = EXCLUDED.role;
```

> **Nota de Seguridad:** Si un correo solicita un Magic Link pero no tiene un registro correspondiente en `public.profiles` con un rol válido (`ADMIN`, `SUPERVISOR`, `OPERATOR`, `FINANCE`, `PRESTADOR`), la plataforma denegará el acceso automáticamente, cerrará la sesión y mostrará: `"Tu usuario no está autorizado para acceder a esta aplicación."`

---

### 3. Variables de Entorno en Vercel

Configura las siguientes variables en el panel de **Vercel ➔ Settings ➔ Environment Variables**:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
VITE_ENABLE_DEMO_MODE=false
VITE_N8N_CHAT_WEBHOOK_URL=https://tu-instancia-n8n.com/webhook/chat-asistente
```

---

## ⚡ Verificación Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Verificar compilación TypeScript y Linter:**
   ```bash
   npx tsc --noEmit
   npm run lint
   npm run build
   ```

3. **Iniciar el servidor dev local en Modo Demo:**
   Configura `VITE_ENABLE_DEMO_MODE=true` en tu `.env` local para probar el frontend sin Supabase:
   ```bash
   npm run dev
   ```

---

## 📄 Licencia

Este proyecto está licenciado bajo la licencia MIT.
