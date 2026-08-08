# Mercado de Cristales - Sistema Integral de Gestión de Siniestros de Cristalería

Sistema web SaaS multi-rol y multi-tenant diseñado para transformar la gestión operativa, financiera y de campo en siniestros de cristalería para aseguradoras, operadoras y prestadores.

![Mercado de Cristales](https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Características Principales

* **Dashboard 360° en Tiempo Real:** KPIs de siniestros abiertos, demorados, cuentas por cobrar a aseguradoras, cuentas por pagar a vidrieros y margen bruto con rentabilidad %.
* **Bandeja de Siniestros Dual:** Vistas de Lista y Tablero Kanban filtrables por aseguradora, prestador y estados ortogonales (Operativo vs Financiero).
* **Ficha 360° del Siniestro:** Pestañas de operación, medidas de taller (alto x ancho x espesor mm), fotos de campo, desglose financiero con retenciones (IVA, Ganancias, IIBB) y timeline inmutable auditado.
* **Vista Móvil PWA del Vidriero:** Interfaz táctil ultraliviana accesible por **Magic Link / Token directo vía WhatsApp** (sin contraseñas). Incluye cámara de fotos, canvas de firma digital del cliente y botón de validación `[MARCAR TRABAJO REALIZADO]`.
* **Simulador de Ingesta & Parsing de Email:** Lectura automática de correos de aseguradoras (BBVA, IGS, SURA) con extracción de siniestro, cliente, domicilio y vidrios a reponer.
* **Facturación por Lotes & Retenciones:** Agrupación de casos para emisión de facturas a aseguradoras y liquidación quincenal a prestadores.

---

## 🛠️ Tecnologías Utilizadas

* **Core & UI:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons.
* **Estado Reactivo:** React Context API + Custom Hooks.
* **Arquitectura Recomendada Cloud:** Supabase (PostgreSQL 3NF + Auth + RLS + Storage) + Next.js / Vite + WhatsApp Cloud API.

---

## 🚀 Instalación y Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/estebanminaudo1-gif/Cristaleria.git
   cd Cristaleria
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 📋 Modelo de Estados Ortogonales

| Estado Operativo | Estado Financiero |
| :--- | :--- |
| `NUEVO` | `PENDIENTE_FACTURACION` |
| `PENDIENTE_CONTACTO` | `FACTURADO` |
| `VISITA_COORDINADA` | `COBRADO` |
| `PRESUPUESTO_INFORMADO` | `LIQUIDADO_PRESTADOR` |
| `APROBADO` | |
| `TRABAJO_PROGRAMADO` | |
| `TRABAJO_REALIZADO` | |
| `DOCUMENTACION_COMPLETA` | |
| `CANCELADO` | |

---

## 📄 Licencia

Este proyecto está licenciado bajo la licencia MIT.
