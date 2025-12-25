export const getBaseUrl = () => {
    // In the browser, prefer the current origin so multi-domain deployments
    // (custom domain + *.vercel.app) don't break auth redirect flows.
    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin.replace(/\/$/, '');
    }

    let url = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    // Remove trailing slash if present to ensure consistency
    url = url.replace(/\/$/, '');
    return url;
};
