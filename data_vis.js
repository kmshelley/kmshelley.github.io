//SVG Width and height
var w = 1000;
var h = 500;
var padding = 20;

//function to display the data visualization
var displayDataByMeal = function(){
	//meal names, colors, etc.
	var meals = ["Breakfast","Lunch","Dinner"];
	var keys = ["carbCal","proteinCal","fatCal"];
	var colors = {"carbCal":"#98abc5", "proteinCal":"#6b486b", "fatCal": "#ff8c00"}
	
	//adds a chart for each meal
	for (i = 0; i < meals.length; i++){
			
		//define sub datasets for charts
		var mealdata = [];
		var calories = [];
		var dates = [];
		for (j = 0; j < dataset.length; j++){
			if (dataset[j].Meal == meals[i]){
				mealdata.push(dataset[j]);
				calories.push(dataset[j].Calories);
				dataset[j].Date = d3.time.format("%m/%d/%Y").parse(dataset[j].Date);
				if (!(dataset[j].Date in dates)){
					dates.push(dataset[j].Date)
				}
			}					
		};
		
		//Data Cleaning: update date fields, add fat calories, protein calories, carb calories
		mealdata.forEach(function(d,i){
			d.Calories = Number(d.Calories);
			d.Fat = Number(d.Fat);
			d.Protein = Number(d.Protein);
			d.Carbs = Number(d.Carbs);
			
			//add variables for calories by fat, carbs, and protein
			d.fatCal = d.Calories * (d.Fat/(d.Fat + d.Protein + d.Carbs));
			d.proteinCal = d.Calories * (d.Protein/(d.Fat + d.Protein + d.Carbs));
			d.carbCal = d.Calories * (d.Carbs/(d.Fat + d.Protein + d.Carbs));
			
			//develop dictionary of subcategory-height pairs for stacked bar chart
			var y0 = 0;
			d.breakdown = keys.map(function(name){return {name: name, y0: y0, y1: y0 += d[name]}});
		});
		
		
		//NOW WE WILL BUILD THE TITLE, LEGEND, AND CHART
		
		//chart title
		d3.select("body")
			.append("h3")
			.text(meals[i]);
		
		
		//chart legend
		//define SVG
		var legend = d3.select("body")
					.append("svg")
					.attr({
						width: 300,
						height: 50,
						});
						
		legend.selectAll("rect")
				.data(keys)
				.enter()
				.append("rect")
				.attr({
					x: function(d,i){return 75*i + 75 ;},
					y: 0,
					height: 20,
					width: 20,
					fill: function(d){return colors[d];}
				});
				
		legend.selectAll("text")
				.data(keys)
				.enter()
				.append("text")
				.attr({
					x: function(d,i){return 75*i + 85;},
					y: 35,
				})
				.attr("text-anchor","middle")
				.text(function(d) {
					if(d == "carbCal"){
						return "Carbs";
					}else if (d == "proteinCal"){
						return "Protein";
					}else if (d == "fatCal"){
						return "Fat";
					}
				});
				
				
		//define SVG for bar chart
		var svg = d3.select("body")
					.append("svg")
					.attr({
						width: w,
						height: h
						});
		
		
		//bar chart scales
		var yScale = d3.scale.linear()
							.domain([
									d3.min([0,d3.min(calories)]),
									d3.max([0,d3.max(calories)])
									])
							.range([h-2*padding,2*padding]);

		var xScale = d3.time.scale()
							.domain([d3.min(dates),d3.max(dates)])
							.range([3*padding,w - 3*padding]);
		
		
		//chart axes
		var xAxis = d3.svg.axis()
						.scale(xScale)
						.orient("bottom")
						.ticks(d3.time.days, 1)
						.tickFormat(d3.time.format('%a'))
						.tickSize(0)
						.tickPadding(8);
						
		var yAxis = d3.svg.axis()
						.scale(yScale)
						.orient("left");
						
		
		
		
		
		
		//add the chart elements
				
		//bar group (will consist of group of rects)
		var bar = svg.selectAll(".bar")
						.data(mealdata)
						.enter()
						.append("g")
						.attr("class", "bar")
						.attr("transform", function(d) { return "translate(" + (xScale(d.Date)-padding) + ",0)"; });
		
		//bind sub-data to svg
		bar.selectAll("rect")
				.data(function(d) { return d.breakdown; })
				.enter()
				.append("rect")
				.attr({
					y: function(d) { return yScale(d.y1); },
					height: function(d) { return yScale(d.y0) - yScale(d.y1); },
					width: 2*padding,
					fill:function(d) { return colors[d.name]; }
				});
		
		svg.append("g")
			.attr("class", "axis") //Assign "axis" css class
			.attr("transform", "translate(0," + (h - 2*padding) + ")")
			.call(xAxis);
		
		svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + 2*padding + ",0)")
			.call(yAxis);
	
	};
	
	
};





//loads the data
var load_data = function(){
	d3.csv("calories.csv",function(data){
		try{
			dataset = data;
			displayDataByMeal();
		}
		catch (err){
			console.log(err);
		}
	});
};

//loads page text
var load_text = function(){
	//Page title and subtitle
	d3.select("body")
		.append("h1")
		.text("W209 Assignment 4")
		.style("font","cambria")
		.style("font-size","24px")
		.style("text-align","center")
		.style("color","rgb(150,150,150)");
		
	d3.select("body")
		.append("h2")
		.text("Katherine Shelley");
		
	//Short description of data visualization
	
	d3.select("body")
		.append("p")
		.text("This chart displays my calorie intake over seven days. The data is broken down by meal; breakfast, lunch, and dinner; and calories from carbohydrates, protein, and fat. ")
		.style("font","cambria")
		.style("font-size","14px")
		.style("text-align","justified")
		.style("color","rgb(130,130,130)");
	
};

var dataset;
load_text();
load_data();
