import { url } from "./config/utils"
import styles from "./css/signuppage.module.css"
import { useLocation } from 'react-router-dom';
import { useState } from "react";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function GoogleSignUpFinalization() {
    let query = useQuery();
    let user = query.get('user');
    let needAddInfo = query.get('need-add-info');
    let token = query.get('token');
    const [invalidPassword, setInvalidPassword] = useState(false);
    const [userExists, setUserExists] = useState(false);

    if(needAddInfo.toLowerCase() == "false") {
        localStorage.setItem("user-data", JSON.stringify({name: user, token: token}));
        window.location.href = "/";
    }

    return (
        <div style={{paddingTop: "0"}} className={styles["page-center"]}>
            <div style={{width: "80vw", height: "90vh", zIndex: "10", display: "flex", alignItems: "center", justifyContent: "center"}}>
                <div style={{marginLeft: "0"}} className={styles["sign-up-page"]}>
                    <h1 style={{fontSize: "1.5em", color: "#F7F4F3", fontWeight: "bold"}}>Additional Info Needed</h1>
                    <p style={{color: "#F7F4F3", textAlign: "center"}}>Some additional information is needed to complete your sign up, 
                    <br/>then, you can get to the prints!</p>
                    <form className={styles["sign-up-form"]} onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const formData = new FormData(form);
                        const data = {
                            username: formData.get('username').toString(),
                            password: formData.get('password').toString(),
                            token: token
                        }
                        if(data.password !== formData.get('confirm-password')) {
                            setInvalidPassword(true);
                            return;
                        }
                        fetch(url("/api/accounts/complete-signup"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        }).then(res => {
                            if(res.status === 400) {
                                setUserExists(true);
                            }
                            res.json().then(data => {
                                if(res.status === 200) {
                                    localStorage.setItem("user-data", JSON.stringify({name: data.username, token: data.token}));
                                    window.location.href = "/";
                                }
                                else {
                                    window.location.href = "/#/sign-up?error=true"
                                }
                            })
                        })
                    }}>
                        {
                            userExists ? <p style={{color: "#DE3C4B", textAlign: "center"}}>This username is already taken!</p> : ""
                        }
                        {
                            invalidPassword ? <p style={{color: "#DE3C4B", textAlign: "center"}}>Passwords do not match!</p> : ""
                        }
                        <label htmlFor="username">Username</label>
                        <input type="text" name="username" id="username" placeholder="Username" required/>
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" id="password" placeholder="Password" required/>
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input type="password" name="confirm-password" id="confirm-password" placeholder="Confirm Password" required/>
                        <button className={styles["sign-up-button"]} type="submit">Sign Up</button>
                    </form>
                </div>
            </div>
            <img src="./primary-modal-background.png" style={{width: "80vw", height: "90vh", position: "absolute", objectFit: "cover", borderRadius: "3rem", objectPosition: "0 top"}}/>
        </div>
    )
}

export default GoogleSignUpFinalization