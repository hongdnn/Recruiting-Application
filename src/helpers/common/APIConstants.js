export const apiConstants = {
    localApiUrl: "http://localhost:3000",
    developApiUrl: "https://apita.tatool.vn",
    productionApiUrl: "",
};

export function generateApiUrl(pathComponent) {
    const baseUrl = process.env.VUE_APP_API_URL;
    return baseUrl + pathComponent;
}
