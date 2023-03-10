# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: seseo <seseo@student.42.fr>                +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/01/25 16:48:49 by seseo             #+#    #+#              #
#    Updated: 2023/03/10 23:09:08 by seseo            ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# for docker compose
DC					:= docker compose
DC_SRC				:= ./docker-compose.yml

DI					:= docker image
DIL					:= $(DI)s

DV					:= docker volume
DVL					:= $(DV) ls

DN					:= docker network
DNL					:= $(DN) ls

# DATA_PATH 			:= $(HOME)/data

TARGET				:= transcendence

.PHONY:	all
all:	up

.PHONY: build
build:
		$(DC) -f $(DC_SRC) -p $(TARGET) build

.PHONY:	up
up:		build
		$(DC) -f $(DC_SRC) -p $(TARGET) up -d

.PHONY:	down
down:
		$(DC) -f $(DC_SRC) -p $(TARGET) down

.PHONY:	re
re:		clean
		make up

.PHONY:	clean
clean:
		$(DC) -f $(DC_SRC) -p $(TARGET) down -v

.PHONY:	fclean
fclean:
		$(DC) -f $(DC_SRC) -p $(TARGET) down -v --rmi all

.PHONY:	img_ls
img_ls:
		$(DIL)

.PHONY:	vol_ls
vol_ls:
		$(DVL)

.PHONY:	net_ls
net_ls:
		$(DNL)