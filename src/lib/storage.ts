import { supabase } from './supabase';

const BUCKET_NAME = 'company-assets';

export async function uploadCompanyAsset(file: File, companyId: string, type: 'logo' | 'watermark'): Promise<string> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${companyId}/${type}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        return data.publicUrl;
    } catch (error) {
        console.error(`Error uploading ${type}:`, error);
        throw error;
    }
}
