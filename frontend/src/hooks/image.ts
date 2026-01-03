const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || '';

const baseUrlWithoutTrailingSlash = baseApiUrl.endsWith('/')
  ? baseApiUrl.slice(0, -1)
  : baseApiUrl;

const cleanBaseUrl = baseUrlWithoutTrailingSlash.endsWith('/api')
  ? baseUrlWithoutTrailingSlash.slice(0, -4)
  : baseUrlWithoutTrailingSlash;

interface FileAttributes {
  url?: string | null;
}

export const getFileUrl = (file?: FileAttributes) => {
  if (!file?.url) {
    return '';
  }
  return buildFileUrl(file.url);
};

export const buildFileUrl = (path?: string | null) => {
  if (!path) {
    return '';
  }

  if (path.startsWith('/')) {
    return `${cleanBaseUrl}${path}`;
  }

  return `${cleanBaseUrl}/${path}`;
};
