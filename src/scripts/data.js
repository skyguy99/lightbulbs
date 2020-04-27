 //https://www.imgonline.com.ua/eng/get-dominant-colors.php
//test in terminal: node {filename}


var path = "./images/"; //add after, +.png

//REVAMP

//date_time : [[light types in vicinity not sunlight], energy level]
//10:00AM, 3:00PM, 8:00PM
const data = {
     '01-20-20_3:00PM':[['sunlight', 'led', 'bluelight'], 4.2], //coffee shop
     '01-21-20_8:00PM':[['halogen', 'bluelight', 'white neon'], 3.8],
     '01-22-20_3:00PM':[['sunlight', 'halogen', 'bluelight'], 4.2], //my room
     '01-23-20_9:00AM':[['sunlight','halogen', 'bluelight'], 8.1],
     '01-23-20_4:00PM':[['sunlight','led', 'bluelight'], 7], //ayzenberg
     '01-23-20_8:00PM':[['fluorescent'], 5.4],
     '01-24-20_10:00AM':[['fluorescent', 'sunlight'], 8.7],
     '01-24-20_3:00PM':[['sunlight'], 6.2],
     '01-24-20_9:00PM':[[], 9.5],
     '01-25-20_10:00AM':[['sunlight', 'bluelight', 'halogen'], 7],
     '01-25-20_6:00PM':[['disco ball', 'bluelight'], 5.9],
     '01-26-20_10:00AM':[['sunlight', 'bluelight'], 8.6],
     '01-26-20_3:00PM':[['sunlight', 'bluelight', 'halogen'], 6],
     '01-26-20_9:00PM':[['bluelight', 'halogen'], 6.8],
     '01-27-20_10:00AM':[['bluelight', 'sunlight', 'fluorescent'], 7.8], //class
     '01-27-20_3:00PM':[['bluelight', 'sunlight', 'fluorescent'], 5.9],
     '01-27-20_9:00PM':[['bluelight', 'halogen'], 10],
     '01-28-20_10:00AM':[['bluelight', 'sunlight', 'fluorescent'], 8.5],
     '01-28-20_3:00PM':[['sunlight'], 6],
     '01-28-20_9:00PM':[['bluelight', 'halogen', 'white neon'], 5],
     '01-29-20_9:00AM':[['bluelight', 'sunlight', 'fluorescent'], 7],
     '01-29-20_3:00PM':[['bluelight', 'sunlight', 'fluorescent'], 2.9],
     '01-29-20_9:00PM':[['fluorescent', 'white neon'], 7.9], //grand central market
     '01-30-20_10:00AM':[['bluelight', 'sunlight'], 8.3],
     '01-30-20_3:00PM':[['sunlight','led', 'bluelight'], 2.8],
     '01-30-20_9:00PM':[['halogen', 'bluelight'], 6.8],
     '01-31-20_9:00AM':[['sunlight', 'fluorescent'], 5.2],
     '01-31-20_3:00PM':[['sunlight', 'bluelight'], 4.9],
     '01-31-20_9:00PM':[['fluorescent'], 6.5],
     '02-01-20_11:00AM':[['sunlight'], 8],
     '02-01-20_4:00PM':[['sunlight', 'bluelight', 'halogen'], 6.9],
     '02-01-20_9:00PM':[['halogen'], 8.8],
     '02-02-20_11:00AM':[['sunlight', 'bluelight'], 7.5],
     '02-02-20_3:00PM':[['sunlight', 'bluelight'], 5.5],
     '02-02-20_10:00PM':[['halogen'], 6.1],
     '02-03-20_10:00AM':[['bluelight', 'sunlight', 'fluorescent'], 3.9],
     '02-03-20_3:00PM':[['sunlight'], 1.5],
     '02-03-20_9:00PM':[['halogen', 'bluelight'], 1.5],
     '02-04-20_10:00AM':[['sunlight', 'bluelight'], 8.6],
     '02-04-20_4:00PM':[['sunlight', 'bluelight'], 6.2],
     '02-04-20_9:00PM':[['fluorescent', 'bluelight'], 1.4],
     '02-05-20_10:00AM':[['bluelight', 'sunlight', 'fluorescent'], 5.9],
     '02-05-20_4:00PM':[['bluelight', 'sunlight', 'fluorescent'], 2.9],
     '02-05-20_9:00PM':[['bluelight'], 1.9],
     '02-06-20_10:00AM':[['bluelight', 'sunlight'], 5.6],
     '02-06-20_3:00PM':[['bluelight', 'sunlight'], 4.8],
     '02-06-20_9:00PM':[['bluelight', 'halogen'], 1.9],
     '02-07-20_9:00AM':[['led', 'sunlight'], 7.2],
     '02-07-20_3:00PM':[['sunlight','led', 'bluelight'], 6.8],
     '02-07-20_9:00PM':[['bluelight'], 3.4],
     '02-08-20_11:00AM':[['sunlight'], 7],
     '02-08-20_3:00PM':[['bluelight', 'sunlight'], 6.7],
     '02-08-20_9:00PM':[['bluelight', 'halogen'], 9],
     '02-09-20_10:00AM':[['sunlight'], 5.9],
     '02-09-20_3:00PM':[['bluelight', 'sunlight'], 6.7],
     '02-09-20_9:00PM':[['bluelight', 'halogen'], 9],
     '02-10-20_10:00AM':[['sunlight', 'bluelight'], 8.5],
     '02-10-20_4:00PM':[['bluelight', 'sunlight', 'fluorescent'], 5.9],
     '02-10-20_9:00PM':[['bluelight', 'halogen'], 9],
     '02-11-20_10:00AM':[['sunlight', 'bluelight'], 7.9],
     '02-11-20_4:00PM':[['sunlight'], 7.1],
     '02-11-20_9:00PM':[['bluelight', 'halogen'], 9.2],
     '02-12-20_10:00AM':[['bluelight', 'sunlight', 'fluorescent'], 8.7],
     '02-12-20_3:00PM':[['bluelight', 'sunlight', 'fluorescent'], 6],
     '02-12-20_9:00PM':[['halogen'], 9],
     '02-13-20_10:00AM':[['sunlight'], 8.9],
     '02-13-20_3:00PM':[['sunlight','led', 'bluelight'], 6.6],
     '02-13-20_9:00PM':[['halogen', 'bluelight'], 4.5],
     '02-14-20_10:00AM':[['sunlight', 'fluorescent'], 8],
     '02-14-20_3:00PM':[['bluelight', 'sunlight'], 7.2],
     '02-14-20_9:00PM':[['bluelight', 'halogen'], 4],
     '02-15-20_9:00AM':[['sunlight'], 8.7],
     '02-15-20_3:00PM':[['bluelight'], 2],
     '02-15-20_9:00PM':[['bluelight', 'halogen'], 6],
     '02-16-20_11:00AM':[['sunlight'], 6.5],
     '02-16-20_3:00PM':[['bluelight', 'sunlight'], 7],
     '02-16-20_9:00PM':[['bluelight'], 7],
     '02-17-20_11:00AM':[['sunlight'], 6.9],
     '02-17-20_3:00PM':[['sunlight', 'led', 'bluelight'], 8.2],
     '02-17-20_7:00PM':[['led', 'bluelight'], 9.5],
     '02-18-20_10:00AM':[['bluelight', 'sunlight'], 7.6],
     '02-18-20_4:00PM':[['sunlight','led', 'bluelight'], 4.5],
     '02-18-20_8:00PM':[['halogen'], 7],
     '02-19-20_10:00AM':[['bluelight', 'sunlight', 'fluorescent'], 8],
     '02-19-20_4:00PM':[['bluelight', 'sunlight', 'fluorescent'], 7.4],
     '02-19-20_8:00PM':[['fluorescent'], 7.9],
     '02-20-20_10:00AM':[['bluelight', 'sunlight'], 7.5],
     '02-20-20_4:00PM':[['bluelight', 'sunlight'], 7],
     '02-20-20_9:00PM':[['halogen'], 8.5],
     '02-21-20_10:00AM':[['fluorescent'], 7.5],
     '02-21-20_4:00PM':[['sunlight', 'fluorescent'], 6.9],
     '02-21-20_9:00PM':[['led', 'halogen'], 8.4],
     '02-22-20_11:00AM':[['bluelight', 'sunlight'], 7.8],
     '02-22-20_4:00PM':[['sunlight'], 7.4],
     '02-22-20_9:00PM':[['halogen', 'bluelight'], 3],
     '02-23-20_11:00AM':[['sunlight'], 7.9],
     '02-23-20_4:00PM':[['bluelight', 'sunlight'], 5.6],
     '02-23-20_9:00PM':[['halogen', 'bluelight'], 3.2],
     '02-24-20_10:00AM':[['bluelight', 'sunlight', 'fluorescent'], 7.1],
     '02-24-20_3:00PM':[['sunlight', 'bluelight'], 6],
     '02-24-20_9:00PM':[['halogen', 'bluelight'], 8],
};

// const data = {'t':4, 'y':2};

export {data};

//console.log(imagesDictionary['02-23-20_9:00PM'][1][0]);

//To aggregate:
//1) Individual visual- each light source gets a 0-10 intensity based on mood (not there = 0)
//2) Aggregate visual - each light gets intensity = [(sum of all moods where not in array = 0)/ (length of list*10)]
