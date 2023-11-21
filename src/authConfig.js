// Config object to be passed to Msal on creation
export const msalConfig = {
    auth: {
        clientId: "CLIENT_ID_HERE" ,// Get this from the App registration 'Application (client) ID'. It is a GUID.
        authority: "https://login.microsoftonline.com/DIRECTORY_ID_HERE", // GEt this from the App registration 'Directory (tenant) ID'. It is a GUID.
        redirectUri: "/",
        postLogoutRedirectUri: "/"
    },
    system: {
        allowNativeBroker: false, // Disables WAM Broker
    }
};

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest = {
    scopes: ["User.Read"]
};

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};
