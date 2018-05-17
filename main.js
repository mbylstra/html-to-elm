#!/usr/bin/env node

// load Elm module
const elm = require('./cli/Main.js');

// get Elm ports
const ports = elm.Main.worker().ports;

// keep our app alive until we get an exitCode from Elm or SIGINT or SIGTERM (see below)
setInterval(id => id, 86400);

ports.exitApp.subscribe(exitCode => {
	console.log('Exit code from Elm:', exitCode);
	process.exit(exitCode);
});

if (!!process.argv[2]) {
  ports.incomingHtmlCode.send(process.argv[2]);
} else {
	console.error("No argument was found, pleas provide one argument.");
	process.exit(1);
}

ports.outgoingElmCode.subscribe(function(currElmCode) {
  console.log(currElmCode);
	process.exit(0);
});

process.on('uncaughtException', err => {
	console.log(`Uncaught exception:\n`, err);
	process.exit(1);
});

process.on('SIGINT', _ => {
	console.log(`SIGINT received.`);
	ports.externalStop.send(null);
});

process.on('SIGTERM', _ => {
	console.log(`SIGTERM received.`);
	ports.externalStop.send(null);
});
