import request from "superagent";

export const SaveIp = () => {
  return request
    .post("/api/v1/ip-handling/save-ip")
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const SetPayed = () => {
  const jwtToken = localStorage.getItem("JwtToken");
  return request
    .post("/api/v1/ip-handling/set-payed")
    .set("Authorization", `Bearer ${jwtToken}`)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const IsPayed = () => {
  return request
    .post("/api/v1/ip-handling/is-payed")
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};
