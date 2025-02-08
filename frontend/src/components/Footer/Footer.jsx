import styles from "./Footer.module.css";
import { Link } from "react-router-dom";
import { Space } from "@mantine/core";
import { Group } from "@mantine/core";
import Config from "@config/Appname/Appname";

function Footer() {
  return (
    <>
      <Space h="lg" />
      <Space h="xl" />
      <Group className={styles.footerContainer}>
        <Group className={styles.footer}>
          <h2>{Config.Appname}</h2>
          <p className={styles.creators}>
            Created by&nbsp; &nbsp;
            <a href="https://www.linkedin.com/in/sfinoe/" target="_blank" rel="noreferrer">
              Zakaria Kasmi
            </a>
          </p>
          <Link to="/privacyPolicy">Privacy Policy</Link>
          <Link to="/contact">Contact</Link>
        </Group>
      </Group>
      <Space h="lg" />
    </>
  );
}

export default Footer;
