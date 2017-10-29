class SlackReporter {
    /**
     * @param {Object} config
     * @param {Slack} slackbot
     */
    constructor(config, slackbot) {
        this.bot = slackbot;
        this.config = config;
    }

    boot() {
        console.log('Booting');
    }

    /**
     * @param {Object} serviceArns
     */
    async waitingForDeployment(serviceArns) {
        console.log('Waiting for deployments');
        console.log(await this.bot.api.test({hyper:'card'}));
    }

    /**
     * @param {Object} deployments
     */
    stillWaitingForDeployment(deployments) {
        console.log('Still waiting...');
    }

    /**
     * @param {Object} deployments
     */
    deploymentDetected(deployments) {
        console.log('Deployment detected')
    }

    /**
     * @param {Object} deployments
     */
    deploymentOngoing(deployments) {
        console.log('Deployment ongoing')
    }

    /**
     * @param {Object} deployments
     */
    deploymentFinished(deployments) {
        console.log('Deployment finished')
    }

    /**
     * @param {Integer} iteration
     * @param {Object} deployments
     */
    gaveUpWatching(iteration, deployments) {
        console.log('Gave up after ' + i + ' iterations.', deployments)
    }
}

module.exports = SlackReporter;