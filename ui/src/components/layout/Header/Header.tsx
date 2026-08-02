import { Link } from "react-router-dom";
import logo from "../../../assets/SoundTrackLogo.png";
import SearchBar from "../../../features/search/components/SearchBar";
import { useAuth } from "../../../features/auth/stores/useAuth";
import styles from "./Header.module.css";

const NAV_LINKS = ["Charts", "Chats", "Drops"];

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logoLink}>
          <img src={logo} alt="SoundTrack" className={styles.logo} />
        </Link>

        <div className={styles.actions}>
          <SearchBar />

          <nav className={styles.nav}>
            {NAV_LINKS.map((label) => (
              <a key={label} href="*" className={styles.navLink}>
                {label}
              </a>
            ))}
          </nav>

          {user ? (
            <div className={styles.userArea}>
              <Link to={`/profile/${user.id}`} className={styles.username}>
                {user.username}
              </Link>
              <Link
                to="/"
                className={styles.logoutButton}
                onClick={() => logout()}
              >
                Log out
              </Link>
            </div>
          ) : (
            <Link to="/login" className={styles.signIn}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
