import { useEffect, useState } from "react";
import styles from "./Navbar.module.css";
import twitter from "/images/twitter.svg";
import facebook from "/images/facebook.svg";
import { Link } from "react-router-dom";
import { BsClock } from "react-icons/bs";
import PropTypes from "prop-types";
import { Space, Group, Image } from "@mantine/core";
import { Spacer } from "@nextui-org/react";
import Countdown, { zeroPad } from "react-countdown";
import jwt_decode from "jwt-decode";
import Config from "@config/Appname/Appname";
import { IsPayed } from "@api/payment";
import ConfigPrice from "@config/Payment/Price";

function Timer({ time }) {
  const token = localStorage.getItem("JwtToken");

  const parseTime = (timeString) => {
    const numericValue = parseInt(timeString);
    if (timeString.includes("h")) {
      return numericValue * 60 * 60 * 1000;
    } else if (timeString.includes("m")) {
      return numericValue * 60 * 1000;
    } else {
      return numericValue * 1000;
    }
  };

  const [targetDate, setTargetDate] = useState(token ? Date.now() + parseTime(time) : Date.now() + 0);

  useEffect(() => {
    const storedTargetDate = localStorage.getItem("countdown");
    if (storedTargetDate) {
      setTargetDate(parseInt(storedTargetDate));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("countdown", targetDate);
  }, [targetDate]);

  const renderer = ({ hours, minutes, seconds }) => {
    if (token) {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        localStorage.removeItem("JwtToken");
        localStorage.removeItem("countdown");
        window.location.reload();
      }
    }

    return (
      <>
        {hours > 0 ? (
          <span>
            {zeroPad(hours)}h:{zeroPad(minutes)}m
          </span>
        ) : (
          <span>
            {zeroPad(minutes)}m:{zeroPad(seconds)}s
          </span>
        )}
      </>
    );
  };

  return (
    <>
      <Countdown date={targetDate} renderer={renderer} />
    </>
  );
}
export default function Navbar() {
  const isMobile = window.innerWidth <= 768;

  const token = localStorage.getItem("JwtToken");

  const [duration, setDuration] = useState("30m");
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    async function fetchData() {
      await IsPayed().then((res) => {
        if (res.statusCode === 200) {
          if (res.body.ret === true) {
            setDuration(ConfigPrice.subsequentTimes.timeInterval);
          } else {
            setDuration(ConfigPrice.firstTime.timeInterval);
          }
        }
        setIsFetching(false);
      });
    }
    fetchData();
  }, []);

  return (
    <div className={styles.navbarContainer}>
      <Space h="sm" />
      <Group className={styles.navbar}>
        <Link to="/">
          <Image src="/images/LOGO.png" width={200} />
        </Link>
        {(token && (
          <Group className={styles.rightContent}>
            <Group className={styles.social}>
              <a href={Config.Twitter} target="_blank" rel="noopener noreferrer">
                <img src={twitter} alt="twitter account" />
              </a>
              <a href={Config.Facebook} target="_blank" rel="noopener noreferrer">
                <img src={facebook} alt="facebook account" />
              </a>
            </Group>
            <Group className={styles.additionalContent}>
              <BsClock />
              <div>{!isFetching && <Timer time={duration} />}</div>
            </Group>
          </Group>
        )) || (
          <Group className={styles.social}>
            <a href={Config.Twitter} target="_blank" rel="noopener noreferrer">
              <img src={twitter} alt="twitter account" width="35px" />
            </a>
            <a href={Config.Facebook} target="_blank" rel="noopener noreferrer">
              <img src={facebook} alt="facebook account" width="35px" />
            </a>
          </Group>
        )}
      </Group>
      {isMobile ? <Spacer y={0} /> : <Spacer y={2.5} />}
    </div>
  );
}

Navbar.propTypes = {
  countdown: PropTypes.number,
};

Timer.propTypes = {
  time: PropTypes.string,
};
