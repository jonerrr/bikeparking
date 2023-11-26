<script lang="ts">
	import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
	import { Map, Geocoder, Marker, controls } from '@beyonk/svelte-mapbox';
	import Parking from './_Parking.svelte';

	const { GeolocateControl } = controls;

	let mapComponent: Map;

	function eventHandler(e) {
		const data = e.detail;
		console.log(data);
	}

	export let data;
</script>

<div class="map">
	<Map
		bind:this={mapComponent}
		accessToken={PUBLIC_MAPBOX_TOKEN}
		style="mapbox://styles/mapbox/streets-v12"
		center={[-74.031, 40.71]}
		zoom={13}
		on:ready={(e) => {
			console.log('ready');
			mapComponent.resize();
		}}
	>
		<GeolocateControl
			position="bottom-left"
			options={{ showUserLocation: false }}
			on:eventname={eventHandler}
		/>
		<Geocoder
			accessToken={PUBLIC_MAPBOX_TOKEN}
			on:result={eventHandler}
			options={{ proximity: { latitude: 40.71, longitude: -74.031 } }}
		/>
		<Parking features={data.parkingSpots} />
		<!-- {#each data.parkingSpots as spot}
			<Marker lat={spot.lat} lng={spot.lng} label={spot.label} color={spot.color}>
			</Marker>
		{/each} -->
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
