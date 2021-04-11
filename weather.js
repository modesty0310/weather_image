// weather.js

//css element
const now_temp = document.querySelector("#js-now_temp");
const now_feels_temp = document.querySelector("#js-now_feels_temp");
const now_wind_speed = document.querySelector("#js-now_wind_speed");
const now_wind_deg = document.querySelector("#js-now_wind_deg");
const now_clouds = document.querySelector("#js-now_clouds");
const now_visiblity = document.querySelector("#js-now_visiblity");
const now_uvi = document.querySelector("#js-now_uvi");
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

            //현재 ---------------------------------------------------------------------------
            const n_temperature = json.current.temp + "°C"; //현재 온도

            //현재 시간
            const now_time = json.current.dt; //유닉스시간
            //유닉스 시간을 변경하기
            const n_date = new Date(now_time * 1000);
            const n_time = n_date.toLocaleTimeString();

            const n_feels_like = json.current.feels_like + "°C";

            //날씨
            let imgIcon = "http://openweathermap.org/img/wn/" + json.current.weather[0].icon + "@2x.png"; // json으로 받아온 날씨(json.current.weather[0].icon)에 맞는 아이콘 요청해서 받음
            now_icon.setAttribute("src", imgIcon); //img태그 src 속성에 받아온 imgIcon 추가

            //풍속 current.wind_speed
            const n_wind_speed = json.current.wind_speed;
            //풍향 current.wind_deg
            const n_wind_deg = json.current.wind_deg;
            //구름 비율 current.clouds
            const n_clouds = json.current.clouds;
            //가시 거리 current.visibility
            const n_visiblity = json.current.visibility;
            //uv지수 current.uvi
            const n_uvi = json.current.uvi;

            now_temp.innerText = `현재 온도: ${n_temperature}`;
            now_feels_temp.innerText = `체감 온도: ${n_feels_like}`;
            now_wind_speed.innerText = `풍속: ${n_wind_speed}m/s`;
            now_wind_deg.innerText = `풍향: ${n_wind_deg}° `;
            now_clouds.innerText = `구름 비율: ${n_clouds}%`;
            now_visiblity.innerText = `가시 거리: ${n_visiblity}m`;
            now_uvi.innerText = `UV지수: ${n_uvi}\r`;

            //------------------------------------------------------------------------------------
            const table = document.getElementById('weather_forecast2');

            for (i = 0; i < 10; i++) {

                const newRow = table.insertRow(i);

                //시간 예측 ---------------------------------------------------------------------------
                const forecast_hour = newRow.insertCell(0);
                //날씨 아이콘
                const forecast_icon = newRow.insertCell(1);
                //현재 온도
                const forecast_temp = newRow.insertCell(2);
                //체감 온도
                const forecast_feels = newRow.insertCell(3);
                //풍속
                const forecast_w_speed = newRow.insertCell(4);
                //풍향
                const forecast_w_deg = newRow.insertCell(5);
                //구름비율
                const forecast_clouds = newRow.insertCell(6);
                //강수확률
                const forecast_pop = newRow.insertCell(7);
                //가시거리
                const forecast_visibility = newRow.insertCell(8);
                //UV 지수
                const forecast_uvi = newRow.insertCell(9);

                const h_date = new Date(json.hourly[i].dt * 1000);
                const h_time = h_date.getHours(); //hour만 가져오기
                forecast_hour.innerText += `${h_time}시\n`;

                var img = document.createElement('img'); //이미지 객체 생성
                img.src = "http://openweathermap.org/img/wn/" + json.hourly[i].weather[0].icon + "@2x.png";

                img.style = "width:50px; height:50px;"
                forecast_icon.appendChild(img);

                //테이블 행 추가하기

                const f_temp = json.hourly[i].temp;
                forecast_temp.innerText = `${f_temp}°C\n`;

                const f_feels = json.hourly[i].feels_like;
                forecast_feels.innerText = `${f_feels}°C\n`;

                const f_w_speed = json.hourly[i].wind_speed;
                forecast_w_speed.innerText = `${f_w_speed}m/s\n`;

                const f_w_deg = json.hourly[i].wind_deg;
                forecast_w_deg.innerText = `${f_w_deg}°\n`;

                const f_clouds = json.hourly[i].clouds;
                forecast_clouds.innerText = `${f_clouds}%\n`;

                const f_pop = json.hourly[i].pop;
                forecast_pop.innerText = `${f_pop}%\n`;

                const f_visibility = json.hourly[i].visibility;
                forecast_visibility.innerText = `${f_visibility}m\n`;

                const f_uvi = json.hourly[i].uvi;
                forecast_uvi.innerText = `${f_uvi}\n`;
            }

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