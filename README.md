# html-to-elm
An online tool for converting HTML to [elm-html](https://github.com/evancz/elm-html) code. 

*Go to http://mbylstra.github.io/html-to-elm/*



#Docker Instructions

##Build Image
docker build . -t elm-0.18

##Run Image
docker run -it --name elm18 --rm -v elm-src:/code elm-0.18b

##GET IP of Machine
docker inspect elm19 --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'

