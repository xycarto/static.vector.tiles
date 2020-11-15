# static.vector.tiles

Process to create a static vector tile server using GitPages. The steps to create a vector tile cache for Web Mercator and NZTM are covered here: however the aim of this site and step-by-step guide are to deliever those tiles in NZTM format using Leaflet. The followig runs through the steps needed to:

1. Extract contours in shapefile format from an elevation file
1. Convert the shapefile to JSON
1. Use Tippecanoe to generate web mercator tile cache
1. Use TRex to generate NZTM tile cache
1. Build a basic Leaflet wrapper to view the tile cache online 

The basic premise is: with your vector file, you need to construct a tile cache in MVT format with uncompressed PBF files. The MVT format is the same as any XYZ tile cache you would use for raster tiles. That tile cache will need to reside in a location accessible by your Leaflet application.   In this example we are using GitPages as our server and embedding our tiles directly along with the website we built.  In this instance, we are using Gitpages as our server.  

###Download Data in NZTM (EPSG:2193) Projection
https://data.linz.govt.nz/layer/53621-wellington-lidar-1m-dem-2013/

###Build VRT
```cd wellington-lidar-1m-dem-2013```
```gdalbuildvrt dem.vrt *.tif```

###Contour Elevation File
```gdal_contour -a elev dem.vrt wellyDEMContour_NZTM.shp -i 50.0```


##Process for Web Mercator
###Reproject Contour to Web Mercator
```ogr2ogr -a_srs EPSG:2193 -t_srs EPSG:3857 wellyDEMContour_webmer.shp wellyDEMContour_NZTM.shp```

###Covert Shapefile to JSON
```ogr2ogr -f GeoJSON -t_srs EPSG:3857 -lco RFC7946=YES wellyDEMContour_webmer.json wellyDEMContour_webmer.shp```

###Create Vector Tile Cache for Web Mercator
```time tippecanoe --no-tile-compression --projection=EPSG:3857 --minimum-zoom=12 --maximum-zoom=16 --output-to-directory "static.vector.tiles/contoursWebmer" wellyDEMContour50m_webmer.json```


##Process for NZTM
###Upload NZTM Shapefile to PostgreSQL
```shp2pgsql -s 2193 wellyDEMContour_NZTM.shp public.contournztm | psql -h localhost -d dbName -U userName```

###Build TRex Config
See configpsql_contour.toml

###Generate Vector Tile Cache
```t_rex generate --progress true --maxzoom=12 --minzoom=9 --extent=160.6,-55.95,-171.2,-25.88  --config /static.vector.tiles/trexConfig/configpsql_contour.toml```

###Decompress Tile Cache
```find . -type f | xargs -n1 -P 1 -t -I % gzip -d -r -S .pbf %```
```find . -type f | xargs -n1 -P 1 -t -I % % %.pbf```
