<script lang="ts">
	export let layer: string;
	export let map: any;

	let visible: boolean = true;
	// TODO: save state in localstorage
</script>

<button
	on:click={(e) => {
		e.preventDefault();
		e.stopPropagation();
		map.setLayoutProperty(`clusters-${layer}`, 'visibility', visible ? 'none' : 'visible');
		map.setLayoutProperty(`clusters-${layer}-count`, 'visibility', visible ? 'none' : 'visible');
		map.setLayoutProperty(`unclustered-point-${layer}`, 'visibility', visible ? 'none' : 'visible');

		visible = !visible;
	}}
	style={visible ? 'background-color: #3887be' : 'background-color: #3074a4'}
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
