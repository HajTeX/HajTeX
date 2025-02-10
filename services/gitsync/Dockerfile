FROM node:18.20.2 AS base

WORKDIR /overleaf/services/gitsync

# Google Cloud Storage needs a writable $HOME/.config for resumable uploads
# (see https://googleapis.dev/nodejs/storage/latest/File.html#createWriteStream)
RUN mkdir /home/node/.config && chown node:node /home/node/.config

FROM base AS app

COPY package.json package-lock.json /overleaf/
COPY services/gitsync/package.json /overleaf/services/gitsync/
COPY libraries/ /overleaf/libraries/
COPY patches/ /overleaf/patches/

RUN cd /overleaf && npm ci --quiet

COPY services/gitsync/ /overleaf/services/gitsync/

FROM app
USER node

CMD ["node", "--expose-gc", "app.js"]
