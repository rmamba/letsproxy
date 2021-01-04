# Prerequsites

## Server

Have a ubuntu server ready with static IP. In my case I use t2.micro EC2 instance that
is also running MySQL test server.

## Router

Make sure ports `80` and `443` are allowed to go to the server. 
For this you need to change inbound policy rulles. On the rancher nodes enable inbound
rulles to allow ports 30000-40000 from your servers internal IP address.
With out this the setup will not work as it will not reach correct URL addresses!!!
Also do NOT expose the ports to public internet for security reasons!!!

## Letsproxy install

First let's install nvm
```
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```
Logout of your SSH session and login again for `nvm` command to be available.

Install node v8.13.0
```
nvm install 8.13.0
```
With `nvm list` we can check if it was installed and is set as default node version. Should see simmilar to this:
```
$ nvm list
nvm list
->      v8.13.0
default -> 8.13.0 (-> v8.13.0)
node -> stable (-> v8.13.0) (default)
stable -> 8.13 (-> v8.13.0) (default)
iojs -> N/A (default)
unstable -> N/A (default)
lts/* -> lts/dubnium (-> N/A)
lts/argon -> v4.9.1 (-> N/A)
lts/boron -> v6.17.1 (-> N/A)
lts/carbon -> v8.16.0 (-> N/A)
lts/dubnium -> v10.16.0 (-> N/A)
```

Now we are ready to clone the repository:
```
git clone git@bitbucket.org:mambix/letsproxy.git
```

Move to letsproxy folder and install node modules:
```
npm i
```

Install pm2 package as global module that we will use to run the site as daemon:
```
npm i pm2 -g
```

Let's load the pm2 configuration now with:
```
pm2 start ecosystem.config.js
```

We can now check the status and start/stop/restart it by `letsProxy` name.
```
# Check status; note that at this point it will say errored, which is ok, we did not finish configuring it yet.
pm2 list
# restart/start/stop
pm2 reload letsProxy
pm2 start letsProxy
pm2 stop letsProxy
```

### Nginx & AcmeTool Installation

Install apt package
```
sudo apt install nginx acmetool
sudo openssl dhparam -dsaparam -out /etc/nginx/dhparam.pem 2048
```

Run acmetool configuration and input data. Note that you need to choose `WEBROOT` as the verification type for this to work.
And enter this path when asked `/var/www/.well-known/acme-challenge`.
```
sudo acmetool quickstart
```

Now we can install our initial certificate and domain. In your domains DNS records add two A records pointing to your servers IP address.
Two records need to be for `letsproxy` and `*.letsproxy` sub domains. So `https://letsproxy.yourdomain.com` will be where we will access controll panel.
Once you make DNS changes it will take some time (up to 48h) for the changes to propagate around the world.

Until that happens you can expose port 3000 on your server and access control panel as `http://Server_IP:3000`.

### Configuration

First lets create configuration file

```
cp config/config.sample.js config/config.js
```
Change the domain in this configuration file to point to your domain.


Start the control panel
```
pm2 start letsProxy
```
And this time when visiting `http://Server_IP:3000` you will be presented with the website.
Login with user `admin` and password `letsproxy`. You are advised to change this ASAP!!!
Save md5 string of your password in `passwd.js` file and use that to login.

We also need to delete nginx `sites-enabled` folder and replace it with the one from our control panel.
```
sudo rm -r /etc/nginx/sites-enabled
sudo ln -s /home/ubuntu/GIT/letsproxy/nginx/sites-enabled /etc/nginx/sites-enabled
sudo systemctl restart nginx
```

## Control panel

Once logged in let us setup the certificate for our `letsproxy` subdomain. Under `Servers` section
add `letsproxy` upstream name with `127.0.0.1` IP address and port `3000`.  
Under `Domains` add new domain. Leave template at `None`. Enter `letsproxy.yourdomain.com` for the domain name.
There is no need for adding any aliases, but here is where you would add `www.mydomain.com` for example when setting up proxy for `mydomain.com`.
Finally choose `letsproxy` as your upstream and save.

In the list of domain on the right side you will see two icons. Click the left one to enable this domain.
After that the nginx configuration will be generated and put into `/etc/nginx/sites-enabled` folder.
If you click on status icon you can view the nginx config file.  
Lets now try our domain in browser.

