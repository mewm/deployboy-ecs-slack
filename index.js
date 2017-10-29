const AWS = require('aws-sdk');
const EventEmitter = require('events').EventEmitter;
const Slack = require('slack');
const SlackReporter = require('./slack-reporter.js');
const DeployBoy = require('./deploy-boy');
const argv = require('minimist')(process.argv.slice(2));

const config = {
    cluster: argv['cluster'] || process.env.DEPLOYBOY_CLUSTER,
    region: argv['region'] || process.env.DEPLOYBOY_REGION,
    listenmode: argv['listen'] || process.env.DEPLOYBOY_LISTENMODE || false,
    slacktoken: argv['slacktoken'] || process.env.DEPLOYBOY_SLACKTOKEN,
    slackchannel: argv['slackchannel'] || process.env.DEPLOYBOY_SLACKCHANNELID,
    longpollinterval: argv['pollms'] || 3500
};

// Check for config sufficiency
const configKeys = Object.keys(config);
Object.values(config).map((item, key) => {
    if(typeof item === 'undefined') {
        throw new Error(`Config "${configKeys[key]}" cannot be undefined`);
    }
});

const event = new EventEmitter();
const ecs = new AWS.ECS({region: config.region});
const reporter = new SlackReporter(config, new Slack({token: config.slacktoken}));
const deployBoy = new DeployBoy(reporter, event, ecs, config);

(async function run() {
    await deployBoy.startYourEngines();
})();
