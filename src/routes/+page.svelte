<script lang="ts">
	import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
	import { Map, Geocoder, controls } from '@beyonk/svelte-mapbox';
	import Rack from './_Rack.svelte';
	import ToggleLayer from './_ToggleLayer.svelte';
	import { center, zoom } from '$lib/stores';

	const { GeolocateControl } = controls;

	let mapComponent: Map;

	export let data;
	const rack_types = Object.keys(data);
	let mapReady = false;
	let expanded = false;
</script>

{#if !mapReady}
	<h1 style="text-align: center;">Loading...</h1>
{:else}
	<div id="menu">
		<h3>
			<button aria-expanded={expanded} on:click={() => (expanded = !expanded)}
				>Layers
				{#if expanded}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						><path d="M0 10h24v4h-24z" /></svg
					>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
						><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" /></svg
					>
				{/if}
			</button>
		</h3>
		<div class="contents" hidden={!expanded}>
			{#each rack_types as rack}
				<ToggleLayer layer={rack} map={mapComponent.getMap()} />
			{/each}
		</div>
	</div>
{/if}

<div id="map">
	<Map
		bind:this={mapComponent}
		on:ready={() => (mapReady = true)}
		accessToken={PUBLIC_MAPBOX_TOKEN}
		style="mapbox://styles/mapbox/streets-v12"
		bind:center={$center}
		bind:zoom={$zoom}
		on:dragend={(e) => {
			//@ts-ignore
			center.set([e.detail.center.lng, e.detail.center.lat]);
		}}
		on:zoomend={(e) => {
			//@ts-ignore
			zoom.set(e.detail.zoom);
		}}
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
			on:result={(e) => {
				//@ts-ignore
				mapComponent.flyTo({ center: e.detail.result.center, zoom: 17 });
			}}
			options={{ proximity: { latitude: 40.71, longitude: -74.031 } }}
		/>
		{#each rack_types as rack}
			<Rack name={rack} features={data[rack]} />
		{/each}
	</Map>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}

	h3 {
		margin: 0;
	}

	button {
		background-color: var(--background, #fff);
		color: var(--gray-darkest, #282828);
		display: flex;
		justify-content: space-between;
		width: 100%;
		border: 1px solid rgba(0, 0, 0, 0.4);
		margin: 0;
		padding: 1em 0.5em;
	}

	svg {
		height: 0.7em;
		width: 0.7em;
	}

	#map {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 100%;
	}

	#menu {
		background: #fff;
		position: absolute;
		z-index: 1;
		top: 10px;
		right: 10px;
		border-radius: 3px;
		width: 120px;
		border: 1px solid rgba(0, 0, 0, 0.4);
		font-family: 'Open Sans', sans-serif;
	}

	@media (max-width: 1024px) {
		#menu {
			top: 7vh;
		}
	}
</style>
