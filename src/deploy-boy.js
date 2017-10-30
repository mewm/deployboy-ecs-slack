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
    }

    /**
     * Binds events to the slack reporter
     */
    bindReportingEvents() {
        const r = this.reporter;
        this.e
            .on('waiting_for_deployment', r.waitingForDeployment.bind(r))
            .on('still_waiting_for_deployment', r.stillWaitingForDeployment.bind(r))
            .on('deployment_detected', r.deploymentDetected.bind(r))
            .on('deployment_ongoing', r.deploymentOngoing.bind(r))
            .on('deployment_finished', r.deploymentFinished.bind(r))
            .on('gaveup_watching', r.gaveUpWatching.bind(r));
    }

    /**
     * Main loop
     * @returns {Promise<void>}
     */
    async startYourEngines() {
        this.bindReportingEvents();
        try {
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
     * @param {Object} services
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
                this.e.removeListener('deployment_finished', () => console.log('Removed finished listener...'));
                this.e.once('see_you_later', this.seeYouLater);
                return;
            }
        }

        this.e.emit('deployment_ongoing', deployments);
        this.i++;
        if (this.i === 500) {
            this.e.once('see_you_layer', this.seeYouLater);
            this.e.emit('gaveup_watching', i, deployments);
            return;
        }

        await DeployBoy.sleep(this.config.longpollinterval);
        return await this.monitorDeployment(services);
    }

    /**
     * @param {Object} deployments
     * @returns {boolean}
     */
    static isDeploymentDone(deployments) {
        let desired = DeployBoy.getDesiredCount(deployments);
        let running = DeployBoy.getRunningCount(deployments);
        return desired === running;
    }

    /**
     * I promise I will sleep
     * @param {Integer} ms
     * @returns {Promise<any>}
     */
    static async sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    /**
     * @param {Object} deployments
     * @returns {Integer}
     */
    static getRunningCount(deployments) {
        return deployments
            .map(item => item.runningCount)
            .reduce((c, i) => c + i);
    }

    /**
     * @param {Object} deployments
     * @returns {Integer}
     */
    static getDesiredCount(deployments) {
        return deployments
            .map(item => item.desiredCount)
            .reduce((c, i) => c + i);
    }

    /**
     * @param deployments
     * @returns {Integer}
     */
    static getPendingCount(deployments) {
        return deployments
            .map(item => item.pendingCount)
            .reduce((c, i) => c + i);
    }

    /**
     * Ciao!
     */
    seeYouLater() {
        console.log(`${this.config.cluster} says see you later!`);
        process.exit(0);
    }
}

module.exports = DeployBoy;