var fs = require('fs');

var resultList = [];
var count = 0;
var input = fs.createReadStream('datafile.txt');

readLines(input, parseLinesToObjects);

//Reads File line by line and sends to parseLinesToObjects function
function readLines(input, func) {
  var remaining = '';

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    var last  = 0;
    while (index > -1) {
      var line = remaining.substring(last, index);
      last = index + 1;
      func(line);
      index = remaining.indexOf('\n', last);
    }

    remaining = remaining.substring(last);
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining);
    }
  });
}

//converts the lines to Json Objects and sends to findLargestSumVariant to calculate burst
function parseLinesToObjects(remaining) {
  var index = remaining.indexOf('|');
  var index2 = (remaining.substring(index+1, remaining.length)).indexOf('|') + index + 2;
  var company = [];
  var iterator = 0;
  company.name = remaining.substring(0, index-1);
  company.symbol = remaining.substring(index+2, index2-1);
  company.values = [];
  company.increments = [];
  var temp = remaining.substring(index2+2, remaining.length-1).split(", ");
  temp.forEach(function(x){
    company.values[iterator] = parseFloat(x);
    if(iterator>0) {
      company.increments[iterator-1] = (company.values[iterator] - company.values[iterator-1]);
    }
    iterator++;
  });
  count++;
  findLargestSumVariant(company);
}

//Calculates burst and when it has done so for 28 companies, it outputs it to terminal
function findLargestSumVariant(company) {
  var maxSum = company.increments[0];
  var currentSum = maxSum;
  var start = 0;
  var end = 0;
  var tstart = 0;
  var i = 1;
  var x = [];
  for(i; i<company.increments.length; i++) {
    if(((company.increments[i]*100.0)/company.values[i-1])>((currentSum+company.increments[i])*100.0/company.values[tstart])) {
      tstart = i;
      currentSum = company.increments[i];
    }
    else {
      currentSum = parseFloat((currentSum + company.increments[i]).toPrecision(5));

    }
    if(currentSum*100/company.values[tstart] > maxSum*100/company.values[start]) {
      maxSum = currentSum;
      start = tstart;
      end = i+1;
    }
  }

  x.symbol = company.symbol;
  x.maxBurst = ((maxSum*100)/company.values[start]);
  x.timePeriod = JSON.stringify(end - start + 1);
  x.startMonth = JSON.stringify(start);
  x.endMonth = JSON.stringify(end);
  x.changeInPrice = maxSum;
  resultList.push(x);

  if(resultList.length == 28) {
    resultList.sort(sortByBurst);
    console.log("Symbol    Burst %age    Period    Start Month    End Month    Burst Change in Price(USD)");
    resultList.forEach(function(x){
      while(x.symbol.length<7) {
        x.symbol = x.symbol + " ";
      }
      while(x.timePeriod.length<5) {
        x.timePeriod = x.timePeriod + " ";
      }
      while(x.endMonth.length<5) {
        x.endMonth = x.endMonth + " ";
      }
      while(x.startMonth.length<5) {
        x.startMonth = x.startMonth + " ";
      }
      console.log( x.symbol + "    " +  x.maxBurst.toPrecision(7)  
          + "        " +  x.timePeriod  + "        "  + x.startMonth + "        " 
          +  x.endMonth  + "        " +  x.changeInPrice );
    });
  }
}

function sortByBurst(a, b) {
  return b.maxBurst-a.maxBurst;
}


