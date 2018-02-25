const fs = require('fs');
const data = fs.readFileSync('words.json','utf-8')
const result = data.split('\n').reduce((result,line,index) => {
	const wordandsyn = line.split('\t');
	return Object.assign({},result,{[index]:{"word": wordandsyn[0], "synonyms": wordandsyn[1].split(",").map(x => x)}});
});
console.log(result);
fs.writeFile("result.json", JSON.stringify(result));