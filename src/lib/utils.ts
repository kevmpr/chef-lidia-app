export function getRealOrigin(request: Request): string {
    const xForwardedHost = request.headers.get('x-forwarded-host');
    const host = request.headers.get('host');
    const vercelUrl = import.meta.env.VERCEL_URL || process.env?.VERCEL_URL;

    const realHost = xForwardedHost || host || vercelUrl || 'localhost:4321';

    let protocol = 'https:';
    if (realHost.includes('localhost') || realHost.includes('127.0.0.1')) {
        protocol = 'http:';
    }

    return `${protocol}//${realHost}`;
}
