// utils/fileUtils.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ensureUploadsDir = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created');
  }
};

export const deleteFile = async (filename) => {
  try {
    const filePath = path.join(__dirname, '../uploads', filename);
    await fs.promises.unlink(filePath);
    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteFileByUrl = async (fileUrl) => {
  try {
    const filename = fileUrl.split('/').pop();
    return await deleteFile(filename);
  } catch (error) {
    return { success: false, error: error.message };
  }
};
