-- ==============================================================================
-- MERCADO DE CRISTALES - MIGRACIÓN INICIAL SCHEMAS, TABLAS, ÍNDICES Y SEGURIDAD
-- Archivo: supabase/migrations/20260808_initial_schema.sql
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Función genérica para actualización de timestamps updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Función auxiliar para hashing seguro de tokens de prestador
CREATE OR REPLACE FUNCTION hash_magic_token(raw_token TEXT)
RETURNS TEXT AS $$
BEGIN
  IF raw_token IS NULL OR raw_token = '' THEN
    RETURN NULL;
  END IF;
  RETURN encode(digest(raw_token, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

-- 4. TABLA: prestadores (Vidrieros y talleres)
CREATE TABLE IF NOT EXISTS prestadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  telefono TEXT,
  whatsapp TEXT,
  email TEXT,
  zona_cobertura TEXT,
  especialidad TEXT,
  cuit TEXT,
  alias_cbu TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER tr_prestadores_updated_at
  BEFORE UPDATE ON prestadores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5. TABLA: profiles (Perfiles de usuarios y roles auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'OPERATOR' CHECK (role IN ('ADMIN', 'SUPERVISOR', 'OPERATOR', 'FINANCE', 'PRESTADOR')),
  prestador_id UUID REFERENCES prestadores(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 6. TABLA: casos (Siniestros principales)
CREATE TABLE IF NOT EXISTS casos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nro_trabajo SERIAL UNIQUE,
  nro_siniestro TEXT NOT NULL,
  poliza TEXT DEFAULT '-',
  aseguradora TEXT NOT NULL,
  canal_ingreso TEXT DEFAULT 'MANUAL',
  fecha_ingreso TIMESTAMPTZ DEFAULT NOW(),
  fecha_denuncia DATE,
  
  -- Asegurado
  asegurado_nombre TEXT NOT NULL,
  asegurado_tel TEXT,
  asegurado_direccion TEXT NOT NULL,
  asegurado_ciudad TEXT DEFAULT 'Mar del Plata',
  
  -- Prestador
  prestador_id UUID REFERENCES prestadores(id) ON DELETE SET NULL,
  fecha_derivacion TIMESTAMPTZ,
  fecha_visita_coordinada TIMESTAMPTZ,
  fecha_realizacion TIMESTAMPTZ,
  magic_token_hash TEXT UNIQUE,
  
  -- Trabajo y Cobertura
  detalle_trabajo TEXT NOT NULL,
  suma_asegurada TEXT DEFAULT '100% en cobertura',
  
  -- Estados Ortogonales con Restricciones CHECK
  estado_operativo TEXT NOT NULL DEFAULT 'NUEVO' CHECK (
    estado_operativo IN (
      'NUEVO',
      'PENDIENTE_CONTACTO',
      'VISITA_COORDINADA',
      'PRESUPUESTO_INFORMADO',
      'APROBADO',
      'TRABAJO_PROGRAMADO',
      'TRABAJO_REALIZADO',
      'DOCUMENTACION_COMPLETA',
      'CANCELADO'
    )
  ),
  estado_financiero TEXT NOT NULL DEFAULT 'PENDIENTE_FACTURACION' CHECK (
    estado_financiero IN (
      'PENDIENTE_FACTURACION',
      'FACTURADO',
      'COBRADO',
      'LIQUIDADO_PRESTADOR'
    )
  ),
  causa_cancelacion TEXT,
  info_extra_operativa TEXT,
  info_extra_financiera TEXT,
  
  -- Valores Financieros
  costo_prestador NUMERIC(12,2) DEFAULT 0.00,
  pagado_prestador_fecha DATE,
  precio_vidrio_material NUMERIC(12,2) DEFAULT 0.00,
  monto_compania_sin_iva NUMERIC(12,2) DEFAULT 0.00,
  monto_compania_final NUMERIC(12,2) DEFAULT 0.00,
  
  -- Facturación y Cobro
  nro_factura TEXT,
  fecha_mail_factura DATE,
  fecha_cobro DATE,
  monto_depositado NUMERIC(12,2),
  retencion_iva NUMERIC(12,2) DEFAULT 0.00,
  retencion_ganancias NUMERIC(12,2) DEFAULT 0.00,
  retencion_iibb NUMERIC(12,2) DEFAULT 0.00,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER tr_casos_updated_at
  BEFORE UPDATE ON casos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 7. TABLA: items_trabajo (Desglose de vidrios y herrajes por caso)
CREATE TABLE IF NOT EXISTS items_trabajo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id UUID NOT NULL REFERENCES casos(id) ON DELETE CASCADE,
  tipo_articulo TEXT NOT NULL,
  ancho_mm INT,
  alto_mm INT,
  espesor_mm INT,
  detalles_herrajes TEXT,
  cantidad INT DEFAULT 1,
  precio_unitario NUMERIC(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA: eventos (Timeline inmutable de auditoría)
CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id UUID NOT NULL REFERENCES casos(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  usuario TEXT NOT NULL,
  rol TEXT NOT NULL,
  evento TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLA: documentos (Fotos y firmas adjuntas)
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id UUID NOT NULL REFERENCES casos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('FOTO_ANTES', 'FOTO_DESPUES', 'FIRMA_CONFORMIDAD', 'REMITO')),
  url TEXT NOT NULL,
  subido_por TEXT NOT NULL,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ÍNDICES DE ALTO RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_casos_nro_trabajo ON casos(nro_trabajo);
CREATE INDEX IF NOT EXISTS idx_casos_nro_siniestro ON casos(nro_siniestro);
CREATE INDEX IF NOT EXISTS idx_casos_asegurado_nombre ON casos(asegurado_nombre);
CREATE INDEX IF NOT EXISTS idx_casos_aseguradora ON casos(aseguradora);
CREATE INDEX IF NOT EXISTS idx_casos_estado_operativo ON casos(estado_operativo);
CREATE INDEX IF NOT EXISTS idx_casos_estado_financiero ON casos(estado_financiero);
CREATE INDEX IF NOT EXISTS idx_casos_prestador_id ON casos(prestador_id);
CREATE INDEX IF NOT EXISTS idx_casos_fecha_ingreso ON casos(fecha_ingreso);
CREATE INDEX IF NOT EXISTS idx_casos_magic_token_hash ON casos(magic_token_hash);

CREATE INDEX IF NOT EXISTS idx_items_caso_id ON items_trabajo(caso_id);
CREATE INDEX IF NOT EXISTS idx_eventos_caso_id ON eventos(caso_id);
CREATE INDEX IF NOT EXISTS idx_documentos_caso_id ON documentos(caso_id);
