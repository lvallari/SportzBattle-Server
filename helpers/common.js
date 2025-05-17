const { DateTime } = require('luxon');

function generateVerificationCode(){
    var chars = '123456789';
    var token = '';
    for (var i=0; i < 6; i++){
      token += chars.charAt(Math.round(Math.random()*(chars.length-1)));
    }
    return token;
}

function generateResetToken(){
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var token = '';
    for (var i=0; i < 16; i++){
      token += chars.charAt(Math.round(Math.random()*(chars.length-1)));
    }
    return token;
}

function generateMessageToken(){
    var chars = 'abcdefghijklmnopqrstuvwxyz';
    var token = '';
    for (var i=0; i < 4; i++){
      token += chars.charAt(Math.round(Math.random()*(chars.length-1)));
    }
    return token;
}

function calculateDistance(reference_point, listing){
    //Calculate distances to user
    //var p = 0.017453292519943295;    // Math.PI / 180
    //var c = Math.cos;
    var earthRadiusMiles = 3959;
    var a = 0;
    var lat_o = Number(reference_point.lat);
    var lng_o = Number(reference_point.lng);
    var lat = 0;
    var lng = 0;
    //var dist_mi = 0;
    //var myObj = {};

    //for (var i = 0; i < $rootScope.answers.length; i++) {
        //if ($rootScope.answers[i].type == 'Establishment') {
            //if ($rootScope.answers[i].location != undefined &&
            //    $rootScope.answers[i].location != '') {
                    
                //console.log($rootScope.answers[i].name," - ",$rootScope.answers[i].location);

                lat = Number(listing.location_lat);
                lng = Number(listing.location_lng);

                var delta_lat = lat_o - lat;
                var delta_lng = lng_o - lng;

                //console.log(lat_o, lng_o, lat, lng);
                //myObj = $rootScope.answers[i];
                //a = 0.5 - c((lat - lat_o) * p) / 2 + c(lat_o * p) * c(lat * p) * (1 - c((lng - lng_o) * p)) / 2;

                var a = Math.sin(delta_lat/2) * Math.sin(delta_lat/2) +
                  Math.sin(delta_lng/2) * Math.sin(delta_lng/2) * Math.cos(lat) * Math.cos(lat_o); 
                
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
                listing.dist = earthRadiusMiles * c;


                //dist_mi = (12742 * Math.asin(Math.sqrt(a))) / 1.609; // 2 * R; R = 6371 km
                //listing.dist = dist_mi;
                
                //if (dist_mi > 100 || dist_mi == NaN) {
                    //console.log('Answer Id. ',myObj.id,' Name: ',myObj.name);
                //    vm.answerdist.push(myObj);
                //}
            //}
        //}
    //}
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function crypt(salt, text){
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
  const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);

  return text
    .split("")
    .map(textToChars)
    .map(applySaltToChar)
    .map(byteHex)
    .join("");
};

function decrypt(salt, encoded){
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
  return encoded
    .match(/.{1,2}/g)
    .map((hex) => parseInt(hex, 16))
    .map(applySaltToChar)
    .map((charCode) => String.fromCharCode(charCode))
    .join("");
};

function getFirstDayOfMonthEpoch() {
  // Get the current date
  const currentDate = new Date();
  
  // Set the date to the first day of the current month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  // Convert the date to epoch time (milliseconds since January 1, 1970)
  const epochTime = firstDayOfMonth.getTime();
  
  // Return the epoch time
  return epochTime;
}

function getEpochTimeForTodayAtMidnight() {
  // Create a new Date object for today's date
  const now = new Date();
  
  // Set the time to 12:01 AM
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 1, 0, 0);
  
  // Return the epoch time
  return midnight.getTime();
}

function getOrdinalSuffix(number) {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = number % 100;
  return number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}

