# Prerequsites

## Server

Have a ubuntu server ready with static IP. This can be physical or virtual machine.
In my case I use ESXi virtual machine with 8GB storage, 2GB of RAM and 2 CPUs. 
Would probably get away with less, nice thing about VM is you can change it if needed.

## Router

Forward ports `80` and `443` on your router to your servers IP address.
With out this the setup will not work as it will not reach correct URL addresses!!!

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
cd ~
mkdir GIT
cd GIT
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

### Nginx & friands Installation

Install apt package
```
sudo apt install nginx acmetool
sudo openssl dhparam -dsaparam -out /etc/nginx/dhparam.pem 2048
```

You need to be able to run these commands without asking you for password. So add this line to `/etc/sudoers`.
In my case `letsproxy` is the name of the user choosen at Ubuntu instalation.
```
#includedir /etc/sudoers.d
letsproxy       ALL=(ALL) NOPASSWD: ALL
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
In my case `/home/letsproxy` is default users home folder.
```
sudo rm -r /etc/nginx/sites-enabled
sudo ln -s -d /home/letsproxy/GIT/letsproxy/nginx/sites-enabled /etc/nginx/sites-enabled
sudo systemctl restart nginx
```

Create a test file so we can check `http://domain.com/.well-known/acme-challenge/test` is working
```
sudo echo "working!!!" > /var/www/.well-known/acme-challenge/test
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


### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [Maven](https://maven.apache.org/) - Dependency Management
* [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Billie Thompson** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone whose code was used
* Inspiration
* etc
