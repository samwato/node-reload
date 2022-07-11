# Include Environment Variables
ifneq ("$(wildcard .env)", "")
	include .env
endif


# Create server keys
.PHONY: generate_keys
generate_keys:
ifeq ("$(wildcard certs/localhost*.pem)", "")
	openssl req -x509 -newkey rsa:4096 -nodes \
		-subj '/CN=localhost' \
		-keyout certs/${KEY_FILE} \
		-out certs/${CERT_FILE}
endif


# Init repo
.PHONY: init
init:
	cp -n .env.example .env
	nvm use
	npm i


# docker compose
.PHONY: dev_up
dev_up:
	docker-compose --file docker-compose.dev.yml up --build --detach
	docker-compose --file docker-compose.dev.yml logs -f

.PHONY: dev_down
dev_down:
	docker-compose --file docker-compose.dev.yml down --remove-orphans
