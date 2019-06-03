NAME = matcha

NEO4J = neo4j

all: $(NAME)

init:
	@npm install --silent > ./logs/init_server.txt
	@npm install --silent --prefix ./client > ./logs/init_client.txt
	@echo Initialisation done! Run make to start!

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
	@ttab -a iTerm2 "make run_database"
	@ttab -a iTerm2 "make run_server"
	@ttab -a iTerm2 "make run_client"

clean: stop_database stop_node

fclean: clean

re: fclean all