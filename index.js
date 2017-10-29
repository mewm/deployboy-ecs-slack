const AWS = require('aws-sdk');
const EventEmitter = require('events').EventEmitter;
const Slack = require('slack');
const SlackReporter = require('./slack-reporter.js');
const DeployBoy = require('./deploy-boy');

const config = {
    cluster: process.env.DEPLOYBOY_CLUSTER,
    region: process.env.DEPLOYBOY_REGION,
    listenmode: process.env.DEPLOYBOY_LISTENMODE || false,
    slacktoken: process.env.DEPLOYBOY_SLACKTOKEN,
    longpollinterval: 3500
};

const reporter = new SlackReporter(config, new Slack({token: config.slacktoken}));
const event = new EventEmitter();
const ecs = new AWS.ECS({region: config.region});

const deployBoy = new DeployBoy(reporter, event, ecs, config);

deployBoy.startYourEngines().catch(function (e) {
    console.error(e);
    throw e;
});