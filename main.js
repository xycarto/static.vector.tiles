var crs = new L.Proj.CRS(
    'EPSG:2193',
    '+proj=tmerc +lat_0=0 +lon_0=173 +k=0.9996 +x_0=1600000 +y_0=10000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
    {
      origin: [-1000000, 10000000],
      resolutions: [8960, 4480, 2240, 1120, 560, 280, 140, 70, 28, 14, 7, 2.8, 1.4, 0.7, 0.28, 0.14, 0.07]
    }
  );
  
// raster overlays

var dem_urlTemplate = 'https://xycarto-base-maps.s3-ap-southeast-2.amazonaws.com/wellyDEM-lidar/tile-cache/2020101712/wellyDEM-lidar/{z}/{x}/{y}.png'
  
var dsm_urlTemplate = 'https://xycarto-base-maps.s3-ap-southeast-2.amazonaws.com/wellyDSM-lidar/tile-cache/2020101712/wellyDSM-lidar/{z}/{x}/{y}.png'
 

//basemaps
var linzColour_urlTemplate = 'https://tiles.maps.linz.io/nz_colour_basemap/NZTM/{z}/{x}/{y}.png'

var settingsOverlay = {
    tms: true,
    maxZoom: 12,
    tileSize: 512,
    continuousWorld: true,
    attribution: '<a href="http://xycarto.com">Overlays Sourced From XYCarto</a>', //Simple attribution for linz
};

var settings = {
      tms: true,
      maxZoom: 12,
      continuousWorld: true,
      attribution: '<a href="http://www.linz.govt.nz">Colour Base Map Sourced from LINZ. CC-BY 4.0</a>', //Simple attribution for linz
};

  
var map = new L.Map('map', {
      crs: crs,
      continuousWorld: true,
      worldCopyJump: false,
          zoomControl: false,
});


//vectorTiles
var vectorURL = "https://xycarto.github.io/static.vector.tiles/contournztm/{z}/{x}/{y}.pbf";

var vectorSettings = {
    maxZoom: 12,
    minZoom: 8
  };

var styles = {
    interactive: false,
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
    }}
  }
};

var vector = L.vectorGrid.protobuf(vectorURL, styles);

//basemaps

var linzColour = new L.TileLayer(linzColour_urlTemplate, settings);

var xycartoDEMHS = new L.TileLayer(dem_urlTemplate, settingsOverlay);

var xycartoDSMHS = new L.TileLayer(dsm_urlTemplate, settingsOverlay);
  
var basemaps = {
      "LINZ Colour Base Map": linzColour
      };

var overlays = {
      "DEM Hillshade": xycartoDEMHS,
      "DSM Hillshade": xycartoDSMHS,
      "Contour 50m(>z8)": vector
}

var settingsControl = {
    collapsed: true
};
  
var zoomcontrol = new L.Control.Zoom({ position: 'bottomright' }).addTo(map)
  
var layers = L.control.layers(basemaps, overlays, settingsControl).addTo(map)
  
map.addLayer(linzColour);
  
map.setView([-41.29, 174.0], 3);
