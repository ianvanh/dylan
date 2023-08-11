FROM node:lts-buster

RUN git clone https://github.com/ianvanh/dylan

RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

COPY package.json .

RUN npm install -g npm@9.8.1
RUN yarn add supervisor -g
RUN yarn

COPY . .

CMD ["node", "."]
