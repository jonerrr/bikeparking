<script lang="ts">
	import { invisibleLayers } from '$lib/stores';

	export let layer: string;
	export let map: any;
</script>

<button
	on:click={(e) => {
		e.preventDefault();
		e.stopPropagation();

		const visibility = $invisibleLayers.includes(layer) ? 'visible' : 'none';

		map.setLayoutProperty(`clusters-${layer}`, 'visibility', visibility);
		map.setLayoutProperty(`clusters-${layer}-count`, 'visibility', visibility);
		map.setLayoutProperty(`unclustered-point-${layer}`, 'visibility', visibility);

		invisibleLayers.update((layers) => {
			if (layers.includes(layer)) {
				return layers.filter((l) => l !== layer);
			} else {
				return [...layers, layer];
			}
		});
	}}
	style={$invisibleLayers.includes(layer)
		? 'background-color: #3887be'
		: 'background-color: #3074a4'}
	class="button-1">{layer}</button
>

<style>
	button {
		border: 1px solid rgba(0, 0, 0, 0.4);
		box-sizing: border-box;
		color: #ffffff;
		cursor: pointer;
		display: block;
		font-size: 13px;
		font-weight: 500;
		height: 50px;
		width: 100%;
		top: 50%;
		list-style: none;
		margin: 0;
		outline: none;
		padding: 10px;
		position: relative;
		text-align: center;
		text-decoration: none;
		transition: color 100ms;
		user-select: none;
		-webkit-user-select: none;
		touch-action: manipulation;
	}
</style>
