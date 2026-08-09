-- ==============================================================================
-- MERCADO DE CRISTALES - SEED DE DATOS DE DEMOSTRACIÓN HISTÓRICOS (EXCEL 1120-1124)
-- Archivo: supabase/seed.sql
-- ==============================================================================

-- 1. PRESTADORES
INSERT INTO prestadores (id, nombre, telefono, whatsapp, email, zona_cobertura, especialidad)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Lolo', '2235001122', '2235001122', 'lolo@cristales.com', 'Mar del Plata Centro / Norte', 'Float & Templados'),
  ('b2222222-2222-2222-2222-222222222222', 'Cristales Sur', '2234991122', '2234991122', 'contacto@cristalessur.com', 'Mar del Plata Sur', 'Ventanales Balcón'),
  ('c3333333-3333-3333-3333-333333333333', 'Taller Central', '2236887766', '2236887766', 'taller@mercadodecristales.com', 'Taller General', 'Espejos Especiales')
ON CONFLICT (id) DO NOTHING;

-- 2. CASOS HISTÓRICOS EXCEL
INSERT INTO casos (
  id, nro_trabajo, nro_siniestro, poliza, aseguradora, canal_ingreso, fecha_ingreso, fecha_denuncia,
  asegurado_nombre, asegurado_tel, asegurado_direccion, asegurado_ciudad, prestador_id,
  fecha_derivacion, fecha_visita_coordinada, fecha_realizacion, magic_token_hash,
  detalle_trabajo, suma_asegurada, estado_operativo, estado_financiero,
  info_extra_operativa, info_extra_financiera, costo_prestador, pagado_prestador_fecha,
  precio_vidrio_material, monto_compania_sin_iva, monto_compania_final,
  nro_factura, fecha_mail_factura, fecha_cobro, monto_depositado,
  retencion_iva, retencion_ganancias, retencion_iibb
) VALUES
(
  'c1120000-0000-0000-0000-000000001120', 1120, '661259', '-', 'IGS', 'EMAIL', '2026-01-02T09:30:00Z', '2026-01-02',
  'ELIZONDO, EDUARDO', '2235123456', 'REPUBLICA ARABE SIRIA 2268- ENTRE COLON Y BROWN', 'Mar del Plata',
  'a1111111-1111-1111-1111-111111111111', '2026-01-02T10:15:00Z', '2026-01-04T10:00:00Z', '2026-01-06T15:30:00Z',
  encode(digest('tok_lolo_1120', 'sha256'), 'hex'),
  '320*240mm 4 m incoloro - vidrio repartido', '100% en cobertura',
  'TRABAJO_REALIZADO', 'COBRADO',
  'Doy aviso a IGS que cambiamos otro vidrio que indicó quien lo recibió. Habla con el cliente y supervisor: APROBADO.',
  'Paga en término', 20000.00, '2026-02-24', 8000.00, 50000.00, 60500.00,
  '942', '2026-01-07', '2026-01-13', 119000.00, 2000.00, 0.00, 0.00
),
(
  'c1121000-0000-0000-0000-000000001121', 1121, 'CUIT 30521742832', '-', 'Particular', 'MANUAL', '2026-01-02T10:00:00Z', '2026-01-02',
  'Administración González', '2236069360 (Florencia 2235035880 8-11am)', 'Santa fe 1635', 'Mar del Plata',
  'a1111111-1111-1111-1111-111111111111', '2026-01-06T10:00:00Z', '2026-01-06T11:00:00Z', '2026-02-04T16:00:00Z',
  encode(digest('tok_lolo_1121', 'sha256'), 'hex'),
  'Retirar vidrio, dejar trabajar al gasista, cortarlo arriba a la izquierda por caño. Vidrio armado 1495*735 mm.',
  'Particular - Presupuesto Aprobado',
  'TRABAJO_REALIZADO', 'COBRADO',
  '30/01 gasista terminado. Pasa Lolo a medir nuevo recuadro de hierro.',
  'Pagado 5 y 9/03', 80000.00, '2026-03-09', 25000.00, 160000.00, 193600.00,
  'B 047', '2026-02-04', '2026-02-05', 193600.00, 0.00, 0.00, 0.00
),
(
  'c1122000-0000-0000-0000-000000001122', 1122, '40629/23', '481482', 'BBVA', 'EMAIL', '2026-01-02T11:15:00Z', '2026-01-02',
  'LUCAS GABRIEL HOYOS', '2235267022 (CRISTIAN)', 'Av. Constitución 5062 (Atención 7 a 14hs y 17 a 22hs)', 'Mar del Plata',
  'a1111111-1111-1111-1111-111111111111', '2026-01-02T12:00:00Z', '2026-01-03T09:00:00Z', '2026-01-06T18:00:00Z',
  encode(digest('tok_lolo_1122', 'sha256'), 'hex'),
  'Espejo 4mm - 900 x 1410 mm // Espejo 4mm - 1596 x 437 mm', '$ 2.287.863,81',
  'TRABAJO_REALIZADO', 'COBRADO',
  'Instalación de ambos espejos en vestidor comercial.',
  'Cobrado con retenciones', 80000.00, '2026-02-24', 42000.00, 265416.00, 321153.36,
  '943', '2026-01-07', '2026-01-14', 324910.15, 53409.89, 6358.32, 0.00
),
(
  'c1123000-0000-0000-0000-000000001123', 1123, 'PENDIENTE-BBVA-01', '-', 'Particular', 'MANUAL', '2026-01-02T14:30:00Z', '2026-01-02',
  'Sebastián Panasci', '2235253750', 'Lijo López 8241- La Florida', 'Mar del Plata',
  'a1111111-1111-1111-1111-111111111111', '2026-01-02T15:00:00Z', NULL, NULL,
  encode(digest('tok_lolo_1123', 'sha256'), 'hex'),
  'Templados 8mm de 2170x640mm con herrajes (tirador P68B + bisagras P63) + Espejos 5mm con cortes escalonados.',
  'Pendiente Cotización',
  'PRESUPUESTO_INFORMADO', 'PENDIENTE_FACTURACION',
  '15/01 Presupuesto informado $294.000, copia detallada lista.',
  NULL, 110000.00, NULL, 75000.00, 294000.00, 355740.00,
  NULL, NULL, NULL, NULL, 0.00, 0.00, 0.00
)
ON CONFLICT (id) DO NOTHING;

