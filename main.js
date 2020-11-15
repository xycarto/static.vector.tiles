var crs = new L.Proj.CRS(
    'EPSG:2193',
    '+proj=tmerc +lat_0=0 +lon_0=173 +k=0.9996 +x_0=1600000 +y_0=10000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
    {
      origin: [-1000000, 10000000],
      resolutions: [8960, 4480, 2240, 1120, 560, 280, 140, 70, 28, 14, 7, 2.8, 1.4, 0.7, 0.28, 0.14, 0.07]
    }
  );
  
//overlays

var dem_urlTemplate = 'https://xycarto-base-maps.s3-ap-southeast-2.amazonaws.com/wellyDEM-lidar/tile-cache/2020101712/wellyDEM-lidar/{z}/{x}/{y}.png'
  
var dsm_urlTemplate = 'https://xycarto-base-maps.s3-ap-southeast-2.amazonaws.com/wellyDSM-lidar/tile-cache/2020101712/wellyDSM-lidar/{z}/{x}/{y}.png'
 
var lowland_urlTemplate = 'https://maps.linz.io/tiles/wellyvation-lowlands-basemap/NZTM/{z}/{x}/{y}.png'

var slope_urlTemplate = 'https://xycarto-base-maps.s3-ap-southeast-2.amazonaws.com/wellySLOPE-lidar/tile-cache/2020101712/wellySLOPE-lidar/{z}/{x}/{y}.png'

//var slope_urlTemplate = 'http://localhost:8000/wellySLOPE-lidar/{z}/{x}/{y}.png'

//basemaps
var linzAerial_urlTemplate = 'https://basemaps.linz.govt.nz/v1/tiles/aerial/EPSG:2193/{z}/{x}/{y}.png?api=c01emr2n17q0qtdaens2m3abcwd'

var linzColour_urlTemplate = 'https://tiles.maps.linz.io/nz_colour_basemap/NZTM/{z}/{x}/{y}.png'

var linzTopo_urlTemplate = 'http://tiles-a.data-cdn.linz.govt.nz/services;key=1b85daaf8266427a9eb3f46a532cd2c7/tiles/v4/layer=50767/EPSG:2193/{z}/{x}/{y}.png'
  
var settingsOverlay = {
    tms: true,
    maxZoom: 12,
    tileSize: 512,
    continuousWorld: true,
    attribution: '<a href="http://www.linz.govt.nz">Sourced from LINZ. CC-BY 4.0</a>', //Simple attribution for linz
};

var settings = {
      tms: true,
      maxZoom: 12,
      continuousWorld: true,
      attribution: '<a href="http://www.linz.govt.nz">Sourced from LINZ. CC-BY 4.0</a>', //Simple attribution for linz
};
  
var settingsLL = {
    tms: true,
    minZoom: 6,
    maxZoom: 12,
    continuousWorld: true,
    attribution: '<a href="http://www.linz.govt.nz">Sourced from LINZ. CC-BY 4.0</a>', //Simple attribution for linz
};

  
var map = new L.Map('map', {
      crs: crs,
      continuousWorld: true,
      worldCopyJump: false,
          zoomControl: false,
});


//vectorTiles TODO

var vectorURL = "https://xycarto.github.io/elevation.viewer.test/wellycontour_simple/{z}/{x}/{y}.pbf";

//var vectorURL = "http://localhost:8000/wellycontour_simple/{z}/{x}/{y}.pbf";

var vectorSettings = {
    maxZoom: 12,
    minZoom: 8
  };

var styles = {
    interactive: true,
    minZoom: 8,
    tileSize: 4096,
    vectorTileLayerStyles: {
        wellycontour_simple: function(properties,zoom) {
            var level = map.getZoom();
            var weight = 1.0;
            if (level >= 10) {weight = 2.0;}
            return {
                weight: weight,
                color: "#ff5633",
                opacity: 0.75
                //fillOpacity: 0.75,
                //fill: true
    }}
  }
};

var vector = L.vectorGrid.protobuf(vectorURL, styles);

//

  
  
//overlays
var demMap = new L.TileLayer(dem_urlTemplate, settingsOverlay);
  
var dsmMap = new L.TileLayer(dsm_urlTemplate, settingsOverlay);

var slopeMap = new L.TileLayer(slope_urlTemplate, settingsOverlay);
  
var lowlandMap = new L.TileLayer(lowland_urlTemplate, settingsLL);

//basemaps
var linzAerial = new L.TileLayer(linzAerial_urlTemplate, settings);

var linzColour = new L.TileLayer(linzColour_urlTemplate, settings);

var linzTopo = new L.TileLayer(linzTopo_urlTemplate, settings);
  
var basemaps = {
      "LINZ Colour Base Map": linzColour,
      "LINZ Aerial Base Map": linzAerial,
      "LINZ Topo50 Base Map": linzTopo
      };

var overlays = {
      "DEM Hillshade Overlay": demMap,
      "DSM Hillshade Overlay": dsmMap,
      Slope: slopeMap,
      "Contour 50m(>z8)": vector,
      "Lowlands(>z6) Overlay": lowlandMap};

var settingsControl = {
    collapsed: true
};
  
var zoomcontrol = new L.Control.Zoom({ position: 'bottomright' }).addTo(map)
  
var layers = L.control.layers(basemaps, overlays, settingsControl).addTo(map)
  
map.addLayer(linzColour);
  
map.setView([-41.29, 174.0], 3);