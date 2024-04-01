'use strict';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AgGridReact} from '@ag-grid-community/react';
import {InfiniteRowModelModule} from '@ag-grid-community/infinite-row-model';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-quartz.css";

import {ModuleRegistry} from '@ag-grid-community/core';
import {getBaseUrl} from './ws.js';

ModuleRegistry.registerModules([InfiniteRowModelModule,SetFilterModule]);

export default function Trades() {

    const URL_WEB_SOCKET = getBaseUrl();
    
    const gridRef = useRef();    
    const [wsClient, setWsClient] = useState(null);
    const [gridParams, setGridParams] = useState(null);
    const [trades, setTrades] = useState([]);
    const [tradesMap, setTradesMap] = useState({});
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
                return <img src="https://www.ag-grid.com/example-assets/loading.gif" />;
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
          filterParams: { values: ['Buy', 'Sell'] },
      },
        {field: 'previousValue', minWidth: 150},
        {field: 'currentValue', minWidth: 150},
    ]);
    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            minWidth: 100,
            // sortable: false,
        }
    }, []);

    const getDatasource = ()=>{
      return {
        rowCount: undefined,
        getRows: getRowData
    };
    }

    const getTrades = ()=>{
      return trades;
    }

    const getRowData = (params) => {      
      setDsParams(params);      
  }

    useEffect(()=>{
      const wsClient = new WebSocket(URL_WEB_SOCKET);
      wsClient.onopen = () => {
          setWsClient(wsClient);
        };        
        wsClient.onmessage = async (evt) => {
          const data = await evt.data.text();
          const trade = JSON.parse(data);          
          setTrades(prevTrades => [...prevTrades,trade]);
          setTradesMap(prevTrades => {
            prevTrades[trade.id] = trade;
            return {...prevTrades};
          });
      };
      wsClient.onclose = () => console.log('ws closed');
      return () => {
        wsClient.close();
    };
    },[]);

    useEffect(()=>{
      if(wsClient&&gridParams){
        gridParams.api.setGridOption('datasource', getDatasource());
      }
    },[wsClient,gridParams]);

    const onGridReady = useCallback((params) => {
        setGridParams(params);
    }, []);

    const getRowId = useCallback(function (params) {
      return params.data.id;
  }, []);

    useEffect(() => {
        if (dsParams != null) {            
            const page = trades.slice(dsParams.startRow, dsParams.endRow);
            console.log("useEffect.trades",trades);
            console.log("useEffect.tradesMap",tradesMap);
            dsParams.successCallback(page, -1);
        }
    }, [trades]);
    useEffect(() => {      
      if(wsClient&&dsParams){        
        const request = JSON.stringify({offset: dsParams.startRow, limit: 100,sortModel:dsParams.sortModel});
        wsClient.send(request);
      }
  }, [dsParams]);

    const handleSortModelChanged = (event)=>{
      console.log("rtModelChanged",event);
    }

    return (
        <div style={containerStyle}>
            <div style={gridStyle} className={"ag-theme-quartz"}>
                <AgGridReact
                    ref={gridRef}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    // rowBuffer={0}
                    rowSelection={'multiple'}
                    rowModelType={'infinite'}
                    cacheBlockSize={100}
                    cacheOverflowSize={2}
                    maxConcurrentDatasourceRequests={2}
                    infiniteInitialRowCount={1}
                    maxBlocksInCache={2}
                    getRowId={getRowId}
                    onGridReady={onGridReady}
                    onSortChanged={(event)=>{setTrades([]);setTradesMap({})}}
                />
            </div>

        </div>
    );

}


