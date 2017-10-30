const DeployBoy = require('./deploy-boy');
const chalk = require('chalk');

class SlackReporter {
    /**
     * @param {Object} config
     * @param {Slack} slackbot
     * @param {EventEmitter} event
     */
    constructor(config, slackbot, event) {
        this.config = config;
        this.bot = slackbot;
        this.channel = config.slackchannel;
        this.token = config.slacktoken;
        this.e = event;
    }

    /**
     * @param {Object} serviceArns
     */
    async waitingForDeployment(serviceArns) {
        await this.meMessage(':sleepy:Someone woke me up. Better look at the deployments then...:beers:');
    }

    /**
     * @param {Object} deployments
     */
    async stillWaitingForDeployment(deployments) {
        this.clog('still waiting...');
        this.clog(SlackReporter.presentContainerStatusText(deployments));
    }

    /**
     * @param {Object} deployments
     */
    async deploymentDetected(deployments) {
        const message = `*${this.config.cluster.toUpperCase()}* is rolling out on AWS\n`;
        await this.postMessage(message, deployments, '#0400ff');
    }

    /**
     * @param {Object} deployments
     */
    deploymentOngoing(deployments) {
        this.clog('still rolling...');
        this.clog(SlackReporter.presentContainerStatusText(deployments));
    }

    /**
     * @param {Object} deployments
     */
    async deploymentFinished(deployments) {
        const message = `*${this.config.cluster.toUpperCase()} is fully rolled out on AWS!* ` +
            `- _API will be available after next health check!_ :beers:`;
        const post = await this.postMessage(message, deployments) && this.e.emit('see_you_layer');
    }

    /**
     * @param {Integer} iteration
     * @param {Object} deployments
     */
    async gaveUpWatching(iteration, deployments) {
        const message = `*${this.config.cluster.toUpperCase()}:* Gave up watching after ${iteration} iterations.\n`;
        await this.postMessage(message, deployments, '#64000d');
    }

    /**
     * Message to slack with beautiful attachment
     * @param {String} text
     * @param {Object} deployments
     * @param {String} color
     * @returns {Promise<void>}
     */
    async postMessage(text, deployments, color = '#36a64f') {
        const attachment = [{
            color,
            author_link: 'https://github.com/mewm/deployboy-ecs-slack',
            fields: SlackReporter.presentContainerStatusFields(deployments)
        }];

        await this.bot.chat.postMessage({
            // icon_emoji: ':partyparrot:',
            token: this.token,
            channel: this.channel,
            text,
            as_user: true,
            attachments: attachment
        });
        this.clog(text).clog(SlackReporter.presentContainerStatusText(deployments));
    }

    /**
     * A /me message
     * @param {String} text
     * @returns {Promise<void>}
     */
    async meMessage(text) {
        this.clog(text);
        await this.bot.chat.meMessage({token: this.token, channel: this.channel, text});
    }

    /**
     * @param {Object} deployments
     * @returns {string}
     */
    static presentContainerStatusText(deployments) {
        const {desired, running, pending} = SlackReporter.getContainerStatus(deployments);
        return `Container status: Desired: ${desired} | Running: ${running} | Pending: ${pending}\n`;
    }

    /**
     * @param {Object} deployments
     * @returns {*[]}
     */
    static presentContainerStatusFields(deployments) {
        const {desired, running, pending} = SlackReporter.getContainerStatus(deployments);
        return [
            {title: 'Desired:ok_hand::skin-tone-6:', value: desired, short: true},
            {title: 'Pending:four_leaf_clover:', value: pending, short: true},
            {title: 'Running:running:', value: running, short: true}
        ]
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
     * @returns {SlackReporter}
     */
    clog(text) {
        const cluster = this.config.cluster.toUpperCase();
        console.log(`${chalk.bgGreen.whiteBright.bold(cluster)}: ${text}`);
        return this;
    }
}

module.exports = SlackReporter;