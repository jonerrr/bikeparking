import { parse, stringify } from 'csv/sync';
import fs from 'fs';
import proj4 from 'proj4';

// https://www.spatialreference.org/ref/epsg/nad83-new-york-long-island-ftus/
const firstProjection =
	'+proj=lcc +lat_1=41.03333333333333 +lat_2=40.66666666666666 +lat_0=40.16666666666666 +lon_0=-74 +x_0=300000.0000000001 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs';
// https://spatialreference.org/ref/epsg/wgs-84/
const secondProjection = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
const conv = proj4(firstProjection, secondProjection, [982218, 184999]);

console.log(`${conv[1]}, ${conv[0]}`);

(async () => {
	// change date to latest update whenever running
	console.log('fetching data');
	// const data = await (
	// 	await fetch(
	// 		'https://data.cityofnewyork.us/api/views/nfid-uabd/rows.csv?date=20231126&accessType=DOWNLOAD'
	// 	)
	// ).arrayBuffer();
	const data = fs.readFileSync('parking-signs.csv');

	console.log('parsing data');
	const csv = parse(data);
	// remove header
	csv.shift();

	const parsed = [];

	const removed = [
		'SS BY',
		'SUPERSEDED',
		'VOID',
		'SU PERSEDED',
		'REPLACED',
		'14 STREET & UNION SQ (B'
	];
	let last_support;
	let i = 0;
	for (let row of csv) {
		console.log(`${i++} / ${csv.length}`);
		// check if lat and lng are blank
		if (row[23] === '' || !row[24] === '') continue;
		// if the sign is the same as the last one, use the same support
		if (row[21] === 'SAME') row[21] = last_support;
		// check if support is good for bike lock
		if (row[21] !== 'POLE' && row[21] !== 'DR') continue;
		// check if sign has been removed
		if (removed.some((r) => row[13].includes(r))) continue;
		// convert to gs 84 projection
		const [lng, lat] = proj4(firstProjection, secondProjection, [
			parseFloat(row[23]),
			parseFloat(row[24])
		]);

		parsed.push({
			type: 'Feature',
			properties: {
				description: row[13]
			},
			geomertry: {
				type: 'Point',
				coordinates: [lng, lat]
			}
		});
		last_support = row[21];
	}
	console.log(parsed.length);
	// fs.writeFileSync(
	// 	'poles.geojson',
	// 	JSON.stringify({ type: 'FeatureCollection', features: parsed })
	// );
	fs.writeFileSync('poles.json', JSON.stringify(parsed));
})();
