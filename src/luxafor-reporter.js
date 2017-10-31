const DeployBoy = require('./deploy-boy');
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
        this.lux.setColor('#ffff00');
    }

    /**
     * @param {Object} deployments
     */
    async stillWaitingForDeployment(deployments) {
    }

    /**
     * @param {Object} deployments
     */
    async deploymentDetected(deployments) {
        this.lux.setColor('#0000ff');
    }

    /**
     * @param {Object} deployments
     */
    deploymentOngoing(deployments) {
    }

    /**
     * @param {Object} deployments
     */
    async deploymentFinished(deployments) {
        this.lux.setColor('#00ff00');
        setTimeout(() => {
            this.lux.setColor('#FF00FF');
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