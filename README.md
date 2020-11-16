# static.vector.tiles

Site is running here: https://xycarto.github.io/static.vector.tiles/

Process to create a static vector tile server using GitPages. The steps to create a vector tile cache for Web Mercator and NZTM are covered here: however the aim of this site and step-by-step guide are to deliever those tiles in NZTM format using Leaflet. The followig runs through the steps needed to:

1. Extract contours in shapefile format from an elevation file
1. Convert the shapefile to JSON
1. Use Tippecanoe to generate web mercator tile cache
1. Use TRex to generate NZTM tile cache
1. Build a basic Leaflet wrapper to view the tile cache online 

The basic premise is: with your vector file, you need to construct a tile cache in MVT format with uncompressed PBF files. The MVT format is the same as any XYZ tile cache you would use for raster tiles. That tile cache will need to reside in a location accessible by your Leaflet application.   In this example we are using GitPages as our server and embedding our tiles directly along with the website we built.  In this instance, we are using Gitpages as our server.  

### Download Raster Elevation Data in NZTM (EPSG:2193) Projection
https://data.linz.govt.nz/layer/53621-wellington-lidar-1m-dem-2013/

### Build VRT
```cd wellington-lidar-1m-dem-2013```

```gdalbuildvrt dem.vrt *.tif```

### Contour Elevation File
```gdal_contour -a elev dem.vrt wellyDEMContour_NZTM.shp -i 50.0```


## Process for Web Mercator
### Reproject Contour to Web Mercator
```ogr2ogr -a_srs EPSG:2193 -t_srs EPSG:3857 wellyDEMContour_webmer.shp wellyDEMContour_NZTM.shp```

### Covert Shapefile to JSON
```ogr2ogr -f GeoJSON -t_srs EPSG:3857 -lco RFC7946=YES wellyDEMContour_webmer.json wellyDEMContour_webmer.shp```

### Create Vector Tile Cache for Web Mercator
```time tippecanoe --no-tile-compression --projection=EPSG:3857 --minimum-zoom=12 --maximum-zoom=16 --output-to-directory "static.vector.tiles/contoursWebmer" wellyDEMContour50m_webmer.json```


## Process for NZTM
### Upload NZTM Shapefile to PostgreSQL
```shp2pgsql -s 2193 wellyDEMContour_NZTM.shp public.contournztm | psql -h localhost -d dbName -U userName```

### Build TRex Config
See configpsql_contour.toml

Note the section of the config file

```
[grid.user]
width = 4096
height = 4096
extent = { minx = -1000000, miny = 3087000, maxx = 3327000, maxy = 10000000 }
srid = 2193
units = "m"
resolutions = [8960.0,4480.0,2240.0,1120.0,560.0,280.0,140.0,70.0,28.0,14.0,7.0,2.8,1.4,0.7,0.28,0.14,0.07]
origin = "TopLeft"
```

This is telling TRex to create a tile cache for NZTM

### Generate Vector Tile Cache
```t_rex generate --progress true --maxzoom=12 --minzoom=9 --extent=160.6,-55.95,-171.2,-25.88  --config /static.vector.tiles/trexConfig/configpsql_contour.toml```

### Decompress Tile Cache
```cd contournztm```

```find . -type f | xargs -n1 -P 1 -t -I % gzip -d -r -S .pbf %```

```find . -type f | xargs -n1 -P 1 -t -I % % %.pbf```

## Running your Leafelt site in NZTM

You need to define the CRS of the page like so:

```
var crs = new L.Proj.CRS(
    'EPSG:2193',
    '+proj=tmerc +lat_0=0 +lon_0=173 +k=0.9996 +x_0=1600000 +y_0=10000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
    {
      origin: [-1000000, 10000000],
      resolutions: [8960, 4480, 2240, 1120, 560, 280, 140, 70, 28, 14, 7, 2.8, 1.4, 0.7, 0.28, 0.14, 0.07]
    }
  );
```

When you load the map, you need to pass the CRS to the map

```
var map = new L.Map('map', {
      crs: crs,
      continuousWorld: true,
      worldCopyJump: false,
          zoomControl: false,
});
```

## Accesing the pbf tile cache using Leafelt

Code snippet you will need to add to the JS for your site.  

Note, above you already told the Leaflet map it will be running in NZTM projection, plus you aready created your vector tile cache in NZTM format.  So, when Leaflet make the calls to the tile cache, it will be calling the tiles form the correct matrix.

```
//In your JS, place the URL where your tile cache resides.  In this case, my tile cache is embedded on my GitPages.
var vectorURL = "https://xycarto.github.io/static.vector.tiles/contournztm/{z}/{x}/{y}.pbf";

// Setting min max zoom
var vectorSettings = {
    maxZoom: 12,
    minZoom: 8
  };

// Setting the styling forthe vector tile layer.  In this example, I am increasing the 
// the width of the contour lines based on the zoom scale
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

// Access the tile cache
var vector = L.vectorGrid.protobuf(vectorURL, styles);
```
