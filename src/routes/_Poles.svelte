<script>
	import { getContext } from 'svelte';
	import { base } from '$app/paths';
	import { contextKey } from '@beyonk/svelte-mapbox';

	const { getMap, getMapbox } = getContext(contextKey);
	const map = getMap();
	const mapbox = getMapbox();
	console.log('loading stuff');

	map.addSource('poles', {
		type: 'geojson',

		data: `${base}/poles.geojson`,
		cluster: true,
		clusterMaxZoom: 14,
		clusterRadius: 50
	});

	map.addLayer({
		id: 'pole-clusters',
		type: 'circle',
		source: 'poles',
		filter: ['has', 'point_count'],
		paint: {
			// Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
			// with three steps to implement three types of circles:
			//   * Blue, 20px circles when point count is less than 100
			//   * Yellow, 30px circles when point count is between 100 and 750
			//   * Pink, 40px circles when point count is greater than or equal to 750
			'circle-color': ['step', ['get', 'point_count'], '#0074D9', 100, '#FF851B ', 750, '#FF4136 '],
			'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
		}
	});

	map.addLayer({
		id: 'pole-cluster-count',
		type: 'symbol',
		source: 'poles',
		filter: ['has', 'point_count'],
		layout: {
			'text-field': ['get', 'point_count_abbreviated'],
			'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
			'text-size': 12
		}
	});

	map.addLayer({
		id: 'pole-unclustered-point',
		type: 'circle',
		source: 'poles',
		filter: ['!', ['has', 'point_count']],
		paint: {
			'circle-radius': 5,
			'circle-stroke-width': 1,
			'circle-stroke-color': '#fff'
		}
	});

	map.on('click', 'pole-clusters', function (e) {
		const features = map.queryRenderedFeatures(e.point, {
			layers: ['pole-clusters']
		});
		const clusterId = features[0].properties.cluster_id;
		map.getSource('poles').getClusterExpansionZoom(clusterId, function (err, zoom) {
			if (err) {
				return;
			}

			map.easeTo({
				center: features[0].geometry.coordinates,
				zoom: zoom
			});
		});
	});

	map.on('click', 'pole-unclustered-point', (e) => {
		const coordinates = e.features[0].geometry.coordinates.slice();

		// Ensure that if the map is zoomed out such that
		// multiple copies of the feature are visible, the
		// popup appears over the copy being pointed to.
		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}

		new mapbox.Popup()
			.setLngLat(coordinates)
			.setHTML(`${e.features[0].properties.description}`)
			.addTo(map);
	});

	map.on('mouseenter', 'pole-clusters', () => {
		map.getCanvas().style.cursor = 'pointer';
	});
	map.on('mouseleave', 'pole-clusters', () => {
		map.getCanvas().style.cursor = '';
	});
</script>
