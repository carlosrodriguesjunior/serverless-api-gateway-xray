'use strict';

const _ = require('lodash');

class ServerlessApiGatewayXray {
  get stackName() {
    return `${this.serverless.service.service}-${this.options.stage}`;
  }

  constructor(serverless, options) {
    this.options = options;
    this.serverless = serverless;
    this.awsService = this.serverless.getProvider('aws');

    this.hooks = {
      'after:deploy:deploy': this.execute.bind(this),
    };
  }

  execute() {
    return this.getStackResources()
      .then(data => this.enableApiGatewayXray(data))
      .then(data => this.serverless.cli.log(JSON.stringify(data)))
      .catch(err => this.serverless.cli.log(JSON.stringify(err)));
  }

  getStackResources() {
    return this.awsService.request('CloudFormation', 'describeStackResources', { StackName: this.stackName });
  }

  enableApiGatewayXray(data) {
    const apiGatewayResources = _.filter(data.StackResources, { ResourceType: 'AWS::ApiGateway::RestApi' });

    const promises = _.map(apiGatewayResources, item => {
      return new Promise((resolve, reject) => {
        const params = {
          restApiId: item.PhysicalResourceId,
          stageName: this.options.stage,
          patchOperations: [
            {
              op: 'replace',
              path: '/tracingEnabled',
              value: this.serverless.service.custom.apiGatewayXray.toString()
            }
          ]
        };

        this.awsService.request('APIGateway', 'updateStage', params).then((data) => {
          resolve(`API gateway xray ${this.serverless.service.custom.apiGatewayXray}`);
        }).catch((err) => {
          console.log(err);
          reject(err);
        });

      });
    });

    return Promise.all(promises);
  }
}

module.exports = ServerlessApiGatewayXray;