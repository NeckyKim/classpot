import { useNavigate, Link } from "react-router-dom";

import { authService } from "../../FirebaseModules";

import styles from "./HeaderTop.module.css";



type HeaderProps = {
    loggedIn: boolean;
}

export default function Header({ loggedIn }: HeaderProps) {
    var navigate = useNavigate();



    return (
        <div>
            <div className={styles.headerContainer}>
                <img className={styles.headerLogo} src={process.env.PUBLIC_URL + "/logos/logo.png"} onClick={() => { navigate("/") }} />

                {
                    loggedIn

                        ?


                        <div className={styles.logoutButton} onClick={() => { authService.signOut(); }}>
                            로그아웃
                        </div>

                        :

                        <Link to="/login" className={styles.loginButton}>
                            로그인
                        </Link>
                }


            </div>

            <div className={styles.blank} />
        </div >
    )
}