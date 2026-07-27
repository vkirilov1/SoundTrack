import { Link } from "react-router-dom";
import logo from "../../../assets/SoundTrackLogo.png";
import { useAuth } from "../../../context/useAuth";
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
          <button
            type="button"
            className={styles.searchButton}
            aria-label="Search"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M16 16L12.5 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

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
              <button
                type="button"
                className={styles.logoutButton}
                onClick={() => logout()}
              >
                Log out
              </button>
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
