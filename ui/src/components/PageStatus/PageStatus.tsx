import missingResourcesIcon from "../../assets/MissingResources.png";
import Spinner from "../Spinner/Spinner";
import styles from "./PageStatus.module.css";

interface PageStatusProps {
  variant: "loading" | "not-found";
  message?: string;
}

/** Full-page loading spinner or "not found" icon+message, centered in a status block. */
function PageStatus({ variant, message }: PageStatusProps) {
  return (
    <div className={styles.status}>
      {variant === "loading" ? (
        <Spinner />
      ) : (
        <>
          <img
            src={missingResourcesIcon}
            alt=""
            className={styles.statusIcon}
          />
          <p>{message}</p>
        </>
      )}
    </div>
  );
}

export default PageStatus;
