# ECS Slack DeployBoy

Checks and whines about ECS deployments on slack


## Configuration

Configuration can be provided via environment variables and/or command line arguments.

__Environment variables:__

* `DEPLOYBOY_CLUSTER`
* `DEPLOYBOY_REGION`
* `DEPLOYBOY_LISTENMODE`
* `DEPLOYBOY_SLACKTOKEN`
* `DEPLOYBOY_SLACKCHANNELID`


__Command line arguments:__

```bash
yarn run start -- \
    --region=eu-central-1 \
    --cluster=acme_cluster \
    --slackchannel=ACME_CHANNEL_ID\
    --pollms=2000 \
    --slacktoken=MY_WACK_ACME_TOKEN
````