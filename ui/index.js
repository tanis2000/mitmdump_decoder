var map = L.map('map');

L.tileLayer.provider('OpenStreetMap.Mapnik', {retina: true}).addTo(map);
//Add UI controls to toggle later
//L.tileLayer.provider('Watercolor').addTo(map);

var filters = document.getElementById('filters');
filters.onclick = function() {
  realtime.update();
  player.update();
};
var realtime = L.realtime({url: 'get_map_objects.json', type: 'json'}, {
  interval: 10 * 1000,
  style: function(feature) { return feature.properties; },
  pointToLayer: simplestyle,

  filter: applyFilter,
  onEachFeature: function (feature, layer) {
    layer.bindPopup(feature.properties.title);
  }
}).addTo(map);

var loaded = false;
realtime.on('update', function(updateEvent) {
  if(!loaded){ // && updateEvent.features.length > 0) {
    loaded = true;
    //Set the view after the first load
    map.fitBounds(realtime.getBounds(), {maxZoom: 16});
  }
});


var player = L.realtime({url: 'player.json', type: 'json'}, {
  interval: 10 * 1000,
  style: function(feature) { return feature.properties; },
  pointToLayer: simplestyle,

  filter: applyFilter,
  onEachFeature: function (feature, layer) {
    layer.bindPopup(feature.properties.title);
  }
}).addTo(map);


//https://gist.github.com/tmcw/3861338
function simplestyle(f, latlon) {
    var sizes = {
      small: [20, 50],
      medium: [30, 70],
      large: [35, 90]
    };
    var fp = f.properties || {};
    var size = fp['marker-size'] || 'medium';
    var symbol = (fp['marker-symbol']) ? '-' + fp['marker-symbol'] : '';
    var color = fp['marker-color'] || '7e7e7e';
    color = color.replace('#', '');
    var url = 'http://a.tiles.mapbox.com/v3/marker/' +
          'pin-' +
          // Internet Explorer does not support the `size[0]` syntax.
          size.charAt(0) + symbol + '+' + color +
          ((window.devicePixelRatio === 2) ? '@2x' : '') +
          '.png';
    return new L.Marker(latlon, {
        icon: new L.icon({
            iconUrl: url,
            iconSize: sizes[size],
            iconAnchor: [sizes[size][0] / 2, sizes[size][1] / 2],
            popupAnchor: [sizes[size][0] / 2, 0]
        })
    });
}

function applyFilter(feature) {
  if (!loaded) {
    return true;
  }
  var box = document.getElementById(feature.properties.type);
  return box == null || box.checked;
}
