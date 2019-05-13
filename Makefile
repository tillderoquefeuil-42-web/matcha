NAME = abs

#NEO4J = neo4j
NEO4J = ~/Desktop/Applications/neo4j/bin/neo4j

all: $(NAME)

init:
	@npm install
	@npm install --prefix ./client

run_database:
	$(NEO4J) start
	mongod --dbpath ./data &>/dev/null

run_server:
	@npm start

run_client:
	@npm start --prefix ./client

stop_database:
	$(NEO4J) stop
	pkill -f mongod

stop_node:
	killall node

stop_server:
	npm stop

stop_client:
	npm stop --prefix ./client


$(NAME): run_database run_server run_client

clean: stop_database stop_node

fclean: clean

re: fclean all