console.log('begin program');

const puppeteer = require('puppeteer');
const fs = require('fs');
const request = require('request-promise-native');
const appInsights = require("applicationinsights");

appInsights.setup("ef63270b-0b56-4a65-8ce7-f534d40a646a");
appInsights.start();

//(async () => {await generateImage('test', '');})();

module.exports = async function (context, req) 
{
    const project = req.query.project;
    const view = req.query.view;
    if(!project)
    {
        console.log('Need to pass in the project name ?project=test');
    }
    else
    {
        console.log('generating image for ' + project + ' view ' + view);

        const i = await generateImage(project, view);    

        context.res = 
        {
            status: 200,
            headers: {'Content-Type': 'image/png'},
            isRaw:true,
            body:i
        }
    }
}


 async function generateImage(project, view)
 {
    //  try
    //  {
        const jsonString = await load(project);
        console.log(jsonString);
        //const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], devtools: true});
        const browser = await puppeteer.launch({devtools: true});
        console.log('browser launched');
        const page = await browser.newPage();
        console.log('new page');

        //await page.addScriptTag({url: 'https://cdnjs.cloudflare.com/ajax/libs/gojs/1.8.7/go-debug.js'});
        // await page.addScriptTag({path: "/home/site/wwwroot/GenerateImage/ts.js"});
        // await page.addScriptTag({ path: "/home/site/wwwroot/GenerateImage/createDiagram.js" });
        await page.addScriptTag({path: "./gojs/go.js"});
        await page.addScriptTag({path: "./GenerateImage/ts.js"});
        await page.addScriptTag({ path: "./GenerateImage/createDiagram.js" });        
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

            console.log('trying to render..');
            //debugger;
            return null;
            // return myDiagram.makeImageData(
            //  {
            //      scale:5,
            //      maxSize: new go.Size(Infinity, Infinity)
            //  });
        },jsonString, view);

        //const { buffer } = parseDataUrl(imageData);
        //fs.writeFileSync('gojs-screenshot.png', buffer, 'base64');
        //await browser.close();    
        return null;
        return buffer;
    // }
    // catch(ex)
    // {
    //     console.log('error');
    //     console.log(ex);
    // }

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