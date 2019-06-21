FROM node:10.13.0-alpine

MAINTAINER Bernardo Gomes <bgomesdeabreu@gmail.com>

RUN npm install -g elm@0.18.0 elm-live@prev --unsafe-perm && mkdir /code/

WORKDIR /code/

ENTRYPOINT ["elm-live"]

#CMD ["src/Main.elm", "-p", "8181", "-h", "0.0.0.0", "--", "--debug"]
CMD ["elm-src/HtmlToElmWebsite/Main.elm", "-p", "8181", "-h", "0.0.0.0", "--start-page=custom.html", "--", "--debug", "--output=elm.js"]



