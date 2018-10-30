# serverless-api-gateway-xray
Serverless plugin to enable X-Ray on API Gateway

## Installation

Install the plugin via <a href="https://docs.npmjs.com/cli/install">NPM</a>

```
npm install --save-dev serverless-api-gateway-xray
```

## Usage

In Serverless template:

```
custom:
  apiGatewayXray:true || false

plugins: 
  - serverless-api-gateway-xray

```