import concertPhoto from "../../../../assets/concert.jpg";
import styles from "./Hero.module.css";

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.intro}>
        <h1 className={styles.heading}>Share your thoughts</h1>
        <p className={styles.subheading}>
          Rate and review your favorite.. and least favorite albums and artists
          from every era and every corner of the world.
        </p>
        <a href="/register" className={styles.register}>
          Register
        </a>
      </div>

      <div className={styles.photoWrap}>
        <img
          src={concertPhoto}
          alt="Crowd at a live concert"
          className={styles.photo}
        />
      </div>
    </section>
  );
}

export default Hero;
