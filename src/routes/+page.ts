async function loadGeodata(
	fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>,
	url: string,
	label?: string
) {
	const { features } = await (await fetch(url)).json();
	const parsed: {
		type: string;
		properties: {
			label: string;
			'marker-color'?: string;
			'marker-size'?: string;
			icon?: {
				iconUrl: string;
				iconSize: number[]; // size of the icon
				iconAnchor: number[]; // point of the icon which will correspond to marker's location
				popupAnchor: number[]; // point from which the popup should open relative to the iconAnchor
				className: string;
			};
		};
		geometry: {
			type: string;
			coordinates: number[];
		};
	}[] = [];
	features.forEach((f: { properties: any; geometry: { type: string; coordinates: number[] } }) => {
		//TODO make the colors work
		let color = '#000';
		if (!label)
			switch (f.properties.rack_type) {
				case 'Bike Corral':
					color = '#B10DC9';
					break;
				case 'LARGE HOOP':
					color = '#7cea9c';
					break;
				case 'WAVE RACK':
					color = '#85144b';
					break;
				case 'U RACK':
					color = '#7FDBFF';
					break;
				case 'SMALL HOOP':
					color = '#55D6BE';
					break;
				case 'UNDETERMINED':
					color = '#000';
					break;
				case 'WAVE RACK (PARKS)':
					color = '#2E5EAA';
					break;
				case 'STAPLE (PARKS)':
					color = '#5b4e77';
					break;
				case 'DOT SLED (BLACK)':
					color = '#4C956C';
					break;
				case 'GFI SLED (SILVER)':
					color = '#EE6055';
					break;
				case 'Opal Rack (Parks)':
					color = '#DDB771';
					break;
			}

		parsed.push({
			type: 'Feature',
			properties: {
				label: label || f.properties.rack_type,
				'marker-color': color
			},
			geometry: f.geometry
		});
	});

	return parsed;
}

export async function load({ fetch }) {
	return Promise.all([
		loadGeodata(
			fetch,
			'https://data.cityofnewyork.us/api/geospatial/thbt-gfu9?method=export&format=GeoJSON',
			'Shelter'
		),
		loadGeodata(
			fetch,
			'https://data.cityofnewyork.us/api/geospatial/yh4a-g3fj?method=export&format=GeoJSON'
		)
	]).then((r) => {
		return { parkingSpots: [...r[0], ...r[1]] };
	});
}
