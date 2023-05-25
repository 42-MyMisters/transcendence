# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: seseo <seseo@student.42.fr>                +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2023/01/25 16:48:49 by seseo             #+#    #+#              #
<<<<<<< HEAD
#    Updated: 2023/05/25 22:28:20 by seseo            ###   ########.fr        #
=======
#    Updated: 2023/05/25 23:44:25 by seseo            ###   ########.fr        #
>>>>>>> b7459260804d0a53cb1036b70c40e9486b841d64
#                                                                              #
# **************************************************************************** #

# for docker compose
<<<<<<< HEAD
DC		:= docker compose
=======
DC		:= docker-compose
>>>>>>> b7459260804d0a53cb1036b70c40e9486b841d64
DC_SRC	:= ./docker-compose.yml

DI		:= docker image
DIL		:= $(DI)s

DV		:= docker volume
DVL		:= $(DV) ls

DN		:= docker network
DNL		:= $(DN) ls

TARGET	:= transcendence

.PHONY:	all
all:	up

.PHONY:	up
up:
		mkdir -p ./db
		cp .env ./nginx/front/.env
		$(DC) -f $(DC_SRC) -p $(TARGET) up --build -d

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
