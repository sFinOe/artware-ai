import { PostSign } from "@api";
import { useEffect } from "react";
import { Center } from "@mantine/core";
import { Loading } from "@nextui-org/react";
import { Stack } from "@mantine/core";
import { Grid } from "@nextui-org/react";
import modelsData from "@config/Models/Models.json";
import { IsPayed } from "@api/payment";
import Config from "@config/Payment/Price";

function Verify_payment() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntent = urlParams.get("payment_intent");
    const paymentIntentClientSecret = urlParams.get("payment_intent_client_secret");
    const redirect_status = urlParams.get("redirect_status");

    IsPayed().then((res) => {
      let expireTime;

      if (res.statusCode === 200) {
        if (res.body.ret === true) {
          expireTime = Config.subsequentTimes.timeInterval;
        } else {
          expireTime = Config.firstTime.timeInterval;
        }

        if (redirect_status === "succeeded") {
          const data = {
            payment_intent: paymentIntent,
            payment_intent_client_secret: paymentIntentClientSecret,
            redirect_status: redirect_status,
            expire_time: expireTime,
          };

          PostSign(data)
            .then((res) => {
              if (res.statusCode === 200) {
                localStorage.setItem("JwtToken", res.body.Token);
                localStorage.removeItem("countdown");
                window.location.href = `/playground/${modelsData[0].name.toLowerCase()}`;
              } else {
                window.location.href = "/";
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }
    });
  }, []);

  return (
    <Center style={{ height: "70vh" }}>
      <Stack>
        <Grid>
          <Loading type="default" color="secondary" size="lg">
            <div style={{ color: "white", fontSize: "1em", marginTop: "1.5rem" }}>Verifying Payment...</div>
          </Loading>
        </Grid>
      </Stack>
    </Center>
  );
}

export default Verify_payment;
