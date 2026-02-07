'use server';

import { cloudinary } from '@/lib/cloudinary/client';
import { logger } from '@/lib/logger';

export async function uploadImageAction(base64Image: string, projectId: string) {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: `opsvantage/${projectId}`,
      // You can add transformations here for optimization
      transformation: [
        { width: 1200, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    logger.info({ msg: 'Image uploaded to Cloudinary', public_id: result.public_id, projectId });

    return { success: true, url: result.secure_url };
  } catch (error: any) {
    logger.error({ msg: 'Failed to upload image to Cloudinary', error: error.message });
    return { error: 'Image upload failed.' };
  }
}