const Page = require("./helper/page");

let page;

beforeEach(async () => {
	page = await Page.build();
	await page.goto("http://localhost:3000/");
});

afterEach(async () => {
	await page.close();
});

describe("When login", async () => {
	beforeEach(async () => {
		await page.login();
		await page.click("a.btn-floating");
	});

	test("Display blog creation form", async () => {
		const label = await page.getContentsOf("form label");
		expect(label).toEqual("Blog Title");
	});

	describe("Using invalid inputs", async () => {
		beforeEach(async () => {
			await page.click("form button");
		});

		test("Should show error message", async () => {
			const titleError = await page.getContentsOf(".title .red-text");
			const contentError = await page.getContentsOf(".content .red-text");

			expect(titleError).toEqual("You must provide a value");
			expect(contentError).toEqual("You must provide a value");
		});
	});

	describe("Using valid inputs", async () => {
		beforeEach(async () => {
			await page.type(".title input", "My Title");
			await page.type(".content input", "My Content");
			await page.click("form button");
		});

		test("Should render review screen", async () => {
			const text = await page.getContentsOf("h5");
			expect(text).toEqual("Please confirm your entries");
		});

		test("Should add to index page after saving", async () => {
			await page.click("button.green");
			await page.waitFor(".card");

			const title = await page.getContentsOf(".card-title");
			const content = await page.getContentsOf("p");

			expect(title).toEqual("My Title");
			expect(content).toEqual("My Content");
		});
	});
});

describe("When not login", async () => {
	const actions = [
		{ method: "get", path: "/api/blogs" },
		{ method: "post", path: "/api/blogs", data: { title: "T", content: "C" } }
	];

	test("Should prohibited blog related actions", async () => {
		const results = await page.execRequests(actions);
		results.forEach(result => {
			expect(result).toEqual({ error: "You must log in!" });
		});
	});
});
