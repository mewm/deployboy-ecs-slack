const AWS = require('aws-sdk');
const EventEmitter = require('events').EventEmitter;
const Slack = require('slack');
const Luxafor = require('luxafor-api');
const SlackReporter = require('./src/slack-reporter.js');
const LuxaforReporter = require('./src/luxafor-reporter.js');
const DeployBoy = require('./src/deploy-boy');
const argv = require('minimist')(process.argv.slice(2));

const config = {
    cluster: argv['cluster'] || process.env.DEPLOYBOY_CLUSTER,
    region: argv['region'] || process.env.DEPLOYBOY_REGION,
    listenmode: argv['listen'] === 0 ? false : process.env.DEPLOYBOY_LISTENMODE || false,
    slacktoken: argv['slacktoken'] || process.env.DEPLOYBOY_SLACKTOKEN || false,
    slackchannel: argv['slackchannel'] || process.env.DEPLOYBOY_SLACKCHANNELID || false,
    reporter: argv['reporter'] || process.env.DEPLOYBOY_REPORTER || 'slack',
    longpollinterval: argv['pollms'] || 3500
};

console.log

// Check for config sufficiency
const configKeys = Object.keys(config);
Object.values(config).map((item, key) => {
    if (typeof item === 'undefined') {
        throw new Error(`Config "${configKeys[key]}" cannot be undefined`);
    }
});

const event = new EventEmitter();
const ecs = new AWS.ECS({region: config.region});
let deployBoy = false;
if (config.reporter === 'slack') {

    const slack = new Slack({token: config.slacktoken});
    const reporter = new SlackReporter(config, slack, event);
    const deployBoy = new DeployBoy(reporter, event, ecs, config);
    deployBoy.startYourEngines();

} else if (config.reporter === 'luxafor') {

    const luxafor = new Luxafor();
    const reporter = new LuxaforReporter(config, luxafor, event);
    const deployBoy = new DeployBoy(reporter, event, ecs, config);
    deployBoy.startYourEngines();

} else {
    throw new Error('Reporter not provided or available.');
}


