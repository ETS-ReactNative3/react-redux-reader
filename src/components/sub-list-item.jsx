import React from 'react';
import { connect } from 'react-redux';

import { getSubscriptionById } from '../redux/reducers/subscriptions-store';
import { getCountForFeed } from '../redux/reducers/feed-items-store';
import { getSelectedSub } from '../redux/reducers/app-state-store';
import BaseSubListItem from './base-sub-list-item';

function mapStateToProps(state, { id }) {
	const sub = getSubscriptionById(state, id);
	return {
		title: sub.title,
		count: getCountForFeed(state, id),
		isActive: getSelectedSub(state) === id,
	};
}

export default connect(mapStateToProps)(BaseSubListItem);