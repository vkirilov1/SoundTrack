import { Link } from "react-router-dom";
import { artistImageUrl, coverImageUrl } from "../../../utils/images";
import type { SearchResult } from "../types";
import styles from "./SearchResultRow.module.css";

interface SearchResultRowProps {
  result: SearchResult;
  onNavigate: () => void;
}

function SearchResultRow({ result, onNavigate }: SearchResultRowProps) {
  const href =
    result.type === "ALBUM" ? `/album/${result.id}` : `/artist/${result.id}`;
  const imageSrc = result.imageUrl
    ? result.type === "ALBUM"
      ? coverImageUrl(result.imageUrl)
      : artistImageUrl(result.imageUrl)
    : null;

  return (
    <Link to={href} className={styles.resultRow} onClick={onNavigate}>
      {imageSrc ? (
        <img src={imageSrc} alt="" className={styles.resultThumb} />
      ) : (
        <span className={styles.resultThumbPlaceholder} aria-hidden="true" />
      )}
      <span className={styles.resultText}>
        <span className={styles.resultTitle}>{result.title}</span>
        {result.subtitle && (
          <span className={styles.resultSubtitle}>{result.subtitle}</span>
        )}
      </span>
    </Link>
  );
}

export default SearchResultRow;
