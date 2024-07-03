# --build rebuilds images before starting the containers
# TODO: REMOVE THE --detach AND --remove-orphans BEFORE HANDING IN
.PHONY: up
up:
	docker-compose up --build

.PHONY: down
down:
	docker compose down

# $$ is an escaped $, and it gives sh, rather than Make, the chance to expand it
# 2> /dev/null ignores errors when $$(docker ps -qa) expands to an empty result
# Likewise, || exit 0 makes sure Make doesn't report an error
.PHONY: clean
clean: rmvol
	docker stop $$(docker ps -qa) 2> /dev/null || exit 0
	docker rm $$(docker ps -qa) 2> /dev/null || exit 0
	docker rmi -f $$(docker images -qa) 2> /dev/null || exit 0
	docker network rm $$(docker network ls -q) 2> /dev/null || exit 0
	docker builder prune -f

.PHONY: rmvol
rmvol: down
	find containers/nestjs/profile_pictures -type f ! -name 42 -delete
	docker volume rm $$(docker volume ls -q) 2> /dev/null || exit 0

.PHONY: test
test:
	docker compose exec --workdir /nestjs/code/ nestjs npm run test
