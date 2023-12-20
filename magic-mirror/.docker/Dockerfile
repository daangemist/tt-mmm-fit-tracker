FROM node:18.19.0

RUN mkdir /magic-mirror

RUN chown -R node:node /magic-mirror

USER node

WORKDIR /magic-mirror

RUN git clone https://github.com/MichMich/MagicMirror.git . && \
    git checkout v2.25.0 && \
    npm run install-mm && \
    touch css/custom.css

RUN npm i --save-dev nodemon
