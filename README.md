# static.vector.tiles



gdal_contour -a elev dem_5m.vrt wellyDEMContour_NZTM.shp -i 50.0

ogr2ogr -a_srs EPSG:2193 -t_srs EPSG:3857 wellyDEMContour_webmer.shp wellyDEMContour_NZTM.shp

ogr2ogr -f GeoJSON -t_srs EPSG:3857 -lco RFC7946=YES wellyDEMContour_webmer.json wellyDEMContour_webmer.shp

time tippecanoe --no-tile-compression --projection=EPSG:3857 --minimum-zoom=12 --maximum-zoom=16 --output-to-directory "/home/ireese/static.vector.tiles/contoursWebmer" /home/ireese/testing/welly_render/contour_vector/wellyDEMContour50m_webmer.json



shp2pgsql -s 2193 wellyDEMContour_NZTM.shp public.contournztm | psql -h localhost -d dbName -U userName

t_rex generate --progress true --maxzoom=12 --minzoom=9 --extent=160.6,-55.95,-171.2,-25.88  --config /home/ireese/static.vector.tiles/trexConfig/configpsql_contour.toml