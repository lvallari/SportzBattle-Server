var tables = require('./tables');
var common = require('./common');
var conn = require('../db');

function getUserActivityWithCategory(){
    return new Promise(function (resolve, reject) {
        var sql = `SELECT 
        user_activity.*,
        questions.category  
        FROM user_activity 
        RIGHT JOIN questions ON user_activity.question_id=questions.question_id`; 
        conn.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

function getUserStats(user_id){
    
    return new Promise(function (resolve, reject) {
        Promise.all([
            tables.getAll('games'),
            getUserActivityWithCategory(),
            tables.getByField('users','account_type','player')
        ]).then( data => {

            console.log('user_id', user_id);

            var games = data[0];
            var user_activity = data[1];
            var users = data[2];

            var start_of_month_time = common.getFirstDayOfMonthEpoch();
            var today_at_midnight = common.getEpochTimeForTodayAtMidnight();

            

            users.forEach(x => {
                x.games = games.filter(n => {return n.user_id == x.user_id});

                x.number_of_games = x.games.length;
                //get top score
                var top_score_all_time = 0;
                var top_score_month = 0;
                var monthly_points = 0;
                var all_time_points = 0;
                var games_today = 0;
                var points_today = 0;
                var active_this_month = false;
                var active_today = false;
                var high_points_today = 0;

                x.games.forEach(n => {
                    all_time_points += n.score;
                    if (n.score > top_score_all_time) top_score_all_time = n.score;
                    if (n.timestamp > start_of_month_time){
                        active_this_month = true;
                        monthly_points += n.score;
                        if (n.score > top_score_month) top_score_month = n.score;
                    }
                    if (n.timestamp > today_at_midnight){
                        games_today += 1;
                        points_today += n.score;
                        active_today = true;
                        if (n.score > high_points_today) high_points_today = n.score;
                    }
                });

                x.all_time_points = all_time_points;
                x.monthly_points = monthly_points;
                x.top_score_all_time = top_score_all_time;
                x.top_score_month = top_score_month;
                x.points_today = points_today;
                x.games_today = games_today;
                x.active_this_month = active_this_month;
                x.active_today = active_today;
                x.high_points_today = high_points_today;

                x.user_activity = user_activity.filter(n => {return n.user_id == x.user_id});

                var nba_questions = x.user_activity.filter(n => {return n.category == 'NBA'});
                var nfl_questions = x.user_activity.filter(n => {return n.category == 'NFL'});
                var mlb_questions = x.user_activity.filter(n => {return n.category == 'MLB'});
  
                var all_questions = x.user_activity.length;
                var all_correct = x.user_activity.filter(n => {  return n.got_it_right == 1 }).length;
                var all_pct = Math.round(100 * all_correct/all_questions);

                var all_nba = nba_questions.length;
                var nba_correct = nba_questions.filter(n => {return n.got_it_right == 1}).length
                var nba_pct = Math.round(100 * nba_correct/all_nba);

                var all_nfl = nfl_questions.length;
                var nfl_correct = nfl_questions.filter(n => {return n.got_it_right == 1}).length
                var nfl_pct = Math.round(100 * nfl_correct/all_nfl);

                var all_mlb = mlb_questions.length;
                var mlb_correct = mlb_questions.filter(n => {return n.got_it_right == 1}).length
                var mlb_pct = Math.round(100 * mlb_correct/all_mlb);

                x.all_questions = all_questions;
                x.all_correct = all_correct;
                x.all_pct = all_pct;

                x.all_nba = all_nba;
                x.nba_correct = nba_correct;
                x.nba_pct = nba_pct;

                x.all_nfl = all_nfl;
                x.nfl_correct = nfl_correct;
                x.nfl_pct = nfl_pct;

                x.all_mlb = all_mlb;
                x.mlb_correct = mlb_correct;
                x.mlb_pct = mlb_pct;

            });

            //get user record
            var user_record = users.find(x => {return x.user_id == user_id});

            //get daily and monthly users
            var number_users_daily = users.filter(n => {return n.active_today == true}).length;
            var number_users_monthly = users.filter(n => {return n.active_this_month == true}).length;

            //sort by games
            var users_sorted_by_games = users.sort((a,b) => {return b.number_of_games - a.number_of_games});
            user_record.number_of_games_rank = users_sorted_by_games.map(x => {return x.user_id}).indexOf(Number(user_id)) + 1;
            user_record.number_of_games_number_players = users_sorted_by_games.length;

            //sort by games today
            var users_sorted_by_games_today = users.sort((a,b) => {return b.games_today - a.games_today});
            user_record.games_today_rank = users_sorted_by_games_today.map(x => {return x.user_id}).indexOf(Number(user_id)) + 1;
            user_record.games_today_number_players = number_users_daily;

            //sort by top_score
            var users_sorted_by_top_score = users.sort((a,b) => {return b.top_score_all_time - a.top_score_all_time});
            user_record.top_score_all_time_rank = users_sorted_by_top_score.map(x => {return x.user_id}).indexOf(Number(user_id)) + 1;
            user_record.top_score_all_time_number_players = users_sorted_by_top_score.length;

            //sort by top_score month
            var users_sorted_by_top_score_month = users.sort((a,b) => {return b.top_score_month - a.top_score_month});
            user_record.top_score_month_rank = users_sorted_by_top_score_month.map(x => {return x.user_id}).indexOf(Number(user_id)) + 1;
            user_record.top_score_month_number_players = number_users_monthly;

            //sort by all time points
            var users_sorted_by_all_time_points = users.sort((a,b) => {return b.all_time_points - a.all_time_points});
            user_record.all_time_points_rank = users_sorted_by_all_time_points.map(x => {return x.user_id}).indexOf(Number(user_id)) + 1;
            user_record.all_time_points_number_players = users_sorted_by_all_time_points.length;

            //sort by daily points
            var users_sorted_by_points_today = users.sort((a,b) => {return b.high_points_today - a.high_points_today});
            user_record.high_points_today_rank = users_sorted_by_points_today.map(x => {return x.user_id}).indexOf(Number(user_id)) + 1;
            user_record.high_points_today_number_players = number_users_daily;

            //sort by monthly points
            var users_sorted_by_monthly_points = users.sort((a,b) => {return b.monthly_points - a.monthly_points});
            user_record.monthly_points_rank = users_sorted_by_monthly_points.map(x => {return x.user_id}).indexOf(Number(user_id)) + 1;
            user_record.monthly_points_number_players = number_users_monthly;

            //sort_by_all_pct
            var users_sorted_by_all_pct = users.sort((a,b) => {return b.all_pct - a.all_pct});
            user_record.all_pct_rank = users_sorted_by_all_pct.map(x => {return x.user_id}).indexOf(Number(user_id)) + 1;
            user_record.all_pct_number_players = users_sorted_by_all_pct.length;

            //sort_by_nba_pct
            var users_sorted_by_nba_pct = users.sort((a,b) => {return b.nba_pct - a.nba_pct});
            user_record.nba_pct_rank = users_sorted_by_nba_pct.map(x => {return x.user_id}).indexOf(Number(user_id)) + 1;
            user_record.nba_pct_number_players = users_sorted_by_nba_pct.length;

            //sort_by_nfl_pct
            var users_sorted_by_nfl_pct = users.sort((a,b) => {return b.nfl_pct - a.nfl_pct});
            user_record.nfl_pct_rank = users_sorted_by_nfl_pct.map(x => {return x.user_id}).indexOf(Number(user_id)) + 1;
            user_record.nfl_pct_number_players = users_sorted_by_nfl_pct.length;


            //sort_by_mlb_pct
            var users_sorted_by_mlb_pct = users.sort((a,b) => {return b.mlb_pct - a.mlb_pct});
            user_record.mlb_pct_rank = users_sorted_by_mlb_pct.map(x => {return x.user_id}).indexOf(Number(user_id)) + 1;
            user_record.mlb_pct_number_players = users_sorted_by_mlb_pct.length;

            user_record.number_of_games_rank_suffix = common.getOrdinalSuffix(user_record.number_of_games_rank);
            user_record.games_today_rank_suffix = common.getOrdinalSuffix(user_record.games_today_rank);
            user_record.all_time_points_rank_suffix = common.getOrdinalSuffix(user_record.all_time_points_rank);
            user_record.high_points_today_rank_suffix = common.getOrdinalSuffix(user_record.high_points_today_rank);
            user_record.monthly_points_rank_suffix = common.getOrdinalSuffix(user_record.monthly_points_rank);
            user_record.top_score_all_time_rank_suffix = common.getOrdinalSuffix(user_record.top_score_all_time_rank);

            user_record.all_pct_rank_suffix = common.getOrdinalSuffix(user_record.all_pct_rank);
            user_record.nba_pct_rank_suffix = common.getOrdinalSuffix(user_record.nba_pct_rank);
            user_record.nfl_pct_rank_suffix = common.getOrdinalSuffix(user_record.nfl_pct_rank);
            user_record.mlb_pct_rank_suffix = common.getOrdinalSuffix(user_record.mlb_pct_rank);

            delete user_record.games;
            delete user_record.user_activity;

            resolve(user_record);

        }).catch(err => {
            console.log('err', err);
            reject(err);
        })        
    });

}

function getUserStatsForAdmin(){
    
    return new Promise(function (resolve, reject) {
        Promise.all([
            tables.getAll('games'),
            getUserActivityWithCategory(),
            tables.getByField('users','account_type','player'),
            tables.getAll('user_activity')
        ]).then( data => {

            var games = data[0];
            var user_activity = data[1];
            var users = data[2];
            var user_activity = data[3];

            var start_of_month_time = common.getFirstDayOfMonthEpoch();
            var today_at_midnight = common.getEpochTimeForTodayAtMidnight();

            users.forEach(x => {
                x.games = games.filter(n => {return n.user_id == x.user_id});

                x.number_of_games = x.games.length;
                //get top score
                var top_score_all_time = 0;
                var top_score_month = 0;
                var monthly_points = 0;
                var all_time_points = 0;
                var games_today = 0;
                var points_today = 0;
                var active_this_month = false;
                var active_today = false;
                var high_points_today = 0;
                var last_game = 0;

                x.games.forEach(n => {
                    all_time_points += n.score;
                    if (n.score > top_score_all_time) top_score_all_time = n.score;
                    if (n.timestamp > start_of_month_time){
                        active_this_month = true;
                        monthly_points += n.score;
                        if (n.score > top_score_month) top_score_month = n.score;
                    }
                    if (n.timestamp > today_at_midnight){
                        games_today += 1;
                        points_today += n.score;
                        active_today = true;
                        if (n.score > high_points_today) high_points_today = n.score;
                    }
                    if (n.timestamp > last_game) last_game = n.timestamp;
                });

                x.all_time_points = all_time_points;
                x.monthly_points = monthly_points;
                x.top_score_all_time = top_score_all_time;
                x.top_score_month = top_score_month;
                x.points_today = points_today;
                x.games_today = games_today;
                x.active_this_month = active_this_month;
                x.active_today = active_today;
                x.high_points_today = high_points_today;
                x.last_played = last_game ? common.getWhen(last_game):'-';
                x.last_played_timestamp = last_game;

                x.number_of_days_played_in_a_row = daysInARow(x.games);
                var user_activityx = user_activity.filter(n => n.user_id == x.user_id);
                x.longest_streak_questions_in_a_row = getLongestCorrectStreak(user_activityx);
                
                x.user_activity = user_activity.filter(n => {return n.user_id == x.user_id});

                var all_questions = x.user_activity.length;
                var all_correct = x.user_activity.filter(n => {  return n.got_it_right == 1 }).length;
                var all_pct = Math.round(100 * all_correct/all_questions);

                x.all_questions = all_questions;
                x.all_correct = all_correct;
                x.all_pct = all_pct;

            });

            resolve(users);

        }).catch(err => {
            console.log('err', err);
            reject(err);
        })        
    });

}

function getVenueStatsForAdmin(){
    return new Promise(function (resolve, reject) {
        Promise.all([
            tables.getAll('games'),
            tables.getByField('users','account_type','player'),
            tables.getAll('venues'),
            //tables.getAll('user_activity'),
        ]).then( data => {

            var start_of_month_time = common.getFirstDayOfMonthEpoch();
            var today_at_midnight = common.getEpochTimeForTodayAtMidnight();
            
            var games = data[0];
            var users = data[1];
            var venues = data[2];
            //var user_activity = data[3]

            venues.forEach(v => {
                var usersx = users.filter(x => {return x.venue_id == v.venue_id});
                //var users_ids = users.map(x => {return x.user_id});
                var gamesx = games.filter(x => {return x.venue_id == v.venue_id});

                v.number_of_players = usersx.length;
                v.total_games = gamesx.length;
                v.today_games = gamesx.filter(x => {return x.timestamp > today_at_midnight}).length;
                v.monthly_games = gamesx.filter(x => {return x.timestamp > start_of_month_time}).length;

            });

            resolve(venues);
        }).catch(err => {
            console.log('err', err);
            reject(err);
        });

    });
}

function daysInARow(data){
    if (!data.length) return 0;

    // Extract and sort timestamps
    let timestamps = data.map(obj => new Date(obj.timestamp).setHours(0, 0, 0, 0));
    timestamps.sort((a, b) => a - b);
  
    let longestStreak = 1;
    let currentStreak = 1;
  
    for (let i = 1; i < timestamps.length; i++) {
      const diff = (timestamps[i] - timestamps[i - 1]) / (1000 * 60 * 60 * 24);
  
      if (diff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else if (diff > 1) {
        currentStreak = 1;
      }
    }
  
    return longestStreak;
}

function getLongestCorrectStreak(_data) {

    //Make the scope daily
    let date = new Date();
    date.setHours(0, 1, 0, 0);
    let start_of_day = date.getTime();
    let data = _data.filter(x => {return x.timestamp_question > start_of_day});

    let longestStreak = 0;
    let currentStreak = 0;
  
    for (let i = 0; i < data.length; i++) {
      if (data[i].got_it_right === 1) {
        currentStreak++;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    }
  
    return longestStreak;
  }

function getPlayersByDate(date){

    var start_of_date = common.getEpochAtStartOfDay(date);
    var end_of_date = common.getEpochAtEndOfDay(date);

    return new Promise(function (resolve, reject) {
        var sql = `SELECT 
        games.*,
        users.*   
        FROM games 
        RIGHT JOIN users ON users.user_id=games.user_id 
        WHERE games.timestamp BETWEEN ${start_of_date} AND ${end_of_date}`; 
        conn.query(sql, (err, result) => {
            if (err) return reject(err);

            var games = result;
            var players = [];
            games.forEach(x => {
                var record = players.find(n => {return n.user_id == x.user_id});
                if (record) record.games.push(x);
                else {
                    var object = {
                        user_id: x.user_id,
                        username: x.username,
                        email: x.email,
                        image: x.image,
                        games: [x]
                    }
                    players.push(object);
                }
            });

            players.forEach(x => {
                x.number_of_games = x.games.length;
                var max_score = 0;
                x.games.forEach(n => {
                    if (n.score > max_score) max_score = n.score;
                });

                x.max_score = max_score;
            });

            players = players.sort((a,b) => {
                return b.max_score - a.max_score;
            });

            //console.log('result', players);
            resolve(players);
        });
    });
}


module.exports = {
    getUserStats:getUserStats,
    getUserStatsForAdmin:getUserStatsForAdmin,
    getVenueStatsForAdmin:getVenueStatsForAdmin,
    getPlayersByDate:getPlayersByDate
}