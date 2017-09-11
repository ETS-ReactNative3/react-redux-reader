import React, { Component } from 'react';
import { connect } from 'react-redux';
import Mousetrap from 'mousetrap';
import _ from 'lodash';

import { getAllSubscriptionIds, getUnreadSubscriptionIds } from '../redux/reducers/subscriptions-store';
import { fetchFeedItems } from '../redux/reducers/feed-items-store';
import { toggleShowFilter, selectSub, getSelectedSub, getShowFilter, SHOW_UNREAD, ALL_SUBSCRIPTION } from '../redux/reducers/app-state-store';
import SubListItem from './sub-list-item';
import AllSubListItem from './all-sub-list-item';

class SubList extends Component {
	constructor(props) {
		super(props);
		this.keyboardShortcuts = {
			n: this.nextSub.bind(this),
			p: this.prevSub.bind(this),
		};
		this.fetchFeedItems = this.fetchFeedItems.bind(this);
		this.toggleShowFilter = this.toggleShowFilter.bind(this);
	}

	componentDidMount() {
		_.forEach(this.keyboardShortcuts, (cb, shortcut) => {
			Mousetrap.bind(shortcut, cb);
		})
	}

	componentWillUnmount() {
		_.forEach(this.keyboardShortcuts, (cb, shortcut) => {
			Mousetrap.unbind(shortcut, cb);
		})
	}

	nextSub() {
		const { subscriptionIds, selectedSubscriptionId, selectSub } = this.props;
		let idToScrollTo;
		if (selectedSubscriptionId === ALL_SUBSCRIPTION && subscriptionIds[0]) {
			idToScrollTo = subscriptionIds[0];
		} else {
			const currentIndex = subscriptionIds.indexOf(selectedSubscriptionId);
			if (currentIndex >= 0 && currentIndex + 1 < subscriptionIds.length) {
				idToScrollTo = subscriptionIds[currentIndex + 1];
			} else {
				idToScrollTo = ALL_SUBSCRIPTION
			}
		}

		selectSub(idToScrollTo);
		document.querySelector(`#sub-item-${idToScrollTo}`).scrollIntoViewIfNeeded(false);
	}

	prevSub() {
		const { subscriptionIds, selectedSubscriptionId, selectSub } = this.props;
		let idToScrollTo;

		const currentIndex = subscriptionIds.indexOf(selectedSubscriptionId);
		if (currentIndex === 0) {
			idToScrollTo = ALL_SUBSCRIPTION;
		} else if (currentIndex >= 0 && currentIndex - 1 >= 0) {
			idToScrollTo = subscriptionIds[currentIndex - 1];
		} else {
			idToScrollTo = ALL_SUBSCRIPTION;
		}

		selectSub(idToScrollTo);
		document.querySelector(`#sub-item-${idToScrollTo}`).scrollIntoViewIfNeeded(false);
	}

	fetchFeedItems(e) {
		e.preventDefault();
		this.props.fetchFeedItems();
	}

	toggleShowFilter(e) {
		e.preventDefault();
		this.props.toggleShowFilter();
	}

	render() {
		return (
			<div id="sub-list">
				<div style={{ overflow: 'auto', flex: '1 1 0', paddingTop: '30px' }}>
					<AllSubListItem />
					{this.props.subscriptionIds.map(
						id => {
							return <SubListItem id={id} key={id} />
						}
					)}
				</div>
				<button style={{ marginTop: 'auto', padding: '10px 0' }} onClick={this.toggleShowFilter}>
					Show {this.props.showFilter === SHOW_UNREAD ? 'All' : 'Unread Only'}
				</button>
				<button style={{ padding: '10px 0' }} onClick={this.fetchFeedItems}>
					Sync
				</button>
			</div>
		);
	}
};

function mapStateToProps(state) {
	const showUnread = getShowFilter(state) === SHOW_UNREAD;
	return {
		subscriptionIds: showUnread ?
			getUnreadSubscriptionIds(state) :
			getAllSubscriptionIds(state),
		selectedSubscriptionId: getSelectedSub(state),
		showFilter: getShowFilter(state),

	};
}

const mapDispatchToProps = {
	selectSub,
	fetchFeedItems,
	toggleShowFilter,
}

export default connect(mapStateToProps, mapDispatchToProps)(SubList);

