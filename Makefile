# Include Environment Variables
ifneq ("$(wildcard .env)", "")
	include .env
endif


# Init repo
init:
	cp -n .env.example .env


# docker compose
up:
	docker-compose --file docker-compose.dev.yml up --build --detach
	docker-compose --file docker-compose.dev.yml logs -f

down:
	docker-compose --file docker-compose.dev.yml down --remove-orphans
