import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import useAccessToken from "../../hooks/useAccessToken";
import SymptomOverview from "../symptomoverview/SymptomOverview";
import Login from "../LoginButton";
import { Account } from "../../interfaces";

export default function Landing() {
    const { user } = useAuth0();
    const accessToken = useAccessToken();

    const [ account, setAccount ] = useState<Account | null>(null);

    useEffect(() => {
        // checks for account; if found, returns data
        async function doesAccountExist(): Promise<Account | null> {
            try {
                const req = await fetch(`http://localhost:8080/account/${user?.email}`, { headers: { 'Authorization': `Bearer ${accessToken}` }});
                if (req.ok) {
                    const res = await req.json();
                    return res;
                } else {
                    const errMsg = await req.text();
                    throw new Error(errMsg);
                }
            } catch(e) {
                console.error(e);
                return null;
            }
        }

        // creates account and returns data
        async function createAccount(): Promise<Account | null> {
            const requestOptions = {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    // may not be necessary to store username OR password in backend
                    username: "adactruong",
                    password: "Ijm&awkWoopfPC1",
                    email: user?.email
                })
            };
            try {
                const req = await fetch("http://localhost:8080/account", requestOptions);
                if (req.ok) {
                    const res = await req.json();
                    return res;
                } else {
                    const errMsg = await req.text();
                    throw new Error(errMsg);
                }
            } catch(e) {
                console.error(e);
                return null;
            }
        }

        // returns account data, whether account exists or not
        async function getAccountData() {
            const accountData: Account | null = await doesAccountExist();
            setAccount(accountData || await createAccount());
        }

        if (user && accessToken) getAccountData();
    }, [accessToken, user]);

    return (
        <main>
            <Login />
            <div>
                <h1>Welcome back, {account?.username}</h1>
            </div>
            <SymptomOverview account={account} />
        </main>
    );
};