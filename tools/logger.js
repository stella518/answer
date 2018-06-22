var logger = function () {
	var obj = getCurrentPages()
	var idx = obj.length - 1
	console.log(obj[idx].route, arguments[0], arguments[1])
}

var toDecimal = function toDecimal(x) {
	var f = parseFloat(x);
	if (isNaN(f)) {
		return false;
	}
	var f = Math.round(x * 100) / 100;
	var s = f.toString();
	var rs = s.indexOf('.');
	if (rs < 0) {
		rs = s.length;
		s += '.';
	}
	while (s.length <= rs + 2) {
		s += '0';
	}
	return s;
}

var exports = module.exports = {
	logger: logger,
	toDecimal: toDecimal
}