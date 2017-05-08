# Cocoweb
Simple *proof of concept* interface in AngularJS for [Coco network](https://github.com/archibald-picq/Coconode).

# Installation
**once as root :**
`sudo npm install -g grunt-cli`
`sudo apt-get install ruby && sudo gem install scss_lint`
**when developing :**
`grunt dev --api=ws://your-ws-server:8080`
open your browser on http://localhost:8081
**for production :**
`grunt prod -- api=ws://your-ws-server:8080`
then publish `build/`

# Hosting
You can host your web interface on any http compliant server (apache/nginx/express/iis ...). [Cocoproxy](https://github.com/archibald-picq/Cocoproxy) can also host this web interface through the `--gui` param.

# Running
Open your browser on that url !
