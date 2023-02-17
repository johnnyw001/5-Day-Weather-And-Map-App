
"use strict";

///////////MAPBOX_JS///////////////

//Creates the map
const myToken = keys.mapbox;
const openWeather = keys.openWeather;

const map = new mapboxgl.Map({
  accessToken: myToken,
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: [-98.4916, 29.4260], // starting position [lng, lat]
  zoom: 4, // starting zoom
});


// Adds zoom and rotation controls to the map.
const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'bottom-right');

//Adds a toggle to allow for full screen zoom
const fullscreen = new mapboxgl.FullscreenControl({ container: document.querySelector('body') })
map.addControl(fullscreen, 'bottom-left');

// Adds a geocoder search bar to the map to make it a functional search map
map.addControl(
  new MapboxGeocoder({
    accessToken: myToken,
    mapboxgl: mapboxgl
  })
);

//Populates a draggable maker for the user to place on the map
const marker = new mapboxgl.Marker({ draggable: true })
  .setLngLat([-98.4916, 29.4260])
  .addTo(map);



//Gets the lat and lng coordinates from where the marker is placed and grabs the 5-day forecast information for the user
function onDragEnd() {
  const lngLat = marker.getLngLat();
  console.log(lngLat);

  $('#user-location').empty();
  event.preventDefault();

  $.get('https://api.openweathermap.org/data/2.5/forecast', {
    lat: lngLat.lat,
    lon: lngLat.lng,
    appid: openWeather,
    units: 'imperial'
  }).done(function (data) {
    $(data).each(function (index, data) {
      addData(data);
      currentWeather(data);
    });
  }).fail(function (jqXhr, status, error) {
    console.log(jqXhr);
    console.log(status);
    console.log(error);
  });
}

marker.on('dragend', onDragEnd);


////////Weather_Map JS////////


//Creates the single current weather card
// function currentWeather(data) {
//   const iconUrl = `https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png`;
//   const d = new Date(data.list[0].dt_txt);
//   const day = d.toLocaleDateString();
//   let currentHtml = '';
//   currentHtml = `
//                   <div class="col-lg-3 col-md-6 col-sm-12">
//                     <div class="card">
//                      <h1 class="date">${day}</h1>
//                       <h1 class="city-name">${data.city.name},${data.city.country}</h1>
//                       <h3 class="currently">Currently</h3>
//                       <div class="city-temp">${data.list[0].main.temp}<sup>°F</sup></div>
//                       <h3 class="lows-highs">
//                          <figure class="fig-custom">
//                            <img class="city-icon" src="${iconUrl}" alt="${data.list[0].weather[0].description}">
//                           <figcaption class="icon-caption">${data.list[0].weather[0].description}</figcaption>
//                           </figure>
//                       </h3>
//                   </div>
//                 </div>`;
//   $('#current').append(currentHtml);
// }

//Creates the individual cards that contain the 5-day weather forecast
function addData(data) {
  console.log(data);
  let html = " ";
  for (let i = 0; i < data.list.length; i += 8) {

    // console.log(data)
    const iconUrl = `https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}@2x.png`;
    const d = new Date(data.list[i].dt_txt);
    const day = d.toLocaleDateString();

    html = `<div class="col-lg col-md-6 col-sm-12">
                <div class="card">
                  <div class="date">${day}</div>
                  <div class="city-name">${data.city.name},${data.city.country}</div>
                  <h3 class="lows-highs">
                   <figure>
                     <img class="city-icon" src="${iconUrl}" alt="${data.list[i].weather[0].description}">
                     <figcaption class="icon-caption">${data.list[i].weather[0].description}</figcaption>
                   <p class="data-category data-value">High / ${data.list[i].main.temp_max}<sup>°F</sup></p>
                   <p class="data-category data-value">Low / ${data.list[i].main.temp_min}<sup>°F</sup></p>
                  </h3>
                </div>
             </div>`;
    $('#user-location').append(html);
  }
}

// Allows the user to search for a city in the search bar and populates the 5-day forecast upon pressing the submit button
const form = document.querySelector(".top form");
const input = document.querySelector(".user-search");
const btn = document.querySelector('.submit-btn')
const msg = document.querySelector(".top .msg");
const list = document.querySelector(".card .cities");

function getSearchData(e) {
  e.preventDefault();

  //This will clear the DOM of the cards from the previous search request.
  $('#user-location').empty();

  const inputVal = input.value;

  $.get('https://api.openweathermap.org/data/2.5/forecast', {
    q: inputVal,
    state: inputVal,
    appid: openWeather,
    units: 'imperial'
  }).done(function (data) {
    $(data).each(function (index, data) {
      addData(data);
      // currentWeather(data);

      //Moves the map marker to the location that the user searched for
      geocode(inputVal, myToken).then(function (data) {
        // console.log(data);
        map.setZoom(13);
        map.flyTo({
          center: [data[0], data[1]],
          essential: true // this animation is considered essential with respect to prefers-reduced-motion
        });

      })

    });
  }).fail(function (jqXhr, status, error) {
    msg.textContent = "***Please enter a valid city name, city name with first 3 digits of the state name seperated with a comma, or city name with two-letter country code***";
    console.log(jqXhr);
    console.log(status);
    console.log(error);
  });
  msg.textContent = "";
  form.reset();
  input.focus();

}
$('.submit-btn').on("click", getSearchData);





