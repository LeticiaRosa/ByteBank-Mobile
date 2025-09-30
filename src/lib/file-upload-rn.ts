import { supabase } from "./supabase";
import { clientEnv } from "../env/client";
import * as ImagePicker from "expo-image-picker";

// Configurações para upload de arquivos (mesmas da web)
const RECEIPT_BUCKET = "byte-bank";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

/**
 * Faz upload de um comprovante para o Storage do Supabase (React Native)
 * Segue a mesma lógica da versão web que funciona
 * @param asset - Asset do ImagePicker
 * @param transactionId - ID da transação para organizar os arquivos
 * @param userId - ID do usuário para organizar os arquivos
 * @returns URL pública do arquivo ou null em caso de erro
 */
export async function uploadReceiptRN(
  asset: ImagePicker.ImagePickerAsset,
  transactionId: string,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    console.log("📤 Iniciando upload com lógica da web...");

    // Validar tamanho do arquivo
    if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
      return {
        url: null,
        error: "Arquivo muito grande. Tamanho máximo: 5MB",
      };
    }

    // Validar tipo do arquivo
    const mimeType = asset.mimeType || "image/jpeg";
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return {
        url: null,
        error: "Tipo de arquivo não permitido. Tipos aceitos: JPG, PNG, PDF",
      };
    }

    // Converter para arrayBuffer (seguindo exemplo oficial do Supabase)
    console.log("🔄 Convertendo asset para arrayBuffer...");
    console.log("📁 Asset URI:", asset.uri);

    if (!asset.uri) {
      return {
        url: null,
        error: "URI do asset não encontrada",
      };
    }

    // Buscar o arquivo e converter para arrayBuffer (método oficial)
    const arrayBuffer = await fetch(asset.uri).then((res) => res.arrayBuffer());

    // Determinar extensão do arquivo
    const fileExt = asset.uri?.split(".").pop()?.toLowerCase() ?? "jpeg";
    const fileName = `receipts/${userId}/${transactionId}/${Date.now()}.${fileExt}`;

    console.log("📁 Path do arquivo:", fileName);
    console.log("📊 Tamanho do buffer:", arrayBuffer.byteLength);

    // Determinar Content-Type correto
    const contentType = asset.mimeType ?? "image/jpeg";
    console.log("📄 Content-Type:", contentType);

    // Fazer upload usando Supabase Storage API (método oficial)
    console.log("🚀 Fazendo upload via Supabase Storage...");
    const { data, error: uploadError } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .upload(fileName, arrayBuffer, {
        contentType: contentType,
      });

    if (uploadError) {
      console.error("❌ Erro no upload:", uploadError);
      return {
        url: null,
        error: uploadError.message,
      };
    }

    if (!data) {
      return {
        url: null,
        error: "Erro no upload: resposta vazia",
      };
    }

    // Obter URL pública do arquivo
    const { data: publicUrlData } = supabase.storage
      .from(RECEIPT_BUCKET)
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    console.log("✅ Upload realizado com sucesso!");
    console.log("🔗 URL pública:", publicUrl);

    return {
      url: publicUrl,
      error: null,
    };
  } catch (error: any) {
    console.error("💥 Erro no upload do comprovante:", error);
    return {
      url: null,
      error: error?.message || "Erro interno no upload do arquivo",
    };
  }
}

/**
 * Remove um comprovante do Storage do Supabase (React Native)
 * Segue a mesma lógica da versão web
 * @param receiptUrl - URL do comprovante a ser removido
 * @returns true se removido com sucesso, false caso contrário
 */
export async function deleteReceiptRN(receiptUrl: string): Promise<boolean> {
  try {
    // Extrair o caminho do arquivo da URL (mesma lógica da web)
    const url = new URL(receiptUrl);
    const pathParts = url.pathname.split(
      `/storage/v1/object/public/${RECEIPT_BUCKET}/`
    );

    if (pathParts.length !== 2) {
      console.error("URL do comprovante inválida:", receiptUrl);
      return false;
    }

    const filePath = pathParts[1];

    // Obter token de autenticação (mesma lógica da web)
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      console.error("Token de autenticação não encontrado");
      return false;
    }

    // Remover arquivo do storage usando fetch (mesma API da web)
    const baseUrl = clientEnv.EXPO_PUBLIC_SUPABASE_URL;
    const anonKey = clientEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    const deleteResponse = await fetch(
      `${baseUrl}/storage/v1/object/${RECEIPT_BUCKET}/${filePath}`,
      {
        method: "DELETE",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error("Erro ao remover comprovante:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao processar remoção do comprovante:", error);
    return false;
  }
}

/**
 * Valida se um asset do ImagePicker é válido para upload
 * @param asset - Asset a ser validado
 * @returns objeto com resultado da validação
 */
export function validateReceiptAsset(asset: ImagePicker.ImagePickerAsset): {
  isValid: boolean;
  error?: string;
} {
  // Validar tamanho
  if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: "Arquivo muito grande. Tamanho máximo: 5MB",
    };
  }

  // Validar tipo
  const mimeType = asset.mimeType || "image/jpeg";
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return {
      isValid: false,
      error: "Tipo de arquivo não permitido. Tipos aceitos: JPG, PNG, PDF",
    };
  }

  return { isValid: true };
}

/**
 * Lista todos os comprovantes de um usuário (React Native)
 * Segue a mesma lógica da versão web
 * @param userId - ID do usuário
 * @returns Lista de arquivos do usuário
 */
export async function listUserReceiptsRN(userId: string) {
  try {
    // Obter token de autenticação (mesma lógica da web)
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      console.error("Token de autenticação não encontrado");
      return [];
    }

    // Listar arquivos do storage usando fetch (mesma API da web)
    const baseUrl = clientEnv.EXPO_PUBLIC_SUPABASE_URL;
    const anonKey = clientEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    const listResponse = await fetch(
      `${baseUrl}/storage/v1/object/list/${RECEIPT_BUCKET}?prefix=receipts/${userId}&limit=100&offset=0&sortBy=created_at&order=desc`,
      {
        method: "GET",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      console.error("Erro ao listar comprovantes:", errorText);
      return [];
    }

    const data = await listResponse.json();
    return data || [];
  } catch (error) {
    console.error("Erro ao processar listagem de comprovantes:", error);
    return [];
  }
}

export { RECEIPT_BUCKET, MAX_FILE_SIZE, ALLOWED_TYPES };
