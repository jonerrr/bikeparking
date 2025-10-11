import type {
	MaplibreGeocoderApi,
	MaplibreGeocoderApiConfig,
	MaplibreGeocoderFeatureResults,
	CarmenGeojsonFeature
} from '@maplibre/maplibre-gl-geocoder';

const BASE_URL = 'https://geosearch.planninglabs.nyc/v2';

const requestJson = async <T>(
	endpoint: string,
	params: URLSearchParams
): Promise<T | undefined> => {
	const url = `${BASE_URL}/${endpoint}?${params.toString()}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			console.error(`GeoSearch request failed (${response.status}): ${response.statusText}`);
			return undefined;
		}

		const payload = (await response.json()) as T;
		// const errors = getGeocodingErrors(payload);
		// if (errors.length) {
		// 	console.warn(`GeoSearch responded with errors for ${endpoint}: ${errors.join('; ')}`);
		// 	return undefined;
		// }

		return payload;
	} catch (error) {
		console.error('GeoSearch request error', error);
		return undefined;
	}
};

const buildForwardParams = (config: MaplibreGeocoderApiConfig) => {
	const params = new URLSearchParams();
	if (typeof config.query === 'string' && config.query.trim().length > 0) {
		params.set('text', config.query.trim());
	}

	if (typeof config.limit === 'number') {
		params.set('size', config.limit.toString());
	}

	// if (config.language) {
	// 	params.set('lang', toParamValue(config.language as string | string[]) ?? '');
	// }

	// if (config.countries) {
	// 	params.set('boundary.country', toParamValue(config.countries as string | string[]) ?? '');
	// }

	if (Array.isArray(config.bbox) && config.bbox.length === 4) {
		params.set('boundary.rect.min_lon', config.bbox[0].toString());
		params.set('boundary.rect.min_lat', config.bbox[1].toString());
		params.set('boundary.rect.max_lon', config.bbox[2].toString());
		params.set('boundary.rect.max_lat', config.bbox[3].toString());
	}

	if (Array.isArray(config.proximity) && config.proximity.length === 2) {
		const [longitude, latitude] = config.proximity;
		params.set('focus.point.lon', longitude.toString());
		params.set('focus.point.lat', latitude.toString());
	}

	// if (config.types) {
	// 	params.set('layers', toParamValue(config.types as string | string[]) ?? '');
	// }

	// Autocomplete benefits from smaller payloads; favour faster responses
	// if (endpoint === 'autocomplete' && !params.has('size')) {
	// 	params.set('size', '10');
	// }

	return params;
};

const prepareFeature = (feature: GeoJSON.Feature): CarmenGeojsonFeature => {
	const properties = feature.properties ?? {};
	// const bbox = feature.bbox as CarmenGeojsonFeature['bbox'];
	const geometry = feature.geometry ?? { type: 'Point', coordinates: [0, 0] };

	const id = feature.properties?.gid;

	const baseFeature = {
		type: 'Feature',
		id,
		geometry,
		properties,
		// bbox,
		text: properties?.name,
		place_name: properties?.label,
		place_type: ['place']
		// place_type: placeType,
	} as CarmenGeojsonFeature;

	// if (center) {
	// 	(baseFeature as CarmenGeojsonFeature & { center: [number, number] }).center = center;
	// }

	return baseFeature;
};

const emptyFeatureCollection = (): MaplibreGeocoderFeatureResults => ({
	type: 'FeatureCollection',
	features: []
});

const Geo: MaplibreGeocoderApi = {
	forwardGeocode: async (config) => {
		try {
			console.log('forwardGeocode', config);
			const params = buildForwardParams(config);
			const data = await requestJson<GeoJSON.FeatureCollection>('autocomplete', params);
			if (!data) return emptyFeatureCollection();

			return {
				type: 'FeatureCollection',
				features: data.features.map(prepareFeature)
			};
		} catch (error) {
			console.error('GeoSearch forwardGeocode error', error);
			return emptyFeatureCollection();
		}
	}
};

export default Geo;
