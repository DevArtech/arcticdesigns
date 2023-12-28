export function url(endpoint: string): string {
    return `${process.env.API_ENDPOINT}${endpoint}`;
}