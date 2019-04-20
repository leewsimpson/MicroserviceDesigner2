const puppeteer = require('puppeteer');
const fs = require('fs');
const http = require('http');
const request = require('request-promise-native');
const URL = require('url').URL;
var port = process.env.PORT || 1337;

const appInsights = require("applicationinsights");
appInsights.setup("ef63270b-0b56-4a65-8ce7-f534d40a646a");
appInsights.start();

http.createServer(async function (req, res) 
{
    res.writeHead(200, { 'Content-Type': 'image/png' });

    let u = new URL('http://' + req.headers.host + req.url);
    let project = u.searchParams.get('project');
    let view = u.searchParams.get('view');
    console.log(u);

    const i = await generateImage(project, view);
    res.end(i, 'binary');
}).listen(port);

console.log('Server running port ' + port);


async function generateImage(project, view)
{
    const jsonString = await load(project);
    const browser = await puppeteer.launch();//{devtools: true})
    const page = await browser.newPage();

    await page.addScriptTag({url: 'https://cdnjs.cloudflare.com/ajax/libs/gojs/1.8.7/go.js'});
    await page.addScriptTag({path: "./ts.js"});
    await page.addScriptTag({ path: "./createDiagram.js" });
    await page.setContent('<body style="width:100%;height:100%;padding:0;margin:0;overflow:hidden;"><div id="myDiagramDiv" style="background-color:white;position:absolute; width:100%;height:calc(100% - 56px);overflow:hidden;"></div></body>');
    

    const imageData = await page.evaluate((jsonString, view) => 
    {
        View.Views = JSON.parse(jsonString).views;

        if (!View.Views)
        {
            View.Views = [];
        }
        var myDiagram = createDiagram(view);
        Main._diagram = myDiagram;

        myDiagram.model = go.Model.fromJson(jsonString);
        if (view)
        {
            View.View(view);
        }

        return myDiagram.makeImageData(
        {
            scale:5,
            maxSize: new go.Size(Infinity, Infinity)
        });
    },jsonString, view);

    const { buffer } = parseDataUrl(imageData);
    fs.writeFileSync('gojs-screenshot.png', buffer, 'base64');
    await browser.close();    
    return buffer;
};

const parseDataUrl = (dataUrl) => 
{
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (matches.length !== 3) {
      throw new Error('Could not parse data URL.');
    }
    return { mime: matches[1], buffer: Buffer.from(matches[2], 'base64') };
};

async function load(project)
{
    let list = await request("https://vizzyapi.azurewebsites.net/api/data/" + project, { json: true });//, (err, res, list) => 
    let id = list[0];
    return request("https://vizzyapi.azurewebsites.net/api/data/" + project + "/" + id, { json: true });//, (err, res, json) => 
}