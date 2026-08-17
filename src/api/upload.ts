import client from './client';

interface UploadResponse {
  coverImage?: string;
  fileUrl?: string;
  fileType?: 'epub' | 'pdf';
}

export async function uploadFiles(files: {
  epub?: File;
  cover?: File;
}): Promise<UploadResponse> {
  const formData = new FormData();
  if (files.epub) formData.append('epub', files.epub);
  if (files.cover) formData.append('cover', files.cover);

  const { data } = await client.post<UploadResponse>('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
