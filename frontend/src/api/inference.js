import request from "superagent";

export const PostInference = (data) => {
  let jwtToken = localStorage.getItem("JwtToken");
  return request
    .post("/api/v1/inference/generate")
    .set("Authorization", `Bearer ${jwtToken}`)
    .send(data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export const PostFreeInference = (data) => {
  return request
    .post("/api/v1/inference/free-generate")
    .send(data)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      throw err;
    });
};
