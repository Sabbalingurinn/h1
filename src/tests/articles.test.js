import request from "supertest";
import { app } from "../src/index"; 

describe("GET /articles", () => {
  it("should return a list of articles", async () => {
    const res = await request(app).get("/articles");

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});