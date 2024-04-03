'use strict';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AgGridReact} from '@ag-grid-community/react';
import {InfiniteRowModelModule} from '@ag-grid-community/infinite-row-model';
import {SetFilterModule} from '@ag-grid-enterprise/set-filter';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";

import {ModuleRegistry} from '@ag-grid-community/core';
import {getAxiosBaseUrl, getBaseUrl} from './ws.js';
import axios from "axios";

ModuleRegistry.registerModules([InfiniteRowModelModule, SetFilterModule]);

export default function Trades() {

    const URL_WEB_SOCKET = getBaseUrl();
    const AXIOS_URL = getAxiosBaseUrl();

    const gridRef = useRef();
    const [wsClient, setWsClient] = useState(null);
    const [gridParams, setGridParams] = useState(null);
    const [trades, setTrades] = useState([]);
    const [selectedTrade, setSelectedTrade] = useState(null);
    const [dsParams, setDsParams] = useState(null);
    const containerStyle = useMemo(() => ({width: '100%', height: '100%'}), []);
    const gridStyle = useMemo(() => ({height: '100%', width: '100%'}), []);

    const [columnDefs, setColumnDefs] = useState([
        {
            headerName: 'ID',
            maxWidth: 100,
            valueGetter: 'node.id',
            cellRenderer: props => {
                if (props.value !== undefined) {
                    return props.value;
                } else {
                    return <img src="https://www.ag-grid.com/example-assets/loading.gif"/>;
                }
            },
            // we don't want to sort by the row index, this doesn't make sense as the point
            // of the row index is to know the row index in what came back from the server
            sortable: false,
            suppressHeaderMenuButton: true,
        },
        {field: 'product', minWidth: 150},
        {field: 'tradeId', minWidth: 150},
        {field: 'portfolio', minWidth: 150},
        {field: 'dealType', minWidth: 150},
        {field: 'book', minWidth: 150},
        {
            field: 'bidType',
            filter: 'agSetColumnFilter',
            filterParams: {values: ['Buy', 'Sell']},
        },
        {field: 'previousValue', minWidth: 150},
        {field: 'currentValue', minWidth: 150},
    ]);
    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            minWidth: 100,
            // sortable: false,
            enableCellChangeFlash: true,
        }
    }, []);

    const getDatasource = () => {
        return {
            rowCount: undefined,
            getRows: getRowData
        };
    }

    const getTrades = () => {
        return trades;
    }

    const getRowData = (params) => {
        setDsParams(params);
    }

    useEffect(() => {
        const wsClient = new WebSocket(URL_WEB_SOCKET);
        wsClient.onopen = () => {
            setWsClient(wsClient);
        };
        wsClient.onmessage = async (evt) => {
            const data = await evt.data.text();
            const tradeUIEvent = JSON.parse(data);
            if (tradeUIEvent.type === "PAGE") {
                // setTrades(prevTrades => [...prevTrades, ...tradeUIEvent.payload]);
                setTrades(tradeUIEvent.payload);
            } else {
                console.log("wsClient.onmessage", tradeUIEvent);
                // gridRef.current.api.applyServerSideTransactionAsync({update:[tradeUIEvent.payload]});
                gridRef.current.api.forEachNode(rowNode => {
                    console.log("gridRef.current.api.forEachNode",rowNode.data)
                    if (tradeUIEvent.payload.id === rowNode.data.id) {
                        rowNode.setData(tradeUIEvent.payload);
                    }
                });
            }
        };
        wsClient.onclose = () => console.log('ws closed');
        return () => {
            wsClient.close();
        };
    }, []);

    useEffect(() => {
        if (wsClient && gridParams) {
            gridParams.api.setGridOption('datasource', getDatasource());
        }
    }, [wsClient, gridParams]);

    const onGridReady = useCallback((params) => {
        setGridParams(params);
    }, []);

    const getRowId = useCallback(function (params) {
        return params.data.id;
    }, []);

    useEffect(() => {
        console.log("useEffect.trades", trades);
        if (dsParams != null) {
            // const page = trades.slice(dsParams.startRow, dsParams.endRow);
            // dsParams.successCallback(page, -1);
            dsParams.successCallback(trades, -1);
        }
    }, [trades]);
    useEffect(() => {
        if (wsClient && dsParams) {
            console.log("useEffect.dsParams", dsParams)
            const request = JSON.stringify({offset: dsParams.startRow, limit: 100, sortModel: dsParams.sortModel});
            wsClient.send(request);
        }
    }, [dsParams]);

    const handleSortModelChanged = (event) => {
        console.log("rtModelChanged", event);
    }

    const onSelectionChanged = useCallback(() => {
        const selectedRows = gridRef.current.api.getSelectedRows();
        if (selectedRows.length > 0) {
            const selectedRow = selectedRows[0];
            setSelectedTrade(selectedRow)
            setInputs({previousValue: selectedRow.previousValue, currentValue: selectedRow.currentValue})
        } else {
            setSelectedTrade(null)
            setInputs(null)
        }
    }, [selectedTrade]);

    const [inputs, setInputs] = useState({});

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]: value}))
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const response = await axios.patch(`${AXIOS_URL}/${selectedTrade.id}`, inputs)
        console.log("handleSubmit", response);
    }

    return (
        <div style={containerStyle}>
            {selectedTrade && <div>
                <p> Selected trade:{selectedTrade.id}</p>
                <form onSubmit={handleSubmit}>
                    <label>Previous Value:
                        <input
                            type="number"
                            name="previousValue"
                            value={inputs.previousValue || ""}
                            onChange={handleChange}
                        />
                    </label>
                    <label>Current Value:
                        <input
                            type="number"
                            name="currentValue"
                            value={inputs.currentValue || ""}
                            onChange={handleChange}
                        />
                    </label>
                    <input type="submit"/>
                </form>
            </div>}
            <div style={gridStyle} className={"ag-theme-quartz"}>
                <AgGridReact
                    ref={gridRef}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    // rowBuffer={0}
                    rowSelection={'single'}
                    rowModelType={'infinite'}
                    cacheBlockSize={100}
                    cacheOverflowSize={2}
                    maxConcurrentDatasourceRequests={1}
                    infiniteInitialRowCount={1}
                    maxBlocksInCache={1}
                    getRowId={getRowId}
                    onGridReady={onGridReady}
                    onSelectionChanged={onSelectionChanged}
                    onSortChanged={(event) => setTrades([])}
                />
            </div>

        </div>
    );

}
