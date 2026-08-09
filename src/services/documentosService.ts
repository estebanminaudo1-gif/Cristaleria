import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { FotoDocumento } from '../types';

const BUCKET_NAME = 'documentos_siniestros';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];

export const documentosService = {
  // Validar restricciones de archivo
  validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { valid: false, error: 'El archivo supera el tamaño máximo permitido de 10 MB.' };
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { valid: false, error: 'Tipo de archivo no permitido. Sube formato JPG, PNG, WEBP o PDF.' };
    }
    return { valid: true };
  },

  // Subir documento o foto a Supabase Storage privado
  async uploadDocumento(
    casoId: string,
    file: File,
    tipo: 'FOTO_ANTES' | 'FOTO_DESPUES' | 'FIRMA_CONFORMIDAD' | 'REMITO',
    subidoPor: string
  ): Promise<FotoDocumento> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    if (!isSupabaseConfigured) {
      // Fallback local: URL de objeto temporal
      const mockUrl = URL.createObjectURL(file);
      return {
        id: `foto-${Date.now()}`,
        tipo,
        url: mockUrl,
        subidoPor,
        fecha: new Date().toISOString()
      };
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${casoId}/${tipo.toLowerCase()}_${Date.now()}.${fileExt}`;

    // Subir archivo al bucket privado de Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error al subir a Supabase Storage:', uploadError);
      throw new Error(`Error en Storage: ${uploadError.message}`);
    }

    // Generar URL firmada temporal con vencimiento de 24 horas (86400 segundos) para no exponer URLs públicas permanentes
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 86400);

    const finalUrl = signedUrlError || !signedUrlData ? filePath : signedUrlData.signedUrl;

    // Registrar metadatos en la tabla documentos
    const { data: dbData, error: dbError } = await supabase
      .from('documentos')
      .insert([
        {
          caso_id: casoId,
          tipo,
          url: finalUrl,
          subido_por: subidoPor
        }
      ])
      .select('*')
      .single();

    if (dbError) {
      console.error('Error registrando documento en la base de datos:', dbError);
      throw new Error(`Error al registrar documento: ${dbError.message}`);
    }

    return {
      id: dbData.id,
      tipo: dbData.tipo,
      url: dbData.url,
      subidoPor: dbData.subido_por,
      fecha: dbData.fecha
    };
  }
};
