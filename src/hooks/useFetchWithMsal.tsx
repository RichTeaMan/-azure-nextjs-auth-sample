import {
    useState,
    useCallback,
} from 'react';
import { useMsal } from "@azure/msal-react";
import { loginRequest } from '../authConfig';

/**
 * Custom hook to call a web API using bearer token obtained from MSAL
 */
const useFetchWithMsal = () => {
    const { instance } = useMsal();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [data, setData] = useState<any>(null);

    const jsonFetch = async (
        endpoint: string,
        data: any = null,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | null = null
    ) => {
        const resolvedMethod = method ?? (data ? 'POST' : 'GET');
        return await execute(resolvedMethod, endpoint, false, data);
    };

    const jsonAuthFetch = async (
        endpoint: string,
        data: any = null,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | null = null
    ) => {
        const resolvedMethod = method ?? (data ? 'POST' : 'GET');
        return execute(resolvedMethod, endpoint, true, data);
    };

    const formAuthFetch = async (
        endpoint: string,
        formData: FormData
    ) => {
        return execute('POST', endpoint, true, {}, formData);
    };

    /**
     * Execute a fetch request with the given options
     * @param {string} method: GET, POST, PUT, DELETE
     * @param {URL} endpoint: The endpoint to call
     * @param {boolean} authed: Whether the request should have authorization headers. If the user is not logged in, the request will not authed regardless of this parameter.
     * @param {Object} data: The data to send to the endpoint, if any.
     * @param {FormData} formData: Form data to send, if any. This will overwrite the JSON data parameter.
     * @returns JSON response
     */
    const execute = useCallback(async (
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        endpoint: string,
        authed: boolean,
        data: any = null,
        formData: FormData | null = null
    ) => {
        try {
            const credentials: RequestCredentials = 'include';
            let options = {
                method: method,
                headers: new Headers(),
                body: formData ?? (data ? JSON.stringify(data) : null),
                credentials: credentials
            };

            if (data && !formData) {
                options.headers.append('Content-Type', 'application/json');
            }

            if (authed && instance.getActiveAccount()) {
                const tokenResponse = await instance.acquireTokenSilent({
                    ...loginRequest,
                    account: instance.getActiveAccount() ?? undefined
                });

                if (tokenResponse) {
                    console.debug("Adding auth header.");
                    const bearer = `Bearer ${tokenResponse.accessToken}`;
                    options.headers.append("Authorization", bearer);
                }
            }
            else {
                console.debug("Not adding auth header");
            }

            setIsLoading(true);

            const response = await fetch(endpoint, options);
            if (!response.ok) {
                throw new Error(`Invalid response: ${response.status}`);
            }
            const responseData = await response.json();
            setData(responseData);

            setIsLoading(false);
            return responseData;
        } catch (e) {
            setError(e);
            setIsLoading(false);
            throw e;
        }
    }, [instance]);

    return {
        isLoading,
        error,
        data,
        jsonFetch: useCallback(jsonFetch, [execute]),
        jsonAuthFetch: useCallback(jsonAuthFetch, [execute]),
        formAuthFetch: useCallback(formAuthFetch, [execute]),
    };
};

export default useFetchWithMsal;
