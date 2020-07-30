# Lambda Node.js Serverless Sample

Node.js + Express sample application deployed using [Serverless Framework + AWS  Lambda](https://www.serverless.com/blog/serverless-express-rest-api#converting-an-existing-express-application) generated with [OpenAPI Generator](https://openapi-generator.tech).

## prerequisites
- NodeJS >= 10.6
- NPM >= 6.10.0
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)

## Generate the Node.js + Express app

### Install the Openapi Generator tool
```bash
npm install @openapitools/openapi-generator-cli -g
openapi-generator version
```

### Generate the code using [this sample API](./api.yml)
```bash
mkdir products-api && cd $_
openapi-generator generate -i ../api.yml -g nodejs-express-server
```

### Use a service mocks

Copy mocks:
```bash
cp -r ../mocks .
```
Include the mocks into [ProductService.js](./products-api/services/ProductService.js)
```js
const Service = require('./Service');
const Mocks = require('../mocks');
...

const findProductsByStatus = ({ status }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse(Mocks.productsFindAll));
    }
...
```

### Run the application

Once you've understood [what is *going* to happen](./products-api/README.md), launch the app and ensure everything is working as expected:
```bash
npm start
```

Try it out http://localhost:3000/api-doc/

## Convert the products-api to a Serverless Application

This step was made following this tutorial:
https://www.serverless.com/blog/serverless-express-rest-api#converting-an-existing-express-application

### Install the serverless-http package

```bash
npm install --save serverless-http
```
### Copy Serverless files

 - (../)

```bash
cp ../sls-convert/* .
```

## Deploy to AWS using Serverless Framework

### Install the Serverless Framework open-source CLI

```bash
npm install -g serverless
sls -v
```

Setup your AWS credentials. You can follow [this instructions](https://www.serverless.com/framework/docs/providers/aws/guide/credentials#creating-aws-access-keys) to setup a new user just for Serverless.

### Test your AWS credentials

Setup your profile and region an test if everything is OK:
```bash
aws sts get-caller-identity
```
Tip: your can export the name of your profile. Example:
```bash
export AWS_PROFILE=serverless
```

### Deploy and try it!

```bash
sls deploy
```

We'll use curl for these examples. Set the BASE_DOMAIN variable to your unique domain and base path so it's easier to reuse:
```bash
export BASE_DOMAIN=https://XXXX.execute-api.us-east-1.amazonaws.com/dev
```

Try it!
```bash
curl -H "Content-Type: application/json" -X GET ${BASE_DOMAIN}/products
```

Cleanup and delete the service
```bash
sls remove
```