let f_tempArray = new Array();
let temp_json = [];

//css element
const dayName = document.querySelector(".date-dayname");
const dayDate = document.querySelector(".date-day");
const location1 = document.querySelector(".location");
const weatherTemp = document.querySelector(".weather-temp");
const weatherText = document.querySelector(".weather-desc");

//이후 날씨 옷과 비교하기 위해 값을 담을 배열 객체 선언 ------------------------------------------
let f_hourArray = new Array();
let f_tempArray = new Array();
let f_pop       = new Array();
let f_icon_des = new Array();
let rain_time = "";




const week = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');

//낮 밤 d,n으로 나눠줘야함
const iconArray = {
     '01n' : 'fas fa-sun',
     '02n' : 'fas fa-cloud-sun',
     '03n' : 'fas fa-cloud',
     '04n' : 'fas fa-cloud-meatball',
     '09n' : 'fas fa-cloud-sun-rain',
     '10n' : 'fas fa-cloud-showers-heavy',
     '11n' : 'fas fa-poo-storm',
     '13n' : 'fas fa-snowflake',
     '50n' : 'fas fa-smog',
     '01d' : 'fas fa-sun',
     '02d' : 'fas fa cloud-sun',
     '03d' : 'fas fa-cloud',
     '04d' : 'fas fa-cloud-meatball',
     '09d' : 'fas fa-cloud-sun-rain',
     '10d' : 'fas fa-cloud-showers-heavy',
     '11d' : 'fas fa-foo-storm',
     '13d' : 'fas fa-snowflake',
     '50d' : 'fas fa-smog', 
}

const now_icon = document.getElementById("js-now_icon"); //img태그 id값으로 가져오기

//api info
const API_KEY = "aeae9bf7b6bd6b5edca5f11badfa8b31";
const COORDS = "coords";
const units = "metric";

