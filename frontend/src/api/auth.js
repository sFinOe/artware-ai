import request from "superagent";

export const PostSign = (data) => {
  return request
    .post("/api/v1/auth/sign")
    .send(data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const PostSignPaypal = (data) => {
  return request
    .post("/api/v1/auth/sign_paypal")
    .send(data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const GetMe = () => {
  let jwtToken = localStorage.getItem("JwtToken");
  return request
    .get("/api/v1/auth/me")
    .set("Authorization", `Bearer ${jwtToken}`)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const GetTotalGenerations = (data) => {
  return request
    .get("/api/v1/ip-handling/get-totalGenerations")
    .send(data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};
