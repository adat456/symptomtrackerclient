import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";

export default function useAccessToken(): string {
    const { getAccessTokenSilently } = useAuth0();
    const [ silentAccessToken, setSilentAccessToken ] = useState<string>("");
    
    useEffect(() => {
        async function getAccessToken() {
            try {
                const silentAccessToken = await getAccessTokenSilently({
                    authorizationParams: {
                        audience: import.meta.env.REACT_APP_AUTH0_AUDIENCE,
                    },
                });
                setSilentAccessToken(silentAccessToken);
            } catch (e: any) {
                console.log(e.message);
            }
        }
        getAccessToken();
    }, [getAccessTokenSilently]);
    
    return silentAccessToken;
}