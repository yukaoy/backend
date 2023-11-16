/*
 * Test suite for articles
 */
require("es6-promise").polyfill();
require("isomorphic-fetch");

const url = (path) => `http://localhost:3000${path}`;
let cookie;
let articles;

describe("Validate Article functionality", () => {
  beforeEach(async () => {
    // QUESTION, should I register?
    // login with test user
    let testUser = {"username": "RDesRoches", "password": "123"};
        
    await fetch(url('/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(testUser),
    }).then(res => {
        cookie = res.headers.get("Set-Cookie");
        return res.json();
    }).catch(err => {
        console.log("Could not login", err);
    });

    // add an article
    const newArticle = { id: 3, author: "RDesRoches", body: "A new post", timestamp: new Date() };

    await fetch(url("/article"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newArticle),
    });

    // get test user's articles
    const response = await fetch(url("/articles"), {
      method: "GET",
      headers: { "Content-Type": "application/json", Cookie: cookie },
    });
    articles = await response.json();
  });

  afterEach(async () => {
    // QUESTION: do I need to delete the article created in beforeEach
    await fetch(url('/articles/3'), {
      method: "DELETE", //wait can you do this
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
    });
  });

  it("should give me articles of logged in user", async () => {
    expect(articles.length).toBe(1);
    expect(articles[0].id).toBe(3); //QUESTION articles.id or articles[0].id?
    expect(articles[0].author).toBe("RDesRoches");
    expect(articles[0].body).toBe("A new post");
  });

  it("should add a new article and return the updated list of articles", async () => {
    const anotherArticle = { author: "RDesRoches", body: "Another new post" };

    const addResponse = await fetch(url("/article"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(anotherArticle),
    });

    const updatedArticles = await addResponse.json();
    expect(updatedArticles.length).toBe(articles.length + 1);
    const addedArticle = updatedArticles.find(
      (article) =>
        article.author === anotherArticle.author && article.body === anotherArticle.body
    );
    expect(addedArticle).toBeTruthy();
    expect(addedArticle.author).toBe("RDesRoches");
    expect(addedArticle.body).toBe("Another new post");
  });

  it("should return an article with a specified id", async () => {
    // call GET /articles/id with the chosen id
    // validate that the correct article is returned
    // test article expected id, author, post
    const response = await fetch(url("/articles/3"), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const article = await response.json();
    expect(article.id).toBe(3);
    expect(article.author).toBe("RDesRoches");
    expect(article.body).toBe("A new post");
  });

  it("should update an article with a specified id", async () => {
    const updatedArticleData = {
      author: "RDesRoches",
      body: "An updated post",
    };

    const response = await fetch(url("/articles/0"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedArticleData),
    });

    const updatedArticle = await response.json();
    expect(updatedArticle.author).toBe(updatedArticleData.author);
    expect(updatedArticle.body).toBe(updatedArticleData.body);
  });
});
