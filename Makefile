all: build push

build:
	docker build -t mewm/deployboy-ecs-slack .

push:
	docker push mewm/deployboy-ecs-slack