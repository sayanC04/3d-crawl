const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>(.*?)<\/script>/s);
if(scriptMatch) {
  // Can't easily run it. Just regex search for duplicate topics.
}
