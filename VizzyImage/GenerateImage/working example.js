const puppeteer = require('puppeteer');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    // if (req.query.name || (req.body && req.body.name)) {
    //     context.res = {
    //         // status: 200, /* Defaults to 200 */
    //         body: "Hello " + (req.query.name || req.body.name)
    //     };
    // }
    // else {
    //     context.res = {
    //         status: 400,
    //         body: "Please pass a name on the query string or in the request body"
    //     };
    // }

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    const page = await browser.newPage();
    await page.goto('https://www.eliostruyf.com');
    const pageTitle = await page.title();
    await browser.close();

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: `Page title: ${pageTitle}`
    };
};