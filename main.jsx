import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import { SinkComposition } from "./composition.jsx";
import { styles } from "./styles.js";
import { useRendering } from "./useRendering.js";
import { DebugPanel } from "./DebugPanel.jsx";
import { ChunkGrid } from "./ChunkGrid.jsx";
import { KitchenSceneInteractive } from "./scene.jsx";
const App = () => {
  const [showDebug, setShowDebug] = useState(false);
  const [config, setConfig] = useState({
    duration: 95,
    fps: 30,
    strategy: "auto",
    customFrames: 120,
    customConcurrency: 25,
    combineChunks: false
  });
  const playerRef = useRef(null);
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "~" || e.key === "`") {
        setShowDebug((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
  const {
    stats,
    renderStatus,
    recording,
    recordChunk,
    renderAllChunks
  } = useRendering(config, playerRef);
  return /* @__PURE__ */ jsxDEV("div", { style: styles.container, children: [
    showDebug && /* @__PURE__ */ jsxDEV("header", { style: styles.header, children: [
      /* @__PURE__ */ jsxDEV("h1", { style: styles.h1, children: "\u{1F3AC} Remotion Smart Chunk Manager" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 46,
        columnNumber: 11
      }),
      /* @__PURE__ */ jsxDEV("p", { style: styles.subtitle, children: "Optimized rendering pipeline for WebSim & Lambda" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 47,
        columnNumber: 11
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 45,
      columnNumber: 9
    }),
    /* @__PURE__ */ jsxDEV("div", { style: styles.grid, children: [
      showDebug && /* @__PURE__ */ jsxDEV(
        DebugPanel,
        {
          config,
          setConfig,
          stats,
          recording,
          renderAllChunks
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 54,
          columnNumber: 11
        }
      ),
      /* @__PURE__ */ jsxDEV("div", { style: styles.playerWrapper, children: stats.totalFrames > 0 ? /* @__PURE__ */ jsxDEV(
        Player,
        {
          ref: playerRef,
          component: SinkComposition,
          durationInFrames: stats.totalFrames,
          fps: config.fps,
          compositionWidth: 1080,
          compositionHeight: 1920,
          controls: true,
          loop: true,
          muted: recording,
          style: {
            width: "100%",
            maxWidth: "360px",
            aspectRatio: "9/16",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)"
          }
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 66,
          columnNumber: 13
        }
      ) : /* @__PURE__ */ jsxDEV("div", { style: {
        width: "100%",
        maxWidth: "360px",
        aspectRatio: "9/16",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        borderRadius: "10px",
        color: "white"
      }, children: "Invalid Duration" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 84,
        columnNumber: 14
      }) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 64,
        columnNumber: 9
      }),
      showDebug && /* @__PURE__ */ jsxDEV(
        ChunkGrid,
        {
          stats,
          renderStatus,
          recordChunk
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 96,
          columnNumber: 11
        }
      ),
      showDebug && /* @__PURE__ */ jsxDEV("div", { style: { ...styles.card, gridColumn: "1 / -1", height: "600px", display: "flex", flexDirection: "column" }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { marginBottom: "20px" }, children: [
          /* @__PURE__ */ jsxDEV("h2", { style: { marginBottom: "5px" }, children: "\u{1F579}\uFE0F Interactive Scene Preview" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 107,
            columnNumber: 15
          }),
          /* @__PURE__ */ jsxDEV("p", { style: { opacity: 0.8, fontSize: "14px" }, children: [
            "Click inside to capture mouse control. ",
            /* @__PURE__ */ jsxDEV("b", { children: "WASD" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 109,
              columnNumber: 56
            }),
            " to move, ",
            /* @__PURE__ */ jsxDEV("b", { children: "Space/Shift" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 109,
              columnNumber: 77
            }),
            " to fly up/down, ",
            /* @__PURE__ */ jsxDEV("b", { children: "Mouse" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 109,
              columnNumber: 112
            }),
            " to look. ",
            /* @__PURE__ */ jsxDEV("b", { children: "ESC" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 109,
              columnNumber: 134
            }),
            " to release."
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 108,
            columnNumber: 15
          })
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 106,
          columnNumber: 13
        }),
        /* @__PURE__ */ jsxDEV("div", { style: { flex: 1, width: "100%", borderRadius: "12px", overflow: "hidden", background: "#111" }, children: /* @__PURE__ */ jsxDEV(KitchenSceneInteractive, {}, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 113,
          columnNumber: 15
        }) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 112,
          columnNumber: 13
        })
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 105,
        columnNumber: 11
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 51,
      columnNumber: 7
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 43,
    columnNumber: 5
  });
};
createRoot(document.getElementById("app")).render(/* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 122,
  columnNumber: 51
}));
