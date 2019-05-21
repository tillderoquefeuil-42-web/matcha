NAME = matcha

NEO4J = neo4j
#NEO4J = ~/Applications/neo4j/bin/neo4j

all: $(NAME)

run_database:
	$(NEO4J) start
	mongod --dbpath ./data &>/dev/null

run_server:
	@npm start

run_client:
	@npm start --prefix ./client

stop_database:
	@$(NEO4J) stop
	@pkill -f mongod

stop_node:
	@killall node

$(NAME): 
	@npm install --silent
	@npm install --silent --prefix ./client

	@ttab -t DATABASE "make run_database"
	@ttab -t SERVER "make run_server"
	@ttab -t CLIENT "make run_client"

clean: stop_database stop_node

fclean: clean

re: fclean all