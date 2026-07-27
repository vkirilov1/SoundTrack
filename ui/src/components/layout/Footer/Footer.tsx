import logo from "../../../assets/SoundTrackLogo.png";
import styles from "./Footer.module.css";

const FOOTER_LINKS = ["Contact Us", "About", "Blog", "FAQ"];

const LEGAL_LINKS = ["Terms of Use", "Privacy Policy", "Legal Policies"];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "#",
    path: "M8 2h8a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6V8a6 6 0 0 1 6-6m0 2a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4zm8.5 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  },
  {
    label: "X",
    href: "#",
    path: "M3 3h4.6l4 5.4L16.4 3H20l-6.4 7.9L20.6 21H16l-4.4-5.9L6.2 21H2.6l6.8-8.4z",
  },
  {
    label: "Facebook",
    href: "#",
    path: "M14 8.5V6.8c0-.8.5-1 .9-1H16V2.5h-2.4C11 2.5 10.5 4.6 10.5 6.6v1.9H8.5v3.2h2v9.8h3.5v-9.8h2.4l.4-3.2z",
  },
  {
    label: "TikTok",
    href: "#",
    path: "M16.6 5.82a4.28 4.28 0 0 1-3.02-3.66h-3.02v13.13a2.6 2.6 0 0 1-4.68 1.57 2.6 2.6 0 0 1 2.6-4.13v-3.06a5.66 5.66 0 0 0-4.6 8.94 5.66 5.66 0 0 0 10.28-3.32V9.01a7.3 7.3 0 0 0 4.24 1.35V7.34a4.28 4.28 0 0 1-1.8-1.52",
  },
];

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img src={logo} alt="SoundTrack" className={styles.logo} />
          <div className={styles.social}>
            {SOCIAL_LINKS.map(({ label, href, path }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className={styles.socialLink}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className={styles.linksArea}>
          <nav className={styles.links}>
            {FOOTER_LINKS.map((label) => (
              <a key={label} href="*" className={styles.link}>
                {label}
              </a>
            ))}
          </nav>
          <p className={styles.timezone}>Timezone: UTC+00:00</p>
          <p className={styles.legal}>
            SoundTrack Limited © 2026. All rights reserved
            {LEGAL_LINKS.map((label) => (
              <span key={label}>
                {" · "}
                <a href="#" className={styles.legalLink}>
                  {label}
                </a>
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
