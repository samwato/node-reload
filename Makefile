# Include Environment Variables
ifneq ("$(wildcard .env)", "")
	include .env
endif


# Create server keys
generate_keys:
ifeq ("$(wildcard certs/localhost*.pem)", "")
	mkdir -p certs
	openssl req -x509 -newkey rsa:4096 --nodes \
		-subj '/CN=localhost' \
		-keyout certs/${KEY_FILE} \
		-out certs/${CERT_FILE}
endif

# Init repo
init: generate_keys
	npm i
	cp -n .env.example .env


# docker compose
dev_up:
	docker-compose --file docker-compose.dev.yml up --build --detach
	docker-compose --file docker-compose.dev.yml logs -f

dev_down:
	docker-compose --file docker-compose.dev.yml down --remove-orphans

test:
	npm test