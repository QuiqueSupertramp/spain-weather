let cities = [];

getair(41.38424664, 2.17634927);

let $currentTemp = document.querySelector(".currentTemp"),
  $feelTemp = document.querySelector(".feelTemp"),
  $imgTemp = document.querySelector("#imgTemp"),
  $airText = document.getElementById("airText"),
  $rainText = document.querySelector("#rainText"),
  $windText = document.querySelector("#windText"),
  $maxText = document.querySelector("#maxText"),
  $minText = document.querySelector("#minText"),
  $globalForecast = document.querySelector(".globalForecast"),
  $globalData = document.querySelector(".globalData"),
  search = document.getElementById("search"),
  options = document.querySelector(".options"),
  loading = document.querySelector(".loading"),
  $temp = document.querySelector(".temp"),
  $header = document.getElementById("header");

async function getair(lat, lon) {
  cities = [];

  let airURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=8f14ce81761169772a28881dd299796e&units=metric&lang=es`;
  let weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=8f14ce81761169772a28881dd299796e&units=metric&lang=es`;
  let forecastURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly&appid=8f14ce81761169772a28881dd299796e&lang=es&units=metric`;
  let locationURL = "https://www.el-tiempo.net/api/json/v2/municipios";

  try {
    // Extraer Json de aire, tiempo, previsión y localización
    let airFetch = await fetch(airURL),
      weatherFetch = await fetch(weatherURL),
      forecastFetch = await fetch(forecastURL),
      locationFetch = await fetch(locationURL),
      airJson = await airFetch.json(),
      weatherJson = await weatherFetch.json(),
      forecastJson = await forecastFetch.json(),
      locationJson = await locationFetch.json();

    // Extraer datos y pintarlos en el DOM
    let calidadAire = airJson.list[0].main.aqi,
      currentTemp = Math.round(weatherJson.main.temp),
      feelTemp = Math.round(weatherJson.main.feels_like),
      min = Math.floor(weatherJson.main.temp_min),
      max = Math.round(weatherJson.main.temp_max),
      wind = Math.round(weatherJson.wind.speed * 3.6),
      rain = Math.round(weatherJson.clouds.all),
      imgTemp = `icons/${weatherJson.weather[0].icon}.png`,
      descTemp = weatherJson.weather[0].description;

    switch (calidadAire) {
      case 1:
        calidadAire = "Muy bueno";
        break;
      case 2:
        calidadAire = "Bueno";
        break;
      case 3:
        calidadAire = "Regular";
        break;
      case 4:
        calidadAire = "Malo";
        break;
      case 5:
        calidadAire = "Muy malo";
        break;

      default:
        break;
    }

    loading.classList.add("none");
    $globalData.classList.remove("none");
    $globalForecast.classList.remove("none");
    $temp.classList.remove("none");
    $currentTemp.textContent = `${currentTemp}º`;
    $feelTemp.textContent = `Sensación térmica: ${feelTemp}º`;
    $imgTemp.src = imgTemp;
    $airText.textContent = calidadAire;
    $rainText.textContent = `${rain}%`;
    $windText.textContent = `${wind}km/h`;
    $minText.textContent = `${min}º`;
    $maxText.textContent = `${max}º`;
    $globalForecast.innerHTML = "";

    // Previsión 3 días
    for (let index = 1; index <= 3; index++) {
      const e = forecastJson.daily[index];

      // Obtener datos
      let img = `icons/${e.weather[0].icon}.png`;
      (desc = e.weather[0].description),
        (min = Math.floor(e.temp.min)),
        (max = Math.round(e.temp.max)),
        (milisegundos = e.dt * 1000),
        (date = new Date(milisegundos).toString().split(" ")[0].toUpperCase());

      $globalForecast.innerHTML += `
          <div class="nextDay1">
              <img src="${img}" alt="" />
              <div class="dayForecast">
                <p><b>${date}</b> · <i class="fontSize2">${desc}</i></p>
              </div>
              <div class="minMaxForecast">
                <p>${min}º/${max}º</p>
              </div>
            </div>
          `;
    }

    // Localizaciones
    if ((cities = [])) {
      cities.push(...locationJson);
      console.log(cities);
    }

    if (!airFetch.ok) throw new Error();
  } catch (err) {
    console.log(err);
    $airText.textContent = "-";
  }
}

function findMatches(wordToSearch, cities) {
  return cities.filter((place) => {
    const regex = new RegExp(wordToSearch, "gi");
    return place.NOMBRE.match(regex);
  });
}

document.addEventListener("keyup", (e) => {
  if (e.target === search) {
    if (!search.value) {
      options.innerHTML = "";
    } else {
      options.innerHTML = "";

      let letters = search.value;
      let places = findMatches(letters, cities);

      places.forEach((el) => {
        let li = document.createElement("li");
        options.appendChild(li).innerHTML = `
          <p class="liOptions" data-nombre ="${el.NOMBRE}" data-lat="${el.LATITUD_ETRS89_REGCAN95}" data-lon="${el.LONGITUD_ETRS89_REGCAN95}">${el.NOMBRE} - <span>${el.POBLACION_CAPITAL} hab</span></p>
          `;
      });
    }
  }
});

document.addEventListener("click", (e) => {
  if (e.target.matches(".liOptions")) {
    if (
      e.target.dataset.nombre &&
      e.target.dataset.lat &&
      e.target.dataset.lon
    ) {
      loading.classList.remove("none");
      $globalData.classList.add("none");
      $globalForecast.classList.add("none");
      $temp.classList.add("none");
      search.value = e.target.dataset.nombre;
      options.innerHTML = "";
      getair(e.target.dataset.lat, e.target.dataset.lon);
    } else {
      search.value = "";
      options.innerHTML = "";
    }
  }
  if (
    e.target === $header ||
    e.target === $header.firstElementChild ||
    e.target === search
  ) {
    search.value = "";
    options.innerHTML = "";
  }
});
