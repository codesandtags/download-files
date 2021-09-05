// const wget = require('wget-improved');
const wget = require("node-wget-js");
const player = require("play-sound")();
const puppeteer = require("puppeteer");

require("dotenv").config();
const verboseMode = false;

const callBackDownloadFile = (error, response, body) => {
  if (error) {
    console.log("--- error:");
    console.log(error); // error encountered
  } else {
    if (verboseMode) {
      console.log("--- headers:");
      console.log(response.headers); // response headers
      console.log("--- body:");
      console.log(body); // content of package
    }
    console.log(`📂 Downloaded [${response.filepath}]`);
  }
};

const downloadFile = (file, output) => {
  wget(
    {
      url: file,
      dest: output, // destination path or path with filenname, default is ./
      timeout: 2000, // duration to wait for request fulfillment in milliseconds, default is 2 seconds
    },
    callBackDownloadFile
  );
};

const downloadFiles = (files = [], output = "./tmp/") => {
  if (files && files.length > 0) {
    files.forEach((file) => downloadFile(file, output));
    playSound('done');
  }
};

// https://thisdavej.com/node-js-playing-sounds-to-provide-notifications/
const playSound = (sound) => {
  player.play(`./media/${sound}.wav`, (err) => {
    if (err) console.log(`Could not play sound: ${err}`);
  });
};


const browseAndFindElements = async (url) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0'});
  const sitename = new URL(url).hostname;
  
  console.log(`\n👨‍💻 Reviewing : ${url}`);
  console.log("🕵️‍♂️  Searching images...");
  console.log(`📸 Taking screenshot to ${sitename}`);

  const elements = await page.evaluate(() => {
    // Scroll down to bottom of page to activate lazy loading images
    document.body.scrollIntoView(false);
    return [...document.querySelectorAll("img")]
      .map((e) => e.src);
      //.filter((e) => (/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i).test(e));
  });

  await page.screenshot({ path: `tmp/${sitename}.png`, fullPage: true });

  console.log("\nTotal elements found to download: ", elements.length);

  if (elements && elements.length > 0) {
    downloadFiles(elements);
  } else {
    playSound('fail');
  }

  await browser.close();
};

(async () => {
  if (process.env.URLS) {
      console.log(process.env.URLS);
    const urls = (process.env.URLS.includes(",")) ? process.env.URLS.split(",") : [process.env.URLS];
    
    for (let url of urls) {
        browseAndFindElements(url);
    }
  }
})();


