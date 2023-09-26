import { Container } from "@nextui-org/react";
import proptypes from "prop-types";
import styles from "./Layout.module.css";

const Layout = ({ children }) => {
  return (
    <div>
      <Container lg className={styles.Container}>
        <main>{children}</main>
      </Container>
    </div>
  );
};

Layout.propTypes = {
  children: proptypes.node.isRequired,
};

export default Layout;
