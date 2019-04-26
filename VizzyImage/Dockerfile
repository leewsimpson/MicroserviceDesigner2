FROM mcr.microsoft.com/azure-functions/node:2.0


RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

RUN npm install
RUN npm i puppeteer 

# ENV FUNCTION_URL https://<functionname>.azurewebsites.net/api/<endpoint>

ENV AzureWebJobsScriptRoot=/home/site/wwwroot
COPY . /home/site/wwwroot

# ENTRYPOINT ["node", "/home/site/wwwroot/GenerateImage/index.js"]