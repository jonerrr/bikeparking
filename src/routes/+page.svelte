<script lang="ts">
	import {
		MapLibre,
		VectorTileSource,
		GeolocateControl,
		CircleLayer,
		Popup,
		FeatureState,
		CustomControl
	} from 'svelte-maplibre-gl';
	import maplibregl from 'maplibre-gl';
	import { PMTilesProtocol } from '@svelte-maplibre-gl/pmtiles';
	import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
	import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
	import { PersistedState } from 'runed';
	import { asset } from '$app/paths';
	import { tick } from 'svelte';
	import Geo from '$lib/geocoder';
	import rack_mapping from '$lib/assets/rack_mapping.json';
	import { slide } from 'svelte/transition';

	const allRackTypes = rack_mapping.map(({ category }) => category);
	const layerNames = rack_mapping.map(({ category }) => category.replace(/[^a-z0-9]/gi, ''));
	// console.log(layerNames);

	let map = $state<maplibregl.Map>();
	let cursor = $state('default');
	let bearing = $state(0);
	let pitch = $state(0);
	let zoom = $state(12);

	let clickedFeature: maplibregl.MapGeoJSONFeature | undefined = $state.raw();
	let lnglat = $state.raw(new maplibregl.LngLat(0, 0));
	let legendOpen = new PersistedState('legendOpen', true);
	// drive rails technically not bike racks and theres a lot of them
	//  so default to offq
	let selectedCategories = new PersistedState(
		'selectedCategories',
		allRackTypes.filter((r) => r !== 'Drive Rail')
	);

	const selectedLayers = $derived(
		selectedCategories.current.map((category) => category.replace(/[^a-z0-9]/gi, ''))
	);
	$inspect(selectedLayers);
	// const categoryFilter = $derived<maplibregl.ExpressionSpecification | boolean>(
	// 	selectedCategories.current.length
	// 		? ['in', ['get', 'category'], ['literal', selectedCategories.current]]
	// 		: true
	// );

	// $inspect(categoryFilter);

	const toggleCategory = (category: string) => {
		selectedCategories.current = selectedCategories.current.includes(category)
			? selectedCategories.current.filter((type) => type !== category)
			: [...selectedCategories.current, category];
	};

	const selectAllCategories = () => {
		selectedCategories.current = [...allRackTypes];
	};

	const clearCategories = () => {
		selectedCategories.current = [];
	};

	const geocoderControl = new MaplibreGeocoder(Geo, {
		maplibregl,
		showResultsWhileTyping: true,
		limit: 10
	});

	geocoderControl.on('error', (event) => {
		console.warn('Geocoder error', event?.error);
	});

	// // TODO: improve placement
	// const streetviewUrl = (lat: number, lng: number, heading = 0, pitch = 0) =>
	// 	`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=90`;

	// 	`https://www.google.com/maps/@${lat},${lng},${zoom}z`;
	const mapsUrl = (lat: number, lng: number) =>
		`https://www.google.com/maps/search/?api=1&query=${lat},${lng}&zoom=${Math.round(zoom)}`;

	// const popupHeading = () => {
	// 	return Math.round(((bearing % 360) + 360) % 360);
	// };

	$effect(() => {
		if (!clickedFeature) return;
		const category = clickedFeature.properties?.category as string | undefined;
		if (category && !selectedCategories.current.includes(category)) {
			clickedFeature = undefined;
		}
	});
</script>