/*

[


      // these are the row groups, so they are all hidden (they are shown in the group column)
      {headerName: 'Hierarchy', children: [
          {headerName: 'Product', field: 'PRODUCT', type: 'dimension', rowGroupIndex: 0, hide: true},
          {headerName: 'Portfolio', field: 'PORTFOLIO', type: 'dimension', rowGroupIndex: 1, hide: true},
          {headerName: 'Book', field: 'BOOK', type: 'dimension', rowGroupIndex: 2, hide: true},
        ]},

      // some string values, that do not get aggregated
      {headerName: 'Attributes', children: [
        {headerName: 'Trade', field: 'TRADEID', width: 100, type: 'dimension',
          filter: "agNumberColumnFilter",
          filterParams: {
            applyButton: true,
            newRowsAction: 'keep'
          }
        },
        {
          headerName: 'Deal Type', field: 'DEALTYPE', type: 'dimension',
          filter: 'agSetColumnFilter',
          filterParams: {
            values: ['Financial', 'Physical'],
            newRowsAction: 'keep'
          }
        },
        {headerName: 'Bid', field: 'BIDTYPE', type: 'dimension', width: 100, filter: 'agSetColumnFilter',
          filterParams: {
            values: ['Buy', 'Sell'],
            newRowsAction: 'keep'
          }
        }
      ]},

      // all the other columns (visible and not grouped)
      {headerName: 'Values', children: [
        {headerName: 'Current', field: 'CURRENTVALUE', type: 'measure'},
          {headerName: 'Previous', field: 'PREVIOUSVALUE', type: 'measure'},
          {headerName: 'PL 1', field: 'PL1', type: 'measure'},
          {headerName: 'PL 2', field: 'PL2', type: 'measure'},
          {headerName: 'Gain-DX', field: 'GAINDX', type: 'measure'},
          {headerName: 'SX / PX', field: 'SXPX', type: 'measure'},
          {headerName: '99 Out', field: 'X99OUT', type: 'measure'}
      ]}

]

let gridOptions = {
  columnTypes: {
    dimension: {
      enableRowGroup: true,
      enablePivot: true,
    },
    measure: {
      width: 150,
      aggFunc: 'sum',
      enableValue: true,
      cellClass: 'number',
      valueFormatter: numberCellFormatter,
      cellRenderer:'agAnimateShowChangeCellRenderer',
      allowedAggFuncs: ['avg','sum','min','max'],
      cellClassRules: {'negative': 'x < 0'}
    }
  },
  autoGroupColumnDef: {
    headerName: 'Hierarchy',
    width: 250
  },
  enableSorting: true,
  enableFilter: true,
  columnDefs: columnDefs,
  enableColResize: true,
  rowModelType: 'enterprise',
  cacheBlockSize: 100,
  rowGroupPanelShow: 'always',
  pivotPanelShow: 'always',
  suppressAggFuncInHeader: true,
  animateRows: false
};

function EnterpriseDatasource() {}

EnterpriseDatasource.prototype.getRows = function (params) {
  let jsonRequest = JSON.stringify(params.request, null, 2);
  console.log(jsonRequest);

  let httpRequest = new XMLHttpRequest();
  httpRequest.open('POST', 'http://localhost:9090/getRows');
  httpRequest.setRequestHeader("Content-type", "application/json");
  httpRequest.send(jsonRequest);
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === 4 && httpRequest.status === 200) {
      let result = JSON.parse(httpRequest.responseText);
      params.successCallback(result.data, result.lastRow);

      updateSecondaryColumns(params.request, result);
    }
  };
};

let updateSecondaryColumns = function (request, result) {
  let valueCols = request.valueCols;
  if (request.pivotMode && request.pivotCols.length > 0) {
    let secondaryColDefs = createSecondaryColumns(result.secondaryColumnFields, valueCols);
    gridOptions.columnApi.setSecondaryColumns(secondaryColDefs);
  } else {
    gridOptions.columnApi.setSecondaryColumns([]);
  }
};

let createSecondaryColumns = function (fields, valueCols) {
  let secondaryCols = [];

  function addColDef(colId, parts, res) {
    if (parts.length === 0) return [];

    let first = parts.shift();
    let existing = res.find(r => r.groupId === first);

    if (existing) {
      existing['children'] = addColDef(colId, parts, existing.children);
    } else {
      let colDef = {};
      let isGroup = parts.length > 0;
      if(isGroup) {
        colDef['groupId'] = first;
        colDef['headerName'] = first;
      } else {
        let valueCol = valueCols.find(r => r.field === first);

        colDef['colId'] = colId;
        colDef['headerName'] =  valueCol.displayName;
        colDef['field'] = colId;
        colDef['type'] = 'measure';
      }

      let children = addColDef(colId, parts, []);
      children.length > 0 ? colDef['children'] = children : null;

      res.push(colDef);
    }

    return res;
  }

  fields.sort();
  fields.forEach(field => addColDef(field, field.split('_'), secondaryCols));
  return secondaryCols;
};

function numberCellFormatter(params) {
  let formattedNumber = Math.floor(Math.abs(params.value)).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  return params.value < 0 ? '(' + formattedNumber + ')' : formattedNumber;
}*/