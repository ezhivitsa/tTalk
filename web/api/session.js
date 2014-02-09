module.exports.Session = function () {
	var getRandom = function () {
		return Math.floor(Math.random() * 1e16).toString(36);
	}
	
	this.sessionId = getRandom() + '-' + new Date().getTime().toString(36) + '-' + getRandom();
	this.doDestroy = false;
 
	this.toString = function () {
		return this.sessionId;
	} 
 
	this.getTime = function () {
		return parseInt(this.sessionId.split('-')[1], 36);
	} 
}