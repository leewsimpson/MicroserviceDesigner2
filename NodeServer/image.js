const puppeteer = require('puppeteer');
const fs = require('fs');
const http = require('http');
const request = require('request-promise-native');
const URL = require('url').URL;

http.createServer(async function (req, res) 
{
    res.writeHead(200, {'Content-Type': 'image/png'});    

    let u = new URL('http://' + req.headers.host + req.url);
    let project = u.searchParams.get('project');
    const i = await generateImage(project);
    res.end(i, 'binary');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');


async function generateImage(project)
{
    const jsonString = await load(project);
    const browser = await puppeteer.launch(); //{devtools: true}
    const page = await browser.newPage();

    await page.addScriptTag({url: 'https://cdnjs.cloudflare.com/ajax/libs/gojs/1.8.7/go.js'});
    await page.addScriptTag({url: "http://vizzy-green.azurewebsites.net/ts.js"});
    await page.addScriptTag({path: "./createDiagram.js"});
    await page.setContent('<div id="myDiagramDiv" style="border: solid 1px black; width:400px; height:400px"></div>');

    const imageData = await page.evaluate((jsonString) => {
        var myDiagram = createDiagram();

        myDiagram.model = go.Model.fromJson(jsonString);

        return myDiagram.makeImageData(
        {
            scale:5,
            maxSize: new go.Size(Infinity, Infinity)
        });
    },jsonString);

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