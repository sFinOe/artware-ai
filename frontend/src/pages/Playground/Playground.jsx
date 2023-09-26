import { useState, useEffect, useMemo, useRef } from "react";
import styles from "./Playground.module.css";
import { RiMagicFill } from "react-icons/ri";
// import shape from "/images/shape.svg";
import stylesData from "@config/PromptStyles/PromptStyles.json";
import Config from "@config/ModelConfig/Config.json";
import Layout from "@components/Layout/Layout";
import { PostInference } from "@api";
import { useParams, useLocation } from "react-router-dom";
import modelsData from "@config/Models/Models.json";
import {
  ActionIcon,
  Grid,
  Menu,
  Button,
  Checkbox,
  Group,
  Slider,
  Text,
  Box,
  Input,
  Stack,
  Tooltip,
  rem,
  ScrollArea,
  Space,
  LoadingOverlay,
  AspectRatio,
  Center,
  Progress,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
// import { Loading, Image } from "@nextui-org/react";
import {
  IconCaretDown,
  IconAdjustments,
  IconDownload,
  IconMoodSad,
  IconAlertCircle,
  IconMoodCheck,
  IconMoodEmptyFilled,
  IconGripHorizontal,
  IconBox,
} from "@tabler/icons-react";
import { Dropdown } from "@nextui-org/react";
import PropTypes from "prop-types";
import tooltipData from "@config/Tooltips/Tooltips.json";
import Blacklist from "@config/Blacklist/Blacklist.json";
import { SetPayed } from "@api/payment";
// import { IconCreditCard } from "@tabler/icons-react";

function MultiSelect({ selected, setSelected }) {
  const selectedValue = useMemo(() => {
    let selectedArray = Array.from(selected);
    if (selectedArray.length === 0) {
      return "Super Tags";
    }

    if (selectedArray.length > 1) {
      return `${selectedArray[0]}, and ${selectedArray.length - 1} more`;
    }

    return selectedArray.join(", ").replaceAll("_", " ");
  }, [selected]);

  const HandleSelected = (keys) => {
    setSelected(keys);
  };

  return (
    <>
      <Dropdown>
        <Dropdown.Button
          color="secondary"
          css={{
            tt: "capitalize",
            backgroundColor: "#5F3BF3",
            borderRadius: "5px",
            height: "2.25rem",
          }}
        >
          {selectedValue}
        </Dropdown.Button>
        <Dropdown.Menu
          aria-label="Multiple selection actions"
          color="secondary"
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={(keys) => {
            HandleSelected(keys);
          }}
        >
          {stylesData.map((style) => (
            <Dropdown.Item key={style.name}>{style.name}</Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
}

function ModelMenu({ SelectedModel, setSelectedModel }) {
  const handleSelected = (value) => {
    setSelectedModel(value.toLowerCase);
    window.location.href = `/playground/${value.toLowerCase()}`;
  };

  return (
    <Menu width="92%" shadow="md" position="top-start" offset={22}>
      <Menu.Target>
        <Button
          fullWidth
          leftIcon={<IconBox size="1rem" />}
          rightIcon={<IconCaretDown size="1rem" />}
          className={`${styles.menuButton} ${styles.button}`}
        >
          {SelectedModel}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <ScrollArea h={160}>
          {modelsData.map((modelItem) => (
            <Menu.Item
              key={modelItem.id}
              onClick={() => handleSelected(modelItem.name)}
              value={modelItem.name}
              style={{
                fontFamily: "Poppins",
              }}
              className={`${styles.modelItem} ${SelectedModel === modelItem.name ? styles.modelSelectedItem : ""}`}
            >
              {modelItem.name}
            </Menu.Item>
          ))}
        </ScrollArea>
      </Menu.Dropdown>
    </Menu>
  );
}

function Playground() {
  const col1ImgRef = useRef(null);
  const location = useLocation();
  const [selected, setSelected] = useState([]);
  const [value, setValue] = useState(28);
  const [endValue, setEndValue] = useState(28);
  const [randomSeed, setRandomSeed] = useState(true);
  const [GeneratedImg, setGeneratedImg] = useState("");
  const [positivePrompt, setPositivePrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [SelectedModel, setSelectedModel] = useState(modelsData[0].name);
  const [generating, setGenerating] = useState(false);
  const [progressvalue, setProgressvalue] = useState(0);

  const { model } = useParams();

  useEffect(() => {
    const token = localStorage.getItem("JwtToken");
    if (token) {
      SetPayed();
    } else {
      window.location.href = "/";
    }

    const defaultModel = modelsData[0].name.toLowerCase();

    if (modelsData.find((modelItem) => modelItem.name.toLowerCase() === model)) {
      setSelectedModel(model.toLowerCase());
    } else {
      window.location.href = `/playground/${defaultModel}`;
    }
  }, [model, SelectedModel]);

  useEffect(() => {
    const storedImg = localStorage.getItem("GeneratedImg");
    if (storedImg) {
      setGeneratedImg(storedImg);
    }
  }, []);

  useEffect(() => {
    const modelName = location.pathname.split("/").pop();

    const col1Img = col1ImgRef.current;
    if (col1Img) {
      const model = modelsData.find((modelItem) => modelItem.name.toLowerCase() === modelName);
      if (model) {
        const imageUrl = model.image;
        col1Img.style.backgroundImage = `url(${imageUrl})`;
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    if (generating) {
      const targetProgress = 95;
      const intervalDuration = 60;
      const totalSteps = (targetProgress - progressvalue) / 4;
      const stepIncrement = totalSteps / (6000 / intervalDuration);

      const timer = setInterval(() => {
        setProgressvalue((oldProgress) => {
          if (oldProgress >= targetProgress) {
            clearInterval(timer);
            return oldProgress;
          }
          return Math.min(oldProgress + stepIncrement * 4, targetProgress);
        });
      }, intervalDuration);

      return () => {
        clearInterval(timer);
      };
    }
  }, [generating]);

  function handleCheckboxChange(event) {
    setRandomSeed(event.target.checked);
  }

  function handlePositivePromptChange(event) {
    setPositivePrompt(event.target.value);
  }

  function handleNegativePromptChange(event) {
    setNegativePrompt(event.target.value);
  }

  const handleDownloadClick = () => {
    const link = document.createElement("a");
    link.href = GeneratedImg;
    link.download = "image.png";
    link.click();
  };

  function containsBlacklistedWord(prompt, negativePrompt) {
    const lowercasePrompt = prompt.toLowerCase();
    for (const word of Blacklist.positive_blacklistedWords) {
      if (lowercasePrompt.includes(word)) {
        return true;
      }
    }

    const lowercaseNegativePrompt = negativePrompt.toLowerCase();
    for (const word of Blacklist.negative_blacklistedWords) {
      if (lowercaseNegativePrompt.includes(word)) {
        return true;
      }
    }
    return false;
  }

  const HandleGenerate = () => {
    if (generating) {
      notifications.show({
        id: "error-generating-image",
        withCloseButton: true,
        autoClose: 2000,
        title: "Error Generating Image",
        message: "Please wait for the current image to be generated",
        color: "red",
        icon: <IconMoodEmptyFilled />,
        loading: false,
      });
      return;
    }

    if (positivePrompt === "") {
      notifications.show({
        id: "prompt-empty",
        withCloseButton: true,
        autoClose: 2000,
        title: "Prompt is empty",
        message: "Please enter a prompt to generate an image",
        color: "yellow",
        loading: false,
      });
      return;
    }

    if (containsBlacklistedWord(positivePrompt, negativePrompt)) {
      notifications.show({
        id: "nsfw",
        withCloseButton: true,
        autoClose: 3000,
        title: Blacklist.error_title,
        message: Blacklist.error_msg,
        color: "red",
        loading: false,
      });
      return;
    }

    // setLoading(true);

    const ids = Array.from(selected);

    const selectedPositivePrompts = ids.map((id, index) => {
      const style = stylesData.find((s) => s.name === id);
      const prompt = index === 0 ? positivePrompt : "";
      const defaultPositive = style && style.positivePrompt;
      return prompt + (defaultPositive ? ", " + defaultPositive : "");
    });

    const selectedNegativePrompts = ids.map((id, index) => {
      const style = stylesData.find((s) => s.name === id);
      const prompt = index === 0 ? negativePrompt : "";
      const defaultNegative = style && style.negativePrompt;
      return prompt + (defaultNegative ? ", " + defaultNegative : "");
    });

    const concatenatedPositivePrompt = selectedPositivePrompts.join(", ");
    const concatenatedNegativePrompt = selectedNegativePrompts.join(", ");

    const Payload = {
      input: {
        prompt: concatenatedPositivePrompt ? concatenatedPositivePrompt : positivePrompt,
        negative_prompt: concatenatedNegativePrompt ? concatenatedNegativePrompt : negativePrompt,
        width: Config.width,
        height: Config.height,
        num_inference_steps: endValue.toString(),
        guidance_scale: Config.guidance_scale,
        num_images_per_prompt: Config.num_images_per_prompt,
        bucket_name: Config.bucket_name,
        model_name: SelectedModel.toLowerCase(),
        scheduler: Config.scheduler,
        seed: randomSeed ? "" : Config.seed,
      },
      endpointId: Config.endpointId,
    };

    setGenerating(true);

    setProgressvalue(0);

    PostInference(Payload)
      .then((res) => {
        if (res.body === "") {
          notifications.show({
            id: "error-generating-image",
            withCloseButton: true,
            autoClose: 2000,
            title: "Error Generating Image",
            message: "Please try again later all the workers are busy",
            color: "red",
            loading: false,
          });

          return;
        }
        setGenerating(false);
        setGeneratedImg(res.body.Image);
        setProgressvalue(100);
        localStorage.setItem("GeneratedImg", res.body.Image);
      })
      .catch((err) => {
        console.log(err);
        notifications.show({
          id: "error-generating-image",
          withCloseButton: true,
          autoClose: 2000,
          title: "Error Generating Image",
          message: "Please try again later all the workers are busy",
          color: "red",
          loading: false,
        });
        setGenerating(false);
        const overlay = document.getElementById("ImgOverlay");
        const button = document.getElementById("ButtonShape");
        overlay.style.display = "none";
        button.style.display = "none";
      });
  };

  return (
    <Layout>
      <div className={styles.row}>
        <div className={styles.col1} id="col1" ref={col1ImgRef}>
          <Stack>
            <h2>AI Image Generation to enhance your creative potential</h2>
            <Space h="sm" />
            <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.</p>
          </Stack>
        </div>
        <div className={styles.col2}>
          <Stack>
            <AspectRatio ratio={512 / 512} mx="auto" w="100%" h="100%">
              <LoadingOverlay
                visible={generating}
                overlayColor="#0C061A"
                overlayBlur={10}
                radius="sm"
                loader={<Progress size="sm" color="violet" radius="xs" w={300} value={progressvalue} animate />}
              />

              {GeneratedImg ? (
                <img
                  src={GeneratedImg}
                  alt="Generated Image"
                  style={{
                    objectFit: "cover",
                    borderRadius: "5px",
                  }}
                />
              ) : (
                <Center
                  bg="#0C061A"
                  style={{
                    borderRadius: "5px",
                  }}
                >
                  {!generating && (
                    <Stack bg="#5f3bf3" px={15} py="xs" style={{ borderRadius: "10px", width: "60%" }}>
                      <Text fz="sm" fw={600} align="center">
                        write a prompt in the input box and click generate to see the magic happen.
                      </Text>
                    </Stack>
                  )}
                </Center>
              )}
            </AspectRatio>
            <Grid className={styles.form}>
              <Stack>
                <Group className={styles.options}>
                  <Group>
                    <MultiSelect selected={selected} setSelected={setSelected} />

                    <Menu closeOnItemClick={0} shadow="md" width={400} className={styles.menu} position="bottom-start">
                      <Menu.Target>
                        <Button
                          leftIcon={<IconAdjustments size="1rem" />}
                          rightIcon={<IconCaretDown size="1rem" />}
                          className={`${styles.menuButton} ${styles.button}`}
                        >
                          Advanced
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item className={styles.menuItem}>
                          <ModelMenu SelectedModel={SelectedModel} setSelectedModel={setSelectedModel} />
                        </Menu.Item>
                        <Menu.Item className={styles.menuItem}>
                          <Checkbox
                            label="Randomize seed"
                            color="violet"
                            checked={randomSeed}
                            onChange={handleCheckboxChange}
                            styles={{
                              input: {
                                fontFamily: "Poppins",
                                cursor: "pointer",
                              },
                              label: {
                                fontFamily: "Poppins",
                                cursor: "pointer",
                                color: "#212529",
                              },
                            }}
                          />
                        </Menu.Item>
                        <Menu.Item className={styles.menuItem}>
                          <Box maw={400} mx="auto">
                            <Slider
                              styles={(theme) => ({
                                thumb: {
                                  border: `${rem(1)} solid ${theme.colorScheme === "dark" ? theme.colors.dark[2] : theme.colors.gray[3]}`,
                                  boxShadow: theme.shadows.sm,
                                  width: rem(28),
                                  height: rem(22),
                                  color: theme.colors.gray[5],
                                  backgroundColor: theme.white,
                                  borderRadius: theme.radius.sm,
                                },
                              })}
                              thumbChildren={<IconGripHorizontal size="1.2rem" stroke={1.5} />}
                              defaultValue={40}
                              label={null}
                              color="violet"
                              min={15}
                              max={50}
                              value={value}
                              onChange={setValue}
                              onChangeEnd={setEndValue}
                            />
                            <Text
                              mt="md"
                              size="sm"
                              style={{
                                fontFamily: "Poppins",
                                color: "#212529",
                              }}
                            >
                              Steps: <b>{value}</b>
                            </Text>
                          </Box>
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                  <Group>
                    {(GeneratedImg && (
                      <ActionIcon size={37} variant="filled" className={styles.button} onClick={handleDownloadClick}>
                        <IconDownload size="1.2rem" />
                      </ActionIcon>
                    )) || (
                      <ActionIcon size={37} variant="filled" className={styles.button} onClick={(event) => event.preventDefault()}>
                        <IconDownload size="1.2rem" />
                      </ActionIcon>
                    )}

                    <Button type="submit" rightIcon={<RiMagicFill size="1rem" />} className={styles.button} onClick={HandleGenerate}>
                      Generate
                    </Button>
                  </Group>
                </Group>
                <Input
                  icon={<IconMoodCheck size="1rem" style={{ color: "#7b7586" }} />}
                  className={styles.input}
                  placeholder="What do you want to see (Positive Prompt)"
                  name="positive-prompt"
                  value={positivePrompt}
                  onChange={handlePositivePromptChange}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      HandleGenerate();
                    }
                  }}
                  size="sm"
                  radius="md"
                  required
                  styles={(theme) => ({
                    input: {
                      fontFamily: "Poppins",
                      padding: "1.3rem 0",
                      paddingRight: "2.2rem",
                      "&:focus-within": {
                        borderColor: theme.colors.violet[7],
                      },
                      backgroundColor: "rgba(255, 255, 255, 0.87)",
                      color: "#4317a1",
                      "::placeholder": {
                        color: "#746b86c7",
                      },
                    },
                  })}
                  rightSection={
                    (positivePrompt && (
                      <Tooltip
                        multiline
                        label={tooltipData[0].label}
                        width="38.5rem"
                        offset={10}
                        arrowSize={6}
                        position="top-end"
                        withArrow
                        style={{
                          fontFamily: "Poppins",
                          padding: "1rem",
                          fontWeight: "normal",
                          backgroundColor: "#4317a1",
                          minWidth: "38.5rem",
                          maxWidth: "38.5rem",
                        }}
                      >
                        <ActionIcon
                          style={{
                            backgroundColor: "#211835",
                            color: "#fff",
                            borderRadius: "8px",
                          }}
                        >
                          <IconAlertCircle size="1rem" style={{ display: "block" }} />
                        </ActionIcon>
                      </Tooltip>
                    )) || (
                      <Tooltip
                        multiline
                        label={tooltipData[0].label}
                        offset={10}
                        arrowSize={6}
                        position="top-end"
                        withArrow
                        style={{
                          fontFamily: "Poppins",
                          padding: "1rem",
                          fontWeight: "normal",
                          backgroundColor: "#4317a1",
                          minWidth: "38.5rem",
                          maxWidth: "38.5rem",
                        }}
                      >
                        <ActionIcon
                          style={{
                            color: "#4317a1",
                          }}
                        >
                          <IconAlertCircle size="1rem" style={{ display: "block" }} />
                        </ActionIcon>
                      </Tooltip>
                    )
                  }
                />

                <Input
                  icon={<IconMoodSad size="1rem" style={{ color: "#7b7586" }} />}
                  className={styles.input}
                  name="negative-prompt"
                  placeholder="What you don't want to see (Negative Prompt)"
                  value={negativePrompt}
                  onChange={handleNegativePromptChange}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      HandleGenerate();
                    }
                  }}
                  size="sm"
                  radius="md"
                  styles={(theme) => ({
                    input: {
                      fontFamily: "Poppins",
                      padding: "1.3rem 0",
                      paddingRight: "2.2rem",
                      "&:focus-within": {
                        borderColor: theme.colors.violet[7],
                      },
                      backgroundColor: "rgba(255, 255, 255, 0.87)",
                      color: "#4317a1",
                      "::placeholder": {
                        color: "#746b86c7",
                      },
                    },
                  })}
                  rightSection={
                    (negativePrompt && (
                      <Tooltip
                        multiline
                        label={tooltipData[1].label}
                        offset={10}
                        arrowSize={6}
                        position="top-end"
                        withArrow
                        style={{
                          fontFamily: "Poppins",
                          padding: "1rem",
                          fontWeight: "normal",
                          backgroundColor: "#4317a1",
                          minWidth: "38.5rem",
                          maxWidth: "38.5rem",
                        }}
                      >
                        <ActionIcon
                          style={{
                            backgroundColor: "#211835",
                            color: "#fff",
                            borderRadius: "8px",
                          }}
                        >
                          <IconAlertCircle size="1rem" style={{ display: "block" }} />
                        </ActionIcon>
                      </Tooltip>
                    )) || (
                      <Tooltip
                        multiline
                        label={tooltipData[1].label}
                        offset={10}
                        arrowSize={6}
                        position="top-end"
                        withArrow
                        style={{
                          fontFamily: "Poppins",
                          padding: "1rem",
                          fontWeight: "normal",
                          backgroundColor: "#4317a1",
                          minWidth: "38.5rem",
                          maxWidth: "38.5rem",
                        }}
                      >
                        <ActionIcon
                          style={{
                            color: "#4317a1",
                          }}
                        >
                          <IconAlertCircle size="1rem" style={{ display: "block" }} />
                        </ActionIcon>
                      </Tooltip>
                    )
                  }
                />
              </Stack>
            </Grid>
          </Stack>
        </div>
      </div>
    </Layout>
  );
}

MultiSelect.propTypes = {
  selected: PropTypes.string,
  setSelected: PropTypes.func,
};

ModelMenu.propTypes = {
  SelectedModel: PropTypes.string,
  setSelectedModel: PropTypes.func,
};

export default Playground;
