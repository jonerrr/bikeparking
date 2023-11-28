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
	const poles = await (await fetch('/poles.json')).json();
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
