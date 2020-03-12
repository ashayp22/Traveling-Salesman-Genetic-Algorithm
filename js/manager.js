//CITY CODE -----------------------------------------------------------------------

var cityCoordinates = [];
var bestPossibleRoute;

var num_of_cities = 10;
const MUTATE_RATE = 0.2;
const CROSSOVER_RATE = 0.75;
const POPULATION_NUM = 100;

var random = false; //type of cities, true means random cities else circular cities

function initialize() {
  var ctx = document.getElementById("canvas").getContext("2d");

  Background();
  num_of_cities = prompt("how many cities, from 4 to 16?") * 1;

  if(num_of_cities < 4 || num_of_cities > 16) {
    num_of_cities = 8;
  }

  var type = prompt("do you want random cities(1) or circular cities(2)").toLowerCase();

  if(type == "1") {
    random = true;

    getRandomCoordinates(num_of_cities);
  } else {
    random = false;
    CreateCircularCities(num_of_cities);
  }

}

function Background() {
  var ctx = document.getElementById("canvas").getContext("2d");
  ctx.fillStyle = "#efefef";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}


function getRandomCoordinates(num) {
  for(var i = 0; i < num; i++) {

    var xPos = RandomInt(10, 490);
    var yPos = RandomInt(10, 490);
    cityCoordinates.push([xPos, yPos]);
  }
  CreateRandomCities();
}

