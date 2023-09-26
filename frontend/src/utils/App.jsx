import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "@pages/Landing/Landing";
import PrivacyPolicy from "@pages/PrivacyPolicy/PrivacyPolicy";
import Contact from "@pages/Contact/Contact";
import Payment from "@pages/Payment/Payment";
import Playground from "@pages/Playground/Playground";
import MobilePlayground from "@components/Mobile/Playground/Playground";
import Verify_payment from "@components/Verify_payment/verify-payment";
import { PrivateRoute } from "@routing/PrivateRoute";
import Navbar from "@components/Navbar/Navbar";
import Footer from "@components/Footer/Footer";
import Error from "@pages/404/Error";
import { GetMe } from "@api";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Group } from "@mantine/core";
import { Spacer } from "@nextui-org/react";
import ScrollToTop from "@components/ScrollToTop/ScrollToTop";
import { SaveIp } from "@api/payment";

function CheckToken() {
  const navigate = useNavigate();

  useEffect(() => {
    SaveIp()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });

    const checkTokenValidity = async () => {
      const token = localStorage.getItem("JwtToken");
      if (!token) {
        return;
      }
      console.log("token", token);

      try {
        const response = await GetMe();
        if (response.statusCode !== 200) {
          localStorage.removeItem("JwtToken");
          localStorage.removeItem("countdown");
          navigate("/");
        }
      } catch (error) {
        localStorage.removeItem("JwtToken");
        localStorage.removeItem("countdown");
        navigate("/");
      }
    };

    checkTokenValidity();
  }, [navigate]);

  return null;
}

function AgePoppup() {
  const [opened, setOpened] = useState(true);
  const isMobile = window.innerWidth <= 1100;

  const age = localStorage.getItem("Age");
  if (age === "true") {
    return null;
  }

  return (
    <>
      <Modal size={isMobile ? "94%" : "30%"} opened={opened} onClose={!opened} centered withCloseButton={false}>
        <div>
          <div>
            <div style={{ padding: "0 10px" }}>
              <h1
                style={{
                  textAlign: "left",
                  fontSize: "1.4rem",
                  fontWeight: "500",
                }}
              >
                age confirmation
              </h1>
            </div>
          </div>
          <Spacer y={1} />
          <div style={{ backgroundColor: "#f2f2f2", borderRadius: "5px" }}>
            <div style={{ padding: "20px 10px" }}>
              <p
                style={{
                  textAlign: "left",
                  fontSize: "0.9rem",
                  fontWeight: "400",
                }}
              >
                By using the site, you acknowlege you are at least 18 years old.
              </p>
              <Spacer y={1} />
              <Group position="left">
                <Button
                  radius="xl"
                  size="md"
                  style={{ backgroundColor: "#5F3BF3", color: "#ffffff" }}
                  onClick={() => {
                    localStorage.setItem("Age", "true");
                    setOpened(false);
                  }}
                >
                  Continue
                </Button>
                <Button
                  radius="xl"
                  size="md"
                  style={{ backgroundColor: "#5F3BF3", color: "#ffffff" }}
                  onClick={() => {
                    window.location.href = "https://www.google.com/";
                  }}
                >
                  Exit
                </Button>
              </Group>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function App() {
  const isMobile = window.innerWidth <= 1100;

  return (
    <PayPalScriptProvider
      options={{
        "client-id": "AcN5X7GEIbZGePJ0u-8vTHvVMGUI_UAMmOLSKMDsP5KnAu8e80C4K4EGWzAKeoaoU8xncLsVsd3Qtn7X",
      }}
    >
      <Router>
        <ScrollToTop />
        <CheckToken />
        <AgePoppup />
        <Notifications style={{ fontFamily: "Poppins" }} />
        <Navbar />
        <Routes>
          <Route exact path="/" element={<Navigate to="/{model}" />} />
          <Route exact path="/:model" element={<Landing />} />
          <Route exact path="/payment" element={<Payment />} />
          <Route exact path="/verify-payment" element={<Verify_payment />} />
          <Route exact element={<PrivateRoute />}>
            <Route exact path="/playground" element={<Navigate to="/playground/{model}" />} />
            <Route exact path="/playground/:model" element={isMobile ? <MobilePlayground /> : <Playground />} />
          </Route>

          <Route exact path="/contact" element={<Contact />} />
          <Route exact path="/privacyPolicy" element={<PrivacyPolicy />} />
          <Route path="*" element={<Error />} />
        </Routes>
        <Footer />
      </Router>
    </PayPalScriptProvider>
  );
}
