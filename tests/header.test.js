const Page = require("./helper/page");

let page;

beforeEach(async () => {
	page = await Page.build();
	await page.goto("http://localhost:3000/");
});

afterEach(async () => {
	await page.close();
});

test("Header has correct text", async () => {
	const text = await page.getContentsOf("a.brand-logo");
	expect(text).toEqual("Blogster");
});

test("Login button redirect to OAuth flow", async () => {
	await page.click(".right a");
	const url = await page.url();
	expect(url).toMatch(/accounts\.google\.com/);
});

test("Logout button when signed in", async () => {
	await page.login();
	const text = await page.getContentsOf("a[href='/auth/logout']");
	expect(text).toEqual("Logout");
});
