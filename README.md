# static.vector.tiles

gdal_contour -a elev /home/ireese/testing/welly_render/dem_5m/dem_5m.vrt /home/ireese/testing/welly_render/contour_vector/wellyDEM_contour_20m.shp -i 50.0

ogr2ogr -a_srs EPSG:2193 -t_srs EPSG:3857 /home/ireese/testing/welly_render/contour_vector/wellyDEMContour50m_webmer.shp /home/ireese/testing/welly_render/contour_vector/wellyDEM_contour_50m.shp

ogr2ogr -f GeoJSON -t_srs EPSG:3857 -lco RFC7946=YES /home/ireese/testing/welly_render/contour_vector/wellyDEMContour50m_webmer.json /home/ireese/testing/welly_render/contour_vector/wellyDEMContour50m_webmer.shp



shp2pgsql -s 2193 /home/ireese/testing/welly_render/contour_vector/wellyDEM_contour_50m.shp public.contourNZTM | psql -h localhost -d nz_data -U postgres

time tippecanoe --no-tile-compression --projection=EPSG:3857 --minimum-zoom=12 --maximum-zoom=16 --output-to-directory "/home/ireese/static.vector.tiles/contoursWebmer" /home/ireese/testing/welly_render/contour_vector/wellyDEMContour50m_webmer.json

time tippecanoe --no-tile-compression --projection=EPSG:3857 -z12 --output-to-directory "/home/ireese/static.vector.tiles/contoursWebmer/test" /home/ireese/testing/welly_render/contour_vector/wellyDEMContour50m_webmer.json

t_rex generate --progress true --maxzoom=12 --minzoom=9 --extent=160.6,-55.95,-171.2,-25.88  --config /home/ireese/static.vector.tiles/trexConfig/configpsql_contour.toml