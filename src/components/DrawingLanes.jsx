import { useEffect, useRef, useState } from "react";

export default function DrawingLanes({ selectedVideo }) {
  const canvasRef = useRef(null);
  const [lines, setLines] = useState([[]]); // Array of lines
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [image, setImage] = useState(null);
  const [processedVideo, setProcessedVideo] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!selectedVideo) return;

    const video = document.createElement("video");
    video.src = URL.createObjectURL(selectedVideo);
    video.crossOrigin = "anonymous";
    video.preload = "auto";

    // Wait until metadata is loaded (dimensions)
    video.addEventListener("loadedmetadata", () => {
      video.currentTime = 0; // go to first frame
    });

    // When the first frame is ready
    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const img = new Image();
      img.src = canvas.toDataURL("image/png");
      img.onload = () => setImage(img);
    });
  }, [selectedVideo]);

  // Redraw everything (existing logic)
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.drawImage(image, 0, 0);

    // Draw all lines
    lines.forEach((points) => {
      if (points.length > 1) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        drawSmoothCurve(ctx, points);
      }
      ctx.fillStyle = "blue";
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }, [image, lines]);

  // Handle click to add or insert points
  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const points = lines[activeLineIndex];
    const insertIndex = findSegmentIndex(points, x, y);

    const newLines = [...lines];
    if (insertIndex !== -1) {
      newLines[activeLineIndex] = [
        ...points.slice(0, insertIndex + 1),
        { x, y },
        ...points.slice(insertIndex + 1),
      ];
    } else {
      newLines[activeLineIndex] = [...points, { x, y }];
    }
    setLines(newLines);
  };

  // Add new empty line
  const handleAddLine = () => {
    setLines((prev) => [...prev, []]);
    setActiveLineIndex(lines.length);
  };

  // Undo last point in active line
  const handleUndo = () => {
    const newLines = [...lines];
    if (newLines[activeLineIndex].length > 0) {
      newLines[activeLineIndex] = newLines[activeLineIndex].slice(0, -1);
      setLines(newLines);
    }
  };

  const exportFullLine = async () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Get all pixels from canvas
    const imageData = ctx.getImageData(0, 0, width, height);
    const allPixels = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];
        const a = imageData.data[idx + 3];

        if (r > 200 && g < 50 && b < 50 && a > 0) {
          allPixels.push({ x, y });
        }
      }
    }

    const controlPoints = lines;
    const dataToExport = { pixels: allPixels, points: controlPoints };

    // Create a Blob from JSON
    const jsonBlob = new Blob([JSON.stringify(dataToExport)], {
      type: "application/json",
    });

    const formData = new FormData();
    formData.append("video", selectedVideo);
    formData.append("pixels_file", jsonBlob, "lane_data.json"); // send as file

    // POST to API
    try {
      const response = await fetch("http://localhost:5000/api/lanes", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        if (processedVideo == null) {
          const data = await response.json();
          const outputVideo = `http://localhost:5000/${data.output_video}`;

          // Update state to show video
          setProcessedVideo(outputVideo);
        }
      } else {
        alert("Failed to post data.");
      }
    } catch (error) {
      console.error(error);
      alert("Error posting data.");
    }
  };

  return (
    <div>
      {processedVideo ? (
        <video width="320" height="240" controls preload="auto">
          <source src={processedVideo} type="video/mp4" />
          <track
            src="/path/to/captions.vtt"
            kind="subtitles"
            srcLang="en"
            label="English"
          />
          Your browser does not support the video tag.
        </video>
      ) : (
        // Drawing/canvas section
        <>
          <div className="text-black space-x-2 py-2">
            <button onClick={handleAddLine}>➕ Add New Line</button>
            <button
              onClick={handleUndo}
              disabled={lines[activeLineIndex].length === 0}
            >
              ⟲ Undo
            </button>
            <button onClick={exportFullLine}>
              🖌 Check Direction Violation
            </button>
          </div>
          <p>Drawing line #{activeLineIndex + 1}</p>
          <canvas
            ref={canvasRef}
            onClick={handleClick}
            style={{ border: "1px solid black", cursor: "crosshair" }}
          />
        </>
      )}
    </div>
  );
}

// Draw smooth curve (Catmull–Rom spline)
function drawSmoothCurve(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i > 0 ? pts[i - 1] : pts[0];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
  ctx.stroke();
}

// Find segment index for inserting a point
function findSegmentIndex(pts, x, y) {
  const threshold = 10;
  for (let i = 0; i < pts.length - 1; i++) {
    const dist = pointToSegmentDistance(x, y, pts[i], pts[i + 1]);
    if (dist < threshold) return i;
  }
  return -1;
}

// Distance from point to segment
function pointToSegmentDistance(px, py, p1, p2) {
  const A = px - p1.x;
  const B = py - p1.y;
  const C = p2.x - p1.x;
  const D = p2.y - p1.y;

  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) param = dot / len_sq;

  let xx, yy;
  if (param < 0) {
    xx = p1.x;
    yy = p1.y;
  } else if (param > 1) {
    xx = p2.x;
    yy = p2.y;
  } else {
    xx = p1.x + param * C;
    yy = p1.y + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}
