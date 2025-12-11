export const getBaseUrl = () => {
    let url = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    // Remove trailing slash if present to ensure consistency
    url = url.replace(/\/$/, '');
    return url;
};
