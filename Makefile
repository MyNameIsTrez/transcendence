# --build rebuilds images before starting the containers
# --detach runs the containers in the background
.PHONY: up
up:
	docker-compose up --build --detach

.PHONY: down
down:
	docker compose down

# $$ is an escaped $, and it gives sh, rather than Make, the chance to expand it
# 2> /dev/null ignores errors when $$(docker ps -qa) expands to an empty result
# Likewise, || exit 0 makes sure Make doesn't report an error
.PHONY: clean
clean:
	docker stop $$(docker ps -qa) 2> /dev/null || exit 0
	docker rm $$(docker ps -qa) 2> /dev/null || exit 0
	docker rmi -f $$(docker images -qa) 2> /dev/null || exit 0
	docker volume rm $$(docker volume ls -q) 2> /dev/null || exit 0
	docker network rm $$(docker network ls -q) 2> /dev/null || exit 0
	docker builder prune -f
