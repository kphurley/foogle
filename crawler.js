const RequestTurtle = require('request-turtle');
const turtle = new RequestTurtle({ limit: 300 }); // limit rate to 300ms. this is the default
const chalk = require('chalk');
const models = require('./models');
const Page = models.Page;
const db = models.db;
const MAX_CALLS = 5;
const START_POINT = 'http://fullstackacademy.com';
const searchRegEx = /href=['"]((?:http:\/\/|www)\S+)['"]/g;

var pagesSeen = [];

var crawl = function(address, lastPage, counter=0){
  let results = [];
  let createdPage;
  counter++;
  if (counter > MAX_CALLS) return;
  turtle.request(address)
    .then(function(responseBody) {
      return Page.create({
        url: address,
        textContent: responseBody,
        title: 'Title here',
        status: 200
      })
    })
    .then(function(page){
      createdPage = page;
      return page.addInboundLinks(lastPage);
    })
    .then(function(){
      let links = createdPage.textContent.match(searchRegEx);
      links = links.map(link => link.slice(6, -1));
      links.forEach(function(link){
        if(pagesSeen.indexOf(link) === -1){
          pagesSeen.push(link);
          console.log(chalk.yellow('New Page:' + link));
          crawl(link, createdPage, counter);
        }
      })
    });

  }

db.sync({force: true})
.then(function(){
  crawl(START_POINT);
});

//console.log(chalk.yellow(pagesSeen.join('\n')));
 // Request example
/*for(var i = 0; i < 1; i++) {
  turtle.request('http://fullstackacademy.com')
    .then(function(responseBody) {
       console.log(responseBody);
    });
}*/
