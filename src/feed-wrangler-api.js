import _ from 'lodash';

const API_ENDPOINT = 'http://fw-proxy.herokuapp.com/api/v2';

const ACCESS_TOKEN = localStorage.getItem('accessToken');

export function apiAuth(email, password) {
	// TODO: come up with a client key
	let url = `${API_ENDPOINT}/users/authorize/?email=${encodeURI(email)}&password=${encodeURI(password)}&client_key=client_key`;
	fetch(url).then(response => response.json()).then(({access_token}) => {
		localStorage.setItem('accessToken', access_token);
		window.location.reload();
	})

}

export function apiFetchFeedItems(limit, offset, options = {}) {
	let url = `${API_ENDPOINT}/feed_items/list?access_token=${ACCESS_TOKEN}`;

	if (limit) {
		url += `&limit=${limit}`;
	}

	if (offset) {
		url += `&offset=${offset}`;
	}

	if (!_.isUndefined(options.read)) {
		url += `&read=${options.read}`;
	}

	if (!_.isUndefined(options.starred)) {
		url += `&starred=${options.starred}`;
	}

	if (!_.isUndefined(options.feedId)) {
		url += `&feed_id=${options.feedId}`;
	}

	return fetch(url).then(response => response.json());
};

export function apiUpdateFeedItem(id, options = {}) {
	let url = `${API_ENDPOINT}/feed_items/update?access_token=${ACCESS_TOKEN}&feed_item_id=${id}`;

	if (!_.isUndefined(options.read)) {
		url += `&read=${options.read}`;
	}

	return fetch(url, { method: 'post' }).then(response => response.json());

	// Fake version for testing
	// return Promise.resolve({
	// 	result: 'success',
	// });
};

export function apiFetchSubscriptions() {
	const url = `${API_ENDPOINT}/subscriptions/list?access_token=${ACCESS_TOKEN}`;

	return fetch(url).then(response => response.json());
};

export function apiFetchFeedItemsByIds(ids) {
	let url = `${API_ENDPOINT}/feed_items/get?access_token=${ACCESS_TOKEN}`;

	url += `&feed_item_ids=${ids.join(',')}`

	return fetch(url).then(response => response.json().then(({feed_items}) => feed_items));
}

export function apiFetchAllUnreadIds(offset = 0) {
	let url = `${API_ENDPOINT}/feed_items/list_ids?access_token=${ACCESS_TOKEN}`;

	url += '&read=false';
	url += '&limit=1000';

	if (offset > 0) {
		url += `&offset=${offset}`
	}

	return fetch(url).then(response => response.json()).then(({ feed_items: feedItems }) => {
		const feedItemIds = _.map(feedItems, ({feed_item_id}) => feed_item_id.toString());
		if (feedItemIds.length === 1000) {
			// fetch more
			return apiFetchAllUnreadIds(offset + 1000).then((newFeedItems) => {
				return feedItemIds.concat(newFeedItems);
			})
		}
		return feedItemIds;
	});
}

export function apiFetchLastNDaysOfFeedItems(numDays, offset = 0) {
	let url = `${API_ENDPOINT}/feed_items/list?access_token=${ACCESS_TOKEN}`;

	url += '&limit=100';
	url += `&created_since=${Math.floor(Date.now()/1000) - ( numDays * 60 * 60 * 24 )}`;

	if (offset > 0) {
		url += `&offset=${offset}`
	}

	return fetch(url).then(response => response.json()).then(({ feed_items: feedItems }) => {
		if (feedItems.length === 100) {
			// fetch more
			return apiFetchLastNDaysOfFeedItems(numDays, offset + 100).then((newFeedItems) => {
				return feedItems.concat(newFeedItems);
			})
		}
		return feedItems;
	});
}