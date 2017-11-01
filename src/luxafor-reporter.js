const DeployBoy = require('./deploy-boy');
const SlackReporter = require('./slack-reporter');
const chalk = require('chalk');

class LuxaforReporter {
    /**
     * @param {Object} config
     * @param {Luxafor} luxafor
     * @param {EventEmitter} event
     */
    constructor(config, luxafor, event) {
        this.config = config;
        this.e = event;
        this.lux = luxafor;
    }

    /**
     * @param {Object} serviceArns
     */
    async waitingForDeployment(serviceArns) {
        this.clog('Waiting for deployment');
        this.lux.setColor('#EEff00');
        this.lux.wave('#00ffff', 1, 1, 4);
    }

    /**
     * @param {Object} deployments
     */
    async stillWaitingForDeployment(deployments) {
        this.clog('Still waiting...');
        this.clog(SlackReporter.presentContainerStatusText(deployments));
    }

    /**
     * @param {Object} deployments
     */
    async deploymentDetected(deployments) {
        this.clog('Deployment detected');
        this.lux.setColor('#00ff00');
        this.lux.wave('#000fff', 4, 4, 0);
        this.clog(SlackReporter.presentContainerStatusText(deployments));
    }

    /**
     * @param {Object} deployments
     */
    deploymentOngoing(deployments) {
        this.clog('Rolling...');
        this.clog(SlackReporter.presentContainerStatusText(deployments));
    }

    /**
     * @param {Object} deployments
     */
    async deploymentFinished(deployments) {
        this.clog('Deployment finished.');
        this.clog(SlackReporter.presentContainerStatusText(deployments));
        setTimeout(() => {
            this.lux.setColor('#00ffff');
            this.lux.wave('#ff00ff', 4, 1, 10);
        }, 10000);
    }

    /**
     * @param {Integer} iteration
     * @param {Object} deployments
     */
    async gaveUpWatching(iteration, deployments) {

    }

    /**
     * @param {Object} deployments
     * @returns {{desired: Integer, running: Integer, pending: Integer}}
     */
    static getContainerStatus(deployments) {
        const desired = DeployBoy.getDesiredCount(deployments);
        const running = DeployBoy.getRunningCount(deployments);
        const pending = DeployBoy.getPendingCount(deployments);
        return {desired, running, pending};
    }

    /**
     * Naughty console output
     * @param text
     * @returns {LuxaforReporter}
     */
    clog(text) {
        const cluster = this.config.cluster.toUpperCase();
        console.log(`${chalk.bgGreen.whiteBright.bold(cluster)}: ${text}`);
        return this;
    }
}

module.exports = LuxaforReporter;