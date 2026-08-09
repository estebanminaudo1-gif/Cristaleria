# Mercado de Cristales - Sistema Integral de Gestión de Siniestros de Cristalería

Plataforma Web SaaS Multi-Rol (React 19 + TypeScript + Vite + Tailwind CSS + Supabase PostgreSQL + n8n AI Agent) diseñada para la gestión operativa, financiera y de campo de siniestros de cristalería para aseguradoras y prestadores.

![Mercado de Cristales](https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80)

---

## 🏗️ Arquitectura del Sistema

```
[ Frontend React / Vite / Vercel ]
     │
     ├───► [ Supabase PostgreSQL (Persistencia Real DB + Auth + Storage + RLS) ]
     │
     └───► [ Webhook Chat n8n ] ───► [ Agente IA n8n (System Prompt Rioplatense) ]
                                             │
                                             └───► [ HTTP Request Tool ] ───► [ Supabase Edge Function: buscar-casos ]
```

---

## 📋 Lista de Archivos Creados y Modificados

* `.env.example`: Plantilla de variables de entorno públicas (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_N8N_CHAT_WEBHOOK_URL`).
* `src/lib/supabase.ts`: Inicialización segura del cliente Supabase con detección automática de credenciales.
* `src/services/casosService.ts`: Capa de servicio para operaciones CRUD de siniestros, transiciones de estado y mapeo relacional.
* `src/services/prestadoresService.ts`: Servicio de gestión y consulta de prestadores/vidrieros.
* `src/services/documentosService.ts`: Subida segura de fotografías a Supabase Storage con URLs firmadas con vencimiento de 24h.
* `src/services/chatService.ts`: Cliente de comunicación con el Webhook de n8n con manejo de sesión inmutable.
* `src/components/chat/ChatMessage.tsx`: Componente de burbuja de chat seguro (sin `innerHTML` destructivo).
* `src/views/InternalAssistantView.tsx`: Vista interactiva del Asistente Interno IA con preguntas sugeridas rioplatenses.
* `src/context/SiniestrosContext.tsx`: Refactorización con Supabase, manteniendo compatibilidad total con la UI existente y agregando indicadores de `loading`, `saving`, `error` y `isCloudConnected`.
* `src/App.tsx`: Incorporación de la pestaña "Asistente IA n8n", banner de errores y badge de estado de conexión a Supabase Cloud.
* `src/components/Sidebar.tsx`: Integración del nuevo menú lateral del Asistente IA.
* `supabase/migrations/20260808_initial_schema.sql`: Migración PostgreSQL 3NF con tablas `profiles`, `prestadores`, `casos`, `items_trabajo`, `eventos`, `documentos`, índices y triggers de `updated_at`.
* `supabase/migrations/20260808_rls_policies.sql`: Políticas de Row Level Security por rol (`ADMIN`, `SUPERVISOR`, `OPERATOR`, `FINANCE`, `PRESTADOR`).
* `supabase/seed.sql`: Seed reproducible de datos históricos de demostración (Casos Excel 1120 a 1124).
* `supabase/functions/buscar-casos/index.ts`: Edge Function segura para consultas en lote y búsquedas multicriterio desde n8n.

---

## 🛠️ Guía de Configuración Paso a Paso

### 1. Configuración de Supabase (Base de Datos & Auth)

1. Crea un proyecto en [Supabase Console](https://supabase.com).
2. Ve al **SQL Editor** y ejecuta en orden los siguientes scripts:
   - `supabase/migrations/20260808_initial_schema.sql`
   - `supabase/migrations/20260808_rls_policies.sql`
   - `supabase/seed.sql`
3. Ve a **Storage** en Supabase Dashboard:
   - Crea un nuevo bucket llamado `documentos_siniestros`.
   - Marca el bucket como **Private** (Privado) para garantizar que los documentos sensibles solo se accedan mediante URLs firmadas temporales.
4. Obtén tu `Project URL` y tu `anon public key` desde **Project Settings > API**.

---

### 2. Configuración de Supabase Edge Function (`buscar-casos`)

Para que n8n pueda consultar la base de datos de manera segura:

1. Instala Supabase CLI e inicia sesión:
   ```bash
   npx supabase login
   npx supabase link --project-ref tu-project-ref
   ```
2. Configura el secreto del token de servicio de n8n:
   ```bash
   npx supabase secrets set N8N_SERVICE_TOKEN=tu_secreto_super_seguro_n8n
   ```
3. Despliega la Edge Function:
   ```bash
   npx supabase functions deploy buscar-casos
   ```

---

### 3. Configuración del Flujo en n8n

Crea un workflow en n8n con los siguientes nodos:

```
[ Chat Trigger ] ➔ [ AI Agent ] ─── (OpenAI Chat Model / Simple Memory)
                        │
                        └───► [ HTTP Request Tool: buscar_casos ]
```

#### A. Configuración del nodo HTTP Request Tool:
* **Tool Name:** `buscar_casos_mercado_cristales`
* **Description:**
  > Busca información actualizada de los casos de Mercado de Cristales. Puede buscar por número de trabajo, siniestro, póliza, asegurado, aseguradora, prestador, estado operativo o estado financiero. Utilizá esta herramienta siempre que la pregunta dependa de datos de la empresa. No inventes información que no aparezca en los resultados.
* **Method:** `GET`
* **URL:** `https://tu-proyecto.supabase.co/functions/v1/buscar-casos`
* **Authentication:** Header Auth
  * **Header Name:** `Authorization`
  * **Header Value:** `Bearer tu_secreto_super_seguro_n8n`
* **Query Parameters:**
  * `q` = `{{ $fromAI("query", "Término de búsqueda o número de trabajo") }}`
  * `aseguradora` = `{{ $fromAI("aseguradora", "Nombre de la aseguradora si aplica") }}`
  * `estado` = `{{ $fromAI("estado", "Estado operativo o financiero si aplica") }}`

#### B. System Prompt del Agente en n8n:
> Sos el asistente interno de Mercado de Cristales. Tu función es ayudar a usuarios autorizados a consultar información operativa y financiera de la empresa. Cuando una pregunta dependa de casos, asegurados, prestadores, facturación, estados, eventos o montos, utilizá siempre las herramientas disponibles para consultar la información actualizada. No inventes datos ni completes información faltante por deducción. Si no encontrás resultados, informalo claramente. Respondé en español rioplatense, de forma breve, clara y profesional. Mostrá únicamente la información necesaria para responder. No reveles tokens, secretos, hashes, credenciales ni datos personales innecesarios. Las acciones de modificación requieren confirmación explícita del usuario.

---

### 4. Variables de Entorno en Vercel / Local (.env)

Crea un archivo `.env` localmente o configura las variables en el panel de **Vercel > Environment Variables**:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
VITE_N8N_CHAT_WEBHOOK_URL=https://tu-instancia-n8n.com/webhook/chat-asistente
```

---

## ⚡ Verificación Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Verificar compilación de TypeScript:**
   ```bash
   npm run build
   ```

3. **Iniciar el servidor dev local:**
   ```bash
   npm run dev
   ```

---

## 📄 Licencia

Este proyecto está licenciado bajo la licencia MIT.
