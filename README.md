# Fullstack Capstone
## Bill Splitter Back End

### Description
Back end application for Capstone bill splitting application using:
- Express
- Sequelize
- PostgreSQL
- Serverless Framework
- AWS

## Prerequisites
- Node.js
- Serverless Framework
  - `npm install -g serverless`
- AWS Account with credentials

## Getting Started
1. Clone repo
2. Run `npm install`
3. Add .env file
```
AWS_ACCESS_KEY_ID=<ACCESS_KEY_ID_HERE>
AWS_SECRET_ACCESS_KEY=<ACCESS_KEY_HERE>
ORG=<SERVERLESS_ORG_NAME>
APP_NAME=<SERVERLESS_APP_NAME>
DB_HOST=<DB_HOST>
DB_PASSWORD=<DB_PASSWORD>
DB_USER=<DB_USER>
```

## Running Dev Mode
`serverless dev`

## Deploying
`serverless deploy`

