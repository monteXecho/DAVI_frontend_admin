import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useChecks } from "../contexts/ChecksContext";
import { getFirstImageOfDoc } from "../services/api";
import Icon from "./Icon";

const ROI_KEYS = ["week", "main", "time"];

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function normRect(r) {
  const x0 = Math.min(r.x0, r.x1);
  const y0 = Math.min(r.y0, r.y1);
  const x1 = Math.max(r.x0, r.x1);
  const y1 = Math.max(r.y0, r.y1);
  return { x0, y0, x1, y1 };
}

export default function FileFormatModal({ kind, onClose }) {
  const { fileMap } = useChecks();
  const file = useMemo(() => fileMap[kind], [fileMap, kind]);

  const [imgSrc, setImgSrc] = useState("");
  const [imgEl, setImgEl] = useState(null);

  const [rois, setRois] = useState({
    week: { x0: 0, y0: 0, x1: 0, y1: 0 },
    main: { x0: 0, y0: 0, x1: 0, y1: 0 },
    time: { x0: 0, y0: 0, x1: 0, y1: 0 },
  });
  const [activeKey, setActiveKey] = useState("week");

  const [mouseImgX, setMouseImgX] = useState(null);
  const [mouseImgY, setMouseImgY] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showMag, setShowMag] = useState(false);

  const stageRef = useRef(null);
  const overlayRef = useRef(null);
  const magRef = useRef(null);

  const draggingRef = useRef(false);
  const dragStartRef = useRef(null);

  useEffect(() => {
    async function getImage() {
      try {
        const res = await getFirstImageOfDoc(file.objectKey);
        setImgSrc(res.data_url);
      } catch (error) {
        console.log(error);
      }
    }
    if (file && file.objectKey) getImage();
  }, [file]);

  useEffect(() => {
    if (!imgSrc) return;
    const img = new Image();
    img.onload = () => setImgEl(img);
    img.src = imgSrc;
  }, [imgSrc]);

  useEffect(() => {
    function layout() {
      const stage = stageRef.current;
      const overlay = overlayRef.current;
      if (!stage || !overlay || !imgEl) return;

      const maxW = stage.clientWidth;
      const maxH = Math.min(stage.clientHeight, 800);
      const iw = imgEl.width;
      const ih = imgEl.height;
      let scale = Math.min(maxW / iw, maxH / ih);
      if (!isFinite(scale) || scale <= 0) scale = 1;

      const renderW = Math.round(iw * scale);
      const renderH = Math.round(ih * scale);

      overlay.width = renderW;
      overlay.height = renderH;
      overlay.style.width = `${renderW}px`;
      overlay.style.height = `${renderH}px`;
      overlay.style.cursor = "crosshair";

      drawOverlay();
    }
    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, [imgEl, imgSrc]);

  function getGeom() {
    const overlay = overlayRef.current;
    if (!overlay || !imgEl) return null;
    const rw = overlay.width;
    const rh = overlay.height;
    const scaleX = rw / imgEl.width;
    const scaleY = rh / imgEl.height;
    const rect = overlay.getBoundingClientRect();
    return { overlay, scaleX, scaleY, rect };
  }

  function clientToImage(e) {
    const g = getGeom();
    if (!g) return null;
    const x = (e.clientX - g.rect.left) / g.scaleX;
    const y = (e.clientY - g.rect.top) / g.scaleY;
    const ix = Math.floor(clamp(x, 0, imgEl.width - 1));
    const iy = Math.floor(clamp(y, 0, imgEl.height - 1));
    return { ix, iy };
  }

  function drawOverlay(previewRect) {
    const overlay = overlayRef.current;
    if (!overlay || !imgEl) return;
    const ctx = overlay.getContext("2d");
    const rw = overlay.width;
    const rh = overlay.height;

    ctx.clearRect(0, 0, rw, rh);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(imgEl, 0, 0, rw, rh);

    const drawRect = (r, color, dash) => {
      const g = getGeom();
      const nr = normRect(r);
      const x = Math.round(nr.x0 * g.scaleX);
      const y = Math.round(nr.y0 * g.scaleY);
      const w = Math.round((nr.x1 - nr.x0) * g.scaleX);
      const h = Math.round((nr.y1 - nr.y0) * g.scaleY);
      ctx.save();
      if (dash) ctx.setLineDash([6, 4]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 0.5, y + 0.5, w, h);
      ctx.restore();
    };

    drawRect(rois.week, "#22c55e");
    drawRect(rois.main, "#3b82f6");
    drawRect(rois.time, "#f97316");

    if (previewRect) {
      drawRect(previewRect, "#ef4444", true);
    }
  }

  function drawMagnifier(ix, iy) {
    const mag = magRef.current;
    if (!mag || !imgEl) return;

    const size = 40;
    const zoom = 4;
    const dst = size * zoom;

    mag.width = dst;
    mag.height = dst;

    const ctx = mag.getContext("2d");
    const sx = clamp(ix - size / 2, 0, imgEl.width - size);
    const sy = clamp(iy - size / 2, 0, imgEl.height - size);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, dst, dst);
    ctx.drawImage(imgEl, sx, sy, size, size, 0, 0, dst, dst);

    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.beginPath();
    ctx.moveTo(0, dst / 2);
    ctx.lineTo(dst, dst / 2);
    ctx.moveTo(dst / 2, 0);
    ctx.lineTo(dst / 2, dst);
    ctx.stroke();
    ctx.strokeStyle = "white";
    ctx.setLineDash([3, 3]);
    ctx.stroke();
  }

  const onMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    const pos = clientToImage(e);
    if (!pos) {
      setShowMag(false);
      return;
    }
    setShowMag(true);
    setMouseImgX(pos.ix);
    setMouseImgY(pos.iy);
    drawMagnifier(pos.ix, pos.iy);

    if (draggingRef.current && dragStartRef.current) {
      const start = dragStartRef.current;
      const preview = { x0: start.x, y0: start.y, x1: pos.ix, y1: pos.iy };
      drawOverlay(preview);
    }
  };

  const onMouseDown = (e) => {
    const pos = clientToImage(e);
    if (!pos) return;
    draggingRef.current = true;
    dragStartRef.current = { x: pos.ix, y: pos.iy };
  };

  function endDrag(e) {
    if (!draggingRef.current) return;
    const pos = clientToImage(e);
    draggingRef.current = false;

    if (dragStartRef.current && pos) {
      const start = dragStartRef.current;
      const final = normRect({
        x0: start.x,
        y0: start.y,
        x1: pos.ix,
        y1: pos.iy,
      });
      setRois((prev) => ({ ...prev, [activeKey]: final }));
      dragStartRef.current = null;
      drawOverlay();
    }
  }

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const onUp = (e) => endDrag(e);
    const onLeave = (e) => endDrag(e);
    overlay.addEventListener("mouseup", onUp);
    overlay.addEventListener("mouseleave", onLeave);
    return () => {
      overlay.removeEventListener("mouseup", onUp);
      overlay.removeEventListener("mouseleave", onLeave);
    };
  }, [activeKey, imgEl]);

  useEffect(() => {
    drawOverlay();
  }, [rois, imgEl]);

  const setField = (key, field, v) => {
    const num = Number(v);
    if (Number.isNaN(num)) return;
    setRois((prev) => {
      const r = { ...prev[key], [field]: Math.max(0, Math.floor(num)) };
      return { ...prev, [key]: r };
    });
  };

  const copyJson = () => {
    const payload = {
      week: normRect(rois.week),
      main: normRect(rois.main),
      time: normRect(rois.time),
      imageWidth: imgEl ? imgEl.width : 0,
      imageHeight: imgEl ? imgEl.height : 0,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-4 md:p-6 w-full max-w-5xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit File Format</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-4">
          {/* Left panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Regions</span>
              <button
                className="text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                onClick={copyJson}
                disabled={!imgEl}
                title="Copy ROIs JSON"
              >
                Copy JSON
              </button>
            </div>

            {ROI_KEYS.map((key) => {
              const r = rois[key];
              const active = activeKey === key;
              return (
                <div
                  key={key}
                  className={`rounded-md p-2 border ${
                    active ? "border-blue-500" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold capitalize">{key}</label>
                    <button
                      className={`text-xs px-2 py-0.5 rounded ${
                        active ? "bg-blue-600 text-white" : "bg-gray-100"
                      }`}
                      onClick={() => setActiveKey(key)}
                    >
                      {active ? "Active" : "Make Active"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {["x0", "y0", "x1", "y1"].map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">{f}:</label>
                        <input
                          type="number"
                          className="border-b px-2 py-0 text-sm w-full"
                          value={r[f]}
                          onChange={(e) => setField(key, f, e.target.value)}
                          onFocus={() => setActiveKey(key)}
                          min={0}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="text-sm text-gray-600">
              {mouseImgX !== null && mouseImgY !== null ? (
                <>
                  Mouse:{" "}
                  <span className="font-mono">
                    ({mouseImgX}, {mouseImgY})
                  </span>
                </>
              ) : (
                "Mouse: —"
              )}
            </div>

            <p className="text-xs text-gray-500">
              Tip: Click an input (or “Make Active”), then drag on the image to
              draw that region.
            </p>
          </div>

          {/* Right panel */}
          <div className="relative">
            {!file && <div>No file selected</div>}
            {imgSrc && (
              <div
                ref={stageRef}
                className="w-full h-[70vh] overflow-auto rounded border bg-gray-50 flex items-start justify-center"
              >
                <canvas
                  ref={overlayRef}
                  onMouseMove={onMouseMove}
                  onMouseDown={onMouseDown}
                  onMouseUp={endDrag}
                  className="select-none"
                />
              </div>
            )}

            {/* Magnifier */}
            <div
              className={clsx(
                "fixed z-50 bg-white/90 p-2 shadow border rounded-full overflow-hidden",
                `left-[${Math.min(mousePos.x, screen.width - 160)}px]`,
                `top-[${mousePos.y}px]`,
                { hidden: !showMag, block: showMag }
              )}
            >
              <canvas ref={magRef} className="border rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
