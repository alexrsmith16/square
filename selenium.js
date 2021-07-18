const {Builder, By, Key, until} = require('selenium-webdriver');

(async function example() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://admin.chownow.com/admin/report/disbursements')
    await sleep(100)
    await driver.findElement(By.id("email")).sendKeys("andy@mortyscafe.com")
    await driver.findElement(By.id("password")).sendKeys("")
    await driver.findElement(By.css("#loginForm > div.line.clearfix > input")).click()
    await sleep(5000)






    // await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
    // await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
  } finally {
    await driver.quit();
  }
})();


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}





// const chrome = require('selenium-webdriver/chrome');
// const firefox = require('selenium-webdriver/firefox');
// const {Builder, By, Key, until} = require('selenium-webdriver');

// const screen = {
//   width: 640,
//   height: 480
// };

// let driver = new Builder()
//     .forBrowser('chrome')
//     .setChromeOptions(new chrome.Options().headless().windowSize(screen))
//     .setFirefoxOptions(new firefox.Options().headless().windowSize(screen))
//     .build();