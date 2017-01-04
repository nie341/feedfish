var DialogData = function DialogData() {
	this["in"] = null;
	this.roles = [];
	this.phrases = [];
	this.sequence = null;
	this.current = 0;
};
var TYPE = DialogData.Type = cc.Enum({
	PHRASE: 0,
	OPTION: 1
});
cc.js.mixin(DialogData.prototype, {
	start: function start() {
		this.current = this["in"];
	},

	getRole: function getRole(id) {
		return this.roles[id];
	},

	appendPhrase: function appendPhrase(role, phrase) {
		var roleid = this.roles.indexOf(role);
		if (roleid === -1) {
			roleid = this.roles.length;
			this.roles.push(role);
		}
		this.phrases.push({
			type: TYPE.PHRASE,
			role: roleid,
			phrase: phrase
		});
	},

	appendOption: function appendOption(options) {
		this.phrases.push({
			type: TYPE.OPTION,
			options: options
		});
	},

	next: function next() {
		var phrase = this.phrases[this.current];
		this.current++;
		return phrase;
	}
});

module.exports = DialogData;