<div class="pointer-events-none absolute right-4 bottom-2 z-20 text-sm">
	{#if legendOpen.current}
		<div
			class="pointer-events-auto mb-2 flex max-w-xs flex-col gap-3 rounded-md bg-white/90 p-3 shadow-lg backdrop-blur"
			transition:slide
		>
			<div class="flex items-center justify-between text-xs font-medium text-slate-500">
				<button class="rounded px-2 py-1 hover:bg-slate-100" onclick={selectAllCategories}
					>Select all</button
				>
				<button class="rounded px-2 py-1 hover:bg-slate-100" onclick={clearCategories}>Clear</button
				>
			</div>
			<ul class="flex flex-col gap-2">
				{#each rack_mapping as rack}
					<li class="flex items-center gap-2">
						<span class="h-3 w-3 rounded" style={`background-color: ${rack.color}`}></span>
						<label class="flex flex-1 items-center justify-between gap-2">
							<span class="text-slate-700">{rack.category}</span>
							<input
								type="checkbox"
								checked={selectedCategories.current.includes(rack.category)}
								onchange={() => toggleCategory(rack.category)}
								class="accent-slate-700"
							/>
						</label>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<button
		class="pointer-events-auto flex items-center gap-2 rounded-md bg-white/90 px-3 py-2 font-semibold text-slate-700 shadow-md transition hover:bg-white"
		aria-expanded={legendOpen.current}
		onclick={() => (legendOpen.current = !legendOpen.current)}
	>
		<span>Layers & Legend</span>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
			class="h-4 w-4 transition"
			class:rotate-180={!legendOpen.current}
		>
			<path
				fill-rule="evenodd"
				d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
				clip-rule="evenodd"
			/>
		</svg>
	</button>
</div>

<PMTilesProtocol />

<MapLibre
	bind:map
	bind:bearing
	bind:pitch
	bind:zoom
	attributionControl={false}
	style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
	center={[-74.006, 40.7128]}
	maxBounds={[
		[-74.45909, 40.277399],
		[-73.000272, 41.017577]
	]}
	{cursor}
	class="h-[100dvh] w-[100dvw]"
>
	<GeolocateControl
		position="bottom-left"
		trackUserLocation={true}
		positionOptions={{ enableHighAccuracy: true }}
		autoTrigger={true}
	/>

	<CustomControl control={geocoderControl} position="top-right" />

	<VectorTileSource url={`pmtiles://${asset('/data.pmtiles')}`}>
		<!-- <CircleLayer
			sourceLayer="bike_parking"
			filter={['all', ['has', 'point_count'], categoryFilter]}
			paint={{
				// 'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 50, '#f1f075', 150, '#f28cb1'],
				'circle-color': ['get', 'color'],
				'circle-radius': ['+', 10, ['sqrt', ['get', 'point_count']]],
				'circle-opacity': 0.8
			}}
		/>
		<SymbolLayer
			sourceLayer="bike_parking"
			filter={['all', ['has', 'point_count'], categoryFilter]}
			layout={{
				'text-field': '{point_count_abbreviated}',
				'text-size': 12
			}}
		/> -->

		{#each layerNames as layer}
			<!-- filter={['all', ['!', ['has', 'point_count']], categoryFilter]} -->
			{#if selectedLayers.includes(layer)}
				<CircleLayer
					sourceLayer={layer}
					paint={{
						'circle-radius': [
							'interpolate',
							['linear'],
							['zoom'],
							10,
							['case', ['boolean', ['feature-state', 'click'], false], 8, 4],
							18,
							['case', ['boolean', ['feature-state', 'click'], false], 20, 12]
						],
						// 'circle-color': [
						// 	'case',
						// 	['boolean', ['feature-state', 'click'], false],
						// 	'#FF4136',
						// 	['get', 'color']
						// ],
						'circle-color': ['get', 'color'],
						'circle-stroke-width': [
							'interpolate',
							['linear'],
							['zoom'],
							10,
							['case', ['boolean', ['feature-state', 'click'], false], 1, 0],
							18,
							['case', ['boolean', ['feature-state', 'click'], false], 3, 0]
						],
						'circle-stroke-color': '#DDDDDD',
						'circle-opacity': 1
					}}
					onmousemove={(ev) => {
						// Listen to mousemove events to track the hovered feature
						// hoveredFeature = ev.features?.[0];
						// lnglat = ev.lngLat; // cursor location
						cursor = 'pointer';
					}}
					onmouseleave={() => (cursor = 'default')}
					onclick={async (ev) => {
						const newFeature = ev.features?.[0];
						if (!newFeature) return;

						if (clickedFeature && clickedFeature.id !== newFeature.id) {
							// clicked the same feature, close popup
							clickedFeature = undefined;
							await tick();
						}
						clickedFeature = newFeature;
						lnglat = ev.lngLat; // cursor location
					}}
				>
					{#if clickedFeature}
						<!-- Set the hover state on the source for the hovered feature -->
						<FeatureState sourceLayer={layer} id={clickedFeature.id} state={{ click: true }} />
						<Popup {lnglat} closeButton={false} onclose={() => (clickedFeature = undefined)}>
							{#each Object.entries(clickedFeature.properties) as [key, value]}
								{#if key !== 'color'}
									<p><strong>{key}:</strong> {value}</p>
								{/if}
							{/each}

							<!-- <p>
								<a
									class="text-blue-600 underline hover:text-blue-800"
									target="_blank"
									rel="noopener noreferrer"
									href={streetviewUrl(lnglat.lat, lnglat.lng, popupHeading())}
								>
									Google Street View
								</a>
							</p> -->

							<p>
								<a
									class="text-blue-600 underline hover:text-blue-800"
									target="_blank"
									rel="noopener noreferrer"
									href={mapsUrl(lnglat.lat, lnglat.lng)}
								>
									Google Maps
								</a>
							</p>
						</Popup>
					{/if}
				</CircleLayer>
			{/if}
		{/each}
	</VectorTileSource>
</MapLibre>
