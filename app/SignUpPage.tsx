import { useState } from "react";
import { url } from "./config/utils"
import styles from "./css/signuppage.module.css"
import GoogleButton from 'react-google-button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { faEyeSlash } from '@fortawesome/free-regular-svg-icons';

function SignUpPage() {
    const [userExists, setUserExists] = useState(false);
    const [invalidPassword, setInvalidPassword] = useState(false);
    const [usernameTaken, setUsernameTaken] = useState(false);
    const [signingIn, isSigningIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    function setSigningIn() {
        isSigningIn(!signingIn);
    }
    
    return (
        <div className={styles["page-center"]}>
            <script src="https://kit.fontawesome.com/109833def2.js" crossOrigin="anonymous"></script>
            <div style={{width: "80vw", height: "90vh", zIndex: "10", display: "flex", alignItems: "center"}}>
                { !signingIn ?
                <div className={styles["sign-up-page"]}>
                    <h1 style={{fontSize: "1.5em", color: "#F7F4F3", fontWeight: "bold"}}>Sign Up</h1>
                    <form className={styles["sign-up-form"]} onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const formData = new FormData(form);
                        const data = {
                            username: formData.get('username').toString(),
                            password: formData.get('password').toString(),
                            email: formData.get('email').toString()
                        }
                        if(data.password !== formData.get('confirm-password')) {
                            setInvalidPassword(true);
                            return;
                        }
                        fetch(url("/api/accounts/signup"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        }).then(res => {
                            if(res.status === 400) {
                                setUserExists(true);
                            } 
                            if(res.status === 409) {
                                setUsernameTaken(true);
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
                            userExists ? <p style={{color: "#DE3C4B", textAlign: "center"}}>It seems you already have an account, <br/> try to sign in instead!</p> : ""
                        }
                        {
                            invalidPassword ? <p style={{color: "#DE3C4B", textAlign: "center"}}>Passwords do not match!</p> : ""
                        }
                        {
                            usernameTaken ? <p style={{color: "#DE3C4B", textAlign: "center"}}>This username is already in use, <br/> please use a different one!</p> : ""
                        }
                        <label htmlFor="username">Username</label>
                        <input type="text" name="username" id="username" placeholder="Username" maxLength={16} required/>
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" id="email" placeholder="Email" required/>
                        <label htmlFor="password">Password</label>
                        <div className={styles["password-field"]}>
                            <input type={showPassword ? "text" : "password"} name="password" id="password" placeholder="Password" required/>
                            {
                                showPassword ? <FontAwesomeIcon icon={faEyeSlash} onClick={() => setShowPassword(!showPassword)}/> : <FontAwesomeIcon icon={faEye} onClick={() => setShowPassword(!showPassword)}/>
                            }
                        </div>
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input type={showPassword ? "text" : "password"} name="confirm-password" id="confirm-password" placeholder="Confirm Password" required/>
                        <p style={{color: "#F7F4F3"}}>or</p>
                        {/* <GoogleButton
                            onClick={() => { window.location.href = url('/login/google'); }}
                        /> */}
                        <button className={styles["sign-up-button"]} type="submit" disabled={signingIn}>Sign Up</button>
                        <button onClick={setSigningIn} className={styles["sign-in-button"]}>Already have an account? Sign in here!</button>
                    </form>
                </div> : 
                <div className={styles["sign-up-page"]}>
                    <h1 style={{fontSize: "1.5em", color: "#F7F4F3", fontWeight: "bold"}}>Sign In</h1>
                    <form className={styles["sign-up-form"]} onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const formData = new FormData(form);
                        const data = {
                            username: formData.get('username').toString(),
                            password: formData.get('password').toString(),
                        }
                        fetch(url("/api/accounts/login"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        }).then(res => {
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
                        <label htmlFor="username">Username or Email</label>
                        <input type="text" name="username" id="username" placeholder="Username or Email" required/>
                        <label htmlFor="password">Password</label>
                        <div className={styles["password-field"]}>
                            <input type={showPassword ? "text" : "password"} name="password" id="password" placeholder="Password" required/>
                            {
                                showPassword ? <FontAwesomeIcon icon={faEyeSlash} onClick={() => setShowPassword(!showPassword)}/> : <FontAwesomeIcon icon={faEye} onClick={() => setShowPassword(!showPassword)}/>
                            }
                        </div>
                        <p style={{color: "#F7F4F3"}}>or</p>
                        {/* <GoogleButton
                             onClick={() => { window.location.href = url('/login/google'); }}
                        /> */}
                        <button className={styles["sign-up-button"]} type="submit" disabled={!signingIn}>Sign In</button>
                        <button onClick={setSigningIn} className={styles["sign-in-button"]}>Don&apos;t have an account? Sign up!</button>
                    </form>
                </div>
                }
            </div>
            <img src="./primary-modal-background.png" style={{width: "55rem", height: "35rem", position: "absolute", objectFit: "cover", borderRadius: "3rem", objectPosition: "0 top"}}/>
        </div>
    )
}

export default SignUpPage