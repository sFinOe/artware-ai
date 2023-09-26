import styles from "./BigTitle.module.css";
import { Grid, Stack, Space } from "@mantine/core";

function BigTitle() {
  return (
    <Grid.Col className={styles.col1}>
      <Stack>
        <h2>AI Image Generation to enhance your creative potential</h2>
        <Space h="sm" />
        <p>
          It is a long established fact that a reader will be distracted by the
          readable content of a page when looking at its layout.
        </p>
      </Stack>
    </Grid.Col>
  );
}

export default BigTitle;
