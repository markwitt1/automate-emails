const express = require("express");
const app = express();
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const LINK_TEXT = "REGIST";
function parse(html) {
  const $ = cheerio.load(html, {
    withDomLvl1: true,
    normalizeWhitespace: true,
    decodeEntities: true,
  });
  /* creates a traversable Document tree from your html string
    Now, let us iterate over every anchor tag and see
    if it is the link we are looking for */
  $("a").each((i, link) => {
    const href = link.attribs["href"];
    if (link.childNodes[0].data) {
      if (link.childNodes[0].data.includes(LINK_TEXT)) clickLink(href); //will be implemented in the next step
    }
  });
}
app.use(express.urlencoded());
/* this middleware enables us to access the http body 
(containing our emails) coming from Mandrill */
app.get("/", (req, res) => res.sendStatus(200));
/*adding a get route shows to Mandrill that the url "exists" 
by sending an "OK" status code. */

app.post("/", (req, res) => {
  console.log(req.body);
  const mandrillEvents = JSON.parse(unescape(req.body.mandrill_events));

  mandrillEvents.forEach((mandrillEvent) => {
    const html = mandrillEvent.msg.html;
    parse(html); //implemented in next step
  });
  res.sendStatus(200);
});
app.listen(process.env.PORT || 3000);
/*for local development, our server will run on port 3000
When deployed, the PORT environment will be created by 
Heroku */

const devOptions = {
  headless: false,
};
const prodOptions = {
  args: ["--no-sandbox"],
  //"headless" defaults to tru
};

async function clickLink(href) {
  const browser = await puppeteer.launch(
    process.env.NODE_ENV === "production" ? prodOptions : devOptions
  );
  /* setting "headless" to false enables us 
  to actually see what is going on behind the scenes*/
  const page = await browser.newPage();
  await page.goto(href);
  console.log("Puppeteer is at " + href);
}
