-- ==============================================================================
-- MERCADO DE CRISTALES - MIGRACIÓN DE RPCs ATÓMICOS, AUDITORÍA Y STORAGE POLICIES
-- Archivo: supabase/migrations/20260808_secure_rpc_and_storage.sql
-- ==============================================================================

-- 1. CORRECCIÓN SEARCH_PATH Y PRIVILEGIOS EN FUNCIONES EXISTENTES
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;

CREATE OR REPLACE FUNCTION public.current_user_prestador_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT prestador_id FROM public.profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.current_user_prestador_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_prestador_id() TO authenticated;

-- ==============================================================================
-- 2. RPC TRANSACCIONAL: CAMBIAR ESTADO OPERATIVO CON EVENTO AUTOMÁTICO
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.rpc_cambiar_estado_operativo(
  _caso_id UUID,
  _nuevo_estado TEXT,
  _motivo TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  _user_role TEXT;
  _user_name TEXT;
BEGIN
  _user_role := public.current_user_role();
  IF _user_role NOT IN ('ADMIN', 'SUPERVISOR', 'OPERATOR') THEN
    RAISE EXCEPTION 'Acceso denegado: El rol % no puede cambiar estados operativos.', _user_role;
  END IF;

  SELECT nombre INTO _user_name FROM public.profiles WHERE id = auth.uid();

  UPDATE public.casos
  SET
    estado_operativo = _nuevo_estado,
    causa_cancelacion = COALESCE(_motivo, causa_cancelacion),
    updated_at = NOW()
  WHERE id = _caso_id;

  INSERT INTO public.eventos (caso_id, usuario, rol, evento, descripcion)
  VALUES (
    _caso_id,
    COALESCE(_user_name, 'Usuario Autenticado'),
    _user_role,
    'CAMBIO_ESTADO_OPERATIVO',
    CONCAT('Transición a ', _nuevo_estado, CASE WHEN _motivo IS NOT NULL THEN CONCAT('. Motivo: ', _motivo) ELSE '' END)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.rpc_cambiar_estado_operativo FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_cambiar_estado_operativo TO authenticated;

-- ==============================================================================
-- 3. RPC TRANSACCIONAL: ACTUALIZAR DATOS FINANCIEROS Y RETENCIONES (SOLO FINANCE/ADMIN)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.rpc_actualizar_datos_financieros(
  _caso_id UUID,
  _monto_sin_iva NUMERIC,
  _costo_prestador NUMERIC,
  _precio_vidrio NUMERIC,
  _nro_factura TEXT DEFAULT NULL,
  _fecha_mail DATE DEFAULT NULL,
  _fecha_cobro DATE DEFAULT NULL,
  _monto_depositado NUMERIC DEFAULT NULL,
  _ret_iva NUMERIC DEFAULT 0,
  _ret_gcias NUMERIC DEFAULT 0,
  _ret_iibb NUMERIC DEFAULT 0
)
RETURNS VOID AS $$
DECLARE
  _user_role TEXT;
  _user_name TEXT;
  _monto_final NUMERIC;
BEGIN
  _user_role := public.current_user_role();
  IF _user_role NOT IN ('ADMIN', 'FINANCE') THEN
    RAISE EXCEPTION 'Acceso denegado: El rol % no tiene permisos financieros.', _user_role;
  END IF;

  SELECT nombre INTO _user_name FROM public.profiles WHERE id = auth.uid();
  _monto_final := ROUND(_monto_sin_iva * 1.21, 2);

  UPDATE public.casos
  SET
    monto_compania_sin_iva = _monto_sin_iva,
    monto_compania_final = _monto_final,
    costo_prestador = _costo_prestador,
    precio_vidrio_material = _precio_vidrio,
    nro_factura = COALESCE(_nro_factura, nro_factura),
    fecha_mail_factura = COALESCE(_fecha_mail, fecha_mail_factura),
    fecha_cobro = COALESCE(_fecha_cobro, fecha_cobro),
    monto_depositado = COALESCE(_monto_depositado, monto_depositado),
    retencion_iva = _ret_iva,
    retencion_ganancias = _ret_gcias,
    retencion_iibb = _ret_iibb,
    updated_at = NOW()
  WHERE id = _caso_id;

  INSERT INTO public.eventos (caso_id, usuario, rol, evento, descripcion)
  VALUES (
    _caso_id,
    COALESCE(_user_name, 'Usuario Finanzas'),
    _user_role,
    'ACTUALIZACION_FINANCIERA',
    CONCAT('Valores financieros actualizados. Monto sin IVA: $', _monto_sin_iva)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.rpc_actualizar_datos_financieros FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_actualizar_datos_financieros TO authenticated;

-- ==============================================================================
-- 4. RPC TRANSACCIONAL: REGISTRAR TRABAJO REALIZADO (PWA VIDRIERO)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.rpc_registrar_trabajo_realizado(
  _caso_id UUID,
  _costo_prestador NUMERIC,
  _observaciones TEXT DEFAULT NULL,
  _foto_url TEXT DEFAULT NULL,
  _firma_url TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  _user_role TEXT;
  _user_name TEXT;
  _prestador_id UUID;
  _caso_prestador_id UUID;
BEGIN
  _user_role := public.current_user_role();
  _prestador_id := public.current_user_prestador_id();

  SELECT prestador_id INTO _caso_prestador_id FROM public.casos WHERE id = _caso_id;

  IF _user_role = 'PRESTADOR' AND _prestador_id IS DISTINCT FROM _caso_prestador_id THEN
    RAISE EXCEPTION 'Acceso denegado: El prestador no está asignado a este trabajo.';
  END IF;

  SELECT nombre INTO _user_name FROM public.profiles WHERE id = auth.uid();

  UPDATE public.casos
  SET
    costo_prestador = _costo_prestador,
    estado_operativo = 'TRABAJO_REALIZADO',
    fecha_realizacion = NOW(),
    info_extra_operativa = CASE
      WHEN _observaciones IS NOT NULL THEN CONCAT(COALESCE(info_extra_operativa, ''), E'\n[Vidriero]: ', _observaciones)
      ELSE info_extra_operativa
    END,
    updated_at = NOW()
  WHERE id = _caso_id;

  IF _foto_url IS NOT NULL THEN
    INSERT INTO public.documentos (caso_id, tipo, url, subido_por)
    VALUES (_caso_id, 'FOTO_DESPUES', _foto_url, COALESCE(_user_name, 'Vidriero'));
  END IF;

  IF _firma_url IS NOT NULL THEN
    INSERT INTO public.documentos (caso_id, tipo, url, subido_por)
    VALUES (_caso_id, 'FIRMA_CONFORMIDAD', _firma_url, 'Asegurado Cliente');
  END IF;

  INSERT INTO public.eventos (caso_id, usuario, rol, evento, descripcion)
  VALUES (
    _caso_id,
    COALESCE(_user_name, 'Prestador Campo'),
    COALESCE(_user_role, 'PRESTADOR'),
    'TRABAJO_REALIZADO',
    'Trabajo finalizado registrado con documentación desde celular'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.rpc_registrar_trabajo_realizado FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_registrar_trabajo_realizado TO authenticated;

-- ==============================================================================
-- 5. POLÍTICAS DE SUPABASE STORAGE (storage.objects)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos_siniestros', 'documentos_siniestros', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can read documentos_siniestros"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documentos_siniestros'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can insert documentos_siniestros"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documentos_siniestros'
    AND auth.role() = 'authenticated'
  );
