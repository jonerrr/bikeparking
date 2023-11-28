<script lang="ts">
	import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
	import { Map, Geocoder, controls } from '@beyonk/svelte-mapbox';
	import Rack from './_Rack.svelte';

	const { GeolocateControl } = controls;

	let mapComponent: Map;

	function eventHandler(e) {
		const data = e.detail;
		mapComponent.flyTo({ center: data.result.center, zoom: 17 });
	}

	export let data;
</script>

<div class="map">
	<Map
		bind:this={mapComponent}
		accessToken={PUBLIC_MAPBOX_TOKEN}
		style="mapbox://styles/mapbox/streets-v12"
		center={[-73.95, 40.69]}
		zoom={12.5}
	>
		<GeolocateControl
			position="bottom-left"
			options={{
				showUserLocation: true,
				showUserHeading: true,
				fitBoundsOptions: {
					zoom: 17
				}
			}}
		/>
		<Geocoder
			geocoder
			accessToken={PUBLIC_MAPBOX_TOKEN}
			on:result={eventHandler}
			options={{ proximity: { latitude: 40.71, longitude: -74.031 } }}
		/>
		{#each Object.keys(data) as rack}
			<Rack name={rack} features={data[rack]} />
		{/each}
	</Map>
</div>

<style>
	.map {
		/* width: 100vw;
		height: 100vh;
		padding: 0%;
		margin: 0%; */
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
	}
	/* 
	:global(.mapboxgl-map) {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
	} */
</style>
