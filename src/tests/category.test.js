import request from "supertest";
import { app } from "../src/index";

let token;


beforeAll(async () => {
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ username: "olafur", password: "osk" }); // Olafur is admin

  token = loginRes.body.token;
});

describe("POST /categories", () => {
  it("should allow admin to create a category", async () => {
    const res = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Technology", description: "Tech related articles" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Technology");
  });

  it("should return 403 if user is not an admin", async () => {
    const userLogin = await request(app)
      .post("/auth/login")
      .send({ username: "jon", password: "password123" });

    const userToken = userLogin.body.token;

    const res = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Gaming", description: "All about gaming" });

    expect(res.status).toBe(403);
  });
});
