import React, { Component } from 'react';
import './ListView.css';
import clsx from 'clsx';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import styles from './ListView.css';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import List from 'react-virtualized/dist/es/List';
import {
    ContentBox,
    ContentBoxHeader,
    ContentBoxParagraph,
} from './ContentBox';
import {LabeledInput, InputRow} from './LabeledInput';


class ListView extends Component {
    static contextTypes = {
        list: PropTypes.instanceOf(Immutable.List).isRequired,
    };

    constructor(props, context) {
        console.log("TEST",props.testList.length);
        super(props, context);
        this.state = {
            listHeight: 300,
            listRowHeight: 50,
            overscanRowCount: 10,
            rowCount: props.testList.length,
            scrollToIndex: undefined,
            showScrollingPlaceholder: false,
            useDynamicRowHeight: false,
        };

        this._getRowHeight = this._getRowHeight.bind(this);
        this._noRowsRenderer = this._noRowsRenderer.bind(this);
        this._onRowCountChange = this._onRowCountChange.bind(this);
        this._onScrollToRowChange = this._onScrollToRowChange.bind(this);
        this._rowRenderer = this._rowRenderer.bind(this);
    }

    render() {
        const {
            listHeight,
            listRowHeight,
            overscanRowCount,
            rowCount,
            scrollToIndex,
            showScrollingPlaceholder,
            useDynamicRowHeight,
        } = this.state;

        return (
            <ContentBox style={{ height: '100vh', width: '100%' }}>
                <div style = {{height: "30vh"}}>
                    <ContentBoxParagraph>
                        <label className={styles.checkboxLabel}>
                            <input
                                aria-label="Use dynamic row heights?"
                                checked={useDynamicRowHeight}
                                className={styles.checkbox}
                                type="checkbox"
                                onChange={event =>
                                    this.setState({useDynamicRowHeight: event.target.checked})
                                }
                            />
                            Use dynamic row heights?
                        </label>

                        <label className={styles.checkboxLabel}>
                            <input
                                aria-label="Show scrolling placeholder?"
                                checked={showScrollingPlaceholder}
                                className={styles.checkbox}
                                type="checkbox"
                                onChange={event =>
                                    this.setState({
                                        showScrollingPlaceholder: event.target.checked,
                                    })
                                }
                            />
                            Show scrolling placeholder?
                        </label>
                    </ContentBoxParagraph>

                    <InputRow>
                        <LabeledInput
                            label="Num rows"
                            name="rowCount"
                            onChange={this._onRowCountChange}
                            value={rowCount}
                        />
                        <LabeledInput
                            label="Scroll to"
                            name="onScrollToRow"
                            placeholder="Index..."
                            onChange={this._onScrollToRowChange}
                            value={scrollToIndex || ''}
                        />
                        <LabeledInput
                            label="List height"
                            name="listHeight"
                            onChange={event =>
                                this.setState({
                                    listHeight: parseInt(event.target.value, 10) || 1,
                                })
                            }
                            value={listHeight}
                        />
                        <LabeledInput
                            disabled={useDynamicRowHeight}
                            label="Row height"
                            name="listRowHeight"
                            onChange={event =>
                                this.setState({
                                    listRowHeight: parseInt(event.target.value, 10) || 1,
                                })
                            }
                            value={listRowHeight}
                        />
                        <LabeledInput
                            label="Overscan"
                            name="overscanRowCount"
                            onChange={event =>
                                this.setState({
                                    overscanRowCount: parseInt(event.target.value, 10) || 0,
                                })
                            }
                            value={overscanRowCount}
                        />
                    </InputRow>
                </div>

                <div>
                    <AutoSizer>
                        {({width}) => (
                            <List
                                style = {{height: "70vh"}}
                                ref="List"
                                className={styles.List}
                                height={listHeight}
                                autoHeight
                                overscanRowCount={overscanRowCount}
                                noRowsRenderer={this._noRowsRenderer}
                                rowCount={rowCount}
                                rowHeight={
                                    useDynamicRowHeight ? this._getRowHeight : listRowHeight
                                }
                                rowRenderer={this._rowRenderer}
                                scrollToIndex={scrollToIndex}
                                width={width}
                            />
                        )}
                    </AutoSizer>
                </div>
            </ContentBox>
        );
    }
    _getDatum(index) {
        const {testList} = this.props;

        return testList[index % testList.length];
    }

    _getRowHeight({index}) {
        return this._getDatum(index).size;
    }

    _noRowsRenderer() {
        return <div className={styles.noRows}>No rows</div>;
    }

    _onRowCountChange(event) {
        const rowCount = parseInt(event.target.value, 10) || 0;

        this.setState({rowCount});
    }

    _onScrollToRowChange(event) {
        const {rowCount} = this.state;
        let scrollToIndex = Math.min(
            rowCount - 1,
            parseInt(event.target.value, 10),
        );

        if (isNaN(scrollToIndex)) {
            scrollToIndex = undefined;
        }

        this.setState({scrollToIndex});
    }

    _rowRenderer({index, isScrolling, key, style}) {
        const {showScrollingPlaceholder, useDynamicRowHeight} = this.state;

        if (showScrollingPlaceholder && isScrolling) {
            return (
                <div
                    className={clsx(styles.row, styles.isScrollingPlaceholder)}
                    key={key}
                    style={style}>
                    Scrolling...
                </div>
            );
        }

        const datum = this._getDatum(index);

        let additionalContent;

        if (useDynamicRowHeight) {
            switch (datum.size) {
                case 75:
                    additionalContent = <div>It is medium-sized.</div>;
                    break;
                case 100:
                    additionalContent = (
                        <div>
                            It is large-sized.<br />It has a 3rd row.
                        </div>
                    );
                    break;
            }
        }

        return (
            <div className={styles.row} key={key} style={style}>
                <div>
                    <div className={styles.name}>{datum.name}</div>
                    <div className={styles.index}>This is row {index}</div>
                    {additionalContent}
                </div>
                {useDynamicRowHeight && (
                    <span className={styles.height}>{datum.size}px</span>
                )}
            </div>
        );
    }
}

export default ListView