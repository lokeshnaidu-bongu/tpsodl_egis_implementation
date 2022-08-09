FROM node:12.13.0
WORKDIR /audit_bookmarks_config
COPY package*.json /audit_bookmarks_config/
COPY . /audit_bookmarks_config

RUN npm install npm@6.12.0
ENTRYPOINT ["node"]
CMD ["pg.js"]
EXPOSE 9005