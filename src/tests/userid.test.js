import request from "supertest";
import { app } from "../src/index";

let token;

beforeAll(async () => {
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ username: "olafur", password: "osk" });

  token = loginRes.body.token;
});

describe("GET /users/:userId", () => {
  it("should return user details if authenticated", async () => {
    const res = await request(app)
      .get("/users/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("username");
  });

  it("should return 401 if no token is provided", async () => {
    const res = await request(app).get("/users/1");

    expect(res.status).toBe(401);
  });
});