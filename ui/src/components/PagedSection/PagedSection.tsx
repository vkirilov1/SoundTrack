import type { ReactNode } from "react";
import missingResourcesIcon from "../../assets/MissingResources.png";
import Spinner from "../Spinner/Spinner";
import styles from "./PagedSection.module.css";

interface PagedSectionProps {
  loading: boolean;
  listLoading: boolean;
  /** When true and emptyMessage is set, shows an icon + message instead of children. */
  isEmpty: boolean;
  emptyMessage?: string;
  spinnerLabel: string;
  children: ReactNode;
}

function PagedSection({
  loading,
  listLoading,
  isEmpty,
  emptyMessage,
  spinnerLabel,
  children,
}: PagedSectionProps) {
  return (
    <div className={styles.sectionWrap}>
      <div
        className={
          listLoading
            ? `${styles.sectionContent} ${styles.blurred}`
            : styles.sectionContent
        }
      >
        {loading ? (
          <div className={styles.empty}>
            <Spinner label={spinnerLabel} />
          </div>
        ) : isEmpty && emptyMessage ? (
          <div className={styles.empty}>
            <img
              src={missingResourcesIcon}
              alt=""
              className={styles.emptyIcon}
            />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
      {listLoading && (
        <div className={styles.loadingOverlay}>
          <Spinner label={spinnerLabel} />
        </div>
      )}
    </div>
  );
}

export default PagedSection;
