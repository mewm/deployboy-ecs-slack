all: build push

build:
	docker build -t mewm/deployboy-ecs-slack:latest -f Dockerfile .
	docker build -t mewm/deployboy-ecs-slack:dev -f dev.Dockerfile .

push:
	docker push mewm/deployboy-ecs-slack