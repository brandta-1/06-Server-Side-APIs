//wrapped in jQuery function, this way it will only run after the page renders
$(function () {

    //load cities from local storage
    var myCities = [];
    var storedCities = JSON.parse(localStorage.getItem("myCities"));
    if (storedCities !== null) {
        myCities = storedCities;
    }

    //initialize API key
    let api_key = '08d3a81b0af6b1118b14bfb1d7a089b5';

    //async geocoding api function returns coordinates given city name
    async function getGeo(cityName) {
        let data = await processURL('https://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=5&appid=' + api_key);
        return [data[0].lat, data[0].lon];
    }

    //convert a fetch's promise into JSON
    async function processURL(url) {
        let response = await fetch(url);
        let data = await response.json();
        return data;
    }

    //I will learn React one day...
    function createModule(city, input, name) {

        let currDiv = $("<div>").addClass(name + "-block");

        currDiv.append([
            $("<h3>").text(city + " " + input.dt_txt),
            $("<img>").attr("src", "https://openweathermap.org/img/wn/" + input.weather[0].icon + "@2x.png"),
            $("<p>").text("Temp: " + input.main.temp),
            $("<p>").text("Wind: " + input.wind.speed + " MPH"),
            $("<p>").text("Humidity: " + input.main.humidity)
        ]);
        $("#container").append(currDiv);
    }

    //on click function
    async function getWeather(event) {
        event.preventDefault();

        //empty any previously rendered elements
        $('#container').empty();

        //initializing cityName variable outside of ternary operator
        let cityName;

        //if the button clicked was the submit button, then cityName comes from the search bar, else cityName comes from the history button
        (event.target.id === "submit") ? cityName = $("#city-search").val() : cityName = $(event.target).text();

        //do not make API calls if the search button was clicked without typing in a city
        if (cityName === "") {
            return;
        }

        //save the current search
        saveSearch(cityName);

        //retrieve coordinate array and then retrieve current and forecast weather
        let latLon = await getGeo(cityName);
        let current = await processURL('https://api.openweathermap.org/data/2.5/weather?units=imperial&lat=' + latLon[0] + '&lon=' + latLon[1] + '&appid=' + api_key);
        let forecast = await processURL('https://api.openweathermap.org/data/2.5/forecast?units=imperial&lat=' + latLon[0] + '&lon=' + latLon[1] + '&appid=' + api_key);

        //give the current weather the "dt_txt" property and set it to a dayjs date. this allows createModule() to work on both current and forecast weather objects
        current.dt_txt = dayjs().format('M/D/YYYY');

        //render the current weather
        createModule(cityName, current, "current");

        //collect forecast information in increments of 24 hours (3 hour increments * 8 indices) 
        forecast = forecast.list.filter((_, i) => {
            return i % 8 === 0;
        });

        //render each forecast weather day
        forecast.forEach((_, i) => {
            createModule(cityName, forecast[i], "forecast");
        });
    }

    //save search function
    function saveSearch(input) {

        //append the search as a button inside of history
        $('#history').append($("<button>").addClass("saved").text(input));

        //keep history from getting too long
        if ($("#history > *").length > 10) {
            $(".saved:first-child").remove();
            myCities.shift();
        }

        //save search into local storage
        myCities.push(input);
        localStorage.setItem("myCities", JSON.stringify(myCities));
    }

    //display cities into history from local storage
    function displayCities() {
        myCities.forEach((_, i) => {
            let thisCity = myCities[i];
            $('#history').append($("<button>").addClass("saved").text(thisCity));
        })
    }

    //render search history, initialize click event listener on all buttons
    displayCities();
    $('body').on('click', 'button', getWeather);
});
