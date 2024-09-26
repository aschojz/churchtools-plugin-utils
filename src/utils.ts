export const txx = (key: string) => key;
export const isValidUrl = (link: string) => {
    try {
        new URL(link);
        return true;
    } catch (_) {
        return false;
    }
};
