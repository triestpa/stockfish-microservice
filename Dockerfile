FROM node:latest
RUN apt-get update; apt-get install -qy stockfish
ENV PATH="${PATH}:/usr/games"
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]
