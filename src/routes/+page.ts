import pako from 'pako';
interface Parking {
	[key: string]: {
		type: string;
		properties: { label: string };
		geometry: { type: string; coordinates: number[] };
	}[];
}

export async function load({ fetch }) {
	const shelters = await (
		await fetch(
			'https://data.cityofnewyork.us/api/geospatial/thbt-gfu9?method=export&format=GeoJSON'
		)
	).json();
	const racks = await (
		await fetch(
			'https://data.cityofnewyork.us/api/geospatial/yh4a-g3fj?method=export&format=GeoJSON'
		)
	).json();
	// I need to make a gzip because cloudflare pages doesn't accept files bigger than 26.2mb
	const poles = JSON.parse(
		pako.inflate(await (await fetch('/poles.json.zz')).arrayBuffer(), { to: 'string' })
	);
	const parking: Parking = {};
	parking['Shelter'] = shelters.features.map((f: any) => {
		return {
			type: 'Feature',
			properties: {
				label: 'Shelter'
			},
			geometry: f.geometry
		};
	});
	racks.features.forEach((f: any) => {
		const parsed = {
			type: 'Feature',
			properties: {
				label: f.properties.rack_type
			},
			geometry: f.geometry
		};

		parking[f.properties.rack_type]
			? parking[f.properties.rack_type].push(parsed)
			: (parking[f.properties.rack_type] = [parsed]);
	});
	parking['Pole'] = poles;

	return parking;
}
