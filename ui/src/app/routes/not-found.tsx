import { Link } from "react-router-dom";
import icon404 from "../../assets/404Icon.png";
import styles from "./not-found.module.css";

function NotFoundRoute() {
  return (
    <section className={styles.wrap}>
      <img src={icon404} alt="404 - page not found" className={styles.icon} />
      <p className={styles.text}>This page doesn't exist yet.</p>
      <Link to="/" className={styles.link}>
        Back to home
      </Link>
    </section>
  );
}

export default NotFoundRoute;
