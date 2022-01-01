const SerialPort = require('serialport');
const config = require('./config');
const { Observable } = require('rxjs');

console.log(config);

const serial = new Observable((subscriber) => {
	let buffer = '';
	const port = new SerialPort(config.PORT, { baudRate: config.RATE, autoOpen: false });
	port.on('error', (err) => {
		console.error(err);
	});
	port.on('data', (data) => {
		buffer+= data.toString(config.ENCODING);
		let del = -1;
		while((del = buffer.indexOf(config.EOL)) >= 0) {
			const line = buffer.slice(0, del);
			buffer = buffer.slice(del + config.EOL.length);
			subscriber.next({port, line});
		}
	});
	port.open();
});

serial.subscribe(({port, line}) => {
	if(line === 'M105') {
		port.write("ok T:0\n");
	} else if (line === 'M21') {
		port.write("SD card ok\n");
		port.write("ok\n");
	} else if (line === 'M20') {
		port.write("Begin file list\n");
		port.write("test.gco 12345 Test.gcode\n");
		port.write("done/test1.gco 53222 done/test1.gcode\n");
		port.write("End file list\n");
		port.write("ok\n");
	} else {
		console.log("L> ", line);
	}
});
