# PATSR
A simple social network based on anonymity, tags, and sharing - currently located at https://patsr.co

*Pull requests and issues are encouraged!*
## Installation
While there is already an instance of PATSR online, it is possible and encouraged to run another instance of it for a certain social group or institution.

The process is as follows:
```
git clone https://github.com/jpwall/patsr
cd patsr
npm install
```
At this point it is necessary to install the database. For PATSR, mongodb is used.

`[sudo] apt-get install mongodb-org` _for Debian 7/8 and LTS 64-bit Ubuntu installations_ and

`[sudo] pacman -S mongodb` _for Arch Linux_

Starting the database must be done in order for PATSR to work. This can be done with `[sudo] systemctl start mongodb.service` under systemd systems, which includes most modern distros.
## Configuration
### Database
All the configuration is done in `config/default.json`

The database host is where the database is located. This location must have an instance of mongodb running and accessible to PATSR. The default is `mongodb://localhost/patsr` where the name of the db is `patsr`.
### reCAPTCHA
PATSR uses reCAPTCHA to keep posts from being spammed. In order to get this to work for your respective instance, it is necessary to sign up for reCAPTCHA with google at https://www.google.com/recaptcha/intro/ . After specifying the domain name that will be used, they will provide you with a private and a public key. Place those respectively in the configuration file. *PATSR will not work if this step is left out*
### Host
This is rather self-explanatory. The host is whatever domain that PATSR will be run on.
### Posts
The number of posts per page is the amount of posts that are shown on a page before cycling to the next one. Default is 100 but theoretically performance may be improved if decreased.

The views per page is the set number of posts from the top to increment the view counter by one. The default is 20 but can be raised or lowered due to differing applications.
## Running
To run PATSR: `PORT=86 npm start`

If everything is running smoothly there should be a connected log in the terminal window. At this point it should work to navigate to `localhost:86` in a web browser and see the initial page.

At this point it is all set up! In order to be open to the web it is necessary to make it so that it can interface with a web server like apache or nginx but this configuration varies between installations
### That's It!
