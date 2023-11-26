interface ParkingSpot {
	lat: number;
	lng: number;
	img: string;
	label: string;
	color: string;
}

async function loadBikeSpots(
	fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>,
	url: string,
	label?: string
) {
	const { data } = await (await fetch(url)).json();
	const parkingSpots: ParkingSpot[] = [];
	const pointMatch = /-?\d+\.?\d+/g;

	// const rackTypes = new Set();

	data.forEach((spot: any[]) => {
		const [lng, lat] = spot[8].match(pointMatch).map(Number);

		// rackTypes.add(spot[25]);

		let color = 'black';
		if (!label)
			switch (spot[25]) {
				case 'Bike Corral':
					color = '#B10DC9';
					break;
				case 'LARGE HOOP':
					color = 'teal';
					break;
				case 'WAVE RACK':
					color = '#85144b';
					break;
				case 'U RACK':
					color = '#7FDBFF';
					break;
				case 'SMALL HOOP':
					color = '#0074D9';
					break;
				case 'UNDETERMINED':
					color = 'black';
					break;
				case 'WAVE RACK (PARKS)':
					color = 'orange';
					break;
				case 'STAPLE (PARKS)':
					color = 'lime';
					break;
				case 'DOT SLED (BLACK)':
					color = 'yellow';
					break;
				case 'GFI SLED (SILVER)':
					color = 'purple';
					break;
				case 'Opal Rack (Parks)':
					color = 'brown';
					break;
				default:
					color = 'red';
			}

		parkingSpots.push({
			lat,
			lng,
			img: 'https://static.thenounproject.com/png/40465-200.png',
			label: label || spot[25],
			color
		});
	});

	return parkingSpots;
}

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
			coordinates: number[]; // const rackTypes = new Set();
		};
	}[] = [];
	features.forEach((f: { properties: any; geometry: { type: string; coordinates: number[] } }) => {
		let color = '#000';
		if (!label)
			switch (f.properties.rack_type) {
				case 'Bike Corral':
					color = '#B10DC9';
					break;
				case 'LARGE HOOP':
					color = 'teal';
					break;
				case 'WAVE RACK':
					color = '#85144b';
					break;
				case 'U RACK':
					color = '#7FDBFF';
					break;
				case 'SMALL HOOP':
					color = '#0074D9';
					break;
				case 'UNDETERMINED':
					color = 'black';
					break;
				case 'WAVE RACK (PARKS)':
					color = 'orange';
					break;
				case 'STAPLE (PARKS)':
					color = 'lime';
					break;
				case 'DOT SLED (BLACK)':
					color = 'yellow';
					break;
				case 'GFI SLED (SILVER)':
					color = 'purple';
					break;
				case 'Opal Rack (Parks)':
					color = 'brown';
					break;
				default:
					color = 'red';
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
		)
	]).then((r) => {
		console.log(r);
		return { parkingSpots: r[0] };
	});

	// return Promise.all([
	// 	loadBikeSpots(
	// 		fetch,
	// 		'https://data.cityofnewyork.us/api/views/dimy-qyej/rows.json?accessType=DOWNLOAD',
	// 		'Shelter'
	// 	),
	// 	// loadBikeSpots(
	// 	// 	fetch,
	// 	// 	'https://data.cityofnewyork.us/api/views/au7q-njtk/rows.json?accessType=DOWNLOAD'
	// 	// )
	// ]).then((results) => {
	// 	console.log({ res: results[0] });
	// 	const parkingSpots = [...results[0]];
	// 	return { parkingSpots: parkingSpots.splice(0, 5000) };
	// });
}
