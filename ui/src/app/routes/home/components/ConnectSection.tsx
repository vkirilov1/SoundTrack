import chatPlaceholder from "../../../../assets/chatPlaceholder.png";
import listsPlaceholder from "../../../../assets/listsPlaceholder.png";
import FeatureRow from "./FeatureRow";
import styles from "./ConnectSection.module.css";

function ConnectSection() {
  return (
    <section className={styles.connect}>
      <h2 className={styles.heading}>Connect</h2>

      <FeatureRow
        title="Chat Live"
        description="Connect with people sharing your taste. Discuss new releases, celebrate your favorites, and share your passion with fellow music lovers."
        image={chatPlaceholder}
        imageAlt="Chat conversation preview"
        imageVariant="chat"
      />

      <FeatureRow
        title="Highlight your favorites"
        description="Build playlists of your favorite albums. Organize your music collection, save your all-time favorites, and share lists with the world, that reflect your unique taste."
        image={listsPlaceholder}
        imageAlt="Checklist of favorite albums"
        imageVariant="highlight"
        reverse
      />
    </section>
  );
}

export default ConnectSection;
