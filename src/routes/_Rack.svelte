<script lang="ts">
	import { getContext } from 'svelte';
	import { contextKey } from '@beyonk/svelte-mapbox';
	import { invisibleLayers } from '$lib/stores';

	const { getMap, getMapbox }: { getMap: any; getMapbox: any } = getContext(contextKey);
	const map = getMap();
	const mapbox = getMapbox();

	function stringToColor(str: string) {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		let color = '#';
		for (let i = 0; i < 3; i++) {
			const value = (hash >> (i * 8)) & 0xff;
			color += ('00' + value.toString(16)).substr(-2);
		}
		return color;
	}

	export let features;
	export let name: string;

	map.addSource(name, {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features
		},
		cluster: true,
		clusterMaxZoom: 14,
		clusterRadius: 50
	});

	map.addLayer({
		id: `clusters-${name}`,
		type: 'circle',
		source: name,
		filter: ['has', 'point_count'],
		paint: {
			// Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
			// with three steps to implement three types of circles:
			//   * Blue, 20px circles when point count is less than 100
			//   * Yellow, 30px circles when point count is between 100 and 750
			//   * Pink, 40px circles when point count is greater than or equal to 750
			'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
			'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
		},
		layout: {
			visibility: $invisibleLayers.includes(name) ? 'none' : 'visible'
		}
	});

	map.addLayer({
		id: `clusters-${name}-count`,
		type: 'symbol',
		source: name,
		filter: ['has', 'point_count'],
		layout: {
			'text-field': ['get', 'point_count_abbreviated'],
			'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
			'text-size': 12,
			visibility: $invisibleLayers.includes(name) ? 'none' : 'visible'
		}
	});

	map.addLayer({
		id: `unclustered-point-${name}`,
		type: 'circle',
		source: name,
		filter: ['!', ['has', 'point_count']],
		paint: {
			'circle-color': stringToColor(name),
			'circle-radius': 7,
			'circle-stroke-width': 1,
			'circle-stroke-color': '#fff'
		},
		layout: {
			visibility: $invisibleLayers.includes(name) ? 'none' : 'visible'
		}
	});

	map.on('click', `clusters-${name}`, function (e: any) {
		const features = map.queryRenderedFeatures(e.point, {
			layers: [`clusters-${name}`]
		});
		const clusterId = features[0].properties.cluster_id;
		map.getSource(name).getClusterExpansionZoom(clusterId, function (err: any, zoom: number) {
			if (err) {
				return;
			}

			map.easeTo({
				center: features[0].geometry.coordinates,
				zoom: zoom
			});
		});
	});

	map.on('click', `unclustered-point-${name}`, (e: any) => {
		const coordinates = e.features[0].geometry.coordinates.slice();

		// Ensure that if the map is zoomed out such that
		// multiple copies of the feature are visible, the
		// popup appears over the copy being pointed to.
		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}

		new mapbox.Popup()
			.setLngLat(coordinates)
			.setHTML(
				`${e.features[0].properties.label} ${
					e.features[0].properties.description ? `<br/>${e.features[0].properties.description}` : ''
				}`
			)
			.addTo(map);
	});

	map.on('mouseenter', `clusters-${name}`, () => {
		map.getCanvas().style.cursor = 'pointer';
	});
	map.on('mouseleave', `clusters-${name}`, () => {
		map.getCanvas().style.cursor = '';
	});
</script>