-- 3. ITEMS DE TRABAJO
INSERT INTO items_trabajo (caso_id, tipo_articulo, ancho_mm, alto_mm, espesor_mm, detalles_herrajes, cantidad, precio_unitario)
VALUES
  ('c1120000-0000-0000-0000-000000001120', 'Vidrio 4mm Incoloro', 320, 240, 4, 'Vidrio repartido comedor', 1, 50000.00),
  ('c1121000-0000-0000-0000-000000001121', 'Vidrio Armado Especial', 1495, 735, 6, 'Corte especial caja de gas arriba izquierda', 1, 160000.00),
  ('c1122000-0000-0000-0000-000000001122', 'Espejo 4mm Float', 900, 1410, 4, 'Corte pulido', 1, 150000.00),
  ('c1122000-0000-0000-0000-000000001122', 'Espejo 4mm Float', 1596, 437, 4, 'Corte pulido', 1, 115416.00)
ON CONFLICT DO NOTHING;

-- 4. DOCUMENTOS Y FOTOS
INSERT INTO documentos (caso_id, tipo, url, subido_por, fecha)
VALUES
  ('c1120000-0000-0000-0000-000000001120', 'FOTO_ANTES', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', 'Lolo', '2026-01-06T14:10:00Z'),
  ('c1120000-0000-0000-0000-000000001120', 'FOTO_DESPUES', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', 'Lolo', '2026-01-06T15:30:00Z'),
  ('c1122000-0000-0000-0000-000000001122', 'FOTO_DESPUES', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80', 'Lolo', '2026-01-06T18:00:00Z')
ON CONFLICT DO NOTHING;

-- 5. EVENTOS TIMELINE
INSERT INTO eventos (caso_id, fecha, usuario, rol, evento, descripcion)
VALUES
  ('c1120000-0000-0000-0000-000000001120', '2026-01-02T09:30:00Z', 'Sistema Email Parser', 'SYSTEM', 'INGESTA_EMAIL', 'Caso creado automáticamente desde email entrante de IGS (Siniestro #661259)'),
  ('c1120000-0000-0000-0000-000000001120', '2026-01-02T09:35:00Z', 'Ana Operaciones', 'OPERATOR', 'CONTACTO_ASEGURADO', 'Mensaje de WhatsApp de bienvenida enviado al asegurado Eduardo Elizondo'),
  ('c1120000-0000-0000-0000-000000001120', '2026-01-06T15:30:00Z', 'Lolo (Prestador)', 'PRESTADOR', 'TRABAJO_REALIZADO', 'Prestador subió 2 fotos de la instalación y marcó el trabajo como realizado')
ON CONFLICT DO NOTHING;
