window.onload = () => {
  let API_KEY = "6564f991bc2b472f86df38bd7e1e3038";
  let base_url = "https://api.weatherbit.io/v2.0/current";
  let baseForecast = "https://api.weatherbit.io/v2.0/forecast/daily";

  const search_city = document.querySelector(".search_city");
  const search_btn = document.querySelector(".search_btn");
  
  
  search_btn.addEventListener("click", () => search(search_city));
  search_city.addEventListener("keydown", (evt) => {
    if (evt.keyCode == 13) {
      search(search_city);
    } 
  });

  function search(search_city) {
    search_city.value = search_city.value.trim();
    var arr = search_city.value.split(" ");
    if (arr[1])
      getCurrentWeather({ city: arr[0].trim(), country: arr[1].trim() });
    else {
      getCurrentWeather({ city: arr[0].trim() });
    }
    search_city.value = "";
  }

  function displayCurrentWeatherResults(current_weather) {
    current_weather = current_weather.data[0];
    let location = document.querySelector(".location");
    let date = document.querySelector(".date");
    let temperature_value = document.querySelector(".temperature_value");
    let weather_name = document.querySelector(".weather_name");
    getCountryName(current_weather.country_code).then((country) => {
      location.textContent = `${current_weather.city_name}, ${country}`;
    });

    date.textContent = dateBuilder(current_weather.datetime, true);
    temperature_value.textContent = current_weather.temp + "°C";
    weather_name.textContent = current_weather.weather.description;
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = "#1b1b29";

    // if (current_weather.pod == "n") {
    //   document.body.style.background =
    //     ' url("../images/night.webp") no-repeat center center fixed';
    //   document.body.style.backgroundSize = "cover";
    //   document.body.style.color = "black";
    // } else {
    //   document.body.style.background =
    //     ' url("../images/after_noon.webp") no-repeat center center fixed';
    //   document.body.style.backgroundSize = "cover";
    //   document.body.style.color = "white";
    // }
    document.querySelector(".search_box").style.position = "static";
    document.querySelector(".current_weather").style.display = "block";
  }

  function fetchCurrentWeather(url) {
    fetch(url, {
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
    })
      .then((response) => {
        if (response.status == 204) {
          throw new Error(
            "City Not Found , Try to add country as well in search box"
          );
        }
        return response.json();
      })
      .catch((err) => {
        alert(err.message);
        throw err;
      })
      .then(displayCurrentWeatherResults);
  }

  function getCurrentWeather(options) {
    if (options.lat && options.long) {
      fetchCurrentWeather(
        `${base_url}?lat=${options.lat}&lon=${options.long}&key=${API_KEY}`
      );
      fetchForecast(
        `${baseForecast}?lat=${options.lat}&lon=${options.long}&key=${API_KEY}`
      );
    } else if (options.city && options.country) {
      fetchCurrentWeather(
        `${base_url}?city=${options.city}&country=${options.country}&key=${API_KEY}`
      );
      fetchForecast(
        `${baseForecast}?city=${options.city}&country=${options.country}&key=${API_KEY}`
      );
    } else if (options.city) {
      fetchCurrentWeather(`${base_url}?city=${options.city}&key=${API_KEY}`);
      fetchForecast(`${baseForecast}?city=${options.city}&key=${API_KEY}`);
    }
  }

  async function getCountryName(countryCode) {
    let res = await fetch("./countryCode.json");

    let isoCountries = await res.json();

    if (isoCountries[countryCode]) {
      return isoCountries[countryCode];
    } else {
      return countryCode;
    }
  }
  function dateBuilder(datetime, isYear) {
    var months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let dateOfMonth = datetime.substring(8, 10);
    if (dateOfMonth.charAt(0) == "0") {
      dateOfMonth = dateOfMonth.substring(1);
    }
    let month = months[datetime.substring(5, 7) - 1];
    let year = datetime.substring(0, 4);
    if (isYear) return `${dateOfMonth} ${month} ${year}`;
    else return `${dateOfMonth} ${month}`;
  }
  async function fetchForecast(url) {
    let res = await fetch(url, {
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
    });
    let forecast = await res.json();
    displayForecastWeather(forecast);
    let min_temp = [];
    let max_temp = [];
    let temp = [];
    dates = [];
    for (idx = 0; idx <= 7; idx += 1) {
      min_temp.push(forecast.data[idx].min_temp);
      max_temp.push(forecast.data[idx].max_temp);
      temp.push(forecast.data[idx].temp);
      dates.push(dateBuilder(forecast.data[idx].datetime));
    }
    lineChartForecast({
      min_temp: min_temp,
      max_temp: max_temp,
      temp: temp,
      dates: dates,
    });
  }
  function displayForecastWeather(forecast) {
    let range = document.querySelector(".range");
    range.textContent = `Max-${forecast.data[0].max_temp}°C/Min-${forecast.data[0].min_temp}°C`;

    let forecast_cards = document.querySelector(".forecast-container").children;

    let x = 1;

    for (let forecast_card of forecast_cards) {
      forecast_values = forecast_card.children;

      forecast_values[0].style.backgroundImage = `url('./icons/${forecast.data[x].weather.icon}.png')`;
      forecast_values[1].textContent = dateBuilder(forecast.data[x].datetime);
      forecast_values[2].textContent = forecast.data[x].temp + "°C";
      forecast_values[3].textContent = forecast.data[x].weather.description;
      forecast_values[4].textContent = `Max-${forecast.data[x].max_temp}°C/Min-${forecast.data[x].min_temp}°C`;
      x = x + 1;
    }
    document.querySelector(".forecast-container").style.display = "flex";
  }
  function lineChartForecast(data) {
    var ctx = document.querySelector(".line-chart").getContext("2d");
    var chart = new Chart(ctx, {
      // The type of chart we want to create
      type: "line",

      // The data for our dataset
      data: {
        labels: data.dates,
        datasets: [
          {
            label: "Minimum Temperature",
            data: data.min_temp,
            borderColor: "blue",
            lineTension: 0,
            borderWidth: 2,
            backgroundColor: "white",
            pointBackgroundColor: "white",
            pointHoverRadius: 5,
          },
          {
            label: "Maximum Temperature",
            data: data.max_temp,
            borderColor: "red",
            lineTension: 0,
            borderWidth: 2,
            backgroundColor: "white",
            pointBackgroundColor: "white",
            pointHoverRadius: 5,
          },
          {
            label: "Temperature",
            data: data.temp,
            borderColor: "green",
            lineTension: 0,
            borderWidth: 2,
            backgroundColor: "white",
            pointBackgroundColor: "white",
            pointHoverRadius: 5,
          },
        ],
      },

      // Configuration options go here
      options: {
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              type: "category",
              display: true,
              gridLines: {
                z: 1,
              },
            },
          ],
          yAxes: [
            {
              display: true,
              gridLines: {
                z: 1,
              },
            },
          ],
        },
        legend: {
          labels: {
            fontSize: 14,
          },
        },
        title: {
          display: true,
          text: "Forecast",
          fontSize: 18,
        },
      },
    });

    document.querySelector(".forecast-chart").style.display = "block";
  }
};
