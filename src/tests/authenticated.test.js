import request from "supertest";
import { app } from "../src/index";

let token;

beforeAll(async () => {
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ username: "olafur", password: "osk" });

  token = loginRes.body.token;
});

describe("POST /articles (Authenticated)", () => {
  it("should create an article with valid data", async () => {
    const res = await request(app)
      .post("/articles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        articlename: "Test Article",
        content: "This is a test article",
        categoryId: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.articlename).toBe("Test Article");
  });

  it("should return 401 when no token is provided", async () => {
    const res = await request(app).post("/articles").send({
      articlename: "Unauthorized",
      content: "This should not be allowed",
    });

    expect(res.status).toBe(401);
  });
});