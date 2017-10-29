class DeployBoy {
    /**
     * @param {SlackReporter} reporter
     * @param eventEmitter
     * @param {ECS} ecs
     * @param config
     */
    constructor(reporter, eventEmitter, ecs, config) {
        this.config = config;
        this.reporter = reporter;
        this.ecs = ecs;
        this.e = eventEmitter;
        this.i = 0;
        this.bindReportingEvents();
    }

    /**
     * Binds events to the slack reporter
     */
    bindReportingEvents() {
        this.e
            .on('startYourEngines', this.reporter.boot)
            .on('waiting_for_deployment', this.reporter.waitingForDeployment)
            .on('still_waiting_for_deployment', this.reporter.stillWaitingForDeployment)
            .on('deployment_detected', this.reporter.deploymentDetected)
            .on('deployment_ongoing', this.reporter.deploymentOngoing)
            .on('deployment_finished', this.reporter.deploymentFinished)
            .on('gaveup_watching', this.reporter.gaveUpWatching);
    }

    /**
     * Main loop
     * @returns {Promise<void>}
     */
    async startYourEngines() {
        try {
            this.e.emit('startYourEngines');
            const listServices = await this.ecs.listServices({cluster: this.config.cluster}).promise();
            const serviceArns = listServices.serviceArns;

            this.e.emit('waiting_for_deployment', serviceArns);
            return await this.listenForNewDeployment(serviceArns)
        } catch (e) {
            console.error(e)
        }
    }

    /**
     * Loops until a new deployment is started, then invokes monitor loop
     * @param services
     * @returns {Promise<*>}
     */
    async listenForNewDeployment(services) {
        let deployments = await this.fetchDeploymentForServices(services);
        let deploymentDone = DeployBoy.isDeploymentDone(deployments);

        if (!deploymentDone) {
            this.e.emit('deployment_detected', deployments);
            return await this.monitorDeployment(services);
        }

        this.e.emit('still_waiting_for_deployment', deployments);
        await DeployBoy.sleep(this.config.longpollinterval);
        return await this.listenForNewDeployment(services);
    }


    /**
     * Gets current deployment for all provided services
     * @param {Object} services
     * @returns {Promise<*>}
     */
    async fetchDeploymentForServices(services) {
        // noinspection JSCheckFunctionSignatures
        let describeServices = await this.ecs.describeServices({
            cluster: this.config.cluster,
            services
        }).promise();
        return describeServices.services.map(item => item.deployments).map(item => item[0]);
    }

    /**
     * Monitors a deployment, emitting status as it goes.
     * If listen mode is on, it starts listen for new deployments again
     * @param services
     * @returns {Promise<*>}
     */
    async monitorDeployment(services) {
        let deployments = await this.fetchDeploymentForServices(services);
        let deploymentDone = DeployBoy.isDeploymentDone(deployments);

        if (deploymentDone) {
            this.e.emit('deployment_finished', deployments);
            if (this.config.listenmode) {
                this.i = 0;
                return await this.listenForNewDeployment(services);
            } else {
                process.exit(0);
            }
        }

        this.e.emit('deployment_ongoing', deployments);
        this.i++;
        if (this.i === 100) {
            this.e.emit('gaveup_watching', i, deployments);
            process.exit(1);
        }

        await DeployBoy.sleep(this.config.longpollinterval);
        return await this.monitorDeployment(services);
    }

    /**
     * @param deployments
     * @returns {boolean}
     */
    static isDeploymentDone(deployments) {
        let desired = deployments.reduce((carry, item) => carry + item.desiredCount);
        let running = deployments.reduce((carry, item) => carry + item.runningCount);
        return desired === running;
    }

    /**
     * @param {Integer} ms
     * @returns {Promise<any>}
     */
    static async sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }
}

module.exports = DeployBoy;