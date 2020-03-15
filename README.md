<p align="center"><img src="https://surv.app/logo.png" width="64" height="64"></p>

# surv.app

With [surv.app](//surv.app) you can create _advanced multi-page surveys in Markdown_ and style them with custom HTML/CSS. When Google Forms feels too simplistic or rigid, surv.app will do just right.

A survey in surv.app is just a Markdown document which can also contain valid HTML blocks. We provide some syntax extensions for asking questions, skip logic, and displaying previous answers.

## Survey Markup Example

```
# Ageistic Survey

How old are you?

? age_group
- 0-18
- 19-35
- 36-55
- 56 or older

@ age_group != "0-18"
Hello, oldie!

```

## Installation

surv.app is a node.js application backed by SQLite3, Postgres or MySQL.

Git clone:

```
git clone https://github.com/fedor/survapp survapp
cd survapp
```

Configure with environment variables or `.env` file:

```
# App name displayed for admins in UI
APP_NAME=surv.app

# Encryption secret used in authentication
AUTH_SECRET=s3cr3t

# Path to SQLite file or a DB connection string like mysql://<username>:<password>@<host>:<port>/<db_name>
DB_CONN=survapp.db

# SMTP connection string for OTP emails
MAIL_CONN=smtp://username:password@smtp.server.email

# The survey to show at WWW root
INDEX_PATH=/index

# Limit admin access to specific emails and/or domains
# Anyone with an email can create surveys by default!
USER_EMAILS=jane@example.com joe@example.com
USER_DOMAINS=example.com example.net
```

[Dokku](http://dokku.viewdocs.io/dokku/) or Heroku is a recommended (tested) way of deployment:

```
dokku apps:create survapp
git remote add dokku dokku@dokku.me:survapp
git push dokku master
```

Or install and run with NPM:

```
npm install
npm run build
npm start
```

## Documentation

Some docs are avaliable here: https://surv.app/docs
