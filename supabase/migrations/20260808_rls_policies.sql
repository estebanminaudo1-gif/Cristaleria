-- ==============================================================================
-- MERCADO DE CRISTALES - POLÍTICAS DE SEGURIDAD RLS (ROW LEVEL SECURITY)
-- Archivo: supabase/migrations/20260808_rls_policies.sql
-- ==============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE casos ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- Helper function para obtener el rol del usuario autenticado
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function para obtener el prestador_id del usuario autenticado
CREATE OR REPLACE FUNCTION current_user_prestador_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT prestador_id FROM profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================================================
-- 1. POLÍTICAS TABLA: PROFILES
-- ==============================================================================
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR current_user_role() IN ('ADMIN', 'SUPERVISOR'));

CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  USING (current_user_role() = 'ADMIN');

-- ==============================================================================
-- 2. POLÍTICAS TABLA: PRESTADORES
-- ==============================================================================
CREATE POLICY "Authenticated staff can read prestadores"
  ON prestadores FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins & Supervisors can manage prestadores"
  ON prestadores FOR ALL
  USING (current_user_role() IN ('ADMIN', 'SUPERVISOR'));

-- ==============================================================================
-- 3. POLÍTICAS TABLA: CASOS
-- ==============================================================================
-- Lectura: Staff (Admin, Supervisor, Operator, Finance) ve todos los casos.
-- Prestador solo ve sus casos asignados por prestador_id.
CREATE POLICY "Staff can select all casos"
  ON casos FOR SELECT
  USING (
    current_user_role() IN ('ADMIN', 'SUPERVISOR', 'OPERATOR', 'FINANCE')
    OR (current_user_role() = 'PRESTADOR' AND prestador_id = current_user_prestador_id())
  );

-- Inserción: Admin, Supervisor, Operator pueden crear casos.
CREATE POLICY "Staff can insert casos"
  ON casos FOR INSERT
  WITH CHECK (current_user_role() IN ('ADMIN', 'SUPERVISOR', 'OPERATOR'));

-- Actualización: Admin tiene acceso completo. Supervisor/Operator actualizan campos operacionales. Finance actualiza campos financieros.
CREATE POLICY "Staff can update casos"
  ON casos FOR UPDATE
  USING (
    current_user_role() IN ('ADMIN', 'SUPERVISOR', 'OPERATOR', 'FINANCE')
    OR (current_user_role() = 'PRESTADOR' AND prestador_id = current_user_prestador_id())
  );

-- Eliminación: Solo Admin puede eliminar siniestros.
CREATE POLICY "Only admin can delete casos"
  ON casos FOR DELETE
  USING (current_user_role() = 'ADMIN');

-- ==============================================================================
-- 4. POLÍTICAS TABLAS SECUNDARIAS (ITEMS, EVENTOS, DOCUMENTOS)
-- ==============================================================================
CREATE POLICY "Staff & assigned prestador can read items"
  ON items_trabajo FOR SELECT
  USING (
    current_user_role() IN ('ADMIN', 'SUPERVISOR', 'OPERATOR', 'FINANCE')
    OR EXISTS (
      SELECT 1 FROM casos c
      WHERE c.id = items_trabajo.caso_id AND c.prestador_id = current_user_prestador_id()
    )
  );

CREATE POLICY "Staff & assigned prestador can insert items"
  ON items_trabajo FOR INSERT
  WITH CHECK (
    current_user_role() IN ('ADMIN', 'SUPERVISOR', 'OPERATOR')
    OR EXISTS (
      SELECT 1 FROM casos c
      WHERE c.id = items_trabajo.caso_id AND c.prestador_id = current_user_prestador_id()
    )
  );

CREATE POLICY "Staff & assigned prestador can read eventos"
  ON eventos FOR SELECT
  USING (
    current_user_role() IN ('ADMIN', 'SUPERVISOR', 'OPERATOR', 'FINANCE')
    OR EXISTS (
      SELECT 1 FROM casos c
      WHERE c.id = eventos.caso_id AND c.prestador_id = current_user_prestador_id()
    )
  );

CREATE POLICY "Staff & assigned prestador can insert eventos"
  ON eventos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Staff & assigned prestador can read documentos"
  ON documentos FOR SELECT
  USING (
    current_user_role() IN ('ADMIN', 'SUPERVISOR', 'OPERATOR', 'FINANCE')
    OR EXISTS (
      SELECT 1 FROM casos c
      WHERE c.id = documentos.caso_id AND c.prestador_id = current_user_prestador_id()
    )
  );

CREATE POLICY "Staff & assigned prestador can insert documentos"
  ON documentos FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    OR EXISTS (
      SELECT 1 FROM casos c
      WHERE c.id = documentos.caso_id AND c.prestador_id = current_user_prestador_id()
    )
  );