function CreateRandomCities() {
  var ctx = document.getElementById("canvas").getContext("2d");

  for(var i = 0; i < cityCoordinates.length; i++) {

    var xPos = cityCoordinates[i][0];
    var yPos = cityCoordinates[i][1];
    ctx.fillStyle = "#000000";

    ctx.beginPath();
    ctx.arc(xPos, yPos, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.font = "20px";
    ctx.fillText(i+1,xPos + 10,yPos);
  }
}

function CreateCircularCities(num) { //creates a circular city
  var radius = 100;
  var centerX = 250;
  var centerY = 250;

  for(var i = 0; i < num; i++) {
    cityCoordinates.push(drawPoint((i/num) * 360, radius, centerX, centerY, i+1));
  }
}

function drawPoint(angle, radius, center_x, center_y, number) { //draws the points based on angle
  var ctx = document.getElementById("canvas").getContext("2d");

  var x = center_x + radius * Math.cos(-angle*Math.PI/180);
  var y = center_y + radius * Math.sin(-angle*Math.PI/180);

  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fill();

  ctx.font = "20px";
  ctx.fillText(number,x + 10,y);

  return [x, y];
}

function CalculateDistance(a, b) { //returns distance between two points
  return Math.sqrt(Math.pow(a[0]-b[0], 2) + Math.pow(a[1]-b[1], 2));
}

function CalculateBestPossibleRoute() { //calculates the best route by going in order of dots
  var sum = 0;
  for(var i = 0; i < num_of_cities; i++) {
    var first = i;
    var second = i + 1;
    if(second === num_of_cities) {
      second = 0;
    }
    sum += CalculateDistance(cityCoordinates[first], cityCoordinates[second]);
  }
  return sum;
}

function getPathText(path) {
  var text = "";
  for(var i = 0; i < path.length; i++) {
    text += (path[i]+1) + " > "
  }
  text += (path[0] + 1);
  return text;
}

//person starts the animation
function start() {
  bestPossibleRoute = CalculateBestPossibleRoute();

  var pop = new TSP(MUTATE_RATE, CROSSOVER_RATE, POPULATION_NUM, num_of_cities);

  pop.Epoch();

}

function checkNotDone(path) {
  var startIndex = path.indexOf(0);
  for(var i = 0; i < path.length; i++) {
    if(startIndex == path.length) {
      startIndex = 0;
    }

    if(path[startIndex] !== i) {
      return false;
    }

    startIndex += 1;

  }

  return true;
}

function checkNotDone2(path) {
  var startIndex = path.indexOf(0);
  for(var i = 0; i < path.length; i++) {
    if(startIndex == -1) {
      startIndex = path.length-1;
    }

    if(path[startIndex] !== i) {;
      return false;
    }

    startIndex -= 1;

  }

  return true;
}


function drawRoute(cityPath) {
  var ctx = document.getElementById("canvas").getContext("2d");
  for(var i = 0; i < cityPath.length; i++) {

    var startCoor = cityCoordinates[cityPath[i]];
    var endCoor = cityCoordinates[cityPath[i+1]];

    if(i+1 == cityPath.length) {
      endCoor = cityCoordinates[cityPath[0]];
    }

    ctx.beginPath();
    ctx.moveTo(startCoor[0],startCoor[1]);
    ctx.lineTo(endCoor[0],endCoor[1]);
    ctx.stroke();

  }
}

//acessor methods

function getCoordinates() {
  return cityCoordinates;
}

function getBestRoute() {
  return bestPossibleRoute;
}

function clone(array) { //returns a cloned 1D array
	var newArray = []; //clone
  for(i = 0; i < array.length; i++) {
  	newArray[i] = array[i];
  }
  return newArray;
}

function RandomInt(min, max) { //min and max are inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//GENOME CODE --------------------------------------------------------------------------------

var Genome = function() { //creates a new genome
  this.cities = [];
  this.fitness;
  this.cities = this.GrabPermutation();
}

Genome.prototype.GrabPermutation = function() { //randomizes city path
  var orderedCities = [];
  for(var i = 0; i < num_of_cities; i++) {
    orderedCities.push(i);
  }

  var randomCities = [];
  for(var j = 0; j < num_of_cities; j++) {
    var index = RandomInt(0, orderedCities.length - 1);
    var city = orderedCities[index];
    randomCities.push(city);
    orderedCities.splice(index, 1);
  }
  return randomCities;
}

Genome.prototype.TourLength = function() {
  var distance = 0;
  for(var i = 0; i < num_of_cities; i++) {
    var first = i;
    var second = i + 1;

    var firstCity = this.cities[first];
    var secondCity = this.cities[second];


    if(second == num_of_cities) {
      secondCity = this.cities[0];

    }


    distance += CalculateDistance(cityCoordinates[firstCity], cityCoordinates[secondCity]);
  }
  return distance;
}

//TSP CODE ------------------------------------------------------------------------

var TSP = function(mutRate, crossRat, popSize, numCities) {
  this.population = [];
  this.mutationRate = mutRate;
  this.crossoverRate = crossRat;
  this.totalFitness = 0;
  this.shortestRoute = 99999999;
  this.longestRoute = 0;
  this.populationSize = popSize;

  this.chromosomeLength = num_of_cities;

  this.fittestGenome = 0;
  this.fittestPath = [];

  this.generationNumber = 0;
this.distance = 0;
  this.CreateStartingPopulation();

}


TSP.prototype.Mutate = function(chromosome) {
  if(Math.random > this.mutationRate) {
    return chromosome;
  }

  var pos1 = RandomInt(0, chromosome.length-1);
  var pos2 = RandomInt(0, chromosome.length-1);

  while(pos1 == pos2) {
    var pos2 = RandomInt(0, chromosome.length-1);
  }

  var tempCity = chromosome[pos1];
  chromosome[pos1] = chromosome[pos2];
  chromosome[pos2] = tempCity;

  return chromosome;
}

TSP.prototype.Crossover = function(d, m, b1, b2) { //permutation crossover operator
  dad = clone(d);
  mom = clone(m);
  baby1 = clone(b1);
  baby2 = clone(b2);

  if((Math.random() > this.crossoverRate) || (dad == mom)) {
    return [baby1, baby2];
  }

  var beg = RandomInt(0, mom.length-3);

  var end = beg;

  while(end <= beg) {
    end = RandomInt(0, mom.length-2);
  }

  //now we iterate through the matched pairs of genes from beg
  //to end swapping the places in each child

  for(var i = beg; i < end + 1; i++) {
    var gene1 = mom[i];
    var gene2 = dad[i];

    if(gene1 != gene2) {
      //baby1
      var posGene1 = baby1.indexOf(gene1);
      var posGene2 = baby1.indexOf(gene2);

      baby1[posGene1] = gene2;
      baby1[posGene2] = gene1;

      //baby2

      posGene1 = baby2.indexOf(gene1);
      posGene2 = baby2.indexOf(gene2);

      baby2[posGene1] = gene2;
      baby2[posGene2] = gene1;

    }
  }

  return [baby1, baby2];

}

TSP.prototype.CalculatePopulationFitness = function() {
  for(var i = 0; i < this.populationSize; i++) {
    var tourLength = this.population[i].TourLength();
    this.population[i].fitness = tourLength;

    if(tourLength < this.shortestRoute) {
      this.shortestRoute = tourLength;
      this.fittestGenome = i;
      this.fittestPath = this.population[i].cities;
	    this.distance = tourLength;
    }

    if(tourLength > this.longestRoute) {
      this.longestRoute = tourLength;
    }
  }

  for(var i = 0; i < this.populationSize; i++) {
      this.population[i].fitness = this.longestRoute - this.population[i].fitness;
      this.totalFitness += this.population[i].fitness;
  }

}

TSP.prototype.Epoch = function() {
  this.Reset();
  this.CalculatePopulationFitness();


  if(random) {
    if(this.generationNumber == Math.pow(2, num_of_cities)) {
      Background();
      if(random) {
        CreateRandomCities(num_of_cities);
      } else {
        CreateCircularCities(num_of_cities);
      }
      drawRoute(this.fittestPath);
      document.getElementById("gen").innerHTML = "Generation: " + this.generationNumber;
      document.getElementById("path").innerHTML = "Path: " + getPathText(this.fittestPath);
document.getElementById("distance").innerHTML = "Distance: " + Math.round(this.distance) + " miles";
      return;
    }
  } else {
    if(checkNotDone(this.fittestPath) || checkNotDone2(this.fittestPath)) {

    Background();
    if(random) {
      CreateRandomCities(num_of_cities);
    } else {
      CreateCircularCities(num_of_cities);
    }
    drawRoute(this.fittestPath);
    document.getElementById("gen").innerHTML = "Generation: " + this.generationNumber;
    document.getElementById("path").innerHTML = "Path: " + getPathText(this.fittestPath);
document.getElementById("distance").innerHTML = "Distance: " + Math.round(this.distance) + " miles";
    return;
  }
}


  var offSpring = [];

  for(var i = 0; i < 4; i++) {
    offSpring.push(this.population[this.fittestGenome]);
  }


  while(offSpring.length !== this.population.length) {
    var mom = this.RouletteWheel();
    var dad = this.RouletteWheel();

    var baby1 = new Genome();
    var baby2 = new Genome();

    var babyCities = this.Crossover(dad.cities, mom.cities, baby1.cities, baby2.cities);

    baby1.cities = babyCities[0];
    baby2.cities = babyCities[1];

    baby1.cities = this.Mutate(baby1.cities);
    baby2.cities = this.Mutate(baby2.cities);

    offSpring.push(baby1);
    offSpring.push(baby2);
  }

  this.population = offSpring;

  this.generationNumber += 1;

  Background();
  if(random) {
    CreateRandomCities(num_of_cities);
  } else {
    CreateCircularCities(num_of_cities);
  }
  drawRoute(this.fittestPath);
  document.getElementById("gen").innerHTML = "Generation: " + this.generationNumber;
  document.getElementById("path").innerHTML = "Path: " + getPathText(this.fittestPath);
document.getElementById("distance").innerHTML = "Distance: " + Math.round(this.distance) + " miles";
  var scope = this;
  setTimeout(function() { scope.Epoch(); } , 1); //keeps on repeating for 20 milliseconds, recursive

}

TSP.prototype.Reset = function() {
  this.shortestRoute = 99999999;
  this.longestRoute = 0;
  this.fittestGenome = 0;
  this.totalFitness = 0;
  this.fittestPath = [];
	this.distance = 0;
}

TSP.prototype.CreateStartingPopulation = function() {
  for(var i = 0; i < this.populationSize; i++) {
    var G = new Genome();
    this.population.push(G);
  }
}

TSP.prototype.RouletteWheel = function() {
  var slice = Math.random() * this.totalFitness;

  var total = 0;
  var selectedGenome = 0;

  for(var i = 0; i < this.populationSize; i++) {
    total += this.population[i].fitness;
    if(total > slice) {
      selectedGenome = i;
      break;
    }
  }

  return this.population[selectedGenome];

}