function getWeather(lat, lng) {
    fetch(
            `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&units=${units}&appid=${API_KEY}`
        )
        .then(function(response) { // .then = fetch가 완료 된 후 실행됨
            return response.json(); // json형태로 변환
        })
        .then(function(json) {
            console.log(json)

            let date = new Date(); 
            let year = date.getFullYear(); 
            let month = new String(date.getMonth()+1); 
            let day = new String(date.getDate());
            let dayIndex = date.getDay();
            let weekText = week[dayIndex];

            const description = json.current.weather[0].description;
            const icon = json.current.weather[0].icon;


            //현재 ---------------------------------------------------------------------------
            const n_temperature = json.current.temp + "°C"; //현재 온도
            temp_json = json.current.temp

            //현재 시간
            const now_time = json.current.dt; //유닉스시간
            //유닉스 시간을 변경하기
            const n_date = new Date(now_time * 1000);
            const n_time = n_date.toLocaleTimeString();
            const N_Hour = n_date.getHours();

            const n_feels_like = json.current.feels_like + "°C";

            //날씨
            let imgIcon = "http://openweathermap.org/img/wn/" + json.current.weather[0].icon + "@2x.png"; // json으로 받아온 날씨(json.current.weather[0].icon)에 맞는 아이콘 요청해서 받음
            now_icon.setAttribute("src", imgIcon); //img태그 src 속성에 받아온 imgIcon 추가


            let iconStr = icon.substr(0,3);
            $('.weather-container').prepend('<i class="' + iconArray[iconStr] + ' fa-5x"></i>')


            dayDate.innerText = year+" / "+month+ " / " + day;
            dayName.innerText = weekText;
            weatherTemp.innerText = n_temperature;
            weatherText.innerText = description;



            //------------------------------------------------------------------------------------
            const table = document.getElementById('table table-hover');
            const Daily_Temperature_Different=document.getElementById("logic_clothes_select");

            for (i = 0; i < 8; i++) {

                const newRow = table.insertRow(i);

                //시간 예측 ---------------------------------------------------------------------------
                const forecast_hour = newRow.insertCell(0);
                //날씨 아이콘
                const forecast_icon = newRow.insertCell(1);
                //현재 온도
                const forecast_temp = newRow.insertCell(2);
                //풍속
                const forecast_w_speed = newRow.insertCell(3);
                //강수확률
                const forecast_pop = newRow.insertCell(4);

                //날씨 아이콘 description 가져오기
                f_icon_des[i] = json.hourly[i].weather[0].description;


                const h_date = new Date(json.hourly[i].dt * 1000);
                const h_time = h_date.getHours(); //hour만 가져오기
                forecast_hour.innerText += `${h_time}시\n`;
                f_hourArray[i] = h_time;

                var img = document.createElement('img'); //이미지 객체 생성
                img.src = "http://openweathermap.org/img/wn/" + json.hourly[i].weather[0].icon + "@2x.png";

                img.style = "width:50px; height:50px;"
                forecast_icon.appendChild(img);

                //테이블 행 추가하기



                const f_temp = json.hourly[i].temp;
                forecast_temp.innerText = `${f_temp}°C\n`;
                f_tempArray[i]  = f_temp;

                const f_w_speed = json.hourly[i].wind_speed;
                forecast_w_speed.innerText = `${f_w_speed}m/s\n`;

                const f_pop = json.hourly[i].pop;
                forecast_pop.innerText = `${f_pop}%\n`;
                const Daily_cloud =document.getElementById("logic_rain_cloud");
                const outside_action=document.getElementById("logic_action");

                if(f_icon_des[i]=="light rain"||f_icon_des[i]=="moderate rain"||f_icon_des[i]=="heavy intensity rain"||f_icon_des[i]=="very heavy rain" ||f_icon_des[i]=="extreme rain"||f_icon_des[i]=="freezing rain"||f_icon_des[i]=="light intensity shower rain"||f_icon_des[i]=="shower rain"||f_icon_des[i]=="heavy intensity shower rain"||f_icon_des[i]=="ragged shower rain")
                {   
                    if(f_icon_des[i].indexOf("rain") != -1){
                        rain_time = f_hourArray[i];
                    }
                    // console.log(f_icon_des[i].indexOf("clouds"))
                    // rain_time=f_hourArray[f_icon_des[i].indexOf("clouds")];
                    var rain_time_calcural=rain_time-N_Hour;
                    if(rain_time_calcural>0){
                        console.log(rain_time_calcural+"시 후에 비가 올 예정이니 우산을 챙기세요");
                        Daily_cloud.innerText =  `${rain_time_calcural}시 후에 금일 비가 올 예정이니 우산을 챙기세요.`;
                    }
                }
                else if(f_icon_des[i]=="light snow"||f_icon_des[i]=="Snow"||f_icon_des[i]=="Heavy snow"||f_icon_des[i]=="Sleet" ||f_icon_des[i]=="Light shower sleet"||f_icon_des[i]=="Shower sleet"||f_icon_des[i]=="Light rain and snow"||f_icon_des[i]=="Rain and snow"||f_icon_des[i]=="Light shower snow"||f_icon_des[i]=="Shower snow"||f_icon_des[i]=="Heavy shower snow")
                {   
                    if(f_icon_des[i].indexOf("snow") != -1){
                        rain_time = f_hourArray[i];
                    }
                    var rain_time_calcural=rain_time-N_Hour;
                    if(rain_time_calcural>0){
                        console.log(rain_time_calcural+"시 후에 비가 올 예정이니 우산을 챙기세요");
                        Daily_cloud.innerText =  `"${rain_time_calcural}시 후에 금일 비가 올 예정이니 우산을 챙기세요."`;
                }
                else{
                    //console.log(N_Temp);
                    //현재 날씨 야외활동 여부
                    if(N_Temp<=25 && N_Temp>=21)
                    {
    
                        outside_action.innerText="현재 야외활동하기 좋은 날씨입니다."
                    }
                }
            }
            let max_temp = Math.max.apply(null, f_tempArray);
            let min_temp = Math.min.apply(null, f_tempArray);
            if(max_temp-min_temp>=10)
            {
                Daily_Temperature_Different.innerText="오늘 일교차가 크니 겉옷을 챙기세요.";
            }else{
                Daily_Temperature_Different.innerText="오늘 일교차는 크지 않아요."
            }    
            }
            //비 오는 시간 체크
           

    });

}

function saveCoords(coordsObj) { // localStorage에 저장
    localStorage.setItem(COORDS, JSON.stringify(coordsObj));
}

function handleGeoSucces(position) { // 요청 수락
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const coordsObj = {
        latitude,
        longitude,
    };
    saveCoords(coordsObj); // localStorage에 저장 함수
}

function handleGeoError() { // 요청 거절
    console.log("Not allowed.");
}

function askForCoords() { // 사용자 위치 요청 (요청 수락, 요청 거절)
    navigator.geolocation.getCurrentPosition(handleGeoSucces, handleGeoError);
}

function loadCoords() {
    const loadedCoords = localStorage.getItem(COORDS); // localStorage에서 위치정보 가져옴
    if (loadedCoords === null) { // 위치 정보가 없으면
        askForCoords(); // 위치 정보 요청 함수
    } else {
        const parseCoords = JSON.parse(loadedCoords); // json형식을 객체 타입으로 바꿔서 저장
        getWeather(parseCoords.latitude, parseCoords.longitude); // 날씨 요청 함수
    }
}

function init() {
    loadCoords();
}

init();
