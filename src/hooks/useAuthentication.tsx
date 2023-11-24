import React, { useEffect } from "react";
import { Constants } from "../constants";
import { UserInfo } from "../models/userInfo";
import { setIsAuthenticated, setUsername } from "../features/storeSlice";
import { useAppDispatch } from "../hooks";
import { useMsal } from "@azure/msal-react";
import useFetchWithMsal from "../hooks/useFetchWithMsal";

const useAuthentication = () => {
    const { instance } = useMsal();
    const dispatch = useAppDispatch();
    const [userInfoState, setUserInfoState] = React.useState<UserInfo | null>(null);
    const [isLoadedState, setIsLoadedState] = React.useState<boolean>(false);
    const [error, setError] = React.useState<any>(null);

    const { jsonAuthFetch } = useFetchWithMsal();

    useEffect(() => {
        const fetchUserInfo = () => {
            jsonAuthFetch(`${Constants.url}/user-info`)
                .then(data => {
                    setUserInfoState(data);
                    setIsLoadedState(true);
                    dispatch(setIsAuthenticated(data.isAuthenticated));
                    dispatch(setUsername(data.name));
                })
                .catch(reason => {
                    console.error(reason);
                    setError(reason);
                });
        };
        fetchUserInfo();
    }, [instance, jsonAuthFetch, dispatch]);

    return {
        isAuthenticated: userInfoState?.isAuthenticated === true,
        isLoadedState,
        userInfoState,
        error
    };
}

export default useAuthentication;
