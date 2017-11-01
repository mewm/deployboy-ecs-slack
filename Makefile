all: build push

build:
	docker build -t mewm/deployboy-ecs-slack:latest -f Dockerfile .
	docker build -t mewm/deployboy-ecs-slack:dev -f dev.Dockerfile .

push:
	docker push mewm/deployboy-ecs-slack

listen:
    docker run mewm/deployboy-ecs-slack yarn run start -- --region=eu-central-1 --cluster=backend-api-sta --slackchannel=C1H48MAG6 --pollms=2000

luxafor:
		node index.js --reporter=luxafor