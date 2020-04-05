This project was created with express 

## Bootstrap

Install nvm:

`nvm install v11.10.1`

Switch to node v11.10.1

`nvm switch v11.10.1`

Install dependencies:

`npm install`

Create a .env file in the root project directory.

```
DB_HOST=
DB_USER=
DB_PASS=
JWT_SECRET=
AWS_BUCKET_NAME=
AWS_REGION=

SMTP_USER=
SMTP_PASS=
SMTP_PORT=
SMTP_HOST=


FRONT_END_HOST=
```

Please note aws permissions where provided with IAM granted to the EC2 instance.


## Available Scripts
In the project directory, you can run:

`nodemon start`

## Deployment

`npm install -g pm2`

`pm2 start index.js`


## Database

The database schema script is provided in the `Model` folder


