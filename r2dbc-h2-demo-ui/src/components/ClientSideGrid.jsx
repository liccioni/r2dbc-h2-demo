"use strict";

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  StrictMode,
} from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import "./styles.css";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
]);

const printNode = (node, index) => {
  if (node.group) {
    console.log(index + " -> group: " + node.key);
  } else {
    console.log(
      index + " -> data: " + node.data.country + ", " + node.data.athlete,
    );
  }
};

export default function ClientSideGrid() {
  const gridRef = useRef();
  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  const [rowData, setRowData] = useState();
  const [columnDefs, setColumnDefs] = useState([
    { field: "country", hide: true },
    { field: "athlete", minWidth: 180 },
    { field: "age" },
    { field: "year" },
    { field: "date", minWidth: 150 },
    { field: "sport", minWidth: 150 },
    { field: "gold" },
    { field: "silver" },
    { field: "bronze" },
    { field: "total" },
  ]);
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      minWidth: 100,
      filter: true,
    };
  }, []);
  const autoGroupColumnDef = useMemo(() => {
    return {
      minWidth: 200,
    };
  }, []);

  const onGridReady = useCallback((params) => {
    fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
      .then((resp) => resp.json())
      .then((data) => setRowData(data.slice(0, 50)));
  }, []);

  const onBtForEachNode = useCallback(() => {
    console.log("### api.forEachNode() ###");
    gridRef.current.api.forEachNode(printNode);
  }, [printNode]);

  const onBtForEachNodeAfterFilter = useCallback(() => {
    console.log("### api.forEachNodeAfterFilter() ###");
    gridRef.current.api.forEachNodeAfterFilter(printNode);
  }, [printNode]);

  const onBtForEachNodeAfterFilterAndSort = useCallback(() => {
    console.log("### api.forEachNodeAfterFilterAndSort() ###");
    gridRef.current.api.forEachNodeAfterFilterAndSort(printNode);
  }, [printNode]);

  const onBtForEachLeafNode = useCallback(() => {
    console.log("### api.forEachLeafNode() ###");
    gridRef.current.api.forEachLeafNode(printNode);
  }, [printNode]);

  return (
    <StrictMode>
    <div style={containerStyle}>
      <div className="example-wrapper">
        <div style={{ marginBottom: "1rem" }}>
          <button onClick={onBtForEachNode}>For-Each Node</button>
          <button onClick={onBtForEachNodeAfterFilter}>
            For-Each Node After Filter
          </button>
          <button onClick={onBtForEachNodeAfterFilterAndSort}>
            For-Each Node After Filter and Sort
          </button>
          <button onClick={onBtForEachLeafNode}>For-Each Leaf Node</button>
        </div>

        <div
          style={gridStyle}
          className={
            "ag-theme-quartz"
          }
        >
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            autoGroupColumnDef={autoGroupColumnDef}
            groupDefaultExpanded={1}
            onGridReady={onGridReady}
          />
        </div>
      </div>
    </div>
    </StrictMode>
  );
};