function getWhen(timestamp){
  //This function calculates difference between current time and elapsedTime and returns humanized string
  var cT = Date.now();
  var dT = cT - timestamp;

  var dTmin = Math.floor(dT/60000); //delta time minutes

  //console.log('cT', cT);
  //console.log('delta', dTmin);
  
  //if within a minute, show 'just now'
  if (dTmin < 1) return 'just now';
  else if (dTmin < 60) return dTmin + ' mins ago';
  else {
    var dThr = Math.floor(dT/3600000); //delta time hrs
    if (dThr == 1) return '1 hr ago';
    else if (dThr < 24) return dThr + ' hrs ago';
    else {
      var dTday = Math.floor(dT/86400000); //delta time days
      if (dTday == 1) return '1 day ago';
      else if (dTday < 30) return dTday + ' days ago';
      else {
        var dTmonth = Math.floor(dT/2592000000); //delta time months
        if (dTmonth == 1) return '1 month ago';
        else if (dTmonth < 12) return dTmonth + ' months ago';
        else{
          var dTyear = Math.floor(dT/31104000000); //delta time years
          if (dTyear == 1) return '1 year ago';
          else return dTyear + ' years ago';
        }
      }
    
    }
  }
}

function getEpochAtStartOfDay(dateString) {
  // Create a Date object from the input date string
  let date = new Date(dateString);

  // Set the hours, minutes, seconds, and milliseconds to 12:01 AM
  date.setHours(0, 1, 0, 0);

  // Get the epoch time (milliseconds since January 1, 1970)
  let epochTime = date.getTime();

  return epochTime;
}

function getEpochAtEndOfDay(dateString) {
  // Create a Date object from the input date string
  let date = new Date(dateString);

  // Set the hours, minutes, seconds, and milliseconds to 11:59 PM
  date.setHours(23, 59, 0, 0);

  // Get the epoch time (milliseconds since January 1, 1970)
  let epochTime = date.getTime();

  return epochTime;
}


function getYesterdayDateString() {
  // Get today's date
  const today = new Date();
  
  // Subtract one day
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Format the date components
  const mm = String(yesterday.getMonth() + 1).padStart(2, '0'); // Month is 0-based
  const dd = String(yesterday.getDate()).padStart(2, '0');
  const yyyy = yesterday.getFullYear();

  // Return the formatted date string
  return `${mm}-${dd}-${yyyy}`;
}

function getLastThreeDays() {
  // Helper function to format a date as mm-dd-yyyy
  function formatDate(date) {
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  }

  // Get today's date
  const today = new Date();
  
  // Generate the array of date strings
  const dates = [];
  for (let i = 1; i <= 3; i++) {
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - i); // Subtract days
    dates.push(formatDate(pastDate));
  }

  return dates;
}

function getTomorrowMidnightTimestamp() {
  const nowET = DateTime.now().setZone('America/New_York');
  const tomorrowET = nowET.plus({ days: 1 }).endOf('day');
  return tomorrowET.toMillis();
}

function assignLevel(user, levels) {

    //find correct level
    var skill_level;
    for (var i = 0; i < levels.length; i++) {
      if (user.all_time_points) {
        if (user.all_time_points >= levels[i].points) {
          skill_level = levels[i];
          break;
        }
      }
      else {
        if (user.points >= levels[i].points) {
          skill_level = levels[i];
          break;
        }
      }
    }

    //var skill_level = levels[0];
    if (skill_level) {
      user.level = skill_level.level;
      user.level_icon = skill_level.icon;
    }

}

function getReadableTimeUntilExpiration(expirationTimestamp) {
  const now = Date.now();
  const deltaMs = expirationTimestamp - now;

  if (deltaMs <= 0) {
    return "Expired";
  }

  const deltaMinutes = deltaMs / (1000 * 60);

  if (deltaMinutes >= 60) {
    const hours = Math.floor(deltaMinutes / 60);
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  } else {
    const minutes = Math.round(deltaMinutes);
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
}


module.exports = {
    generateVerificationCode:generateVerificationCode,
    generateResetToken: generateResetToken,
    calculateDistance: calculateDistance,
    generateMessageToken:generateMessageToken, 
    shuffle:shuffle,
    crypt: crypt,
    decrypt: decrypt,
    getFirstDayOfMonthEpoch:getFirstDayOfMonthEpoch,
    getOrdinalSuffix: getOrdinalSuffix,
    getEpochTimeForTodayAtMidnight:getEpochTimeForTodayAtMidnight,
    getWhen:getWhen,
    getEpochAtStartOfDay: getEpochAtStartOfDay,
    getEpochAtEndOfDay: getEpochAtEndOfDay,
    getYesterdayDateString:getYesterdayDateString,
    getLastThreeDays:getLastThreeDays,
    getTomorrowMidnightTimestamp:getTomorrowMidnightTimestamp,
    assignLevel:assignLevel,
    getReadableTimeUntilExpiration:getReadableTimeUntilExpiration
}