import styles from "./Hero.module.css";
import { useState, useEffect, useRef } from "react";
import { Spacer } from "@nextui-org/react";
import { Link } from "react-router-dom";
import stylesData from "@config/PromptStyles/PromptStyles.json";
import Config from "@config/Payment/Price";
import ModelConfig from "@config/ModelConfig/Config.json";
import {
  ActionIcon,
  Button,
  Group,
  Input,
  Grid,
  Stack,
  Modal,
  Menu,
  Checkbox,
  Box,
  Slider,
  rem,
  Text,
  Accordion,
  ScrollArea,
  LoadingOverlay,
  AspectRatio,
  Center,
  Overlay,
  Progress,
} from "@mantine/core";
// import { Loading, Image } from "@nextui-org/react";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { PostFreeInference, GetTotalGenerations } from "@api";
import { IsPayed } from "@api/payment";
import modelsData from "@config/Models/Models.json";
import {
  IconTag,
  IconCreditCard,
  IconMoodSad,
  IconMoodCheck,
  IconSettings,
  IconArrowDown,
  IconGripHorizontal,
  IconSelector,
  IconBox,
  IconMoodEmpty,
  IconMoodEmptyFilled,
  IconDownload,
} from "@tabler/icons-react";
import PropTypes from "prop-types";
import Blacklist from "@config/Blacklist/Blacklist.json";
import { useParams } from "react-router-dom";

function MultiSelect({ selected, setSelected }) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelected = (index) => {
    if (selected.includes(stylesData[index].name)) {
      setSelected(selected.filter((style) => style !== stylesData[index].name));
      setSelectedIndex(null);
    } else {
      setSelected([...selected, stylesData[index].name]);
      setSelectedIndex(index);
    }
  };

  return (
    <>
      <Group position="center">
        <Button variant="outline" color="violet" onClick={toggleDropdown} rightIcon={<IconTag size="1rem" />} style={{ fontFamily: "Poppins" }}>
          Super Tags
        </Button>
      </Group>
      {isOpen && (
        <Stack gap="sm" style={{ marginTop: "0.5rem" }}>
          {stylesData.map((style, index) => (
            <Button
              key={style.name}
              variant={selected.includes(style.name) ? "filled" : "light"}
              color="violet"
              onClick={() => handleSelected(index)}
              style={{
                fontFamily: "Poppins",
                color: selectedIndex === index ? "#ffffff" : undefined,
              }}
            >
              {style.name}
            </Button>
          ))}
        </Stack>
      )}
    </>
  );
}

function ModelMenu({ SelectedModel, setSelectedModel }) {
  const handleSelected = (value) => {
    setSelectedModel(value.toLowerCase());
    window.location.href = `/${value.toLowerCase()}`;
  };

  return (
    <>
      <Accordion>
        <Accordion.Item value="flexibility">
          <Accordion.Control
            style={{
              fontFamily: "Poppins",
              backgroundColor: "#5f3bf3",
              color: "#fff",
              borderRadius: "3px",
              width: "100%",
              margin: "0",
            }}
          >
            <Group style={{ fontWeight: "500" }}>
              <IconSelector size="1rem" />
              {SelectedModel}
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <ScrollArea h={150}>
              {modelsData.map((modelItem) => (
                <Group
                  align="center"
                  position="space-between"
                  key={modelItem.id}
                  onClick={() => handleSelected(modelItem.name)}
                  value={modelItem.name}
                  style={{
                    fontFamily: "Poppins",
                    margin: "0.5rem 0",
                    fontWeight: "500",
                  }}
                  className={`${styles.modelItem} ${SelectedModel === modelItem.name ? styles.modelSelectedItem : ""}`}
                >
                  {modelItem.name}
                  <IconBox size="1rem" />
                </Group>
              ))}
            </ScrollArea>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
  );
}

