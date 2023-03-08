$(function () {

    var myCities = [];
    
    var storedCities = JSON.parse(localStorage.getItem("myCities"));
    
    if (storedCities !== null) {
        myCities = storedCities;
    }
    
    
    console.log(storedCities);
    console.log(myCities);

    let api_key = '08d3a81b0af6b1118b14bfb1d7a089b5';

    async function getGeo(cityName) {

        console.log(cityName);

        let data = await processURL('https://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=5&appid=' + api_key);
        return [data[0].lat, data[0].lon, data[0].name];
    }

    async function processURL(url) {
        let response = await fetch(url);
        let data = await response.json();
        console.log(data);
        return data;
    }

    function createModule(input, name) {

        let currDiv = $("<div>").addClass(name + "-block");

        currDiv.append([
            $("<h3>").text(input.dt_txt),
            $("<img>").attr("src", "https://openweathermap.org/img/wn/" + input.weather[0].icon + "@2x.png"),
            $("<p>").text("Temp: " + input.main.temp),
            $("<p>").text("Wind: " + input.wind.speed + " MPH"),
            $("<p>").text("Humidity: " + input.main.humidity)
        ]);
        $("#container").append(currDiv);
    }

    async function getWeather(event) {
        event.preventDefault();
        $('#container').empty();

        let cityName;

        (event.target.id === "submit") ? cityName = $("#city-search").val() : cityName = $(event.target).text();

        if (cityName === "") {
            return;
        }

        saveSearch(cityName);

        console.log(cityName);
        
        
        let latLon = await getGeo(cityName);
        let current = await processURL('https://api.openweathermap.org/data/2.5/weather?units=imperial&lat=' + latLon[0] + '&lon=' + latLon[1] + '&appid=' + api_key);
        let forecast = await processURL('https://api.openweathermap.org/data/2.5/forecast?units=imperial&lat=' + latLon[0] + '&lon=' + latLon[1] + '&appid=' + api_key);

        current.dt_txt = dayjs().format('M/D/YYYY');
        createModule(current, "current");

        forecast = forecast.list.filter((_, i) => {
            return i % 8 === 0;
        });

        forecast.forEach((_, i) => {
            createModule(forecast[i], "forecast");
        });
        
    }

    function saveSearch(input) {
        console.log(myCities);
        $('#history').append($("<button>").addClass("saved").text(input));
        
        myCities.push(input);
        localStorage.setItem("myCities", JSON.stringify(myCities));
    }

   

    
    function displayCities() {
        myCities.forEach((_, i) => {
            let thisT = myCities[i];
            $('#history').append($("<button>").addClass("saved").text(thisT));
        })
    }

    displayCities();
    $('body').on('click', 'button', getWeather);


});
