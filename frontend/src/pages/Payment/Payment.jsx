import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Grid, Stack, Radio, Group, Text, Space } from "@mantine/core";
import Layout from "@components/Layout/Layout";
import styles from "./Payment.module.css";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@components/Checkout/Checkout";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { PostSignPaypal } from "@api";
import Config from "@config/Payment/Price";
import modelsData from "@config/Models/Models.json";
import { IsPayed } from "@api/payment";

const stripePromise = loadStripe("pk_live_51NKtrGFYtDYXQuVZ6QS1or2TcqZ8QaLOGIWa5S6oGJqT5RauBQOVjbKwt8U6NXPNN3oZ2zEIBXyBLw0vHvHl3kJz00k2VJ3LWB");
// const stripePromise = loadStripe(
//   "pk_test_51N4nJYBgl9h325Yi79pQCbTuIVSbTG7Iq62h6llCavncTQ6b06yy9HuHiclumwps43OjABliXMgZqzGrHx4Kn4Nc00LFk0AaDn"
// );

function Payment() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("CC");
  const appearance = {
    theme: "stripe",
  };
  const options = {
    clientSecret,
    appearance,
  };
  const [isPayed, setisPayed] = useState(false);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const data = {
      amount: isPayed ? Config.subsequentTimes.Price : Config.firstTime.Price,
      currency: isPayed ? Config.subsequentTimes.Currency : Config.firstTime.Currency,
    };
    fetch("/api/v1/payments/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [isPayed]);

  const token = localStorage.getItem("JwtToken");
  if (token) {
    return <Navigate to={`/playground/${modelsData[0].name.toLowerCase()}`} />;
  }

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: isPayed ? Config.subsequentTimes.Price : Config.firstTime.Price,
          },
        },
      ],
    });
  };

  const onApprove = (data, actions) => {
    // Capture the funds from the transaction
    return actions.order.capture().then(function (details) {
      // Call your backend API to save the transaction details
      const data = {
        paymentId: details.id,
        payerId: details.payer.payer_id,
        expireTime: isPayed ? Config.subsequentTimes.timeInterval : Config.firstTime.timeInterval,
      };

      PostSignPaypal(data)
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
    });
  };

  return (
    <Layout>
      <Grid className={styles.row}>
        <Grid className={styles.col1}>
          <Stack>
            <h2>AI Image Generation to enhance your creative potential</h2>
            <Space h="sm" />
            <p>
              It is a long established fact that a reader will be distracted by the readable content of a page when
              looking at its layout.
            </p>
          </Stack>
        </Grid>
        <Grid className={`${styles.col2} ${styles.paymentContainer}`}>
          <Stack className={styles.paymentAll}>
            <h1 className={styles.paymentTitle}>Select Payment Method</h1>
            <Stack spacing="xl" className={styles.payment}>
              <Stack spacing="xs" className={styles.paymentHeader}>
                <h1>{isPayed ? <h1>{Config.subsequentTimes.Price}$</h1> : <>{Config.firstTime.Price}$</>}</h1>
                <p>View detailed order</p>
              </Stack>
              <Radio.Group defaultValue={selectedPaymentMethod} onChange={setSelectedPaymentMethod}>
                <Stack spacing="lg">
                  <Group className={styles.paymentOption}>
                    <Radio
                      id="bankRadio"
                      name="paymentMethod"
                      value="CC"
                      label="Credit/Debit Card"
                      checked={selectedPaymentMethod === "CC"}
                      styles={{
                        input: {
                          fontFamily: "Poppins",
                          cursor: "pointer",
                        },
                        label: {
                          fontFamily: "Poppins",
                          fontWeight: "600",
                          cursor: "pointer",
                        },
                      }}
                    />
                    <img src="/images/visa.png" alt="visa" />
                  </Group>
                  {selectedPaymentMethod === "CC" && (
                    <Stack>
                      <Text className={styles.desc}>Pay securely with your Bank Account using Visa or Mastercard</Text>
                      {clientSecret && (
                        <Elements options={options} stripe={stripePromise}>
                          <CheckoutForm />
                        </Elements>
                      )}
                    </Stack>
                  )}
                  <Group className={styles.paymentOption}>
                    <Radio
                      id="paypalOption"
                      name="paymentMethod"
                      value="Paypal"
                      label="Paypal"
                      checked={selectedPaymentMethod === "Paypal"}
                      styles={{
                        input: {
                          fontFamily: "Poppins",
                          cursor: "pointer",
                        },
                        label: {
                          fontFamily: "Poppins",
                          fontWeight: "600",
                          cursor: "pointer",
                        },
                      }}
                    />
                    <img src="/images/paypal.png" alt="paypal" className={styles.paypalImg} />
                  </Group>
                  {selectedPaymentMethod === "Paypal" && (
                    <Stack>
                      <Text className={styles.desc}>
                        You will be redirected to PayPal website to complete your order securely.
                      </Text>
                      <PayPalButtons
                        createOrder={createOrder}
                        onApprove={onApprove}
                        onError={(err) => console.log(err)}
                        style={{
                          layout: "horizontal",
                          color: "blue",
                          shape: "rect",
                          tagline: false,
                        }}
                      />
                    </Stack>
                  )}
                </Stack>
              </Radio.Group>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default Payment;