function Hero() {
  const [selected, setSelected] = useState([]);
  const [showArrow, setShowArrow] = useState(false);
  const [opened1, { open: openModal1, close: closeModal1 }] = useDisclosure(false);
  const [opened2, { open: openModal2, close: closeModal2 }] = useDisclosure(false);
  const col2Ref = useRef(null);
  const [value, setValue] = useState(28);
  const [randomSeed, setRandomSeed] = useState(true);

  localStorage.removeItem("countdown");
  localStorage.removeItem("JwtToken");

  const [endValue, setEndValue] = useState(28);
  const [GeneratedImg, setGeneratedImg] = useState("");
  const [positivePrompt, setPositivePrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [SelectedModel, setSelectedModel] = useState(modelsData[0].name);
  const [progressvalue, setProgressvalue] = useState(0);
  const [generating, setGenerating] = useState(false);

  const { model } = useParams();

  const [hitlimit, setHitLimit] = useState(false);
  const [isPayed, setisPayed] = useState(false);

  useEffect(() => {
    const defaultModel = modelsData[0].name.toLowerCase();

    if (modelsData.find((modelItem) => modelItem.name.toLowerCase() === model)) {
      setSelectedModel(model.toLowerCase());
    } else {
      window.location.href = `/${defaultModel}`;
    }
  }, [model, SelectedModel]);

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

  useEffect(() => {
    GetTotalGenerations()
      .then((res) => {
        console.log(res.body);
        // setTotalGenerations(res.body.setTotalGenerations);
        setHitLimit(res.body.hitlimit);
      })
      .catch((err) => {
        console.log(err);
      });

    IsPayed()
      .then((res) => {
        if (res.statusCode === 200) {
          if (res.body.ret === true) {
            setisPayed(true);
          } else {
            setisPayed(false);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });

    const storedImg = localStorage.getItem("GeneratedImg");
    if (storedImg) {
      setGeneratedImg(storedImg);
    }
  }, []);

  function handlePositivePromptChange(event) {
    setPositivePrompt(event.target.value);

    if (event.key === "Enter" && !generating) {
      event.preventDefault();
      if (generating) {
        notifications.show({
          id: "error-generating-image",
          withCloseButton: true,
          autoClose: 4000,
          title: "wait for image",
          message: "Please wait for the image to be generated",
          color: "yellow",
          icon: <IconMoodEmpty />,
          loading: false,
        });
      } else {
        if (positivePrompt === "") {
          notifications.show({
            id: "error-generating-image",
            withCloseButton: true,
            autoClose: 4000,
            title: "Positive Prompt required",
            message: "Please enter a positive prompt",
            color: "yellow",
            icon: <IconMoodEmpty />,
            loading: false,
          });
          return;
        }
        setGenerating(true);
        HandleGenerate(event);
      }
    }
  }

  function handleNegativePromptChange(event) {
    setNegativePrompt(event.target.value);

    if (event.key === "Enter") {
      event.preventDefault();
      if (generating) {
        notifications.show({
          id: "error-generating-image",
          withCloseButton: true,
          autoClose: 4000,
          title: "wait for image",
          message: "Please wait for the image to be generated",
          color: "yellow",
          icon: <IconMoodEmpty />,
          loading: false,
        });
      } else {
        if (positivePrompt === "") {
          notifications.show({
            id: "error-generating-image",
            withCloseButton: true,
            autoClose: 4000,
            title: "Positive Prompt required",
            message: "Please enter a positive prompt",
            color: "yellow",
            icon: <IconMoodEmpty />,
            loading: false,
          });
          return;
        }
        setGenerating(true);
        HandleGenerate(event);
      }
    }
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

  useEffect(() => {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollPosition < 70) {
      setShowArrow(true);
    }
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScroll = () => {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollPosition > 70) {
      setShowArrow(false);
    }
  };

  function handleCheckboxChange(event) {
    setRandomSeed(event.target.checked);
  }

  const HandleGenerate = () => {
    if (hitlimit) {
      notifications.show({
        id: "limit-reached",
        withCloseButton: true,
        autoClose: 3000,
        title: "Limit Reached",
        message: "Please pay to be able to generate more images",
        color: "orange",
      });
      setTimeout(() => {
        window.location.href = "/payment";
      }, 800);
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
        width: ModelConfig.width,
        height: ModelConfig.height,
        num_inference_steps: endValue.toString(),
        guidance_scale: ModelConfig.guidance_scale,
        num_images_per_prompt: ModelConfig.num_images_per_prompt,
        bucket_name: ModelConfig.bucket_name,
        model_name: SelectedModel.toLowerCase(),
        scheduler: ModelConfig.scheduler,
        seed: randomSeed ? "" : ModelConfig.seed,
      },
      endpointId: ModelConfig.endpointId,
    };

    setProgressvalue(0);

    setGenerating(true);

    PostFreeInference(Payload)
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
          const button = document.getElementById("ButtonShape");
          button.style.display = "none";
          return;
        }
        setGenerating(false);
        setGeneratedImg(res.body.Image);
        setProgressvalue(100);

        localStorage.setItem("GeneratedImg", res.body.Image);
      })
      .catch((err) => {
        if (err.status === 401) {
          notifications.show({
            id: "error-generating-image",
            withCloseButton: true,
            autoClose: 2000,
            title: "Limit Reached",
            message: "Please pay to be able to generate more images",
            color: "orange",
            loading: false,
          });
          setGenerating(false);
          setTimeout(() => {
            window.location.href = "/payment";
          }, 800);
        } else if (err.status === 403) {
          notifications.show({
            id: "error-generating-image",
            withCloseButton: true,
            autoClose: 2000,
            title: "Daily limit Reached",
            message: "Please pay to be able to generate more images",
            color: "orange",
            loading: false,
          });
          setGenerating(false);
          setTimeout(() => {
            window.location.href = "/payment";
          }, 800);
        } else {
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
        }
        setGenerating(false);
      });
  };

  return (
    <Stack className={styles.bigContainer}>
      <Grid className={styles.col1}>
        <Stack className={styles.stack}>
          <h2>AI Image Generation to enhance your creative potential</h2>
          <Spacer y={0.3} />
          <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.</p>
        </Stack>
      </Grid>
      <Spacer y={4} />
      <Grid className={styles.col2} id="content" ref={col2Ref}>
        <Stack spacing="xl">
          <AspectRatio ratio={512 / 512} mx="auto" w="100%" h="100%">
            <LoadingOverlay
              visible={generating}
              overlayColor="#0C061A"
              overlayBlur={10}
              radius="sm"
              loader={<Progress size="sm" color="violet" radius="xs" w={300} value={progressvalue} animate />}
            />

            {hitlimit && (
              <>
                <Overlay
                  color="#0C061A"
                  opacity={0.8}
                  style={{
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Link to="/payment">
                    <Button rightIcon={<IconCreditCard size="1rem" />} className={styles.button}>
                      Pay {isPayed ? Config.subsequentTimes.Price : Config.firstTime.Price}$ to access Button
                    </Button>
                  </Link>
                </Overlay>
                <img
                  src={GeneratedImg ? GeneratedImg : "/images/dog.png"}
                  alt="Generated Image"
                  style={{
                    objectFit: "cover",
                    borderRadius: "5px",
                  }}
                />
              </>
            )}

            {GeneratedImg && !hitlimit ? (
              <img
                src={GeneratedImg}
                alt="Generated Image"
                style={{
                  objectFit: "cover",
                  borderRadius: "5px",
                }}
              />
            ) : (
              !hitlimit && (
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
              )
            )}
          </AspectRatio>

          <div className={styles.form}>
            <Stack>
              <Group spacing="md" align="center" position="center">
                <Input
                  icon={<IconMoodCheck size="1rem" style={{ color: "#7b7586" }} />}
                  className={styles.input}
                  placeholder="Positive Prompt"
                  name="positive-prompt"
                  value={positivePrompt}
                  onChange={handlePositivePromptChange}
                  onKeyDown={handlePositivePromptChange}
                  size="sm"
                  radius="md"
                  styles={(theme) => ({
                    input: {
                      fontFamily: "Poppins",
                      padding: "1.3rem 0",
                      "&:focus-within": {
                        borderColor: theme.colors.violet[7],
                      },
                      backgroundColor: "rgba(255, 255, 255, 0.87)",
                      color: "#4317a1",
                      "::placeholder": {
                        color: "#746b86c7",
                        fontSize: "13px",
                      },
                    },
                  })}
                />
                <Modal className={styles.modal} opened={opened1} onClose={closeModal1} withCloseButton={false} centered>
                  <Grid className={styles.modal}>
                    <MultiSelect selected={selected} setSelected={setSelected} />
                  </Grid>
                </Modal>

                <ActionIcon onClick={openModal1} className={styles.addOn}>
                  <IconTag size="1.125rem" />
                </ActionIcon>
              </Group>

              <Group spacing="md" align="center" position="center">
                <Input
                  icon={<IconMoodSad size="1rem" style={{ color: "#7b7586" }} />}
                  className={styles.input}
                  name="negative-prompt"
                  placeholder="Negative Prompt"
                  value={negativePrompt}
                  onChange={handleNegativePromptChange}
                  onKeyDown={handleNegativePromptChange}
                  size="sm"
                  radius="md"
                  styles={(theme) => ({
                    input: {
                      fontFamily: "Poppins",
                      padding: "1.3rem 0",
                      "&:focus-within": {
                        borderColor: theme.colors.violet[7],
                      },
                      backgroundColor: "rgba(255, 255, 255, 0.87)",
                      color: "#4317a1",
                      "::placeholder": {
                        color: "#746b86c7",
                        fontSize: "13px",
                      },
                    },
                  })}
                />
                <Modal className={styles.modal} opened={opened2} onClose={closeModal2} withCloseButton={false} centered>
                  <Grid className={styles.modal}>
                    <Menu closeOnItemClick={0} shadow="md" width={400} className={styles.menu} position="bottom-start">
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
                      <Menu.Item className={styles.menuItem}>
                        <ModelMenu SelectedModel={SelectedModel} setSelectedModel={setSelectedModel} />
                      </Menu.Item>
                      <Menu.Item className={styles.menuItem}>
                        <Button
                          variant="filled"
                          className={styles.button}
                          fullWidth
                          onClick={
                            GeneratedImg
                              ? handleDownloadClick
                              : (event) => {
                                  event.preventDefault();
                                }
                          }
                        >
                          <IconDownload size="1.2rem" />
                        </Button>
                      </Menu.Item>
                    </Menu>
                  </Grid>
                </Modal>

                <ActionIcon onClick={openModal2} className={styles.addOn}>
                  <IconSettings size="1.125rem" />
                </ActionIcon>
              </Group>
            </Stack>
          </div>
        </Stack>
      </Grid>
      {showArrow && (
        <div className={styles.arrowContainer}>
          <IconArrowDown className={styles.arrow} size="5rem" />
        </div>
      )}
    </Stack>
  );
}

MultiSelect.propTypes = {
  selected: PropTypes.instanceOf(Set).isRequired,
  setSelected: PropTypes.func.isRequired,
};

ModelMenu.propTypes = {
  SelectedModel: PropTypes.string,
  setSelectedModel: PropTypes.func,
};

export default Hero;
