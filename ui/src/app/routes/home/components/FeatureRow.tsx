import styles from "./FeatureRow.module.css";

interface FeatureRowProps {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imageVariant: "chat" | "highlight";
  reverse?: boolean;
}

function FeatureRow({
  title,
  description,
  image,
  imageAlt,
  imageVariant,
  reverse = false,
}: FeatureRowProps) {
  return (
    <div className={`${styles.row} ${reverse ? styles.reverse : ""}`}>
      <div className={`${styles.imageWrap} ${styles[imageVariant]}`}>
        <img src={image} alt={imageAlt} className={styles.image} />
      </div>

      <div className={styles.text}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
}

export default FeatureRow;
